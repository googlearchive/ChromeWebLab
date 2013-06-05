# 
#  format.py: encode/decode messages from Node.js server's
#  byte-compressed format
# 
#  See MessageEncoder.js in server source for message formats.
#  
#  Copyright Google Inc, 2013
#  See LICENSE.TXT for licensing information.
# 

from twisted.python import log

# Message ID constants (PARTIAL)
# See MessageIds.js in server source
# 
RECEIVED_MESSAGE_IDS = {
    0x10: 'add_note',
    0x12: 'change_note',
    0x14: 'remove_note',
    0x0B: 'current_layout',
    0x71: 'error'
}
SENT_MESSAGE_IDS = {
    'note_added': 0x11,
    'note_changed': 0x13,
    'note_removed': 0x15,
    'loop_times': 0x20
}

LAYOUT_BYTES_PER_NOTE = 3


def decode_message_type(message):
    """
    Get message type from 0th byte of message
    """
    try:
        message_id = ord(message[0])
        return RECEIVED_MESSAGE_IDS[message_id]
    except KeyError:
        log.err("Message ID not recognized (%d)" % message_id)
        return None

def decode_layout(message):
    """
    Loop through each note (i.e. blob) of each instrument in layout,
    producing a dict in the format sequencer expects.
    """
    
    instrument_index = 1
    instruments = []
    
    # For each instrument...
    while instrument_index < len(message):
        num_notes = ord(message[instrument_index])
        note_index = instrument_index + 1
        next_instrument_index = note_index + (num_notes * LAYOUT_BYTES_PER_NOTE)
        notes = []
        
        # For each note...
        while note_index < next_instrument_index:
            notes.append({
                'id': ord(message[note_index]),
                'pos': ord(message[note_index + 1]),
                'pitch': ord(message[note_index + 2])
            })
            note_index += LAYOUT_BYTES_PER_NOTE
        
        instruments.append(notes)
        instrument_index = next_instrument_index
        
    return instruments

def decode_note(message):
    """
    Used by note update methods (add/change/remove).
    Only the latter omits the pitch/pos, and therefore is shorter.
    """
    instrument_id = ord(message[1])
    note = {
        'id': ord(message[2])
    }
    
    if len(message) > 3:
        note['pos'] = ord(message[3])
        note['pitch'] = ord(message[4])
    
    return instrument_id, note

def encode_note_confirmation(message_type, message, note_time):
    """
    Sling request back to Node.js with some mods to format it
    as a response (i.e. confirmation).
    """
    response = ""
    
    # translate request message ID to response ID
    if message_type is 'change_note':
        response = chr(SENT_MESSAGE_IDS['note_changed'])
    elif message_type is 'add_note':
        response = chr(SENT_MESSAGE_IDS['note_added'])
    elif message_type is 'remove_note':
        response = chr(SENT_MESSAGE_IDS['note_removed'])
    
    # just pass the note params back verbatim
    if message_type is 'remove_note':
        response += message[1:3]
    else:
        response += message[1:5]
    
    if note_time:
        response += encode_date(note_time)
    
    return response

def encode_loop_times(loop_times):
    """
    Encode an array of timestamps
    """
    message = chr(SENT_MESSAGE_IDS['loop_times'])
    for time in loop_times:
        message += encode_date(time)
    return message

def encode_date(note_time):
    """
    Compress time (epoch time in millis) into 6 bytes.
    Ported from MessageEncoder.encodeDate in web client source
    """
    time_string = ""
    for b in range(6):
        one_byte = note_time & 0x7F
        time_string = chr(one_byte) + time_string
        note_time = (note_time - one_byte) / 128
    return time_string
