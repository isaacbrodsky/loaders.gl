"use strict";var worker;module.link('../dist/draco-loader.worker.js',{default(v){worker=v}},0);// The bundled worker is imported as an inline string


module.exportDefault({
  name: 'DRACO',
  extensions: ['drc'],
  worker
});