# Copyright Google Inc, 2013
# See LICENSE.TXT for licensing information.
"""Convenient base class for Web Lab tests

"""

import unittest2
from google.appengine.ext import db
from google.appengine.ext import testbed
from google.appengine.ext import blobstore
from google.appengine.datastore import datastore_stub_util
from datetime import tzinfo, timedelta, datetime
from google.appengine.api import files
from google.appengine.api.files import file_service_stub

import wsgiref
import webapp2

class AppEngineTestCase(unittest2.TestCase):
    """A base class for test cases which involve the App Engine datastore
    """
    
    ds_is_inited = False
    ds_is_hrd = False
    
    def setUp(self):
        # start up the AppEngine testbed
        self.testbed = testbed.Testbed()
        self.testbed.activate()
        # make any needed changes to the environment
        # self.testbed.setup_env(app_id='appid') (use a test App ID for now)
        
        # start the blobstore simulator
        self.testbed.init_blobstore_stub()
        
        # start the file service simulator
        self.testbed.init_file_service_stub()
        
    def tearDown(self):
        self.testbed.deactivate()
        
    def _init_HRD(self):
        """Use the High Replication Datastore simulator
        """
        self.policy = datastore_stub_util.PseudoRandomHRConsistencyPolicy()
        self.policy.SetProbability(0.5) # 50% chance to apply
        self.policy.SetSeed(self._get_num_reads_until_consistency()) # the DS will be consistent with a write after the write plus two more queries
        
        # Initialize the datastore stub with this policy.
        self.testbed.init_datastore_v3_stub(consistency_policy=self.policy)
        self.ds_is_hrd = True
        self.ds_is_inited = True
    
    def _init_MSD(self):
        """Use the Master/Slave Datastore simulator
        """
        self.policy = None
        self.testbed.init_datastore_v3_stub()
        self.ds_is_hrd = False
        self.ds_is_inited = True
    
    def _in_HRD_mode(self):
        return self.ds_is_hrd
    
    
    def _get_num_reads_until_consistency(self):
        if self._in_HRD_mode():
            return 3
        else:
            return 1
    
    def _hrd_repeat_range(self):
        return range(20)
    
    def _delete_all_entities(self, model_class):
        """Delete all entities of a given model class
        """
        keep_going = True
        while self.ds_is_inited and keep_going:
            q = model_class.all()
            keep_going = q.count(200) > 0
            db.delete(q.fetch(200))
    
    _blob_key_counter = 0
    "Used to generate keys for blobs returned by _create_blob_from_str"
    
    def _create_blob_from_str(self, data):
        """Create a blob in the blobstore simulator which contains the
        specified data.
        
        Returns a BlobKey which points to the blob.
        
        """
        kstr = 'blobkey-%i' % (self._blob_key_counter)
        entity = self.testbed.get_stub('blobstore').CreateBlob(kstr, data)
        return blobstore.BlobKey(entity.key().name())

class HRDMSDAppEngineTestCase(AppEngineTestCase):
    """A base class for test cases which need to test in both MSD
    and HRD datastore modes.
    
    Call test methods from the _test() method.
    
    """
    
    def test_HRD(self):
        """Test in HRD mode
        """
        self._init_HRD()
        self._test()
    
    def test_MSD(self):
        """Test in Master/Slave mode
        """
        self._init_MSD()
        self._test()
    
    def _test(self):
        """Perform the real test here
        """
        #raise Exception('%s is an HRDMSDAppEngineTestCase, but fails to override the _test() method. See docs for HRDMSDAppEngineTestCase' % (self.__class__.__name__))
        pass


