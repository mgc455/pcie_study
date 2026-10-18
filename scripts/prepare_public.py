"""One-time public-edition cleanup; preserves manually maintained references."""
import json,re,collections
from pathlib import Path
root=Path(__file__).resolve().parents[1]
p=root/'content/features.json';a=json.loads(p.read_text(encoding='utf-8'))
for f in a:
    for key in ['intro','usage','mechanism','example','checks','prerequisites']:
        s=f[key]
        # Remove remaining generation-specific sentences without making a claim about every IP.
        parts=re.split(r'(?<=[。；])',s)
        s=''.join(x for x in parts if not any(k in x for k in ['当前子项','当前DPA','当前多VC','当前Function Group','当前扩展开关','当前EP','当前x8 Gen6','CX_','CC_','本版本HDMA','专章明确','表述冲突','原生Unroll','生成最大Gen6']))
        s=s.replace('具体控制器不实现ATS cache','部分控制器不内置ATS cache').replace('具体控制器部分','部分控制器的').replace('当前IP','具体IP')
        f[key]=s.strip() or '实际支持情况需要核对具体设备的能力、控制状态以及平台配合。'
    if f['id']==147:
        f['usage']='适合由硬件持续搬运数据；通道数、描述符格式与协议功能组合依具体DMA实现。'
        f['checks']='确认源/目的地址空间、权限、描述符所有权、通道状态和通知语义；独立核对DMA支持的事务属性，不由控制器的通用能力推导。'
    if f['id']==150:f['usage']='并行架构与端口组织属于具体IP实现，不能与VC、SR-IOV或DMA通道混淆。'
    if f['id']==153:f['checks']='核对PHY类型、PIPE版本、每lane宽度、速率、时钟模式和板级连接；示例顶层声明串行端口不代表PHY集成已完成。'
    if f['id']==71:f['checks']='不把PASID当物理地址高位；检查宽度、Enable、权限与前缀处理，DMA引擎是否支持PASID Prefix还需单独核对。'
p.write_text(json.dumps(a,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
p=root/'content/documents.json';d=json.loads(p.read_text(encoding='utf-8'));items=[];seen=set()
for x in d['items']:
    key=(x['title'].lower(),x['format'],x['bytes'])
    if x['title'].startswith('.') or key in seen:continue
    seen.add(key);items.append(x)
d['items']=items;d['candidateCount']=len(items);d['counts']=dict(collections.Counter(x['format'] for x in items))
d['readStatus']='文件名初筛并合并相同名称、格式和大小的候选；不等同逐份核读或内容级去重。主题仅由名称推断，原文件不随站点发布。'
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('Public features:',len(a),'document candidates after name/size filtering:',len(items))
