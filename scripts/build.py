import json,shutil,datetime,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];out=ROOT/'docs';out.mkdir(exist_ok=True)
data={name:json.loads((ROOT/'content'/file).read_text(encoding='utf-8')) for name,file in [('features','features.json'),('documents','documents.json'),('protocols','protocols.json'),('changelog','changelog.json'),('maintenance','maintenance.json')]}
data['generations']=json.loads((ROOT/'content/generations.json').read_text(encoding='utf-8'))
data['audit']=json.loads((ROOT/'content/self-audit.json').read_text(encoding='utf-8'))
data['builtDate']=max(c['date'] for c in data['changelog'])
for name in ['index.html','style.css','app.js']:shutil.copyfile(ROOT/'web'/name,out/name)
(out/'data.js').write_text('window.PCIE_STUDY = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8')
(out/'.nojekyll').write_text('',encoding='utf-8')
print('Built docs/:',len(data['features']),'features;',sum(bool(f.get('protocolReferences')) for f in data['features']),'protocol locators;',data['documents']['candidateCount'],'document candidates.')
