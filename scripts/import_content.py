"""Import authored learning material; never copy source RTL, PDFs, or manual extracts."""
import argparse, json, re, os, collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
p=argparse.ArgumentParser();p.add_argument('--source',required=True);p.add_argument('--documents');a=p.parse_args()
source=Path(a.source)
features=json.loads((source/'pcie_features.json').read_text(encoding='utf-8'))
def public_text(text):
    # Drop implementation-specific claims from the published, general-purpose edition.
    text=re.sub(r'(?:本IP|当前IP)','具体控制器',text)
    text=re.sub(r'当前工程','具体工程',text)
    parts=re.split(r'(?<=[。！？；])',text)
    return ''.join(s for s in parts if not any(k in s for k in ['当前关闭','当前开关','当前总开关','当前ACS','当前未','当前生成','当前2写','当前配置','当前单','当前VC','当前例子','本工程','该工程','max_pclk','概览与专章','章节表述','该细项未','静态源码','L0P_EN'])).strip() or '实际支持与使能状态需要按具体设备能力、控制器版本及运行配置确认。'
public=[]
for f in features:
    x={k:public_text(f[k]) for k in ['name','group','intro','usage','mechanism','example','checks','prerequisites']}
    x.update(id=f['id'],status='已整理 · 待持续深化',sources=[{'title':'PCI-SIG 规范目录','url':'https://pcisig.com/specifications?order=field_revision&sort=asc'}],reviewed='2026-10-18')
    public.append(x)
content=ROOT/'content';content.mkdir(exist_ok=True)
(content/'features.json').write_text(json.dumps(public,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
documents=[];counts=collections.Counter();total=0
if a.documents:
    docroot=Path(a.documents)
    suffixes={'.pdf','.doc','.docx','.ppt','.pptx','.epub','.chm'}
    for folder,dirs,files in os.walk(docroot):
        dirs[:]=[d for d in dirs if d not in {'.git','node_modules','__pycache__','.venv'}]
        for fn in files:
            total+=1;p=Path(folder)/fn
            if p.suffix.lower() not in suffixes:continue
            counts[p.suffix.lower()]+=1
            rel=p.relative_to(docroot).as_posix()
            low=rel.lower()
            topics=[label for label,terms in [('规范',['spec','base','ecn','规范','标准']),('DMA与驱动',['dma','driver','xdma','驱动']),('链路与物理',['phy','signal','equal','pcie6','gen6','物理']),('虚拟化与安全',['acs','ats','pasid','sriov','sr-iov','iommu','security','安全']),('入门与教程',['教程','入门','training','tutorial','express体系'])] if any(t in low for t in terms)] or ['待分类']
            documents.append(dict(id=len(documents)+1,title=p.stem,format=p.suffix[1:].upper(),topics=topics,bytes=p.stat().st_size,status='仅文件名索引 · 未逐份阅读'))
    local=ROOT/'.local';local.mkdir(exist_ok=True)
    (local/'document_paths.json').write_text(json.dumps({'root':str(docroot),'paths':[str(p.relative_to(docroot)) for p in docroot.rglob('*') if p.is_file() and p.suffix.lower() in suffixes]},ensure_ascii=False),encoding='utf-8')
(content/'documents.json').write_text(json.dumps({'items':documents,'counts':dict(counts),'candidateCount':len(documents),'indexedDate':'2026-10-18','readStatus':'文件名初筛，主题由名称推断，尚未验证文档内容。原文件不随站点发布。'},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'features':len(public),'document_candidates':len(documents),'formats':dict(counts),'files_seen':total},ensure_ascii=False))
