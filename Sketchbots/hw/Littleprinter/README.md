LittlePrinter
=============

![weblab](https://f.cloud.github.com/assets/45510/905194/c9308636-fc04-11e2-821b-1e66c769f80f.gif)

The [LittlePrinter](http://bergcloud.com/littleprinter/) by [BergCloud](http://bergcloud.com/) is a beautifully simple
thermal printer that is connected to the Internet.

As a user you don't have access to the printer, you send documents up to the cloud service and then they get sent to the printer from there.

If you have a LittlePrinter this guide shows you how to hook it up to an instance of WebLab.

1.  Open the  Sketchbots / sw / robotcontrol / src / ConfigParams.js file
2.  Change the DRAW_MACHINE_TYPE: to DRAW_MACHINE_TYPE: 'LittlePrinter',
3.  Visit http://remote.bergcloud.com/developers/direct_print_codes and get your Printer Code
4.  Add in your direct print code to
    LITTLE_PRINTER: {
        DEVICE_ID: "[YOUR CODE HERE]" // This needs to be code found at the bottom of http://remote.bergcloud.com/developers/direct_print_codes
    },

That is it.

Start up the labqueue and robotcontroller and visit your local instance.
