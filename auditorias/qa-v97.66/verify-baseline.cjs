const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const root=path.resolve(__dirname,'../..');
const baseline=JSON.parse(fs.readFileSync(path.join(root,'auditorias/base-v97.66.json'),'utf8'));
for(const [file,expected]of Object.entries(baseline.files)){
 const actual=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex');
 assert.equal(actual,expected,'The accepted baseline was changed: '+file);
}
console.log(JSON.stringify({base:baseline.version,immutableSnapshotFilesVerified:Object.keys(baseline.files).length,releaseCommit:baseline.release_commit}));
