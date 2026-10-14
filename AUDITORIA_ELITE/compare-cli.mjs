// Read-only snapshot comparison CLI. Never writes financial data.
import {readFileSync} from 'node:fs';
import {compareSnapshots} from './compare-snapshots.mjs';
if (process.argv.length !== 4) {
  console.error('Usage: node AUDITORIA_ELITE/compare-cli.mjs html-snapshot.json elite-snapshot.json');
  process.exitCode=2;
} else {
  try {
    const [a,b]=process.argv.slice(2).map(p=>JSON.parse(readFileSync(p,'utf8')));
    const result=compareSnapshots(a,b);
    process.stdout.write(JSON.stringify(result,null,2)+'\n');
    process.exitCode=result.certified?0:1;
  } catch(e) {
    console.error('AUDIT_BLOCKED:',e.message);
    process.exitCode=2;
  }
}
