# Copyright Google Inc, 2013
# See LICENSE.TXT for licensing information.
"""Convenient base class for imaging

"""

from google.appengine.api import images
import logging

def generate_thumbnail(image_data, min_source_height, max_source_height, min_source_width, max_source_width, content_type, width, height, overlay_path, valign, top_crop_pct=None, bottom_crop_pct=None, left_crop_pct=None, right_crop_pct=None, crop_x=None, crop_y=None, post_crop_uniform_scale_pct=None):
    """ Generate a thumbnail and return the image data as a
    binary string. If unable to create the
    thumbnail, will return None.
    
    :min_source_height:
        If specified, a thumbnail will only be generated if the incoming image
        is at least this high.
    
    :min_source_width:
        If specified, a thumbnail will only be generated if the incoming image
        is at least this wide.
    
    :max_source_height:
        If specified, a thumbnail will only be generated if the incoming image
        is less than this many pixels high.
    
    :max_source_width:
        If specified, a thumbnail will only be generated if the incoming image
        is less than this many pixels wide.
    
    :image_data:
        Image data, as a bytestring
    
    :content_type:
        The MIME content type of the image.
    
    :width:
        Width of the thumbnail
    
    :height:
        Height of the thumbnail
    
    :overlay_path:
        Full path to an image file to overlay on top of the image data, or None
        to not use an overlay.
    
    :valign:
        A string, one of:
            "top"
            "bottom"
            "middle"
        describing how the image should be aligned along the
        Y-axis when cropping.
    
    :top_crop_pct:
    :bottom_crop_pct:
        Optional. Floats indicating how much from the top and bottom of the
        original image to crop in before rescaling. Numbers between 0 and 1.0 incl.
    
    :crop_x:
    :crop_y:
        Optional. If specified with width and height, will simply cut out a rectangle
        of the incoming image which is width x height and has its upper-left corner
        pegged to (crop_x, cropy_y).
        
        NOTE: For crop_x and crop_y to work, the following other options must be None:
            valign, top_crop_pct, bottom_crop_pct

    :post_crop_uniform_scale_pct:
        If not None, will scale image after cropping by the indicated percent. Should be None or a
        float between 0.0 and 1.0
    
    """
    # figure out the width/height of the image from the datastore
    
#    img = images.Image(image_data=image_data)
#    img.crop(left_x=0.25, top_y=0.25, right_x=0.25, bottom_y=0.25)
#    img.resize(width=width, height=height)
#    logging.info('(b) w=%i, h=%i' % (img.width, img.height))
#    output = img.execute_transforms(output_encoding=img.format)
    
    image = images.Image(image_data)
    
    if min_source_height is not None and image.height < min_source_height:
        return None
    if max_source_height is not None and image.height > max_source_height:
        return None
    
    if min_source_width is not None and image.width < min_source_width:
        return None
    if max_source_width is not None and image.width > max_source_width:
        return None
    
    
    if content_type == 'image/png':
        output_encoding = images.PNG
    else:
        output_encoding = images.JPEG
    if crop_x is not None and crop_y is not None and valign is None and top_crop_pct is None and bottom_crop_pct is None and (image.width >= crop_x + width) and (image.height >= crop_y + height):
        fw = float(image.width)
        fh = float(image.height)
        try:
            output = images.crop(image_data, float(crop_x) / fw, float(crop_y) / fh, float(crop_x + width) / fw, float(crop_y + height) / fh, output_encoding=output_encoding)
        except:
            output = image_data
    else:
        if width > image.width and height > image.height:
            output = image_data
#            # this would result in scaling the image UP, that's no good
#            if image.width > image.height:
#                width = image.width
#            else:
#                height = image.height
#                
#            output = images.resize(image_data, width, height, output_encoding)
        else:
            output = rescale(image, width, height, halign='middle', valign=valign, top_crop_pct=top_crop_pct, bottom_crop_pct=bottom_crop_pct, left_crop_pct=left_crop_pct, right_crop_pct=right_crop_pct)
    
    if post_crop_uniform_scale_pct is not None:
        output = images.resize(output, width=int(width * post_crop_uniform_scale_pct), output_encoding=output_encoding)
    
    if overlay_path is not None:
        # read the overlay into memory
        overlay_data = open(overlay_path,'r').read()
        # composite the overlay onto the rescaled output
        if content_type == 'image/png':
            output_encoding = images.PNG
        else:
            output_encoding = images.JPEG
        output = images.composite(
            inputs=[
                (output,0,0,1.0,images.CENTER_CENTER),
                (overlay_data,0,0,1.0,images.CENTER_CENTER),
            ],
            width=width,
            height=height,
            output_encoding=output_encoding
        )
    return output
    
#    # Get a "file name" for a blobstore entity
#    blob_file_name = files.blobstore.create(mime_type=content_type)
#    # Open the blob and write the contents of the trasnfered file to it
#    with files.open(blob_file_name, 'a') as target:
#        target.write(output)
#    # all done, let blobstore finish up
#    files.finalize(blob_file_name)
#    
#    # retain a reference to the key
#    k = files.blobstore.get_blob_key(blob_file_name)
#    # logging.info(k)
#    return k

def rescale(image, width, height, halign='middle', valign='middle', top_crop_pct=None, bottom_crop_pct=None, left_crop_pct=None, right_crop_pct=None, post_crop_uniform_scale_pct=None):
  """
  From http://stackoverflow.com/questions/1944112/app-engine-cropping-to-a-specific-width-and-height
  
  Resize then optionally crop a given image.

  Attributes:
    image: The image
    width: The desired width
    height: The desired height
    halign: Acts like photoshop's 'Canvas Size' function, horizontally
            aligning the crop to left, middle or right
    valign: Verticallly aligns the crop to top, middle or bottom
    
    :post_crop_uniform_scale_pct:
        If not None, will scale image after cropping by the indicated percent. Should be None or a
        float between 0.0 and 1.0

  """
  #image = images.Image(img_data)
  
  #logging.info(left_crop_pct)
  
  if top_crop_pct is not None and bottom_crop_pct is not None:
    if left_crop_pct is not None and right_crop_pct is not None:
        image.crop(left_crop_pct,top_crop_pct,right_crop_pct,bottom_crop_pct)
    else:
        image.crop(0.0,top_crop_pct,1.0,bottom_crop_pct)
  elif left_crop_pct is not None and right_crop_pct is not None:
    image.crop(left_crop_pct,0.0,right_crop_pct,1.0)

  desired_wh_ratio = float(width) / float(height)
  wh_ratio = float(image.width) / float(image.height)

  if desired_wh_ratio > wh_ratio:
    # resize to width, then crop to height
    image.resize(width=width)
    output = image.execute_transforms()
    if image.width < width or image.height < height:
        return output
    trim_y = (float(image.height - height) / 2) / image.height
    if valign == 'top':
      image.crop(0.0, 0.0, 1.0, 1 - (2 * trim_y))
    elif valign == 'bottom':
#      logging.info('----------')
#      logging.info(image.height)
#      logging.info(image.width)
#      logging.info(height)
#      logging.info(trim_y)
      image.crop(0.0, (2 * trim_y), 1.0, 1.0)
    else:
      image.crop(0.0, trim_y, 1.0, 1 - trim_y)
  else:
    # resize to height, then crop to width
    image.resize(height=height)
    output = image.execute_transforms()
    if image.width < width or image.height < height:
        return output
    trim_x = (float(image.width - width) / 2) / image.width
    if halign == 'left':
      image.crop(0.0, 0.0, 1 - (2 * trim_x), 1.0)
    elif halign == 'right':
      image.crop((2 * trim_x), 0.0, 1.0, 1.0)
    else:
      image.crop(trim_x, 0.0, 1 - trim_x, 1.0)

  return image.execute_transforms()
    