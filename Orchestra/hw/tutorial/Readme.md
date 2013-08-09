# MIDI Whirlophone

**WARNING** **WARNING** **WARNING** **WARNING**

Moving machines can cause damage to personal property, personal injury or death. It is the responsibility of the reader of this document to take adequate safety precautions when operating, designing, or building any machinery, or when offering machinery to others for use.

None of the software, documents, firmware, schematics, drawings or other materials accompanying this document have been checked for errors, omissions or mistakes of any kind. Use it at your own risk.

Your use of the software, documents, firmware, schematics, drawings or other materials accompanying this document is governed by the [License Agreement](../LICENSE.txt). Read it before proceeding.

All trademarks are the property of their respective owners.

## Introduction
This an example of a 'musical' instrument that can be developed using the Chrome Web Lab's Orchestra system. For a full description of the history and concept of the project, see [this page](https://github.com/GoogleChrome/ChromeWebLab/tree/master/Orchestra).

But we're here to make something. Specifically, this thing:

![Dremelphone](images/intro1.jpg)

A MIDI-controlled whirlophone. A MIDI-controlled servo/percussive tonal experience, powered by a hobby rotary power tool.

## Materials

The first step is to acquire all of the parts we will need to build this project. 

Tools:

* Safety goggles
* Band saw or handheld jigsaw
* Scissors
* Hot glue gun and a little bit of hot glue
* Wire cutter/stripper

###Electronics

| Quantity | Description |
|----------|-------------|
| 1        | USB MIDI interface &mdash; look around, there are [some inexpensive ones out there](https://www.google.com/search?biw=1025&bih=760&tbm=shop&q=usb+midi+interface) |
| 1        | Standard Male/Male [MIDI cable](https://www.google.com/search?q=midi+cable&source=univ&tbm=shop) |
| 1        | Arduino &mdash; nearly any will do, such as the [Leonardo](http://store.arduino.cc/ww/index.php?main_page=product_info&cPath=11_12&products_id=226) |
| 4        | Standard 6V metal gear hobby servos* &mdash; [such as these](https://www.sparkfun.com/products/10333) 
| 1        | [DIN 5/180 MIDI Connector](https://www.sparkfun.com/products/9536) |
| 1        | [6N138 Optocoupler](http://www.digikey.com/product-detail/en/6N138-000E/516-1600-5-ND/825236) |
| 1        | 220ohm resistor |
| 1        | 270ohm resistor |
| 2        | 100ohm resistors |
| 1        | 1kOhm resistor |
| 1        | [1N914 diode](http://www.digikey.com/product-detail/en/1N914/1N914FS-ND/978749) |
| 1        | 12 volt DC power supply &mdash; such as [this one](#LINK) |
| spool    | Red hookup wire |
| spool    | Black hookup wire |
| 1        | [breadboard](https://www.sparkfun.com/products/9567) |

**We used 7.4V servos and powered them on a separate supply from the Arduino. Typically powering servos through the Arduino is not a good idea unless they are very small or you only need to power one or two.*

###Other materials

| Quantity | Description |
|----------|-------------|
| 4        | Drinking glasses, roughly 3" diameter base &mdash; any kind will do, really |
| 1        | [Dremel hobby tool with flex shaft, or similar motorized rotary tool](https://www.google.com/search?q=dremel+tool+with+flex+shaft) |
| 1        | [10" diameter wooden clock base, 3/4" thick](#LINK) |
| quarter-sheet | Quarter sheet of 3/4" plywood &mdash; we used scrap wood we had laying around, enough for 4 3" squares, and 4 3/4" x 3/4" x 1" blocks |
| quarter-sheet | 3/16" plywood for cams (1/8" would work), a 3" x 10" piece is plenty |
| 1 box    | [Thumb Tacks](http://www.officedepot.com/a/products/323873/OIC-Thumb-Tacks-No-2-38/) |
| | Masking Tape |
| 1        | Small wooden bead |
| a few inches | Cotton twine |
| 4        | 3" narrow hinges with screws &mdash; [like these](http://www.homedepot.com/p/Everbilt-3-in-Zinc-Plated-Non-Removable-Pin-Narrow-Utility-Hinges-2-Pack-15168/202033931#.UgQn92Tm3kg) |

## Electronics

1. Following the diagram, assemble the the MIDI input circuit. 

![Dremelphone](images/midi-in-circuit.jpg)

2. Connect the Servos (TODO: add servo circuit)

*note that your power supply needs for the servos will vary based on the required supply voltage

## Building the Base

**Important**: Always wear safety goggles while using power tools. In fact, you should wear safety goggles while using this instrument.

1. Layout on Clock Face
We're going to lay out all the cutlines on the clock face first. First, draw two perpendicular diameters. Make a mark at 2" and 2 1/4" in from the circle's edge along each line. The 2" mark is where we're going to drill. 

2. Drill and Cut Slots

3. Cut Cam and other Parts

4. Predrill for Screws

5. Attach cams to servos

6. Align servos in slots and mark

7. Attach Hinges and Servos

8. Attach Base Legs

9. Connect wiring

10. Glue Glasses

11. Make Threaded Bead

12. Tune Glasses with water

13. Fire it up!
