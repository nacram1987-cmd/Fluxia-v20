import re,sys,subprocess,os,tempfile
s=open(sys.argv[1],encoding='utf-8').read()
blocks=re.findall(r'<script(?![^>]*\bsrc=)(?![^>]*type="(?:application/ld\+json|text/template|module)")[^>]*>(.*?)</script>',s,re.S)
err=0
for i,b in enumerate(blocks):
    fd,p=tempfile.mkstemp(suffix='.js'); os.write(fd,b.encode()); os.close(fd)
    r=subprocess.run(['node','--check',p],capture_output=True,text=True)
    if r.returncode: err+=1; print('BLOQUE',i,r.stderr[:600])
    os.unlink(p)
print('bloques',len(blocks),'errores',err)
