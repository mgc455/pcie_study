import json,re,sys
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
features=json.loads((ROOT/'content/features.json').read_text(encoding='utf-8'))
protocols=json.loads((ROOT/'content/protocols.json').read_text(encoding='utf-8'))
documents_by_id={d['id']:d for d in protocols}
assert len(documents_by_id)==len(protocols)
assert len(features)>=162 and len({f['id'] for f in features})==len(features)
assert {f['id'] for f in features}==set(range(1,len(features)+1)), 'Preserve existing IDs and append new contiguous IDs'
assert len({f['group'] for f in features})>=12
for f in features:
    assert all(f.get(k) for k in ['name','intro','mechanism','example','checks','prerequisites'])
    for detail in f.get('details',[]):
        assert detail.get('title') and (detail.get('paragraphs') or detail.get('table'))
        if 'table' in detail:
            table=detail['table']
            assert table['columns'] and table['rows']
            assert all(len(row)==len(table['columns']) for row in table['rows'])
    for ref in f.get('protocolReferences',[]):
        assert ref['documentId'] in documents_by_id
        doc=documents_by_id[ref['documentId']]
        assert ref['version']==doc['version'] and 1<=ref['pdfPage']<=doc['pages']
        assert isinstance(ref['page'],int) and ref['page']>=1
        assert re.fullmatch(r'\d+(?:\.\d+)*',ref['section'])
        assert ref['url']==doc['url']
raw='\n'.join((ROOT/'docs'/n).read_text(encoding='utf-8') for n in ['index.html','style.css','app.js','data.js'])
assert not re.search(r'file:///|[A-Z]:[\\/]|/Users/|pcie_test_ip|DWC_pcie_ctl|CX_[A-Z_]+|CC_[A-Z_]+',raw),'Found local-only/project-specific content in website'
assert not any(p.suffix.lower() in {'.pdf','.sv','.svh','.v','.doc','.docx','.ppt','.pptx','.cdl','.sp','.spi','.gds','.oas','.lef','.lib','.db','.hex','.mem','.rom','.bin'} for p in (ROOT/'docs').rglob('*') if p.is_file())
assert 'fetch(' not in (ROOT/'web/app.js').read_text(encoding='utf-8'),'Website is intended to work without content/PDF upload APIs'
assert 'URL.createObjectURL(file)' in raw and '#page=' in raw
class Check(HTMLParser):
    def __init__(self):super().__init__();self.ids=set();self.files=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:assert a['id'] not in self.ids;self.ids.add(a['id'])
        if tag=='script' and 'src' in a:self.files.append(a['src'])
        if tag=='link' and a.get('rel')=='stylesheet':self.files.append(a['href'])
p=Check();p.feed((ROOT/'docs/index.html').read_text(encoding='utf-8'));p.close()
assert all((ROOT/'docs'/f).is_file() for f in p.files)
assert {'content','search','groups','pdf-dialog','pdf-file'}<=p.ids
for fn in ['changelog','maintenance','protocols','documents','generations','self-audit','phy']:json.loads((ROOT/f'content/{fn}.json').read_text(encoding='utf-8'))
g=json.loads((ROOT/'content/generations.json').read_text(encoding='utf-8'))
assert [x['gen'] for x in g['items']]==list(range(1,8))
assert [x['rate'] for x in g['items']]==[2.5,5,8,16,32,64,128]
sources={s['id'] for s in g['sources']}
for x in g['items']:
    assert set(x['sourceIds'])<=sources and x['sourceIds']
    assert set(x['featureIds'])<={f['id'] for f in features}
    assert x['change'] and x['focus']
assert all(x['efficiency'] is None for x in g['items'][-2:]), 'FLIT overhead is not 128/130'
assert '#generations' in raw and '#audit' in raw
phy=json.loads((ROOT/'content/phy.json').read_text(encoding='utf-8'))
phy_ids=[id for group in phy['groups'] for id in group['ids']]
assert len(phy_ids)==len(set(phy_ids))==20
assert set(phy_ids)<={f['id'] for f in features}
assert all(len(flow['stages'])>=4 for flow in phy['flows'])
assert '#phy' in raw
# Audit the entire publication allowlist, including maintenance scripts and instructions.
public_files=['.gitignore','site.config.json','AGENTS.md','README.md','.github/workflows/check.yml']
public_files += ['scripts/'+n for n in ['build.py','check.py','import_content.py','index_protocol.py','map_references.py','prepare_public.py']]
public_files += ['web/'+n for n in ['index.html','style.css','app.js']]
public_files += ['content/'+n+'.json' for n in ['features','documents','protocols','changelog','maintenance','generations','self-audit','phy']]
public_files += ['docs/'+n for n in ['index.html','style.css','app.js','data.js','.nojekyll']]
drive_path=re.compile(r'(?<![A-Za-z0-9])[A-Za-z]:[\\/]')
for relative in public_files:
    text=(ROOT/relative).read_text(encoding='utf-8')
    assert not drive_path.search(text), f'Absolute drive path in publication file: {relative}'
    assert not re.search(r'/(?:Users|home)/[^\s\"\x27<>/]+/',text), f'Home directory in publication file: {relative}'
assert len(public_files)==27
print(f'PASS: {len(features)} features, Gen1–Gen7, source links, public-content boundary, local-only PDF reader, static assets, JSON and HTML structure.')
