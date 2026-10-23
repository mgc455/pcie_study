import json,re,sys,hashlib
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
    detail_ids=[d['id'] for d in f.get('details',[]) if 'id' in d]
    assert len(detail_ids)==len(set(detail_ids)), 'Duplicate stable detail ID'
    assert all(re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*',key) for key in detail_ids), 'Invalid detail URL key'
    for detail in f.get('details',[]):
        assert detail.get('title') and (detail.get('paragraphs') or detail.get('table'))
        assert all(isinstance(i,int) and 0<=i<len(f.get('protocolReferences',[])) for i in detail.get('referenceIndices',[])), 'Invalid detail source index'
        if 'table' in detail:
            table=detail['table']
            assert table['columns'] and table['rows']
            assert all(len(row)==len(table['columns']) for row in table['rows'])
    for ref in f.get('protocolReferences',[]):
        assert ref['documentId'] in documents_by_id
        doc=documents_by_id[ref['documentId']]
        assert ref['version']==doc['version'] and 1<=ref['pdfPage']<=doc['pages']
        assert isinstance(ref['page'],int) and ref['page']>=1
        assert re.fullmatch(r'(?:\d+(?:\.\d+)*|Glossary)',ref['section'])
        assert ref['url']==doc['url']
# Packet figures must account for every depicted bit, including short final rows.
packet_ids=set()
for f in features:
    for d in f.get('details',[]):
        for layout in d.get('packetLayouts',[]):
            assert layout['id'] not in packet_ids
            packet_ids.add(layout['id'])
            assert layout['version'] and layout['title'] and layout['note'] and layout['parts']
            assert sum(field['width'] for row in layout['rows'] for field in row)==layout['headerBits']
            for index,row in enumerate(layout['rows']):
                width=sum(field['width'] for field in row)
                assert width==32 or index==len(layout['rows'])-1 and width in {8,16,24}
                assert all(isinstance(field['width'],int) and field['width']>0 and field['key'] and field['label'] and field['help'] for field in row)
raw='\n'.join((ROOT/'docs'/n).read_text(encoding='utf-8') for n in ['index.html','style.css','app.js','data.js'])
for asset in ['style.css','data.js','app.js']:
    digest=hashlib.sha256((ROOT/'docs'/asset).read_bytes()).hexdigest()[:16]
    assert '"'+asset+'?v='+digest+'"' in (ROOT/'docs/index.html').read_text(encoding='utf-8'), 'Stale or missing asset version: '+asset
assert not re.search(r'file:///|[A-Z]:[\\/]|/Users/|pcie_test_ip|DWC_pcie_ctl|CX_[A-Z_]+|CC_[A-Z_]+',raw),'Found local-only/project-specific content in website'
assert not any(p.suffix.lower() in {'.pdf','.sv','.svh','.v','.doc','.docx','.ppt','.pptx','.cdl','.sp','.spi','.gds','.oas','.lef','.lib','.db','.hex','.mem','.rom','.bin'} for p in (ROOT/'docs').rglob('*') if p.is_file())
assert 'fetch(' not in (ROOT/'web/app.js').read_text(encoding='utf-8'),'Website is intended to work without content/PDF upload APIs'
assert 'URL.createObjectURL(file)' in raw and '#page=' in raw
assert (ROOT/'docs/data.js').read_bytes().endswith(b';\n') and b'\r\n' not in (ROOT/'docs/data.js').read_bytes(), 'Use deterministic LF output for Windows/Linux rebuilds'
class Check(HTMLParser):
    def __init__(self):super().__init__();self.ids=set();self.files=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if 'id' in a:assert a['id'] not in self.ids;self.ids.add(a['id'])
        if tag=='script' and 'src' in a:self.files.append(a['src'])
        if tag=='link' and a.get('rel')=='stylesheet':self.files.append(a['href'])
p=Check();p.feed((ROOT/'docs/index.html').read_text(encoding='utf-8'));p.close()
assert all((ROOT/'docs'/f.split('?',1)[0]).is_file() for f in p.files)
assert {'content','search','groups','pdf-dialog','pdf-file'}<=p.ids
for fn in ['changelog','maintenance','protocols','documents','generations','self-audit','phy','coverage']:json.loads((ROOT/f'content/{fn}.json').read_text(encoding='utf-8'))
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
if 'marginReferences' in phy:
    assert phy['marginReferences']['title'] and phy['marginReferences']['ids']
    assert len(phy['marginReferences']['ids'])==len(set(phy['marginReferences']['ids']))
    assert set(phy['marginReferences']['ids'])<={f['id'] for f in features}
    assert 'p.marginReferences' in raw
assert set(phy_ids)<={f['id'] for f in features}
if 'receiveReferences' in phy:
    assert phy['receiveReferences']['title'] and len(phy['receiveReferences']['ids'])==len(set(phy['receiveReferences']['ids']))
    assert set(phy['receiveReferences']['ids'])<={f['id'] for f in features}
    assert 'p.receiveReferences' in raw
if 'timeReferences' in phy:
    assert phy['timeReferences']['title'] and len(phy['timeReferences']['ids'])==len(set(phy['timeReferences']['ids']))
    assert set(phy['timeReferences']['ids'])<={f['id'] for f in features}
    assert 'p.timeReferences' in raw
if 'lowPowerReferences' in phy:
    assert phy['lowPowerReferences']['title'] and len(phy['lowPowerReferences']['ids'])==len(set(phy['lowPowerReferences']['ids']))
    assert set(phy['lowPowerReferences']['ids'])<={f['id'] for f in features}
assert all(len(flow['stages'])>=4 for flow in phy['flows'])
assert '#phy' in raw
coverage=json.loads((ROOT/'content/coverage.json').read_text(encoding='utf-8'))
assert [d['generation'] for d in coverage['documents']]==list(range(1,8))
features_by_id={f['id']:f for f in features}
for d in coverage['documents']:
    doc=documents_by_id[d['documentId']]
    assert d['version']==doc['version']
    pages=[c['locator']['pdfPage'] for c in d['chapters']]
    assert pages==sorted(set(pages)) and all(1<=p<=doc['pages'] for p in pages)
    assert len({c['section'] for c in d['chapters']})==len(d['chapters'])
    for chapter in d['chapters']:
        assert chapter['status'] in {'indexed','selected-rules-reviewed'}, 'No whole-chapter completion claim without a clause audit'
        locator=chapter['locator']
        assert locator['documentId']==d['documentId'] and locator['version']==d['version'] and locator['url']==doc['url']
        assert locator['section']==chapter['section'] and locator['page']>0
        assert bool(chapter['reviewedBlocks'])==(chapter['status']=='selected-rules-reviewed')
        assert set(chapter['candidateFeatureIds'])<=set(features_by_id)
        for block in chapter['reviewedBlocks']:
            f=features_by_id[block['featureId']]
            detail=next(x for x in f['details'] if x['id']==block['detailId'])
            assert block['referenceIndices'] and set(block['referenceIndices'])<=set(detail['referenceIndices'])
            assert all(f['protocolReferences'][i]['documentId']==d['documentId'] and f['protocolReferences'][i]['section'].split('.')[0]==chapter['section'] for i in block['referenceIndices'])
        clauses=chapter.get('clauses',[])
        assert len({x['section'] for x in clauses})==len(clauses)
        for clause in clauses:
            assert clause['section'].startswith(chapter['section']+'.')
            assert clause['status'] in {'indexed','linked-reviewed-rules'}, 'Do not equate a TOC entry or selected rules with a completed clause'
            assert bool(clause['reviewedBlocks'])==(clause['status']=='linked-reviewed-rules')
            loc=clause['locator']
            assert loc['documentId']==d['documentId'] and loc['version']==d['version'] and loc['section']==clause['section'] and loc['url']==doc['url']
            assert chapter['locator']['page']<=loc['page']<=doc['pages'] and 1<=loc['pdfPage']<=doc['pages']
            assert clause.get('bodyStartVerified') is True or isinstance(clause.get('tocPdfPage'),int) and clause['tocPdfPage']>0
            if clause.get('bodyStartVerified'):
                assert clause['reviewedBlocks'] and any(features_by_id[b['featureId']]['protocolReferences'][i]['pdfPage']==loc['pdfPage'] for b in clause['reviewedBlocks'] for i in b['referenceIndices']), 'Body opening requires its own exact-page evidence'
            for block in clause['reviewedBlocks']:
                f=features_by_id[block['featureId']]
                detail=next(x for x in f['details'] if x['id']==block['detailId'])
                assert block['referenceIndices'] and set(block['referenceIndices'])<=set(detail['referenceIndices'])
                assert all(f['protocolReferences'][i]['documentId']==d['documentId'] and f['protocolReferences'][i]['section']==clause['section'] for i in block['referenceIndices']), 'Clause links require precise version and section evidence'
    if any(c.get('clauses') for c in d['chapters']):assert d.get('clauseIndexStatus')
assert '#coverage' in raw
for change in coverage.get('independentChanges',[]):
    assert change['documentId'] in documents_by_id
    assert change['status']=='selected-rules-reviewed-local-copy', 'Independent changes are not whole-Base completion'
    assert change['reviewedBlocks'] and change['note']
    for block in change['reviewedBlocks']:
        f=features_by_id[block['featureId']]
        detail=next(d for d in f['details'] if d['id']==block['detailId'])
        assert block['referenceIndices'] and set(block['referenceIndices'])<=set(detail['referenceIndices'])
        assert all(f['protocolReferences'][i]['documentId']==change['documentId'] for i in block['referenceIndices'])
# Audit the entire publication allowlist, including maintenance scripts and instructions.
public_files=['.gitignore','site.config.json','AGENTS.md','README.md','.github/workflows/check.yml']
public_files += ['scripts/'+n for n in ['build.py','check.py','import_content.py','index_protocol.py','map_references.py','prepare_public.py']]
public_files += ['web/'+n for n in ['index.html','style.css','app.js']]
public_files += ['content/'+n+'.json' for n in ['features','documents','protocols','changelog','maintenance','generations','self-audit','phy','coverage']]
public_files += ['docs/'+n for n in ['index.html','style.css','app.js','data.js','.nojekyll']]
drive_path=re.compile(r'(?<![A-Za-z0-9])[A-Za-z]:[\\/]')
for relative in public_files:
    text=(ROOT/relative).read_text(encoding='utf-8')
    assert not drive_path.search(text), f'Absolute drive path in publication file: {relative}'
    assert not re.search(r'/(?:Users|home)/[^\s\"\x27<>/]+/',text), f'Home directory in publication file: {relative}'
assert len(public_files)==28
print(f'PASS: {len(features)} features, Gen1–Gen7, source links, public-content boundary, local-only PDF reader, static assets, JSON and HTML structure.')
