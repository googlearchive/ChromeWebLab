# 
#  notes.py: heavy lifting of note matrices
#  
#  Copyright Google Inc, 2013
#  See LICENSE.TXT for licensing information.
# 

from time import time
import max

NUM_STEPS = 16

# When we're determining the next_note_play_time for a note,
# factor in how long it'll be before this message hits the client.
# We don't know how long that'll actually be. Fudge it!
LATENCY_FUDGE_FACTOR_MS = 100

step_ms = 250
instruments = []
last_loop_time = 0
loop_times = []

def set_instruments(all_instruments):
    """
    setter
    """
    global instruments
    instruments = all_instruments
    max.send_instruments()

def next_loop_times(time):
    """
    Rebuild upcoming loop_times list based on last loop time
    """
    global last_loop_time, loop_times
    last_loop_time = time
    loop_times = []
    for i in range(10):
        loop_times.append(last_loop_time + ((i + 1) * current_loop_ms()))
    return loop_times

def update_instrument(instrument_id, message_type, note):
    """
    Update this note within the instrument (creating, moving, or deleting)
    """
    global instruments
    instrument = instruments[instrument_id]
    
    if message_type is 'change_note':
        for index, instrument_note in enumerate(instrument):
            if instrument_note['id'] == note['id']:
                instrument[index] = note
    elif message_type is 'add_note':
        instrument.append(note)
    elif message_type is 'remove_note':
        for index, instrument_note in enumerate(instrument):
            if instrument_note['id'] == note['id']:
                instrument.pop(index)
    
    max.send_instruments()

def next_note_play_time(note):
    """
    DEPRECATED. Just returning current time now, not note time!
    Determine next play time (epoch, ms) for this new note.
    """
    next_play_time = None
    if note.has_key('pos'):
        next_play_time = last_loop_time + note['pos'] * step_ms
        likely_client_position = int(time() * 1000) + LATENCY_FUDGE_FACTOR_MS
        if next_play_time <= likely_client_position:
            next_play_time += current_loop_ms()
    return next_play_time

def current_loop_ms():
    """
    Length of one loop based on current tempo
    """
    return step_ms * NUM_STEPS
