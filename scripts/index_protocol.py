"""Extract citation metadata, never full standard text, into the public knowledge base."""
import argparse,json,re,sys
from pathlib import Path
from pypdf import PdfReader
sys.stdout.reconfigure(encoding='utf-8')
root=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('pdf');args=p.parse_args()
reader=PdfReader(args.pdf);outline=[]
def walk(items,level=0):
    for item in items:
        if isinstance(item,list):walk(item,level+1)
        else:
            try:outline.append({'title':re.sub(r'\s+',' ',item.title).strip(),'page':reader.get_destination_page_number(item)+1,'level':level})
            except Exception:pass
walk(reader.outline)
if not outline:
    toc=[]
    for i in range(min(55,len(reader.pages))):
        t=reader.pages[i].extract_text() or ''
        toc.append({'pdfPage':i+1,'text':t})
    (root/'.local').mkdir(exist_ok=True)
    (root/'.local/protocol_toc.json').write_text(json.dumps(toc,ensure_ascii=False),encoding='utf-8')
    for x in toc:
        for line in x['text'].splitlines():
            if any(k in line.lower() for k in ['access control services','address translation','page request','process address','single root','integrity and data','precision time','resizable bar','function level reset','advanced error reporting','downstream port containment','atomicop','data object exchange']):print('TOC PDF',x['pdfPage'],line)
cover=reader.pages[0].extract_text() or ''
local=root/'.local';local.mkdir(exist_ok=True)
(local/'protocol_outline.json').write_text(json.dumps(outline,ensure_ascii=False,indent=2),encoding='utf-8')
(local/'protocol_source.json').write_text(json.dumps({'path':args.pdf,'pages':len(reader.pages),'cover':cover},ensure_ascii=False),encoding='utf-8')
print(json.dumps({'pages':len(reader.pages),'outlineItems':len(outline),'cover':cover[:700]},ensure_ascii=False))
for x in outline:
    if any(t in x['title'].lower() for t in ['access control services','address translation','page request','process address','single root','integrity and data','precision time','resizable bar','function level reset','advanced error reporting','downstream port containment','atomicop','data object exchange']):print(x)
