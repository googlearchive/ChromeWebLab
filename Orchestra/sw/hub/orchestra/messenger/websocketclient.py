# 
#  websocketclient.py: WebSockets connection to Node.js server
#  
#  Copyright Google Inc, 2013
#  See LICENSE.TXT for licensing information.
# 

from twisted.application import internet, service
from twisted.python import log
from twisted.internet.protocol import ReconnectingClientFactory
from autobahn.websocket import WebSocketClientFactory, WebSocketClientProtocol
from time import time
import json
import urllib2
import sequencer
from format import *
from config import config

clients = []

class MessengerClientProtocol(WebSocketClientProtocol):
    """
    A Twisted Protocol models the connection to the server.
    This class is used to receive and send messages to the
    realtime (Node.js) server.
    """
    def onOpen(self):
        pass
    
    def onConnect(self, connectionResponse):
        global clients
        clients.append(self)
            
    def onClose(self, wasClean, code, reason):
        global clients
        try:
            clients.remove(self)
        except Exception, e:
            pass # client closed before it fully connected?
    
    def onMessage(self, message, binary):
        """
        Server sent us a message: most likely related to note state.
        """
        message_type = decode_message_type(message)
        
        log.msg("Received message '%s'" % message_type)
        
        # Layout: Parse through all instruments & notes at once
        if message_type is 'current_layout':
            sequencer.set_instruments(decode_layout(message))
            
        # CRUD for notes
        elif message_type is 'change_note' or message_type is 'add_note' or message_type is 'remove_note':
            instrument_id, note = decode_note(message)
            
            # Notify sequencer of the change, get schedule note time
            sequencer.update_instrument(instrument_id, message_type, note)
            
            # just report current server time for all note messages
            note_time = int(time() * 1000)
            
            # Confirm note with server
            confirmation_message = encode_note_confirmation(message_type, message, note_time)
            self.sendMessage(confirmation_message)
            
        # Error, typically in response to our last message
        elif message_type is 'error':
            log.err("Server error: %s" % message[1:])
            
    def send_loop_times(self, loop_times):
        """
        Send next n loop start times to sync data to playhead
        """
        log.msg("Sending loop_times starting with %d" % loop_times[0])
        self.sendMessage(encode_loop_times(loop_times))


class ReconnectingWebSocketClientFactory(WebSocketClientFactory, ReconnectingClientFactory):
    """
    A Twisted Factory monitors the connection and spins up Protocols
    when it's alive.
    
    This factory uses multiple inheritance to combine
    Autobahn's WebSocket support with Twisted's reconnecting helpers.
    
    For more information on ReconnectingClientFactory:
    http://twistedmatrix.com/documents/current/core/howto/clients.html#auto4
    """
    
    def startedConnecting(self, connector):
        log.msg("Connecting to realtime server at %s..." % connector.getDestination().host)

    def buildProtocol(self, addr):
        log.msg("Connected to realtime server at %s." % addr.host)
        
        # reset exponentially-increasing delay
        self.resetDelay()
        
        # build protocol as usual
        return WebSocketClientFactory.buildProtocol(self, addr)

    def clientConnectionLost(self, connector, reason):
        log.err("Lost connection to realtime server at %s: %s" % (connector.getDestination().host, reason))
        ReconnectingClientFactory.clientConnectionLost(self, connector, reason)

    def clientConnectionFailed(self, connector, reason):
        log.err("Failed to connect to realtime server at %s: %s" % (connector.getDestination().host, reason))
        ReconnectingClientFactory.clientConnectionFailed(self, connector, reason)


def broadcast_loop_times(loop_times):
    """
    Send loop times to all clients
    """
    global clients
    for client in clients:
        client.send_loop_times(loop_times)

def service(host):
    """
    Create and return Twisted service (w. assoc. factory w. assoc. protocol)
    """
    web_socket_url = "ws://%s:8080/orchestra/connection/instrumentControlJoin" % host
    factory = ReconnectingWebSocketClientFactory(web_socket_url)
    factory.protocol = MessengerClientProtocol
    return internet.TCPClient(factory.host, factory.port, factory)
