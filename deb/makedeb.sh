#!/bin/sh

# Setting this environment variable fixes Apple's modified GNU tar so that
# it won't make dot-underscore AppleDouble files. Google it for details...
export COPY_EXTENDED_ATTRIBUTES_DISABLE=1

# create the data tarball
# (the tar options "czvf" mean create, zip, verbose, and filename.  h - follow symlinks)
tar czvfh data.tar.gz opt/ChromeWeblab

# create the control tarball
tar czvf control.tar.gz control preinst postrm

# create the ar (deb) archive
ar -r chromeweblab.deb debian-binary control.tar.gz data.tar.gz

rm data.tar.gz control.tar.gz
