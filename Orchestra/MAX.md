How MAX works
=============

MAX is a piece of software that lets developers design programs for controlling MIDI
syntheriszers and other advanced audio things such as Samplers and Effects Processors.

MAX is primarily a graphical based languge for building the programs (known as "patchers") that control MIDI devices
and is used in WebLab to take signals from the network, 'do some magic' send commands to the MIDI
device and then send commands back on the network to syncrhonise all the web clients.

Simple right? Not really. :)

This document describes roughly how the MAX product is configured to let you play music from your
website via MIDI.

## Sequencer ##

The sequencer is the main "patcher" and it is broken in to two areas:

1.  The reciever
2.  The interesting bit

The receiver sets up a UDP port to listen to incoming OSC commands sent from the `hub` server.  The port that listens to incoming requests has a script attached to it and once it gets a command sets a global internal variable describing what the `hub` knows to be the configuration of the "sequencer".

The interesting bit is interesting, and described below the image (I am doing this so you get some context).

![Sequencer](/docs/images/sequencer.png "Sequencer")

The main body of this MAX patcher is the interesting bit.   At a high-level it is a collection of sub-patchers (they are the bits starting with "p_").  The flow is roughly as follows:

1.  `loadbang` is triggered when the script is loaded and sends a 1 or if the user presses spacebar, the key module fires and is filtered on ASCII char 32
2.  If either loadbang or keypress is 0, then the `toggle` module is toggled.
3.  If the toggle `bangs` a 1, then the [p_sequencer](#p_sequencer) sub-patcher is loaded - this is the main script that beats once every 250ms.
4.  Every time the p_sequencer bangs, it is sent through to the 16 bar timer and to playback.js script.  This script works out what note on the MIDI it should be playing for the current timestamp.  At the same time for each 250ms beat p_loop_start is executed and an OSC command is crafted and sent back the `hub` server. 
5.  At this point the patcher is trying to play a MIDI note, it is displayed on the little keyboard control, but also sent through to the [p_picthmappings](#p_picthmappings) sub-patchers which converts the note to the correct scale.
6.  The output is then sent to the [p_actuators](#p_actuators) script which creates the NOTE ON and NOTE OFF midi command (100ms duration)
7.  NOTEOUT is then fired with all the corretly mapped settings.

## p_Sequencer ##
![p_sequencer](/docs/images/sequencer-p_sequencer.png "p_sequencer")

## Actuators ##
![p_actuators](/docs/images/actuators.png "p_actuators")

## Loop Start ##
![p_loop_start](/docs/images/loop_start.png "p_loop_start")

## Pitch Mappings ##
![p_pitch_mappings](/docs/images/pitch-mappings.png "p_pitch_mappings")

## Epoch ##
![p_epoch](/docs/images/epoch.png "p_epoch")
