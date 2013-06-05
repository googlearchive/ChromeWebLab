# 
#  max.py: send OSC messages to be converted to MIDI messages for robots
#  
#  Copyright Google Inc, 2013
#  See LICENSE.TXT for licensing information.
# 

import json
from twisted.application import internet, service
from txosc import osc, dispatch, async
import messenger
import notes


# CLIENT
# 
osc_send_address = None
client = None

def send_instruments():
    """
    Send all instrument note positions to Max
    """
    send("/instruments " + json.dumps(notes.instruments))

def send(message):
    """
    Send message to Max.
    OSC message is path + arguments in one string.
    """
    global client
    client.send(osc.Message(message), osc_send_address)

def client_service(address):
    """
    Twisted service for outbound OSC messages.
    (Weirdly, Twisted has us call UDPServer() to register a client. [sic])
    """
    global client, osc_send_address
    osc_send_address = address
    client = async.DatagramClientProtocol()
    return internet.UDPServer(0, client)


# SERVER
# 
def got_loop(message, address):
    """
    Max passed a timestamp from last loop start.
    Get next n loop_times, send to WS.
    """
    global client
    loop_time = int(message.getValues()[0].replace('ms', ''))
    notes.step_ms = int(message.getValues()[1])
    loop_times = notes.next_loop_times(loop_time)
    messenger.websocketclient.broadcast_loop_times(loop_times)

def server_service(port):
    """
    Create Twisted service for OSC server ('receiver').
    Callbacks for inbound messages must be registered here.
    """
    receiver = dispatch.Receiver()
    receiver.addCallback("/loop", got_loop)
    protocol = async.DatagramServerProtocol(receiver)
    return internet.UDPServer(port, protocol)
