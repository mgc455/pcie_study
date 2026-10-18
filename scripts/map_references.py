"""Build verified table-of-contents references for Base 6.0, without publishing standard text."""
import json,re,sys
from pathlib import Path
from pypdf import PdfReader
root=Path(__file__).resolve().parents[1]
toc=json.loads((root/'.local/protocol_toc.json').read_text(encoding='utf-8'))
sections={}
for p in toc[:29]:
    for line in p['text'].splitlines():
        m=re.match(r'^(\d+(?:\.\d+)*)(?:\.)?\s+(.+?)\s*\.{3,}\s*(\d+)\s*$',line)
        if m:sections[m[1]]={'section':m[1],'title':m[2].strip(),'page':int(m[3])}
print('TOC sections',len(sections))
mapping={
1:['1.3'],2:['1','4'],3:['4'],4:['4.2'],5:['4'],6:['4'],7:['4'],8:['4'],9:['4'],10:['4'],11:['4'],12:['4'],13:['4'],14:['4'],15:['5'],16:['4'],
17:['2.2'],18:['2.2'],19:['2.2'],20:['2.2'],21:['2.4'],22:['2.2'],23:['2.2'],24:['2.2'],25:['2.2'],26:['2.3'],27:['2.4'],28:['2.4'],29:['2.4'],30:['2.2'],31:['6.15'],32:['2.2'],33:['2.4'],34:['2.2'],35:['2.2'],
36:['7.3'],37:['7.5'],38:['7.2'],39:['7.5'],40:['7.5'],41:['7.5'],42:['7.5'],43:['7.5'],44:['7.8.6'],45:['7.8.7'],46:['7.5'],47:['7.5'],48:['7.2'],49:['7.5'],50:['7.9'],51:['7'],
52:['6.1'],53:['6.1'],54:['6.1'],55:['6.1'],56:['6.1'],57:['2.2.8'],58:['2.2.8'],59:['5'],60:['6.2'],61:['6'],
62:['7.5'],63:['6'],64:['9'],65:['9'],66:['9'],67:[],68:['10.1.1'],69:['10'],70:['10.4'],71:['10.1.3'],72:['10.1'],73:['10.1'],74:['6.12'],75:['6.12'],76:['6.12'],77:['6.12'],78:['6.12'],79:['6.12'],80:['6.12'],81:['6.12'],82:['6.12'],83:['6.12'],
84:['5'],85:['5'],86:['5'],87:['5'],88:['5'],89:['6'],90:['6'],91:['6.8'],92:['6'],93:['6.6'],94:['6.6'],95:['6.6.2'],96:[],
97:['3'],98:['3'],99:['2.7'],100:['2.7'],101:['2.3'],102:['2.8'],103:['6.2','7.8.4'],104:['6.2.4'],105:['6.2.11'],106:['6.2.11.3'],107:['6.2'],108:['6.12','6.15'],109:[],110:[],
111:['2.6'],112:['2.6'],113:['2.5'],114:['6.3'],115:['6.3.3.4'],116:['6.3.3'],117:['6'],118:['6'],119:['6.21'],120:['6.21'],121:['7'],122:[],123:['2.6'],
124:['6'],125:['6'],126:['6'],127:['6.30'],128:[],129:[],130:['6.12','10'],131:[],132:['7'],133:['7'],134:[],135:[],136:['4'],137:['4'],138:['6.7'],139:['6'],140:[],141:['3'],142:['7'],
143:[],144:[],145:[],146:[],147:[],148:[],149:[],150:[],151:[],152:[],153:[],154:[],155:[],156:[],157:[],158:[],159:[],160:[],161:[],162:[]}
# Prefer specific TOC titles when the title is unambiguous. These are discovery matches, not guessed section numbers.
keywords={4:['Link Training and Status State Machine'],5:['Link Speed Management'],9:['Equalization'],10:['Clocking'],15:['L0p'],22:['Tag'],24:['Maximum Payload'],25:['Max_Read_Request'],26:['Read Completion Boundary'],28:['Relaxed Ordering'],29:['ID-Based Ordering'],30:['No Snoop'],32:['Deferrable Memory'],33:['Unordered I/O','Unordered IO'],34:['TLP Prefix'],35:['Orthogonal Header'],36:['Configuration Space Organization'],39:['Capability Structures'],44:['Resizable BAR Extended Capability'],48:['Enhanced Configuration Access'],49:['Device Serial Number'],52:['INTx'],53:['MSI Capability'],54:['MSI Capability'],55:['MSI-X'],56:['MSI-X'],61:['Readiness'],63:['Alternative Routing-ID'],74:['Access Control Services (ACS)'],75:['ACS Source Validation'],76:['ACS Translation Blocking'],77:['ACS P2P Request Redirect'],78:['ACS P2P Completion Redirect'],79:['ACS Upstream Forwarding'],80:['ACS P2P Egress Control'],81:['ACS Direct Translated P2P'],84:['D0'],86:['Active State Power Management'],87:['L1 PM Substates'],88:['Clock Power Management'],89:['Latency Tolerance Reporting'],90:['Optimized Buffer'],92:['Emergency Power'],99:['End-to-End Data Integrity'],102:['Completion Timeout'],117:['TLP Processing Hints'],118:['TLP Processing Hints'],124:['Integrity and Data Encryption (IDE)'],125:['Integrity and Data Encryption (IDE)'],126:['Integrity and Data Encryption (IDE)'],132:['Flit Logging'],133:['Flit Error Injection'],136:['Lane Margining'],139:['Native PCIe Enclosure'],141:['Data Link Feature'],142:['Secondary PCI Express']}
for fid,terms in keywords.items():
    hits=[s['section'] for s in sections.values() if any(t.lower() in s['title'].lower() for t in terms)]
    if hits:mapping[fid]=hits[:2]
features=json.loads((root/'content/features.json').read_text(encoding='utf-8'))
for f in features:
    refs=[]
    for sec in mapping[f['id']]:
        if sec in sections:
            ref=dict(sections[sec],documentId='pcie-base-6.0',document='PCI Express Base Specification',version='6.0',pdfPage=sections[sec]['page'],verification='已核对该版本目录；正文待逐项核读',url='https://pcisig.com/specifications?order=field_revision&sort=asc')
            refs.append(ref)
    f['protocolReferences']=refs
    f['referenceStatus']='已定位规范目录' if refs else '需补充对应独立规范/实现资料，未猜测Base章节'
# Verify printed page = physical PDF index against actual chapter text before enabling local page navigation.
source=json.loads((root/'.local/protocol_source.json').read_text(encoding='utf-8'))
r=PdfReader(source['path']);verified=[]
for fid,needle in [(74,'Access Control Services'),(68,'Address Translation Services'),(95,'Function Level Reset'),(105,'Downstream Port Containment')]:
    f=next(x for x in features if x['id']==fid)
    if not f['protocolReferences']:continue
    ref=f['protocolReferences'][0];txt=r.pages[ref['page']-1].extract_text() or ''
    if needle.lower() not in txt.lower():
        raise RuntimeError(f'页码定位需人工核对: {fid} {ref["page"]}')
    ref['verification']='目录与该PDF章节首页已核对；完整章节继续核读'
    verified.append(fid)
(root/'content/features.json').write_text(json.dumps(features,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(root/'content/protocols.json').write_text(json.dumps([{'id':'pcie-base-6.0','title':'PCI Express Base Specification','version':'6.0','fileName':Path(source['path']).name,'pages':source['pages'],'source':'本地用户提供文档，仅发布定位元数据，不发布PDF或协议正文','pageMapping':'PDF物理页与目录页码已抽样核对','url':'https://pcisig.com/specifications?order=field_revision&sort=asc'}],ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('features with TOC reference:',sum(bool(f['protocolReferences']) for f in features),'chapter starts verified:',verified)
