"use strict";module.export({default:()=>GLBParser});var unpackGLTFBuffers;module.link('../gltf/unpack-gltf-buffers',{default(v){unpackGLTFBuffers=v}},0);var unpackBinaryJson;module.link('../packed-json/unpack-binary-json',{default(v){unpackBinaryJson=v}},1);var assert;module.link('../utils/assert',{default(v){assert=v}},2);var parseGLBSync,isGLB;module.link('../glb/parse-glb',{default(v){parseGLBSync=v},isGLB(v){isGLB=v}},3);var ATTRIBUTE_TYPE_TO_COMPONENTS,ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE,ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY;module.link('../gltf/gltf-type-utils',{ATTRIBUTE_TYPE_TO_COMPONENTS(v){ATTRIBUTE_TYPE_TO_COMPONENTS=v},ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE(v){ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE=v},ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY(v){ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY=v}},4);/* eslint-disable camelcase, max-statements, no-restricted-globals */











class GLBParser {
  static isGLB(arrayBuffer, options = {}) {
    const dataView = new DataView(arrayBuffer);
    const byteOffset = 0;
    return isGLB(dataView, byteOffset);
  }

  // Return the gltf JSON and the original arrayBuffer
  parse(arrayBuffer, options = {}) {
    return this.parseSync(arrayBuffer, options);
  }

  parseSync(arrayBuffer, options = {}) {
    this.glbArrayBuffer = arrayBuffer;

    this.binaryByteOffset = null;
    this.packedJson = null;
    this.json = null;

    // Only parse once
    if (this.json === null && this.binaryByteOffset === null) {
      const byteOffset = 0;

      // Populates the supplied object (`this`) with parsed data members.
      parseGLBSync(this, this.glbArrayBuffer, byteOffset, options);

      // Backwards compat
      this.binaryByteOffset = this.binChunkByteOffset;

      // Unpack binary JSON
      this.packedJson = this.json;
      this.unpackedBuffers = unpackGLTFBuffers(
        this.glbArrayBuffer,
        this.json,
        this.binaryByteOffset
      );
      this.json = unpackBinaryJson(this.json, this.unpackedBuffers);
    }

    return this;
  }

  // Returns application JSON data stored in `key`
  getApplicationData(key) {
    return this.json[key];
  }

  // Returns JSON envelope
  getJSON() {
    return this.json;
  }

  // Return binary chunk
  getArrayBuffer() {
    return this.glbArrayBuffer;
  }

  // Return index into binary chunk
  getBinaryByteOffset() {
    return this.binaryByteOffset;
  }

  // Unpacks a bufferview into a new Uint8Array that is a view into the binary chunk
  getBufferView(glTFBufferView) {
    const byteOffset = (glTFBufferView.byteOffset || 0) + this.binaryByteOffset;
    return new Uint8Array(this.glbArrayBuffer, byteOffset, glTFBufferView.byteLength);
  }

  // Unpacks a glTF accessor into a new typed array that is a view into the binary chunk
  getBuffer(glTFAccessor) {
    // Decode the glTF accessor format
    const ArrayType = ATTRIBUTE_COMPONENT_TYPE_TO_ARRAY[glTFAccessor.componentType];
    const components = ATTRIBUTE_TYPE_TO_COMPONENTS[glTFAccessor.type];
    const bytesPerComponent = ATTRIBUTE_COMPONENT_TYPE_TO_BYTE_SIZE[glTFAccessor.componentType];
    const length = glTFAccessor.count * components;
    const byteLength = glTFAccessor.count * components * bytesPerComponent;

    // Get the boundaries of the binary sub-chunk for this bufferView
    const glTFBufferView = this.json.bufferViews[glTFAccessor.bufferView];
    assert(byteLength >= 0 && glTFAccessor.byteOffset + byteLength <= glTFBufferView.byteLength);

    const byteOffset = glTFBufferView.byteOffset + this.binaryByteOffset + glTFAccessor.byteOffset;
    return new ArrayType(this.glbArrayBuffer, byteOffset, length);
  }

  // Unpacks an image into an HTML image
  getImageData(glTFImage) {
    return {
      typedArray: this.getBufferView(glTFImage.bufferView),
      mimeType: glTFImage.mimeType || 'image/jpeg'
    };
  }

  getImage(glTFImage) {
    /* global self, Blob, Image */
    const arrayBufferView = this.getBufferView(glTFImage.bufferView);
    const mimeType = glTFImage.mimeType || 'image/jpeg';
    const blob = new Blob([arrayBufferView], {type: mimeType});
    const urlCreator = self.URL || self.webkitURL;
    const imageUrl = urlCreator.createObjectURL(blob);
    const img = new Image();
    img.src = imageUrl;
    return img;
  }

  getImageAsync(glTFImage) {
    /* global self, Blob, Image */
    return new Promise(resolve => {
      const arrayBufferView = this.getBufferView(glTFImage.bufferView);
      const mimeType = glTFImage.mimeType || 'image/jpeg';
      const blob = new Blob([arrayBufferView], {type: mimeType});
      const urlCreator = self.URL || self.webkitURL;
      const imageUrl = urlCreator.createObjectURL(blob);
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = imageUrl;
    });
  }
}