import json,re,sys
from pathlib import Path
from html.parser import HTMLParser
ROOT=Path(__file__).resolve().parents[1]
features=json.loads((ROOT/'content/features.json').read_text(encoding='utf-8'))
assert len(features)==162 and len({f['id'] for f in features})==162
assert len({f['group'] for f in features})==12
for f in features:
    assert all(f.get(k) for k in ['name','intro','mechanism','example','checks','prerequisites'])
    for ref in f.get('protocolReferences',[]):
        assert ref['documentId']=='pcie-base-6.0'
        assert ref['version']=='6.0' and 1<=ref['pdfPage']<=1924
        assert re.fullmatch(r'\d+(?:\.\d+)*',ref['section'])
        assert ref['url'].startswith('https://pcisig.com/')
raw='\n'.join((ROOT/'docs'/n).read_text(encoding='utf-8') for n in ['index.html','style.css','app.js','data.js'])
assert not re.search(r'file:///|[A-Z]:[\\/]|/Users/|pcie_test_ip|DWC_pcie_ctl|CX_[A-Z_]+|CC_[A-Z_]+',raw),'Found local-only/project-specific content in website'
assert not any(p.suffix.lower() in {'.pdf','.sv','.svh','.v','.doc','.docx','.ppt','.pptx'} for p in (ROOT/'docs').rglob('*') if p.is_file())
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
for fn in ['changelog','maintenance','protocols','documents']:json.loads((ROOT/f'content/{fn}.json').read_text(encoding='utf-8'))
print('PASS: 162 features, reference metadata, public-content boundary, local-only PDF reader, static assets, JSON and HTML structure.')
