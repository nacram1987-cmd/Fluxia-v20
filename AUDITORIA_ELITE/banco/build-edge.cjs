const fs=require('node:fs');
let s=fs.readFileSync('AUDITORIA_ELITE/banco/Fluxia-banco-lab9755-backup.ts','utf8');
const patch=(a,b)=>{if(s.split(a).length!==2)throw Error('Edge anchor mismatch '+a.slice(0,60));s=s.replace(a,b)};
patch('const VERSION = "fluxia-banco-lab-v97.55";', 'const VERSION = "fluxia-banco-lab-v97.70";');
patch('    moneda: a.currency || "EUR",', '    identificationHashes: Array.isArray(a.identification_hashes) ? a.identification_hashes.filter(Boolean).map(String).sort() : [],\n    moneda: a.currency || "EUR",');
patch('function mapMov(t: any, banco: string) {','function mapMov(t: any, banco: string, accountKey: string = "", accountId: string = "", accountKeyKind: string = "provider-uid") {');
patch('    id: String(id),\n    fecha,','    id: String(id),\n    legacyId: String(id),\n    stableRef: String(t.entry_reference || `fallback|${fecha}|${importe}|${concepto}|${contraparte}|${ccy}`),\n    idAuthority: t.entry_reference ? "provider" : "fallback",\n    provider: "enablebanking",\n    accountKey,\n    accountId,\n    accountKeyKind,\n    fecha,');
// Account keys use a one-way digest of the bank/IBAN when available, so a new
// consent/account UID does not create a new identity for the same account.
patch('  for (const uid of uids) {\n    try {\n      let continuation:',`  for (const uid of uids) {
    try {
      const account = (work.cuentas || []).find((c: any) => String(c.uid) === String(uid));
      const iban = String(account?.iban || "").replace(/\\s/g, "").toUpperCase();
      const hashes = Array.isArray(account?.identificationHashes) ? account.identificationHashes.filter(Boolean).map(String).sort().join("|") : "";
      const seed = "enablebanking|" + String(work.banco).toLowerCase() + "|" + (iban || hashes || String(uid));
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed));
      const accountKey = Array.from(new Uint8Array(digest)).map(x => x.toString(16).padStart(2,"0")).join("");
      let continuation:`);
patch('const m = mapMov(t, work.banco);','const m = mapMov(t, work.banco, accountKey, String(uid), iban ? "iban-digest" : (hashes ? "provider-hashes" : "provider-uid"));');
// Keep raw IDs for provider compatibility. V9770 carries the account namespace
// before client dedupe. The legacy global blacklist must be resolved by the
// scoped client; filtering raw IDs here could discard a different bank/account.
patch('movimientos = movimientos.filter(m => !blacklist.has(m.id));','movimientos = movimientos.filter(m => !blacklist.has("fxbank9770:" + JSON.stringify(["enablebanking",String(m.banco).toLowerCase().normalize("NFD").replace(/[\\u0300-\\u036f]/g, "").replace(/[^a-z0-9]/g,""),m.accountKey,String(m.stableRef||m.id)])));');
patch('    const { sb, user } = await userFromReq(req);','    let authenticated;\n    try { authenticated = await userFromReq(req); }\n    catch (e: any) { return err(e?.message || "Sesión no válida", 401); }\n    const { sb, user } = authenticated;');
fs.writeFileSync('AUDITORIA_ELITE/banco/Fluxia-banco-lab9770.ts',s);
console.log(JSON.stringify({function:'Fluxia-banco-lab9770',originalPreserved:true,providerRequestsUnchanged:true,accountKey:'SHA256(bank + iban or provider uid)',legacyRawIdRetained:true}));
