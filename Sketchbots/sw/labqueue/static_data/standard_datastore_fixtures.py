# Copyright Google Inc, 2013
# See LICENSE.TXT for licensing information.
import config

# the standard set of Topics used by the system
TOPICS = {
    'sketchbot-drawings': {
        'worker_guid': config.API_WORKER_GUID,
        'task_policy': {
            'max_num_tasks': 200
        }
    },
}


# the standard set of root-level LDC names
LABDATACONTAINERS = {
    'bin': {
        'worker_guid': config.API_WORKER_GUID,
        'unlisted': False,
        'description': '',
        'content': None,
        'content_type': None,
        'create_tree': False,
    },
}

CLIENT_APP_CREDENTIALS = {
}
