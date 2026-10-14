'use strict';
// Load browser UMD modules in the same realm when the repository's package.json
// declares ESM. Avoid require() of .js under Node 22/24 without touching app code.
const fs=require('node:fs');
const path=require('node:path');
module.exports=function loadUmd(relativePath){
 const source=fs.readFileSync(path.resolve(__dirname,relativePath),'utf8');
 const target={exports:{}};
 new Function('module',source+'\nreturn module.exports;')(target);
 return target.exports;
};
