'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const f=process.argv[2]||'AUDITORIA_ELITE/logs/benchmark.json',d=JSON.parse(fs.readFileSync(f,'utf8'));
const a=d.versions['lab/v97.68.html'],b=d.versions['lab/v97.73.html'];assert(a&&b,'benchmark must include v97.68 and v97.73');
assert.equal(b.errors.length,0,'v97.73 has JS/DOM errors');
const metrics=['construction','domContentLoaded','menu','warmVariables','coldVariables','bankPanel'],out={reference:'v97.68',candidate:'v97.73',tolerance:1.15,results:{}};
for(const k of metrics){const base=a[k].median,candidate=b[k].median,ratio=base>0?candidate/base:1;out.results[k]={referenceMedianMs:base,candidateMedianMs:candidate,ratio};assert(candidate<=base*1.15||candidate-base<=1,`reproducible performance regression in ${k}: ${ratio.toFixed(2)}x`)}
console.log(JSON.stringify(out,null,2));
