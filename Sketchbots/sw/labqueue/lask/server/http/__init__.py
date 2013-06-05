# Copyright Google Inc, 2013
# See LICENSE.TXT for licensing information.
"""Part of Lask, the Web Lab Task management system.

HTTP-related server interface(s) for Lask, mainly a WSGI-compatible application.
"""

import webapp2
from webapp2_extras import routes
import misc_handlers
import appkey_handlers
import watchdog_handlers
import worker_handlers
import ldc_handlers
import topic_task_handlers
    

###################################################################################
#
# Here is the WSGI app itself
#

app = webapp2.WSGIApplication([
    # routes.RedirectRoute(r'/api', handler=misc_handlers.HelloWorldHandler, strict_slash=True, name='API'),
    webapp2.Route('/media/<key>', handler=ldc_handlers.PublicMediaHandler, name='public-media'),
    webapp2.Route('/media/<key>/<tn_type>', handler=ldc_handlers.PublicMediaHandler, name='public-media-thumbnail'),

    webapp2.Route(r'/api/', handler=misc_handlers.HelloWorldHandler, name='API'),
    routes.PathPrefixRoute('/api', [
        
        #
        # TODO - help home goes here - will there ever be time to make this?
        #
        
        #
        # cron endpoints
        #
        webapp2.Route(r'/cron/do/ldc_watchdog_cull', handler=watchdog_handlers.LabDataContainerWatchdogCullHandler),
        webapp2.Route(r'/cron/do/task_watchdog_clean_tasks', handler=watchdog_handlers.TaskWatchdogCleanTasksHandler),
        
        #
        # other services
        #
        webapp2.Route(r'/test', handler=misc_handlers.TestHandler),
        
        webapp2.Route(r'/time', handler=misc_handlers.TimeHandler), # time on the server right now
        # to be enabled in some future version, experimental: webapp2.Route(r'/keygen', handler=appkey_handlers.AppKeyGeneratorHandler),
        # to be enabled in some future version, experimental: webapp2.Route(r'/keytest', handler=appkey_handlers.AppKeyTestHandler),

        #
        # workers/status
        #
        routes.PathPrefixRoute('/workers', [
            webapp2.Route(r'/all/status', handler=worker_handlers.Workers_all_status_handler),
            webapp2.Route(r'/<guid>/status', handler=worker_handlers.Workers_status_handler),
            webapp2.Route(r'/<guid>/sys_health', handler=worker_handlers.Workers_sys_health_handler),
            webapp2.Route(r'/<guid>/log', handler=worker_handlers.Workers_log_handler),
        ]),

        #
        # topic/task queue access
        #
        routes.RedirectRoute(r'/topics', handler=topic_task_handlers.TopicCollectionHandler, strict_slash=True, name='Topipcs'),
        routes.PathPrefixRoute('/topics', [
            
            routes.RedirectRoute(r'/<topic_name>', handler=topic_task_handlers.TopicHandler, strict_slash=True, name='Topic'),
            
            webapp2.Route(r'/<topic_name>/num_recent_tasks', handler=topic_task_handlers.TaskStatsReporterHandler_num_recent_tasks_created),
            webapp2.Route(r'/<topic_name>/num_creatable_tasks', handler=topic_task_handlers.TopicHandler_num_creatable_tasks),
            webapp2.Route(r'/<topic_name>/max_num_tasks', handler=topic_task_handlers.TopicHandler_max_num_tasks),
            routes.RedirectRoute(r'/<topic_name>/offers', handler=topic_task_handlers.AssignTaskHandler, strict_slash=True, name='Topic_offers'),
            routes.RedirectRoute(r'/<topic_name>/tasks', handler=topic_task_handlers.TaskCollectionHandler, strict_slash=True, name='Topic_tasks'),
            routes.RedirectRoute(r'/<topic_name>/rejected_tasks', handler=topic_task_handlers.RejectedTaskCollectionHandler, strict_slash=True, name='Topic_rejected_tasks'),
            routes.RedirectRoute(r'/<topic_name>/rejected_tasks/count', handler=topic_task_handlers.RejectedTaskCountHandler, strict_slash=True, name='Topic_rejected_tasks_count'),
            routes.RedirectRoute(r'/<topic_name>/waiting_tasks', handler=topic_task_handlers.WaitingTaskCollectionHandler, strict_slash=True, name='Topic_waiting_tasks'),
            routes.RedirectRoute(r'/<topic_name>/waiting_tasks/count', handler=topic_task_handlers.WaitingTaskCountHandler, strict_slash=True, name='Topic_waiting_tasks_count'),
            routes.RedirectRoute(r'/<topic_name>/working_tasks', handler=topic_task_handlers.WorkingTaskCollectionHandler, strict_slash=True, name='Topic_working_tasks'),
            routes.RedirectRoute(r'/<topic_name>/working_tasks/count', handler=topic_task_handlers.WorkingTaskCountHandler, strict_slash=True, name='Topic_working_tasks_count'),
            routes.RedirectRoute(r'/<topic_name>/successful_tasks', handler=topic_task_handlers.SuccessfulTaskCollectionHandler, strict_slash=True, name='Topic_successful_tasks'),
            routes.RedirectRoute(r'/<topic_name>/failed_tasks', handler=topic_task_handlers.FailedTaskCollectionHandler, strict_slash=True, name='Topic_failed_tasks'),
            
            routes.RedirectRoute(r'/<topic_name>/tasks/<task_id>', handler=topic_task_handlers.TaskHandler, strict_slash=True, name='Task'),
            
            # TODO - pick one of these two styles of URL
            webapp2.Route(r'/<topic_name>/tasks/<task_id>/do/accept', handler=topic_task_handlers.AcceptTaskHandler),
            webapp2.Route(r'/<topic_name>/tasks/<task_id>/do/decline', handler=topic_task_handlers.DeclineTaskHandler),
            webapp2.Route(r'/<topic_name>/tasks/<task_id>/do/delegate', handler=topic_task_handlers.DelegateTaskHandler),
            webapp2.Route(r'/<topic_name>/tasks/<task_id>/do/progress', handler=topic_task_handlers.ProgressTaskHandler),
            webapp2.Route(r'/<topic_name>/tasks/<task_id>/do/stop', handler=topic_task_handlers.StopTaskHandler),
            webapp2.Route(r'/<topic_name>/tasks/<task_id>/do/reject', handler=topic_task_handlers.TaskModerationRejectHandler),
        ]),
        
        
        #
        # aceess to binary data
        #
        routes.PathPrefixRoute('/<ldc0:(bin)>', [
            webapp2.Route(r'', handler=ldc_handlers.RootLDCCollectionHandler),
            webapp2.Route(r'/', handler=ldc_handlers.RootLDCCollectionHandler, name='LabDataContainer-L0'),
            
            webapp2.Route(r'/<ldc1>', handler=ldc_handlers.LDCHandler),
            webapp2.Route(r'/<ldc1>/', handler=ldc_handlers.LDCHandler, name='LabDataContainer-L1'),
            webapp2.Route(r'/<ldc1>/do/delete', handler=ldc_handlers.LDCDeleteHandler),
            webapp2.Route(r'/<ldc1>/do/finish_big_upload', handler=ldc_handlers.LDCContentBigUploadHandler, name='LabDataContainer-L1-finish_upload'),
            webapp2.Route(r'/<ldc1>/content', handler=ldc_handlers.LDCContentHandler),

        ]),
    ])])

