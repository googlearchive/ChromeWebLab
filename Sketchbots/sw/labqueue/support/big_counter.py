# Copyright Google Inc, 2013
# See LICENSE.TXT for licensing information.
"""This is based almost entirely off the now "classic" sharding counter
technique described by Brett Slatkin (and expanded by Joe Gregorio) in 2008.

"""

from google.appengine.api import memcache
from google.appengine.ext import db
import random

MIN_NUM_SHARDS = 200

class GeneralCounterShardConfig(db.Model):
    """Tracks the number of shards for each named counter."""
    name = db.StringProperty(required=True)
    num_shards = db.IntegerProperty(required=True, default=MIN_NUM_SHARDS)


class GeneralCounterShard(db.Model):
    """Shards for each named counter"""
    name = db.StringProperty(required=True)
    count = db.IntegerProperty(required=True, default=0)

class BigCounter(object):
    """This class allows access to an internally-sharded counter
    which can scale more easily than simple datastore entity properties.
    """
    
    __counter_name = None
    __counter_config = None
    
    def __init__(self, name):
        """Constructs an object through which the counter identified by
        name can be incremeneted, decremenented and read.
        
        :name:
            The name of the counter
        """
        
        if name is None:
            raise Exception('The name argument must be specified')
        
        self.__counter_name = name

    def get_value(self):
        """Retrieve the value of the counter.
        """
        total = memcache.get(self.__counter_name)
        if total is None:
            total = 0
            for counter in GeneralCounterShard.all().filter('name = ', self.__counter_name):
                total += counter.count
            memcache.add(self.__counter_name, total, 60)
        return total


    def increment(self):
        """Increment the value of the counter.
        """
        if self.__counter_config is None:
            self.__counter_config = GeneralCounterShardConfig.get_or_insert(self.__counter_name, name=self.__counter_name)

        # maintain minimum number of shards
        if self.__counter_config.num_shards < MIN_NUM_SHARDS:
            self.increase_shards(MIN_NUM_SHARDS)
            
        def txn():
            index = random.randint(0, self.__counter_config.num_shards - 1)
            shard_name = self.__counter_name + str(index)
            counter = GeneralCounterShard.get_by_key_name(shard_name)
            if counter is None:
                counter = GeneralCounterShard(key_name=shard_name, name=self.__counter_name)
            counter.count += 1
            counter.put()
        db.run_in_transaction(txn)
        # does nothing if the key does not exist
        memcache.incr(self.__counter_name)
    
    
    def decrement(self):
        """Decrement the value of the counter.
        """
        if self.__counter_config is None:
            self.__counter_config = GeneralCounterShardConfig.get_or_insert(self.__counter_name, name=self.__counter_name)
        def txn():
            index = random.randint(0, self.__counter_config.num_shards - 1)
            shard_name = self.__counter_name + str(index)
            counter = GeneralCounterShard.get_by_key_name(shard_name)
            if counter is None:
                counter = GeneralCounterShard(key_name=shard_name, name=self.__counter_name)
            counter.count -= 1
            counter.put()
        db.run_in_transaction(txn)
        # does nothing if the key does not exist
        memcache.decr(self.__counter_name)


    def increase_shards(self, num):
        """Increase the number of shards over which the counter value is stored.
        Do this to increase write performance at the expense of read performance.
        Will never decrease the number of shards.

        :num:
          How many shards to use. This will be the NEW total number of
          shards, this is not the number by which to increase.

        """
        if self.__counter_config is None:
            self.__counter_config = GeneralCounterShardConfig.get_or_insert(self.__counter_name, name=self.__counter_name)
        def txn():
            if self.__counter_config.num_shards < num:
                self.__counter_config.num_shards = num
                self.__counter_config.put()
        db.run_in_transaction(txn)

