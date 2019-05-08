"use strict";module.export({encodeImage:()=>encodeImage});var assert;module.link('@loaders.gl/core',{assert(v){assert=v}},0);var encodeImageNode;module.link('../node/encode-image-node',{encodeImageNode(v){encodeImageNode=v}},1);// Image loading/saving for browser
/* global document, HTMLCanvasElement, Image */




/*
 * Returns data bytes representing a compressed image in PNG or JPG format,
 * This data can be saved using file system (f) methods or
 * used in a request.
 * @param {Image}  image - Image or Canvas
 * @param {String} opt.type='png' - png, jpg or image/png, image/jpg are valid
 * @param {String} opt.dataURI= - Whether to include a data URI header
 */
function encodeImage(image, type) {
  if (encodeImageNode) {
    return encodeImageNode(image, type);
  }

  if (image instanceof HTMLCanvasElement) {
    const canvas = image;
    return canvas.toDataURL(type);
  }

  assert(image instanceof Image, 'getImageData accepts image or canvas');
  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;
  canvas.getContext('2d').drawImage(image, 0, 0);

  // Get raw image data
  const data = canvas.toDataURL(type || 'png').replace(/^data:image\/(png|jpg);base64,/, '');
  return Promise.resolve(data);
}