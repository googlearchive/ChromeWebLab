# Copyright Google Inc, 2013
# See LICENSE.TXT for licensing information.
""" Various service objects used to monitor and maintain data integrity,
such as deleting things which are obsolete.


"""

import logging
import time

from google.appengine.ext import db
from support.modeling import *
import datetime
from lask import core
import config

# from static_data import country_data
# from static_data import map_areas
# from static_data import test_lab_tag_ids
# from static_data import countries_to_continents
from math import floor

MAX_RECORDS_PER_ITERATIVE_FETCH = 200
"The maximum number of records to retrieve per call to Query.fetch() when iterating over potentially large batches of results"

MAX_RECORDS_CUMULATIVE_FETCH = 2000
"The maximum culumative number of records to retrieve over an iterative series of Query.fetch() calls"

# MAX_AGE_OF_TEMP_LDCS_SEC = 10 # test
MAX_AGE_OF_TEMP_LDCS_SEC = 7200 # production
"The maximum age of an LDC, in seconds"

X_DELETE_BLOBS = False
"Experimental! Whether or not to delete blobs explicitly when deleting their parent LDC's"

class TaskWatchdog(object):
    """ Keeps an eye on Task objects
    """
    
    @classmethod
    def clean_tasks(cls):
        """ Clears out "zombie" tasks
        """
        logging.info('TaskWatchdog: Running clean_tasks()')

        timeout = modeling_utcnow() - datetime.timedelta(seconds=config.TASK_RESERVATION_MAX_HOLD_TIME_SEC)
        q = db.Query(core.model.Task)
        q.filter('state =', core.model.TaskStateProperty.RESERVATION)
        q.filter('created_at <', timeout)

        num_records_fetched = 0
        run = True
        while run:
            # get more records to inspect
            limit = min(MAX_RECORDS_PER_ITERATIVE_FETCH, MAX_RECORDS_CUMULATIVE_FETCH - num_records_fetched)
            num_records_fetched += limit
            if limit > 0:
                #logging.info('Fetching new batch of records, limit='+str(limit))
                recs = q.fetch(limit=limit)
            else:
                recs = []
            if len(recs) > 0:
                for rec in recs:
                    logging.info('TaskWatchdog: Found expired reserved Task %s in Topic %s (created by %s at %s), cancelling' % (str(rec.get_task_id()), rec.topic_name, rec.created_by, str(rec.created_at)))
                    rec.cancel_reservation(config.API_WORKER_GUID)
                q.with_cursor(q.cursor()) # use a cursor to make the next fetch pick up where this one ended
            else:
                # no more records
                run = False

        logging.info('TaskWatchdog: Finished clean_tasks()')
        return True
        

class LabDataContainerWatchdog(object):
    """ Keeps an eye on LabDataContainer objects
    """
    
    @classmethod
    def propogate_moderation(cls):
        """ Goes through the datastore looking for LDC's which have the mod_propogate
        flag set to True and copies those LDC's mod_flagged and mod_rejected property
        values to all child LDCs.
        """
        logging.info('LabDataContainerWatchdog: Starting propogate_moderation()')
        q = db.Query(core.model.LabDataContainer)
        q.filter('mod_propogate =', True)

        num_records_fetched = 0
        run = True
        while run:
            # get more records to inspect
            limit = min(MAX_RECORDS_PER_ITERATIVE_FETCH, MAX_RECORDS_CUMULATIVE_FETCH - num_records_fetched)
            num_records_fetched += limit
            if limit > 0:
                #logging.info('Fetching new batch of records, limit='+str(limit))
                recs = q.fetch(limit=limit)
            else:
                recs = []
            if len(recs) > 0:
                for rec in recs:
#                    if rec.mod_flagged or rec.mod_rejected:
                    # only do this for records that are flagged or rejected
                    #
                    # change all of this LDC's children with deleted=False to deleted=True
                    #
                    logging.info('LabDataContainerWatchdog: Propoagting moderation properties from LabDataContainer '+rec.key().id_or_name()+' to all of its children')
                    q2 = db.Query(core.model.LabDataContainer)
                    q2.filter('ancestors =', rec.key())
                    #q2.filter('mod_propogate = ', False)
                    num_records_fetched2 = 0
                    run2 = True
                    while run2:
                        limit2 = min(MAX_RECORDS_PER_ITERATIVE_FETCH, MAX_RECORDS_CUMULATIVE_FETCH - num_records_fetched2)
                        logging.info(limit2)
                        if limit2 > 0:
                            recs2 = q2.fetch(limit=limit2)
                        else:
                            recs2 = []
                        if len(recs2) > 0:
                            for rec2 in recs2:
                                if rec2.key() != rec.key():
                                    # delete blob if necessary (do this first, before marking the record as culled)
                                    # mark this child record as culled
                                    rec2.mod_rejected = rec.mod_rejected
                                    rec2.mod_approved = rec.mod_approved
                                    rec2.mod_flagged = rec.mod_flagged
                                    rec2.mod_rejected_at = rec.mod_rejected_at
                                    rec2.mod_approved_at = rec.mod_approved_at
                                    rec2.mod_flagged_at = rec.mod_flagged_at
                                    rec.mod_propogate = False
                                    rec2.put()
                                    logging.info('LabDataContainerWatchdog: LabDataContainer with key name '+rec2.key().id_or_name()+' set with mod_flagged = %s, mod_rejected = %s, mod_approved = %s' % (str(rec2.mod_flagged), str(rec2.mod_rejected), str(rec2.mod_approved)))
                            q2.with_cursor(q2.cursor()) # use a cursor to make the next fetch pick up where this one ended
                        else:
                            # no more records
                            run2 = False
                    #
                    # done
                    #
                    rec.mod_propogate = False
                    rec.put()
                    logging.info('LabDataContainerWatchdog: Done propogating moderation properties of LabDataContainer with key name '+rec.key().id_or_name()+'.')
                q.with_cursor(q.cursor()) # use a cursor to make the next fetch pick up where this one ended
            else:
                # no more records
                run = False
        logging.info('LabDataContainerWatchdog: Finished propogate_moderation()')
        return True
        
    
    @classmethod
    def cull(cls):
        """ Goes through the datastore looking for LDC's which have their
        deleted flag set to True, and makes sure that child LDC's are also
        marked deleted.
        """
        logging.info('LabDataContainerWatchdog: Starting cull()')
        q = db.Query(core.model.LabDataContainer)
        q.filter('deleted =', True)
        q.filter('culled =', False)

        num_records_fetched = 0
        run = True
        while run:
            # get more records to inspect
            limit = min(MAX_RECORDS_PER_ITERATIVE_FETCH, MAX_RECORDS_CUMULATIVE_FETCH - num_records_fetched)
            num_records_fetched += limit
            if limit > 0:
                #logging.info('Fetching new batch of records, limit='+str(limit))
                recs = q.fetch(limit=limit)
            else:
                recs = []
            if len(recs) > 0:
                for rec in recs:
                    #
                    # change all of this LDC's children with deleted=False to deleted=True
                    #
                    logging.info('LabDataContainerWatchdog: LabDataContainer '+rec.key().id_or_name()+' is to be deleted, making sure child LDCs will also be deleted.')
                    q2 = db.Query(core.model.LabDataContainer)
                    q2.filter('ancestors = ', rec.key())
                    q2.filter('deleted = ', False)
                    num_records_fetched2 = 0
                    run2 = True
                    while run2:
                        limit2 = min(MAX_RECORDS_PER_ITERATIVE_FETCH, MAX_RECORDS_CUMULATIVE_FETCH - num_records_fetched2)
                        if limit2 > 0:
                            recs2 = q2.fetch(limit=limit2)
                        else:
                            recs2 = []
                        if len(recs2) > 0:
                            for rec2 in recs2:
                                if rec2.key() != rec.key():
                                    # delete blob if necessary (do this first, before marking the record as culled)
                                    if X_DELETE_BLOBS and rec2.content_blob is not None:
                                        rec2.content_blob.delete()
                                    # mark this child record as culled
                                    rec2.deleted = True
                                    rec2.culled = True
                                    rec2.put()
                                    logging.info('LabDataContainerWatchdog: LabDataContainer with key name '+rec2.key().id_or_name()+' marked deleted & culled')
                            q2.with_cursor(q2.cursor()) # use a cursor to make the next fetch pick up where this one ended
                        else:
                            # no more records
                            run2 = False
                    #
                    # done
                    #
                        
                    # delete blob if necessary (do this first, before marking the record as culled)
                    if X_DELETE_BLOBS and rec.content_blob is not None:
                        rec.content_blob.delete()
                    # mark this record as culled
                    rec.culled = True
                    rec.put()
                    logging.info('LabDataContainerWatchdog: LabDataContainer with key name '+rec.key().id_or_name()+' marked deleted & culled')
                q.with_cursor(q.cursor()) # use a cursor to make the next fetch pick up where this one ended
            else:
                # no more records
                run = False
        logging.info('LabDataContainerWatchdog: Finished cull()')
        return True

    @classmethod
    def clean_temp(cls):
        """ Cleans out items from the /temp tree which are over a certain maximum age.
        """
        logging.info('LabDataContainerWatchdog: Starting clean_temp()')
        timeout = modeling_utcnow() - datetime.timedelta(seconds=MAX_AGE_OF_TEMP_LDCS_SEC)
        q = db.Query(core.model.LabDataContainer)
        k = core.model.LabDataPath('temp').get_key()
#        logging.info(k.name())
#        logging.info(timeout)
        q.filter('ancestors =', k)
        q.filter('deleted =', False)
        q.filter('updated_at <', timeout)
        
        num_records_fetched = 0
        run = True
        while run:
            # get more records to inspect
            limit = min(MAX_RECORDS_PER_ITERATIVE_FETCH, MAX_RECORDS_CUMULATIVE_FETCH - num_records_fetched)
            num_records_fetched += limit
            if limit > 0:
                logging.info('Fetching new batch of records, limit='+str(limit))
                recs = q.fetch(limit=limit)
            else:
                recs = []
            logging.info('Found '+str(len(recs))+' records')
            if len(recs) > 0:
                for rec in recs:
                    # delete blob if necessary (do this first, before marking the record as culled)
                    if X_DELETE_BLOBS and rec.content_blob is not None:
                        logging.info('LabDataContainerWatchdog: clean_temp() is deleting blob '+str(rec.content_blob)+' for LabDataContainer with key name '+rec.key().id_or_name())
                        rec.content_blob.delete()
                        rec.content_blob = None
                    # and flag the content for deletion by the regular deletion by LabDataContainerWatchdog.cull()
                    # rec.end_user_delete()
                    # actually delete the object
                    rec.delete()
                q.with_cursor(q.cursor()) # use a cursor to make the next fetch pick up where this one ended
            else:
                # no more records
                run = False
        logging.info('LabDataContainerWatchdog: Finished clean_temp()')
        return True
        

