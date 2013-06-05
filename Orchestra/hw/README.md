**WARNING** **WARNING** **WARNING** **WARNING**

Moving machines can cause damage to personal property, personal injury or death. It is the responsibility of the reader of this document to take adequate safety precautions when operating, designing, or building any machinery, or when offering machinery to others for use.

None of the software, documents, firmware, schematics, drawings or other materials accompanying this document have been checked for errors, omissions or mistakes of any kind. Use it at your own risk.

Your use of the software, documents, firmware, schematics, drawings or other materials accompanying this document is governed by the [License Agreement](../../LICENSE.txt). Read it before proceeding.

# Orchestra Hardware

Once you've got the software running, you can begin to experiment with your own
custom hardware to make some music.

Typically, this will involve three classes of component: an **actuator driver**
to turn the digital note information into electrical pulses, which in turn
activate **actuators** such as motors, which in turn cause **sounding bodies**
to resonate.

## Cameras

If you choose to stream video and audio of the hardware, you will need a camera, with microphone, pointed at the instrument. We use tested with simple USB webcams. Any type that works well on your computer should work for streaming.
It recommended you use for each instrument so that you can easily position it.

## Actuator drivers

The output from the Hub (Max patch) is plain old MIDI note ons and note offs.
To use that to make some actuators move, you have some options.

The [Chrome Web Lab](http://www.chromeweblab.com/) uses proprietary MIDI decoders,
but there are a handful of cheaply-available alternatives.

In any case, a basic **requirement** is that you'll need some kind of MIDI OUT
from the machine running the Hub software. Any consumer musician audio interface
will have one. Additionally, there are a number of cheap USB-to-MIDI interfaces
out there.

### Highly Liquid MIDI Decoders

The most well-suited off-the-shelf MIDI-to-voltage boards we've come across are the
[Highly Liquid MIDI Decoders](http://store.highlyliquid.com/collections/midi-decoders/).
They require a minimal amount of soldering and have useful default configurations.
Plus, there's an active community around them ready to help out.

We've tested with the `MSA-P` photorelay model. Note: If you'd like to drive actuators,
please select a model that uses a relay or switch; otherwise you won't have the amperage
(or possibly even the voltage) you need to drive physical actuators.

In addition to the board itself, it was also necessary to purchase MIDI connectors
(also from Highly Liquid) as well as two power supplies: one for the control voltage
of the circuit, and the other to drive the actuators. Power supplies can be purchased at
Digikey, Radio Shack, or any other electronics store. Please consult the documentation
for your particular model for specs.

You'll need to solder on a MIDI in port and screw in your control voltage power
supply using the screw terminals. At that point, you can begin to test, as the LEDs
on the board will light up when they receive MIDI!

If you require more actuators, you can daisy-chain several boards together using MIDI THRU.
You'll then have to configure them individually. Please consult the ample documentation
on [highlyliquid.com](http://highlyliquid.com/hl2012/support).

## Actuators

The Universal Orchestra uses mostly pull solenoids, with a cord system to
translate that force to a mallet mounted to a joint. Certain instruments use stepper
motors. Theoretically you can use whatever can be switched on and off electrically--but be careful!

## Sounding bodies

Anything that makes a sound [when struck or whacked or bowed by an actuator is fair game](https://www.google.com/search?q=non+traditional+percussion).
