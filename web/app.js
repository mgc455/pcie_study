'use strict';
const DB=window.PCIE_STUDY;

function choosePdfReference(r){pdfTarget=r;const p=DB.protocols.find(p=>p.id===r.documentId);$('#pdf-reference').textContent=`${r.document} Revision ${r.version} · §${r.section} · 印刷页 ${r.page} / PDF 第 ${r.pdfPage} 页。请选择：${p?.fileName||'对应版本文件'}`;$('#pdf-file').value='';$('#pdf-open').replaceChildren();$('#pdf-dialog').showModal()}
function renderCoverage(version='6.0'){
 const cv=DB.coverage,current=cv.documents.find(d=>d.version===version)||cv.documents.find(d=>d.version==='6.0'),q=$('#search').value.trim().toLowerCase();
 const rows=current.chapters.filter(c=>{const parts=[c.section,c.title,c.label,...c.reviewedBlocks.map(b=>{const f=DB.features.find(f=>f.id===b.featureId),d=f.details.find(d=>d.id===b.detailId);return f.name+' '+d.title})];return !q||parts.join(' ').toLowerCase().includes(q)});
 $('#content').innerHTML=`<div class="hero"><div class="eyebrow">SPECIFICATION COVERAGE / ${esc(cv.edition)}</div><h1>沿着协议，看到已整理与缺口。</h1><p>${esc(cv.scope)}</p><p>当前按七份规范的主章与附录建立顺序清单，共 ${cv.documents.reduce((n,d)=>n+d.chapters.length,0)} 个入口；不把目录定位或若干引用计成整章读完。</p></div><nav class="coverage-versions" aria-label="选择Base版本">${cv.documents.map(d=>`<a class="tag ${d.version===current.version?'selected-version':''}" href="#coverage/${d.version}">Gen${d.generation} · Base ${esc(d.version)}</a>`).join('')}</nav><div class="note">仅定位：已确认目录和起始页。选定规则已展开：下面列出的具体知识块有正文依据。本轮没有任何章被标记为全部完成。图表/条款的更细缺口会逐轮增加。</div><div class="toolbar"><span>${esc(current.version)} · ${rows.length}/${current.chapters.length} 个章／附录 · ${esc(cv.edition)}</span></div><div class="table-wrap coverage-table" tabindex="0" role="region" aria-label="协议章序覆盖"><table class="generation-table"><thead><tr><th>章序</th><th>主题与版本绑定起始页</th><th>正文整理状态</th><th>关联内容与剩余工作</th></tr></thead><tbody>${rows.map(c=>`<tr><th scope="row">${esc(c.section)}</th><td><strong>${esc(c.label)}</strong><p class="muted">${esc(c.title)}</p><button class="source-chip" data-coverage-pdf="${current.version}:${c.section}">Base ${esc(current.version)} · 印刷 ${c.locator.page} / PDF ${c.locator.pdfPage} ↗</button></td><td><span class="tag">${c.status==='selected-rules-reviewed'?'选定规则已展开':'仅定位，待逐条整理'}</span>${c.reviewedBlocks.length?`<div class="coverage-blocks">${c.reviewedBlocks.map(b=>{const f=DB.features.find(f=>f.id===b.featureId),d=f.details.find(d=>d.id===b.detailId);return `<a href="#feature/${f.id}/detail/${encodeURIComponent(d.id)}">${esc(d.title)} →</a>`}).join('')}</div>`:''}</td><td><p>${esc(c.remaining)}</p>${c.candidateFeatureIds.length?`<details><summary>已有章节定位的 ${c.candidateFeatureIds.length} 个条目（不等于正文全读）</summary><div class="coverage-blocks">${c.candidateFeatureIds.map(id=>{const f=DB.features.find(f=>f.id===id);return `<a href="#feature/${id}">${esc(f.name)}</a>`}).join('')}</div></details>`:'<p class="muted">尚未关联专题。</p>'}</td></tr>`).join('')}</tbody></table></div><article class="list-row"><h2>怎样持续推进</h2>${cv.method.map(p=>`<p>${esc(p)}</p>`).join('')}<p><a href="#lookup">按功能和细节查 →</a> · <a href="#generations">查代际概览 →</a> · <a href="#audit">看具体未解决问题 →</a></p></article>`;
 document.title='Base '+current.version+' 章序与覆盖 · PCIe Study';
}

function renderPhy(){
 const p=DB.phy,q=$('#search').value.trim().toLowerCase();
 $('#content').innerHTML=`<div class="hero"><div class="eyebrow">PHY / SERDES / GEN5 → GEN6</div><h1>从 PIPE，到真正的差分信号。</h1><p>${esc(p.summary)}</p><p><a href="#group/${encodeURIComponent('PHY与SerDes')}">查看全部20项PHY主题 →</a> · <a href="#generations">对照Gen1～Gen7 →</a></p></div><div class="note">协议规范定义行为，PIPE定义边界，产品手册和RTL解释一种实现。这里将它们分别标注；原始代码、CDL、固件和商业文档正文不公开上传。</div>${p.lowPowerReferences?`<article class="list-row"><h2>${esc(p.lowPowerReferences.title)}</h2><p>从协议状态查到PHY恢复：以下是关联主题，不计入20项PHY专属分类。</p><div class="detail-links">${p.lowPowerReferences.ids.map(id=>DB.features.find(f=>f.id===id)).filter(f=>!q||[f.name,...(f.details||[]).map(d=>d.title)].join(' ').toLowerCase().includes(q)).map(f=>`<a href="#feature/${f.id}">${esc(f.name)} →</a>`).join('')}</div></article>`:''}${p.flows.map(f=>`<article class="list-row"><h2>${esc(f.title)}</h2><ol class="phy-flow" aria-label="${esc(f.title)}">${f.stages.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p>${esc(f.note)}</p></article>`).join('')}${renderDetails({details:[{title:'Gen5与Gen6：先对比边界，再对比参数',table:p.compare}]})}${p.groups.map(g=>{const items=g.ids.map(id=>DB.features.find(f=>f.id===id)).filter(f=>!q||searchIndex.get(f.id).includes(q));return items.length?`<section class="phy-topic-group"><h2>${esc(g.title)}</h2><div class="cards">${items.map(card).join('')}</div></section>`:''}).join('')}<article class="list-row"><h2>按现象定位到对应层</h2>${p.debug.map(x=>`<h3>${esc(x.symptom)}</h3><p>${esc(x.checks)}</p>`).join('')}</article><article class="list-row"><h2>核读范围与待补齐内容</h2>${p.limits.map(t=>`<p>${esc(t)}</p>`).join('')}<h3>后续完善路线</h3>${p.next.map(t=>`<p>${esc(t)}</p>`).join('')}<a href="#references">查看本地版本化PDF入口 →</a></article>`;
 document.title='PHY与SerDes · PCIe Study';
}
function renderGenerations(){
 const g=DB.generations,q=$('#search').value.trim().toLowerCase();
 const items=g.items.filter(x=>[`gen${x.gen}`,`gen ${x.gen}`,x.rate+'',x.signaling,x.encoding,x.change,x.focus].join(' ').toLowerCase().includes(q));
 const links=x=>x.sourceIds.map(id=>{const s=g.sources.find(s=>s.id===id);return `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`}).join(' · ');
 $('#content').innerHTML=`<div class="hero"><div class="eyebrow">GEN1 → GEN7 / EVOLUTION</div><h1>每一代，究竟改了什么？</h1><p>${esc(g.status)}</p></div><div class="note">Gen 是链路速率代际；Base 规范修订、独立规范和 ECN 是功能规则的出处。ACS、ATS、SR-IOV 等是否支持，需要逐项检查能力与平台，不能仅凭 Gen 判断。</div><div class="table-wrap"><table class="generation-table"><caption>单向带宽对比：十进制 GB/s，未扣除全部协议开销</caption><thead><tr><th>代际</th><th>GT/s</th><th>调制 / 编码</th><th>x1 原始</th><th>x16 原始</th><th>x16 扣除编码后</th></tr></thead><tbody>${items.map(x=>`<tr><th><a href="#generations" data-gen="gen-${x.gen}">Gen${x.gen}</a></th><td>${x.rate}</td><td>${esc(x.signaling)} / ${esc(x.encoding)}</td><td>${(x.rate/8).toFixed(3)}</td><td>${(x.rate*2).toFixed(3)}</td><td>${x.efficiency?(x.rate*2*x.efficiency).toFixed(3):'另算 FLIT / 协议开销'}</td></tr>`).join('')}</tbody></table></div><div class="note">计算口径：原始单向带宽 = GT/s × lane 数 ÷ 8；Gen1/2 再乘 8/10，Gen3～5 再乘 128/130。Gen6/7 的标称 GT/s 已计入 PAM4 每符号 2 bit，不能再乘 2。双向合计 = 单向 × 2；TLP 包头、Completion、流控、空闲和重放还会降低实际吞吐，Gen6/7 不能沿用 128/130。此表由这些公式计算，不是实测性能。</div>${items.map(x=>`<article class="list-row generation-detail" id="gen-${x.gen}"><span class="tag">Gen${x.gen} · ${x.rate} GT/s</span><h2>主要变化</h2><p>${esc(x.change)}</p><h3>学习与检查重点</h3><p>${esc(x.focus)}</p><p>${x.featureIds.map(id=>{const f=DB.features.find(f=>f.id===id);return f?`<a class="tag" href="#feature/${id}">${esc(f.name)}</a>`:''}).join(' ')}</p><p>${links(x)}</p><p class="muted">来源核对：${esc(g.reviewed)} · 正文精确条款与该代完整差异仍在完善。</p></article>`).join('')}${!items.length?'<div class="empty">没有匹配代际，可搜索 Gen6、PAM4、编码、均衡等。</div>':''}<article class="list-row"><h2>建议学习顺序</h2>${g.learningPath.map(t=>`<p>${esc(t)}</p>`).join('')}<h2>接下来逐项补齐</h2>${g.nextResearch.map(t=>`<p>${esc(t)}</p>`).join('')}</article><article class="list-row"><h2>引用类型与限制</h2>${g.sources.map(s=>`<p><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a><br><span class="muted">${esc(s.kind)}</span></p>`).join('')}</article>`;
 document.title='Gen1～Gen7 演进 · PCIe Study';
}
function renderAudit(){const a=DB.audit;$('#content').innerHTML=`<div class="hero"><div class="eyebrow">SELF REVIEW / ${esc(a.date)}</div><h1>每日自查，留下可追溯的改进。</h1><p>${esc(a.summary)}</p></div>${a.checks.map(c=>`<article class="list-row"><span class="tag">${esc(c.status)}</span><h2>${esc(c.name)}</h2><p>${esc(c.detail)}</p></article>`).join('')}<article class="list-row"><h2>尚未解决的问题</h2>${a.unresolved.map(t=>`<p>${esc(t)}</p>`).join('')}</article><p><a href="#updates">查看每轮实际内容变更 →</a></p>`;document.title='每日自查 · PCIe Study'}
const $=s=>document.querySelector(s);
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function detailKey(d,i){return d.id||'block-'+(i+1)}
function detailHref(f,d,i){return '#feature/'+f.id+'/detail/'+encodeURIComponent(detailKey(d,i))}
function detailSources(f,d){return (d.referenceIndices||[]).map(i=>{const r=f.protocolReferences[i];return `<button class="source-chip" data-pdf="${f.id}:${i}" title="选择本地对应PDF，不上传文件">${esc(r.version)} §${esc(r.section)} · p${r.page} / PDF ${r.pdfPage} ↗</button>`}).join('')}
function settingRowMatches(number,text,query){const q=query.trim().toLowerCase();return /^#?\d+$/.test(q)?number===String(Number(q.replace('#',''))):q.split(/\s+/).filter(Boolean).every(w=>text.toLowerCase().includes(w))}
function flitByteLocation(byte,width){
 if(!Number.isInteger(byte)||byte<0||byte>255||![1,2,4,8,16].includes(width))return null;
 const region=byte<236?'TLP':byte<242?'DLP':byte<250?'CRC':'ECC';
 const group=byte<250?byte%3:(byte-249)%3;
 const offset=byte<250?Math.floor(byte/3):84+Math.floor((byte-250)/3);
 return {byte,width,region,lane:byte%width,row:Math.floor(byte/width),group,offset};
}
function flitByteResult(byte,width){const r=flitByteLocation(byte,width);return r?`字节 ${r.byte} · ${r.region}区 → 逻辑Lane ${r.lane}，符号行 ${r.row}；ECC组 ${r.group}，组内偏移 ${r.offset}。`:'请输入0～255的整数字节序号，并选择有效宽度。'}
function flitByteExplorer(){return `<div class="flit-explorer" role="group" aria-label="Flit字节映射查询"><p>选择一个字节，查它在线路和纠错组中的位置。</p><div class="flit-controls"><label>字节序号（0～255）<input id="flit-byte" type="number" min="0" max="255" step="1" value="250"></label><label>链路宽度<select id="flit-width"><option value="1">x1</option><option value="2">x2</option><option value="4">x4</option><option value="8" selected>x8</option><option value="16">x16</option></select></label></div><p id="flit-byte-result" class="note" aria-live="polite">${flitByteResult(250,8)}</p><p class="muted">从0计数；按逻辑lane顺序，不模拟lane reversal、物理管脚、L0p切换、OS插入及误码。适用于本块所列Base6.0/7.0映射，不能代替ECC编码/CRC计算。</p></div>`}
function sequenceStep(n,delta){return ((n-1+delta)%1023+1023)%1023+1}
function ackWindow(next,ackd,n,max){
 if(![next,ackd,n,max].every(Number.isInteger)||next<1||next>1023||ackd<1||ackd>1023||n<0||n>1023||max<1||max>511)return null;
 if(n===0)return {ignored:true};
 const last=sequenceStep(next,-1),behind=(last-n+1023)%1023,ahead=(n-ackd+1023)%1023;
 return {last,behind,ahead,within:behind<=max&&ahead<=max};
}
function ackWindowText(next,ackd,n,max){const r=ackWindow(next,ackd,n,max);if(!r)return '请输入有效整数：NEXT_TX、ACKD为1～1023，N为0～1023，MAX为1～511。';if(r.ignored)return '反馈N=0：按本块规则忽略，不释放重试缓冲。';return `lastSent=${r.last}；(lastSent−N) mod1023=${r.behind}；(N−ACKD) mod1023=${r.ahead}。${r.within?'落在给定窗口内；仍需满足Flit有效性、阶段和其他状态条件。':'越出给定窗口；不能据此反馈释放缓冲，按对应规则处理错误。'}`}
function ackWindowExplorer(){return `<div class="flit-explorer" role="group" aria-label="Ack Nak序号窗口查询"><div class="flit-controls">${[['next','NEXT_TX',3,1,1023],['ackd','ACKD',1022,1,1023],['n','反馈N',1,0,1023],['max','MAX窗口',511,1,511]].map(([id,label,value,min,max])=>`<label>${label}<input id="ack-${id}" type="number" min="${min}" max="${max}" step="1" value="${value}"></label>`).join('')}</div><p id="ack-window-result" class="note" aria-live="polite">${ackWindowText(3,1022,1,511)}</p><p class="muted">按Base6.0/7.0所列Ack/Nak接收窗口算式；不是完整Replay仿真器。窗口内不等于整条Flit协议合规。</p></div>`}
function decodeDlp(raw){
 const compact=raw.trim().replace(/[\s,:-]/g,'');
 if(!/^[0-9a-fA-F]{12}$/.test(compact))return null;
 const b=compact.match(/../g).map(x=>parseInt(x,16));
 const usage=b[0]>>>6,prior=(b[0]>>>5)&1,type=(b[0]>>>4)&1,command=(b[0]>>>2)&3,seq=((b[0]&3)<<8)|b[1];
 const payload=b[2]*16777216+b[3]*65536+b[4]*256+b[5];
 const result={bytes:b,usage,prior,type,command,seq,payload,warnings:[]};
 if(usage>1)result.warnings.push('Flit Usage为Reserved');
 if(command===0&&usage===1&&seq===0)result.warnings.push('Payload的显式序号不能为0');
 if(command!==0&&seq===0)result.warnings.push('Ack/Nak的序号0应忽略');
 if(type===0){result.kind='普通DLLP Payload';result.dllpType=b[2]}
 else if(payload<2147483648){result.kind='Optimized_Update_FC';result.vc=Math.floor(payload/268435456)%8;result.nph=Math.floor(payload/1048576)%256;result.ph=Math.floor(payload/4096)%256;result.pd=payload%4096}
 else {result.kind='Flit_Marker';result.status=Math.floor(payload/536870912)%4;result.ptm=Math.floor(payload/268435456)%2;result.reserved=payload%268435456;if(result.status===3)result.warnings.push('Flit_Status为Reserved');if(result.reserved!==0)result.warnings.push('Marker保留位非零：请核对发送与接收保留位规则')}
 return result;
}
function dlpResultText(raw){const r=decodeDlp(raw);if(!r)return '请输入DLP0～DLP5六个十六进制字节，例如40 01 00 00 00 00；不含Flit其他字节。';
 const command=['显式本端发送序号','Ack：反方向累计确认','Standard Nak：反方向累计确认并请求余下重放','Selective Nak：反方向累计确认并请求一条重放'][r.command];
 let text=`Usage=${r.usage.toString(2).padStart(2,'0')}（${['IDLE/NOP，单凭Usage不能区分','Payload','Reserved','Reserved'][r.usage]}）；Prior=${r.prior}；Command=${r.command.toString(2).padStart(2,'0')}（${command}）；序号=${r.seq}。`;
 if(r.command===3&&r.seq!==0)text+=` 请求的目标后继=${sequenceStep(r.seq,1)}。`;
 text+=` 负载格式：${r.kind}。`;
 if(r.kind==='Optimized_Update_FC')text+=` VC=${r.vc}，Shared NPH=${r.nph}，PH=${r.ph}，PD=${r.pd}（原始累计字段；实际单位须结合Scale/初始化）。`;
 else if(r.kind==='Flit_Marker')text+=` Flit_Status=${r.status.toString(2).padStart(2,'0')}（${['无特殊信息','最后结束TLP Nullified','最后结束TLP Poisoned','Reserved'][r.status]}），PTM=${r.ptm}，保留位=0x${r.reserved.toString(16)}。`;
 else text+=` DLLP Type=0x${r.dllpType.toString(16).padStart(2,'0')}，需继续按第3章解析。`;
 if(r.warnings.length)text+=' 字段提示：'+r.warnings.join('；')+'。';return text;
}
function dlpDecoder(){return `<div class="flit-explorer" role="group" aria-label="DLP六字节解码"><div class="flit-controls"><label>DLP0 → DLP5（十六进制）<input id="dlp-bytes" type="text" value="40 01 00 00 00 00" spellcheck="false" autocomplete="off" aria-describedby="dlp-help"></label></div><p id="dlp-result" class="note" aria-live="polite">${dlpResultText('40 01 00 00 00 00')}</p><p id="dlp-help" class="muted">可用空格、逗号、冒号或连字符分隔，也可连续输入12个十六进制字符。按DLP线路字节顺序；解码不表示CRC/FEC、隐式序号或完整协议检查已通过。</p></div>`}
function parseHex16(raw){const t=String(raw).trim().replace(/^0x/i,'');return /^[0-9a-fA-F]{1,4}$/.test(t)?parseInt(t,16):null}
function decodeAddressCapability(kind,version,raw,controlRaw){
 const cap=parseHex16(raw),control=parseHex16(controlRaw);if(cap===null||control===null||!['6.0','7.0'].includes(version)||!['ats','pasid','pri'].includes(kind))return null;
 const bit=(x,n)=>(x>>>n)&1;const rows=[],notes=[];
 if(kind==='ats'){
  const depth=cap&31,stu=control&31;
  rows.push(`IQD字段=${depth}：非VF按${depth||32}条解释；VF必须使用关联PF上下文`, `Page Aligned=${bit(cap,5)}；Global Invalidate=${bit(cap,6)}；RO Supported=${bit(cap,7)}`,`AMA Supported=${bit(cap,8)}；${version==='7.0'?'TE Supported='+bit(cap,9):'Capability bit9在6.0为保留位'}`,`STU=${stu} → 最小范围 ${2**(12+stu)} B`,`AMAD=${(control>>>11)&7}；AMAE=${bit(control,14)}；ATS E=${bit(control,15)}`);
  if(bit(control,14)&&!bit(cap,8))notes.push('AMAE已置位但未宣告AMA支持：核对输入与保留/硬连位。');
  if(version==='7.0'&&bit(cap,6)&&bit(cap,9))notes.push('7.0 Global Invalidate与TE支持不能同时置位。');
  notes.push('VF的STU读零不能独立解释为实际4 KiB；TEE-IO支持、PASID Control和平台授权不在这两个输入中。');
 }else if(kind==='pasid'){
  const width=(cap>>>8)&31;
  rows.push(`Max PASID Width=${width}${width<=20?' → PASID数值0～'+(2**width-1):'：超出规范0～20编码范围'}`,`Execute Supported=${bit(cap,1)}；Privileged Supported=${bit(cap,2)}；Translated+PASID Supported=${bit(cap,3)}`,`PASID E=${bit(control,0)}；Execute E=${bit(control,1)}；Privileged E=${bit(control,2)}；Translated+PASID E=${bit(control,3)}`);
  for(const [n,name]of [[1,'Execute'],[2,'Privileged'],[3,'Translated+PASID']])if(bit(control,n)&&!bit(cap,n))notes.push(`${name}使能读值为1但能力未支持：核对保留位和输入。`);
  if(!bit(control,0)&&(control&14))notes.push('PASID总使能未开，选项置位不等于已可发送PASID请求。');
  if(version==='7.0'&&bit(cap,1))notes.push('7.0强烈建议Execute Supported为0；建议不等同所有情况强制禁止。');
  notes.push('ATS E=1期间不能随意改这些控制；多Function能力作用范围和ATS支持还需另查。');
 }else{
  const enabled=bit(control,0),stopped=bit(cap,8);
  rows.push(`PRI E=${enabled}；Reset读回位=${bit(control,1)}`,`Response Failure=${bit(cap,0)}；UPRGI=${bit(cap,1)}（两者RW1C）`,`Stopped读值=${stopped}：${enabled?'E=1时该状态未定义，不作为已停止证据':stopped?'E=0/S=1：接口已停止':'E=0/S=0：停止中/仍有在途，不应直接重新使能'}`,`PRG Response PASID Required=${bit(cap,15)}`);
  if(bit(control,1))notes.push('Reset规定读回0；若输入为拟写值，它仅在E已清或同次清E时起作用。');
  if(bit(cap,0))notes.push('Response Failure：接口失败语义与重新使能流程另查，不能只清错误位就认定已恢复。');
  notes.push('Status不是Capability；Capacity/Allocation及PF/VF/SDI共享队列没有包含在输入中。');
 }
 return {kind,version,cap,control,rows,notes};
}
function addressCapabilityText(kind,version,raw,control){const r=decodeAddressCapability(kind,version,raw,control);return r?[`Base ${version} · ${kind.toUpperCase()}只读解码`,...r.rows,'条件提示：',...r.notes].join('\n'):'请输入两个1～4位十六进制寄存器值（可带0x）；每个为16 bit。'}
function addressCapabilityExplorer(kind){const initial={ats:['0120','8000'],pasid:['140e','0009'],pri:['0100','0000']}[kind];return `<div class="flit-explorer" role="group" aria-label="${kind.toUpperCase()}寄存器解码"><input type="hidden" id="cap-kind" value="${kind}"><div class="flit-controls"><label>规范版本<select id="cap-version"><option value="6.0">Base6.0</option><option value="7.0">Base7.0</option></select></label><label>${kind==='pri'?'Status +06h':'Capability +04h'}<input id="cap-raw" type="text" value="${initial[0]}" spellcheck="false" autocomplete="off"></label><label>Control ${kind==='pri'?'+04h':'+06h'}<input id="cap-control" type="text" value="${initial[1]}" spellcheck="false" autocomplete="off"></label></div><p id="cap-result" class="note address-query-output" aria-live="polite">${esc(addressCapabilityText(kind,'6.0',...initial))}</p><p class="muted">各偏移相对本能力块基址；按16位值输入，不是整个DWORD。只解释读值，不访问设备或修改配置。</p></div>`}
function decodeAtsRange(raw,s,stu,purpose){
 const text=String(raw).trim().replace(/^0x/i,'');if(!/^[0-9a-fA-F]{1,16}$/.test(text)||![0,1].includes(s)||!Number.isInteger(stu)||stu<0||stu>31||!['translation','invalidate'].includes(purpose))return null;
 const address=BigInt('0x'+text),minimum=1n<<BigInt(12+stu);if((address&4095n)!==0n)return {error:'低12位必须补零；先把S/权限等条目低位与地址字段分离。'};
 let size=4096n;
 if(s===1){let firstZero=12;while(firstZero<64&&((address>>BigInt(firstZero))&1n)===1n)firstZero++;
  if(firstZero===64)return {error:'S=1且地址[63:12]全1：规范定义行为未定义。'};
  if(firstZero===63)return {special:true,purpose,minimum,allowed:purpose==='invalidate'};
  size=1n<<BigInt(firstZero+1);
 }
 const base=address&~(size-1n),end=base+size-1n;return {address,s,stu,purpose,minimum,size,base,end,belowStu:size<minimum};
}
function atsRangeText(raw,s,stu,purpose){const r=decodeAtsRange(raw,s,stu,purpose);if(!r)return '请输入不超过64位的十六进制地址字段、STU整数0～31，并选择有效场景。';if(r.error)return r.error;if(r.special)return `全部失效特殊编码：${r.allowed?'仅按Invalidate语义解释，不作为普通地址范围。':'不能作为普通Translation Completion的有效地址映射使用。'}`;
 let text=`范围大小 ${r.size} B；对齐基址 0x${r.base.toString(16)}；末地址 0x${r.end.toString(16)}。STU=${r.stu} → 最小 ${r.minimum} B。`;
 if(r.belowStu)text+=r.purpose==='translation'?' 小于STU：Translation Completion按相应UR规则处理。':' 小于STU：Invalidate可按规则扩大至至少STU或报告UR（不推荐）。';
 else text+=' 大小满足STU下限；地址/权限及报文整体仍需另行验证。';return text;
}
function atsRangeExplorer(){return `<div class="flit-explorer" role="group" aria-label="ATS范围编码查询"><div class="flit-controls"><label>地址字段[63:12]（低12补0）<input id="ats-range-address" value="0x20001000" spellcheck="false" autocomplete="off"></label><label>S<select id="ats-range-s"><option value="0">0：4 KiB</option><option value="1" selected>1：更大范围</option></select></label><label>STU<input id="ats-range-stu" type="number" min="0" max="31" step="1" value="0"></label><label>使用场景<select id="ats-range-purpose"><option value="translation">Translation Completion</option><option value="invalidate">Invalidate Request</option></select></label></div><p id="ats-range-result" class="note" aria-live="polite">${atsRangeText('0x20001000',1,0,'translation')}</p><p class="muted">依据所列Base6.0/7.0范围规则，用BigInt精确保留64位地址；不输入整条报文，不读取或修改实际映射。</p></div>`}
function acsRoute(o){
 const ctl=parseHex16(o.control);if(ctl===null||!['6.0','7.0'].includes(o.version)||!['dsp','rp','mfd'].includes(o.role)||!['memory','completion'].includes(o.type)||!['up','down'].includes(o.direction)||!['peer','same','rc'].includes(o.target)||![0,1,2,3].includes(o.at)||![0,1].includes(o.vector)||![0,1].includes(o.ro))return null;
 const b=n=>(ctl>>n)&1,steps=['前提：非Multicast、非UIO；格式与Source Validation通过，能力支持另查。'],done=(action,reason)=>({action,reason,steps});
 if(o.direction==='down')return done('unchanged','向下行进，不由这里的上行ACS机制改变。');
 if(o.type==='memory'&&o.at===3)return done('outside','AT=11保留，不能套合法Memory Request的P2P表。');
 if(o.role!=='mfd'&&o.type==='memory'&&b(1)&&o.at!==0){steps.push('Translation Blocking优先。');return done('violation','AT非00且Control[1]=1：ACS Violation。');}
 if(o.role==='mfd')steps.push('非RCiEP MFD Function不实现Translation Blocking或Upstream Forwarding。');
 if(o.target==='rc')return done('unchanged','正常就到上行/RC，不命中本工具peer或同出口条件；最终权限另查。');
 if(o.target==='same'){
  if(o.role==='mfd')return done('outside','非RCiEP MFD无端口同一出口语义。');
  steps.push('同出口上行输入检查Upstream Forwarding。');
  if(!b(4))return done('undefined','Control[4]=0：处理未定义。');
  return done(o.role==='rp'?'rc-handling':'upstream',o.role==='rp'?(o.type==='memory'?'RP按请求重定向语义交RC验证。':'RP按完成重定向语义处理排序并最终回送。'):'Switch继续上行。');
 }
 if(o.type==='completion'){
  steps.push('Completion仅独立查Control[3]和RO，不查E/R/V或Direct。');
  if(!b(3)||o.ro)return done('direct',o.ro?'RO=1，不重定向。':'Completion Redirect未使能。');
  return done(o.role==='rp'?'rc-handling':'upstream',o.role==='rp'?'RP按顺序处理并最终回送，不增加ACS权限检查。':'non-RO完成上行。');
 }
 if(b(6)&&o.at===2){steps.push('Direct覆盖E/R/V，已通过Translation Blocking。');return done('direct','AT=10请求不重定向；仍须遵守ATS权限/失效。');}
 const e=b(5),r=b(2),v=o.vector;steps.push('E='+e+'，R='+r+'，V='+v+'。');
 if(e&&!v)return done('direct','E=1/V=0，即使R=1也直达。');
 if(r)return done(o.role==='rp'?'rc-validation':'upstream',o.role==='rp'?'RC验证后反射或拒绝，平台决定。':'请求送上行。');
 if(e&&v)return done('violation','E=1/R=0/V=1：ACS Violation。');
 return done('direct','E=0/R=0，正常peer直达。');
}
function acsRouteText(o){const r=acsRoute(o);return r?r.steps.concat('结果 ['+r.action+']：'+r.reason,'不模拟Enhanced目标、UIO、FM消息、Segment或RC算法；不读写硬件。').join('\n'):'请输入有效16位hex Control与选择项。'}
function acsRouteExplorer(){const sel=(id,label,a)=>`<label>${label}<select id="acs-route-${id}">${a.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`;return `<div class="flit-explorer" role="group" aria-label="ACS路径查询"><div class="flit-controls">${sel('version','Base',[['6.0','6.0'],['7.0','7.0']])}${sel('role','角色',[['dsp','Switch DSP'],['rp','Root Port'],['mfd','非RCiEP MFD Function']])}${sel('type','TLP',[['memory','Memory Request（非UIO）'],['completion','Completion（非UIO）']])}${sel('direction','方向',[['up','上行输入'],['down','向下行进']])}${sel('target','非ACS正常路由目标',[['peer','其他peer出口/Function'],['same','接收端口自己的出口'],['rc','上行/RC']])}<label>Control +06h（hex）<input id="acs-route-control" value="0024" spellcheck="false"></label>${sel('at','AT',[[0,'00 Untranslated'],[1,'01 Translation Request'],[2,'10 Translated'],[3,'11 Reserved']])}${sel('vector','目标Vector bit',[[0,'0'],[1,'1']])}${sel('ro','Completion RO',[[0,'0'],[1,'1']])}</div><p id="acs-route-result" class="note address-query-output" aria-live="polite">${esc(acsRouteText({version:'6.0',role:'dsp',type:'memory',direction:'up',target:'peer',control:'0024',at:0,vector:0,ro:0}))}</p></div>`}
function acsVector(raw,target,mode){
 const t=String(raw).trim().replace(/^0x/i,'');if(!/^[0-9a-f]{1,2}$/i.test(t)||!Number.isInteger(target)||target<0||!['port','function','group'].includes(mode))return null;
 const n=parseInt(t,16)||256;let k=target;
 if(mode==='function'){if((n&(n-1))!==0||target>255)return null;k=target%n;}
 else if(mode==='group'){if(n<8||(n&(n-1))!==0||target>7)return null;}
 else if(target>=n)return null;
 return {n,k,offset:8+4*Math.floor(k/32),bit:k%32,dwords:Math.ceil(n/32),aliases:mode==='function'?Math.ceil((256-k)/n):1};
}
function acsVectorText(raw,target,mode){const r=acsVector(raw,target,mode);return r?['有效N='+r.n+' bit，占'+r.dwords+'个DWORD。','目标K='+r.k+'；ACS基址B + 0x'+r.offset.toString(16).toUpperCase().padStart(2,'0')+'，DWORD内bit'+r.bit+'。',mode==='function'?'ARI未开Group：Function mod N；0～255内有'+r.aliases+'个Function号映射此bit。':mode==='group'?'Group已开：前8bit对应目标组，其余实现bit不用。':'端口按Port Number，不能用Bus号。','假定Egress Capability[5]=1；硬连位、Group能力与Function存在性另查。'].join('\n'):'无效输入：Size为8bit hex；Port目标<N；ARI要求N是2次幂、Function 0～255；Group要求N≥8且为2次幂、组0～7。'}
function acsVectorExplorer(){return `<div class="flit-explorer" role="group" aria-label="Vector索引查询"><div class="flit-controls"><label>映射<select id="acs-vector-mode"><option value="port">Port Number</option><option value="function">ARI Function（Group未开）</option><option value="group">Function Group（已开）</option></select></label><label>Size（8bit hex）<input id="acs-vector-size" value="00" spellcheck="false"></label><label>目标编号（十进制）<input id="acs-vector-target" type="number" min="0" max="255" value="37"></label></div><p id="acs-vector-result" class="note address-query-output" aria-live="polite">${esc(acsVectorText('00',37,'port'))}</p></div>`}
function decodeAcsRegisters(capRaw,ctlRaw,role){
 const cap=parseHex16(capRaw),ctl=parseHex16(ctlRaw);if(cap===null||ctl===null||!['rp','dsp','mfd'].includes(role))return null;const rows=[],notes=[];
 const names=['Source Validation','Translation Blocking','Request Redirect','Completion Redirect','Upstream Forwarding','Egress Control','Direct Translated P2P'];
 for(let i=0;i<7;i++){const support=(cap>>i)&1,enabled=(ctl>>i)&1;rows.push('bit'+i+' '+names[i]+'：支持='+support+'，使能='+enabled+'。');if(enabled&&!support)notes.push('bit'+i+'使能但能力未宣告。');if(role==='mfd'&&[0,1,4].includes(i)&&(support||enabled))notes.push('非RCiEP MFD不适用bit'+i+'；DSP Function应选端口角色。');}
 const enhanced=(cap>>7)&1;rows.push('Capability[7] Enhanced='+enhanced+'。');rows.push((cap&32)?'Vector Size='+((cap>>8)||256)+' bit（编码0表示256）。':'Egress未支持：Size未定义，Vector可不存在。');
 if(enhanced&&role!=='mfd'){
  const map=['00 直接访问','01 阻断','10 重定向','11 保留'];rows.push('Control[7] I/O阻断='+((ctl>>7)&1)+'；[9:8] DSP目标='+map[(ctl>>8)&3]+'。');if(((ctl>>8)&3)===3)notes.push('DSP目标11为保留编码。');
  if(role==='dsp'){rows.push('Control[11:10] USP目标='+map[(ctl>>10)&3]+'；[12] Unclaimed='+((ctl&4096)?'上行':'UR')+'。');if(((ctl>>10)&3)===3)notes.push('USP目标11为保留编码。');}
  else{rows.push('RP不适用USP目标与Unclaimed。');if(ctl&0x1c00)notes.push('RP中[12:10]按保留字段核对。');}
 }else{rows.push('Control[12:7]无有效Enhanced解释。');if((ctl&0x1f80)||(enhanced&&role==='mfd'))notes.push('Enhanced未支持或角色不适用。');}
 if(ctl&0xe000)notes.push('Control[15:13]为RsvdP，含非零值需核对。');if((ctl&0x42)===0x42)notes.push('Translation Blocking[1]=1时Direct[6]被忽略。');if((ctl&0x44)===0x44)notes.push('Request Redirect与Direct同时开，需核对请求排序。');notes.push('相关使能默认0；目标BAR是否存在需另查。离线解码不写设备。');return {rows,notes};
}
function acsRegistersText(cap,ctl,role){const r=decodeAcsRegisters(cap,ctl,role);return r?r.rows.concat(r.notes).join('\n'):'请输入有效16位hex值和角色。'}
function acsRegisterExplorer(){return `<div class="flit-explorer" role="group" aria-label="ACS寄存器解码"><div class="flit-controls"><label>角色<select id="acs-reg-role"><option value="dsp">Switch DSP</option><option value="rp">Root Port</option><option value="mfd">非RCiEP MFD Function</option></select></label><label>Capability +04h（hex）<input id="acs-reg-cap" value="00ff" spellcheck="false"></label><label>Control +06h（hex）<input id="acs-reg-ctl" value="0024" spellcheck="false"></label></div><p id="acs-reg-result" class="note address-query-output" aria-live="polite">${esc(acsRegistersText('00ff','0024','dsp'))}</p></div>`}

function parseHex32(raw){const s=String(raw).trim().replace(/^0x/i,'');return /^[0-9a-f]{1,8}$/i.test(s)?parseInt(s,16):null}
function ltrField(raw){const n=parseHex16(raw);if(n===null)return null;const required=!!(n&0x8000),scale=(n>>>10)&7,value=n&1023;return {required,scale,value,reserved:!!(n&0x6000),valid:!required||scale<6,ns:required&&scale<6?value*2**(5*scale):null};}
function decodeL1ss(capRaw,c1Raw,c2Raw,statusRaw,version,role){
 const cap=parseHex32(capRaw),c1=parseHex32(c1Raw),c2=parseHex32(c2Raw),status=version===1?0:parseHex32(statusRaw);if([cap,c1,c2,status].some(x=>x===null)||![1,2].includes(version)||!['dsp','usp'].includes(role))return null;
 const units=[2,10,100],powerScale=(c2&3),powerValue=(c2>>>3)&31,portScale=(cap>>>16)&3,portValue=(cap>>>19)&31,scale=c1>>>29,value=(c1>>>16)&1023;
 const rows=[],notes=[],names=['PCI-PM L1.2','PCI-PM L1.1','ASPM L1.2','ASPM L1.1'];
 for(let i=0;i<4;i++){rows.push(names[i]+'：Supported='+((cap>>>i)&1)+'，Enable='+((c1>>>i)&1)+'。');if((c1&(1<<i))&&!(cap&(1<<i)))notes.push(names[i]+'使能但未宣告支持。');}
 rows.push('L1SS Supported[4]='+((cap>>>4)&1)+'；Link Activation Supported[5]='+((cap>>>5)&1)+'。');if((c1&15)&&!(cap&16))notes.push('L1SS Supported=0，不得使能子状态。');
 rows.push('Port Common_Mode_Restore_Time='+((cap>>>8)&255)+' μs（仅L1.2相关能力有效）。');
 const pt=portScale<3?portValue*units[portScale]:null,wait=powerScale<3?powerValue*units[powerScale]:null,threshold=scale<6?value*2**(5*scale):null;
 if(cap&5){rows.push('Port T_POWER_ON='+portValue+' × '+(portScale<3?units[portScale]+' μs = '+pt+' μs':'保留Scale')+'（本端要求对端等待）。');rows.push('Control2 TPOWER_ON='+powerValue+' × '+(powerScale<3?units[powerScale]+' μs = '+wait+' μs':'保留Scale')+'（本端配置等待）。');if(portScale===3||powerScale===3)notes.push('T_POWER_ON Scale=11保留，不按有效时间使用。');}else rows.push('不支持L1.2：Port时间与Control2字段按RsvdP，不按有效时间使用。');
 if(role==='dsp'&&(cap&5))rows.push('Control1 Common_Mode_Restore_Time='+((c1>>>8)&255)+' μs。');else rows.push('Control1 Common_Mode_Restore_Time对本角色/能力为RsvdP。');
 if(cap&4){rows.push('LTR阈值='+value+' × Scale '+scale+'：'+(threshold===null?'Not Permitted':threshold+' ns')+'。');if(scale>5)notes.push('LTR Threshold Scale=6/7不允许，写入会导致未定义行为。');}else rows.push('不支持ASPM L1.2：LTR阈值字段按RsvdP。');
 if(role==='dsp'&&(cap&32)){rows.push('Activation Interrupt Enable='+((c1>>>4)&1)+'，Control='+((c1>>>5)&1)+'。');if((c1&32)&&!(c1&3))notes.push('仅ASPM或无PCI-PM子状态使能：Activation Control按该机制没有作用。');}else if((cap&32)||(c1&48))notes.push('Link Activation需支持它的DSP；USP相关字段RsvdP。');
 if(version===1)rows.push('头版本1：+10h Status不存在，忽略输入Status。');else{rows.push('头版本2：+10h bit0 Activation Status='+((role==='dsp'&&(cap&32))?(status&1):'RsvdZ/硬连0')+'；有效时为RW1C，不是当前L状态。');if((status>>>1)||(status&1)&&!(role==='dsp'&&(cap&32)))notes.push('Status含RsvdZ非零位，需核对输入/实现。');}
 if((cap&0xff0400c0)||(c1&0x1c0000c0)||(c2&0xffffff04))notes.push('输入包含RsvdP非零位；先核对原始读取及保留位。');
 if(c1&5)notes.push('任一L1.2已使能时禁止改TPOWER_ON和Common Mode时间。');if(c1&4)notes.push('ASPM L1.2已使能时禁止改LTR阈值。');
 notes.push('仅解码本端输入；双端匹配、设计时间、CLKREQ#接线和模拟恢复另查。');return {rows,notes,powerOnUs:wait,portPowerOnUs:pt,thresholdNs:threshold};
}
function l1ssRegisterText(...args){const r=decodeL1ss(...args);return r?r.rows.concat(r.notes).join('\n'):'请输入4个有效32bit hex DWORD，并选择头版本与Port角色。'}
function l1ssRegisterExplorer(){return `<div class="flit-explorer" role="group" aria-label="L1SS寄存器解码"><div class="flit-controls"><label>角色<select id="l1reg-role"><option value="dsp">DSP（RP或Switch下行端口）</option><option value="usp">USP（设备或Switch上行端口）</option></select></label><label>头Capability Version<select id="l1reg-version"><option value="2">2，有Status</option><option value="1">1，无Status</option></select></label><label>Capabilities +04h（hex）<input id="l1reg-cap" value="00200a3f" spellcheck="false"></label><label>Control1 +08h（hex）<input id="l1reg-c1" value="000a0a0c" spellcheck="false"></label><label>Control2 +0Ch（hex）<input id="l1reg-c2" value="00000028" spellcheck="false"></label><label>Status +10h（hex，可忽略于v1）<input id="l1reg-status" value="00000000" spellcheck="false"></label></div><p id="l1reg-result" class="note address-query-output" aria-live="polite">${esc(l1ssRegisterText('00200a3f','000a0a0c','00000028','00000000',2,'dsp'))}</p></div>`}
function l1ssEntry(o){
 const d=parseHex32(o.dcap),u=parseHex32(o.ucap),c=parseHex32(o.control);if([d,u,c].some(x=>x===null)||!['aspm','pcipm'].includes(o.path)||![0,1].includes(o.asserted))return null;
 const steps=[],done=(state,reason)=>({state,reason,steps}),enables=c&15,common=d&u,shift=o.path==='aspm'?2:0;
 steps.push('前提：已处L1.0，两端相关Enable/阈值一致且板级/计时配置合法；只判断下一子状态。');
 if(enables&&(!(d&16)||!(u&16)||(enables&~common)))return done('undefined','使能了双端未共同支持的子状态，或L1SS Supported未置位。');
 if(o.asserted)return done('L1.0','CLKREQ# asserted（低），不进入更深子状态；是否退出L1由其他请求决定。');
 steps.push('CLKREQ# deasserted（双方释放），按'+o.path+'入口选对应Enable。');
 const e12=!!(c&(1<<shift)),e11=!!(c&(2<<shift));
 if(o.path==='pcipm'){if(e12)return done('L1.2.Entry','PCI-PM L1.2优先，不比较ASPM的LTR阈值。');return done(e11?'L1.1':'L1.0',e11?'PCI-PM L1.1使能，L1.2未使能。':'该路径无更深子状态使能。');}
 if(e12){const s=ltrField(o.snoop),n=ltrField(o.nosnoop),scale=c>>>29,value=(c>>>16)&1023;if(!s||!n)return null;if(scale>5||!s.valid||!n.valid)return done('undefined','阈值或有效LTR使用Not Permitted Scale，不能判成无限容忍。');if(s.reserved||n.reserved)return done('outside','LTR输入含保留位，先核对字段格式。');
  const threshold=value*2**(5*scale),pass=x=>!x.required||x.ns>=threshold;steps.push('阈值='+threshold+' ns；snoop='+(!s.required?'无要求':s.ns+' ns')+'；non-snoop='+(!n.required?'无要求':n.ns+' ns')+'。');
  if(pass(s)&&pass(n))return done('L1.2.Entry','两类都满足≥阈值或无要求；随后还须完成Entry过程。');
  steps.push('至少一类LTR小于阈值，L1.2条件不满足。');
 }
 return done(e11?'L1.1':'L1.0',e11?'ASPM L1.1使能，作为未满足L1.2条件的路径。':'无可进入的更深子状态。');
}
function l1ssEntryText(o){const r=l1ssEntry(o);return r?r.steps.concat('下一子状态：'+r.state+'。'+r.reason,'此查询不是当前状态读取或模拟上电/训练验证。').join('\n'):'请输入有效32bit Cap/Control、16bit LTR及选择项。'}
function l1ssEntryExplorer(){return `<div class="flit-explorer" role="group" aria-label="L1SS入口条件查询"><div class="flit-controls"><label>进入L1来源<select id="l1entry-path"><option value="aspm">ASPM L1.0</option><option value="pcipm">PCI-PM L1.0</option></select></label><label>CLKREQ#逻辑状态<select id="l1entry-asserted"><option value="0">高：deasserted，双方释放</option><option value="1">低：asserted，任一端拉低</option></select></label><label>DSP Capability（hex）<input id="l1entry-dcap" value="0000001f" spellcheck="false"></label><label>USP Capability（hex）<input id="l1entry-ucap" value="0000001f" spellcheck="false"></label><label>共同Control1（hex）<input id="l1entry-control" value="000a000c" spellcheck="false"></label><label>Snoop LTR字段（16bit hex）<input id="l1entry-snoop" value="800a" spellcheck="false"></label><label>Non-snoop LTR字段（16bit hex）<input id="l1entry-nosnoop" value="800a" spellcheck="false"></label></div><p id="l1entry-result" class="note address-query-output" aria-live="polite">${esc(l1ssEntryText({dcap:'0000001f',ucap:'0000001f',control:'000a000c',path:'aspm',asserted:0,snoop:'800a',nosnoop:'800a'}))}</p></div>`}

const AER_UE_BITS=[[4,'Data Link Protocol'],[5,'Surprise Down'],[12,'Poisoned TLP Received'],[13,'Flow Control Protocol'],[14,'Completion Timeout'],[15,'Completer Abort'],[16,'Unexpected Completion'],[17,'Receiver Overflow'],[18,'Malformed TLP'],[19,'ECRC Error'],[20,'Unsupported Request'],[21,'ACS Violation'],[22,'Uncorrectable Internal'],[23,'MC Blocked TLP'],[24,'AtomicOp Egress Blocked'],[25,'TLP Prefix Blocked'],[26,'Poisoned TLP Egress Blocked'],[27,'DMWr Egress Blocked'],[28,'IDE Check Failed'],[29,'Misrouted IDE TLP'],[30,'PCRC Check Failed'],[31,'TLP Translation Egress Blocked']];
const AER_CE_BITS=[[0,'Receiver Error'],[6,'Bad TLP'],[7,'Bad DLLP'],[8,'REPLAY_NUM Rollover'],[12,'Replay Timer Timeout'],[13,'Advisory Non-Fatal Error'],[14,'Corrected Internal Error'],[15,'Header Log Overflow']];
function decodeAerSnapshot(ueRaw,umRaw,sevRaw,ceRaw,cmRaw){
 const values=[ueRaw,umRaw,sevRaw,ceRaw,cmRaw].map(parseHex32);if(values.some(v=>v===null))return null;
 const [ue,um,sev,ce,cm]=values,bit=(v,i)=>(v>>>i)&1,rows=[],notes=[];
 const ues=AER_UE_BITS.filter(([i])=>bit(ue,i)).map(([i,name])=>({bit:i,name,masked:!!bit(um,i),fatal:!!bit(sev,i)}));
 const ces=AER_CE_BITS.filter(([i])=>bit(ce,i)).map(([i,name])=>({bit:i,name,masked:!!bit(cm,i)}));
 for(const x of ues)rows.push('UE['+x.bit+'] '+x.name+'：Status=1，'+(x.masked?'Masked':'未屏蔽')+'，Severity='+ (x.fatal?'Fatal':'Non-Fatal')+'。');
 for(const x of ces)rows.push('CE['+x.bit+'] '+x.name+'：Status=1，'+(x.masked?'Masked':'未屏蔽')+'。');
 if(!ues.length&&!ces.length)rows.push('当前输入没有已定义UE/CE Status置位；这不证明从未出错或日志已排空。');
 const uMask=AER_UE_BITS.reduce((n,[i])=>(n|2**i)>>>0,0),cMask=AER_CE_BITS.reduce((n,[i])=>(n|2**i)>>>0,0);
 if((ue&~uMask)>>>0)notes.push('UE Status含Undefined bit0或Reserved位非零，需核对版本/原始读取。');
 if((ce&~cMask)>>>0)notes.push('CE Status含Reserved位非零，需核对版本/原始读取。');
 if(((um|sev)&~(uMask|1))>>>0)notes.push('UE Mask/Severity含保留位非零；不能当已定义错误解释。');
 if(((cm)&~cMask)>>>0)notes.push('CE Mask含保留位非零；核对保留属性，不生成回写值。');
 if((sev&1)!==0)notes.push('UE Severity bit0为Undefined，不赋予Fatal/Non-Fatal语义。');
 if(!(um&1))notes.push('UE Mask bit0为Undefined旧字段，规范要求软件只向该位写1；本站只读解码，不建议整字回写。');
 if(bit(ce,13))notes.push(bit(cm,13)?'ANFE：CE Mask[13]=1可在设置对应UE Status和Header前终止；快照中其他UE位可能来自历史/其他事件。':'ANFE：CE Mask[13]=0后才进入对应UE Status记录；UE Mask继续控制Header/FEP。');
 notes.push('快照不能确定ERR消息/Root IRQ：仍需角色、报告Enable、ANFE/DPC分支、能力与历史顺序。可选位不一定实现。');
 return {ues,ces,rows,notes};
}
function aerSnapshotText(...args){const r=decodeAerSnapshot(...args);return r?r.rows.concat(r.notes).join('\n'):'请输入5个有效32bit十六进制DWORD（可带0x）。';}
function aerRegisterExplorer(){const inputs=[['ue','UE Status +04h','00104000'],['mask','UE Mask +08h','04400001'],['severity','UE Severity +0Ch','10462030'],['ce','CE Status +10h','00002040'],['cmask','CE Mask +14h','0000e000']];return `<div class="flit-explorer" role="group" aria-label="AER错误位图查询"><div class="flit-controls">${inputs.map(([id,label,value])=>`<label>${label}（hex）<input id="aer-${id}" value="${value}" spellcheck="false"></label>`).join('')}</div><p id="aer-result" class="note address-query-output" aria-live="polite">${esc(aerSnapshotText(...inputs.map(x=>x[2])))}</p></div>`;}
const TIMEOUT_SUPPORT={0:'',1:'A',2:'B',3:'AB',6:'BC',7:'ABC',14:'BCD',15:'ABCD'};
const TIMEOUT_SELECTION={1:['A',0.05,0.1],2:['A',1,10],5:['B',16,55],6:['B',65,210],9:['C',260,900],10:['C',1000,3500],13:['D',4000,13000],14:['D',17000,64000]};
function decodeCompletionTimeout(capRaw,controlRaw,fmSupported){
 const cap=parseHex32(capRaw),control=parseHex16(controlRaw);if(cap===null||control===null||typeof fmSupported!=='boolean')return null;
 const supportCode=cap&15,value=control&15,support=TIMEOUT_SUPPORT[supportCode],selection=TIMEOUT_SELECTION[value],disableSupported=!!(cap&16),disabled=!!(control&16),notes=[];
 let rangeMs=null,valid=support!==undefined,selectionSupported=false;
 if(support===undefined)notes.push('DevCap2[3:0]为Reserved组合，不能按任意四位bitmap解释。');
 if(value===0){rangeMs=fmSupported?[40,50]:[0.05,50];selectionSupported=true;}
 else if(!selection){valid=false;notes.push('DevControl2[3:0]为Reserved选择值。');}
 else{selectionSupported=support!==undefined&&support.includes(selection[0]);if(selectionSupported)rangeMs=[value===5&&fmSupported?40:selection[1],selection[2]];else{valid=false;notes.push('所选Range '+selection[0]+'未被有效支持编码宣告，不输出有效Timeout区间。');}}
 if(disabled&&!disableSupported){valid=false;notes.push('Disable=1但DevCap2[4]=0，未宣告Disable能力。');}
 const rows=['范围支持编码=0x'+supportCode.toString(16).toUpperCase()+'：'+(support===undefined?'Reserved':support||'无可编程范围（仍有默认值）')+'。','选择值=0x'+value.toString(16).toUpperCase()+'；FM Supported='+Number(fmSupported)+'（不是当前FM运行状态）。','Disable Supported='+Number(disableSupported)+'；Disable='+Number(disabled)+'。'];
 if(rangeMs)rows.push('所选允许范围：'+rangeMs[0]+'～'+rangeMs[1]+' ms'+(disabled?'（合法Disable使能时当前不运行计时）':'')+'。');
 if(disabled&&disableSupported)rows.push('Timeout机制已禁用；所选范围仅为配置解码，不代表正在计时。');
 if(!fmSupported&&value===0)notes.push('不支持FM时，默认范围虽从50μs起，规范强烈建议不早于10ms超时。');
 notes.push('VF使用关联PF设置；输入有效PF控制值。改值/解除Disable对在途请求有实现选择，无法推出精确deadline。');
 return {valid,supportCode,support,value,disableSupported,disabled,rangeMs,selectionSupported,rows,notes};
}
function completionTimeoutText(...args){const r=decodeCompletionTimeout(...args);return r?r.rows.concat(r.notes).join('\n'):'请输入有效32bit DevCap2、16bit DevControl2及FM支持条件。';}
function completionTimeoutExplorer(){return `<div class="flit-explorer" role="group" aria-label="Completion Timeout查询"><div class="flit-controls"><label>DevCap2 C+24h（hex DWORD）<input id="cto-cap" value="0000001f" spellcheck="false"></label><label>DevControl2 C+28h（hex WORD）<input id="cto-control" value="0005" spellcheck="false"></label><label>组件Flit Mode Supported<select id="cto-fm"><option value="1">是（即使当前跑NFM）</option><option value="0">否</option></select></label></div><p id="cto-result" class="note address-query-output" aria-live="polite">${esc(completionTimeoutText('0000001f','0005',true))}</p></div>`;}

function renderDetails(f){return (f.details||[]).map((d,i)=>`<section class="feature-detail" id="detail-${esc(detailKey(d,i))}"><h2>${esc(d.title)} ${f.id?`<a class="permalink" href="${detailHref(f,d,i)}" aria-label="链接到 ${esc(d.title)}">#</a>`:''}</h2>${(d.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${d.id==='compliance-all-settings'?`<label class="setting-filter-label">筛选档位／图样 <input id="compliance-filter" type="search" placeholder="如 #84、167、128 LSTP4" aria-label="筛选Compliance档位"></label><p id="setting-filter-status" class="muted" aria-live="polite">167 / 167 档；纯数字按档位编号精确匹配。</p>`:''}${d.id==='ecc-group-map'?flitByteExplorer():''}${d.id==='dlp-live-decoder'?dlpDecoder():''}${d.id==='sequence-window-explorer'?ackWindowExplorer():''}${d.id==='ats-register-decoder'?addressCapabilityExplorer('ats'):''}${d.id==='pasid-register-decoder'?addressCapabilityExplorer('pasid'):''}${d.id==='pri-register-decoder'?addressCapabilityExplorer('pri'):''}${d.id==='ats-range-explorer'?atsRangeExplorer():''}${d.id==='acs-route-explorer'?acsRouteExplorer():''}${d.id==='egress-vector-explorer'?acsVectorExplorer():''}${d.id==='enhanced-register-decoder'?acsRegisterExplorer():''}${d.id==='l1ss-entry-explorer'?l1ssEntryExplorer():''}${d.id==='l1ss-register-decoder'?l1ssRegisterExplorer():''}${d.id==='aer-register-explorer'?aerRegisterExplorer():''}${d.id==='completion-timeout-explorer'?completionTimeoutExplorer():''}${d.table?`<div class="table-wrap" tabindex="0" role="region" aria-label="${esc(d.title)}"><table class="generation-table"><caption>${esc(d.title)}</caption><thead><tr>${d.table.columns.map(c=>`<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${d.table.rows.map(row=>`<tr ${d.id==='compliance-all-settings'?`data-setting="${esc(row[0])}"`:''}>${row.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:''}<div class="detail-sources">${detailSources(f,d)}</div></section>`).join('')}
function detailMatches(f){const words=$('#search').value.trim().toLowerCase().split(/\s+/).filter(Boolean);return words.length?(f.details||[]).map((d,i)=>({d,i})).filter(({d})=>words.every(w=>JSON.stringify(d).toLowerCase().includes(w))):[]}
function renderLookup(){const ids=[4,11,16,137,169,179,111,112,9,164,175,178,10,170,174,93,94,95,13,14,98,68,69,70,71,72,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,175,99,100,101,102,103,104],q=$('#search').value.trim();const features=ids.map(id=>DB.features.find(f=>f.id===id));$('#content').innerHTML=`<div class="hero"><div class="eyebrow">PROTOCOL REFERENCE / STATES · CREDITS · PIPE</div><h1>把协议细节，查到条件。</h1><p>按子状态、转移条件、计数、定时器和接口字段查询。每块显示明确版本及PDF物理页，选择自己的文档即可对照。</p><p>按块关联已核读的正式版正文；6.0/7.0的细节与早期修订差异分别标注，七代全部条款仍在逐项完善。</p></div><div class="note">输入完整子状态名或关键词，例如 Polling.Active、NPH、Merged、96 ms、RxValid、PERST、FLR、ECC、TLPs per Half Flit、ANFE、Completion Timeout、Header Log。全站功能目录也会检索这些详情。</div>${features.map(f=>{const ds=q?detailMatches(f):(f.details||[]).map((d,i)=>({d,i}));return ds.length?`<article class="list-row"><span class="tag">功能 ${f.id} · ${ds.length} 个知识块</span><h2><a href="#feature/${f.id}">${esc(f.name)}</a></h2><div class="detail-links">${ds.map(({d,i})=>`<a href="${detailHref(f,d,i)}">${esc(d.title)} →</a>`).join('')}</div></article>`:''}).join('')}${q&&!features.some(f=>detailMatches(f).length)?'<div class="empty">这些专题没有匹配细节，可到全部功能搜索其他主题。</div>':''}`;document.title='协议细节查询 · PCIe Study'}
function loadSet(key){try{const a=JSON.parse(localStorage.getItem(key)||'[]');return new Set(Array.isArray(a)?a:[])}catch{return new Set()}}
const saved=loadSet('pcie-study-bookmarks'),read=loadSet('pcie-study-read');
$('#feature-count').textContent=DB.features.length;
const groups=[...new Set(DB.features.map(f=>f.group))];
const searchIndex=new Map(DB.features.map(f=>[f.id,[f.name,f.group,f.intro,f.usage,f.mechanism,f.checks,f.prerequisites,JSON.stringify(f.details||[]),...(f.protocolReferences||[]).map(r=>`${r.section} ${r.title} ${r.version}`)].join(' ').toLowerCase()]));
let searchTimer,pdfTarget=null,pdfUrl=null;
function store(){try{localStorage.setItem('pcie-study-bookmarks',JSON.stringify([...saved]));localStorage.setItem('pcie-study-read',JSON.stringify([...read]))}catch{toast('浏览器暂不允许保存阅读标记')}}
function toast(s){$('#toast').textContent=s;$('#toast').classList.add('show');clearTimeout(searchTimer);searchTimer=setTimeout(()=>$('#toast').classList.remove('show'),2200)}
function section(title,text,n){return `<section id="part-${n}"><h2><span class="number">${String(n).padStart(2,'0')}</span>${title}</h2><p>${esc(text)}</p></section>`}
function route(){let h=location.hash.slice(1)||'home';try{return decodeURIComponent(h)}catch{return 'home'}}
function card(f){return `<article class="card"><div class="card-tag">${esc(f.group)} · ${String(f.id).padStart(3,'0')}</div><button class="bookmark ${saved.has(f.id)?'saved':''}" data-save="${f.id}" aria-label="${saved.has(f.id)?'取消收藏':'收藏'} ${esc(f.name)}" aria-pressed="${saved.has(f.id)}">${saved.has(f.id)?'★':'☆'}</button><h2><a href="#feature/${f.id}">${esc(f.name)}</a></h2><p>${esc(f.intro)}</p>${detailMatches(f).length?`<div class="search-detail-hits">${detailMatches(f).slice(0,4).map(({d,i})=>`<a href="${detailHref(f,d,i)}">↳ ${esc(d.title)}</a>`).join('')}</div>`:''}<div class="card-meta"><span>${(f.protocolReferences||[]).length?((f.protocolReferences||[]).some(r=>DB.protocols.find(p=>p.id===r.documentId)?.kind==='product-manual')?'资料章节已定位':'规范章节已定位'):'来源待补充'}</span><span>${read.has(f.id)?'✓ 已读':'查看详解 →'}</span></div></article>`}
function filtered(items){const q=$('#search').value.toLowerCase().trim().split(/\s+/).filter(Boolean);return items.filter(f=>q.every(w=>searchIndex.get(f.id).includes(w)))}
function renderHome(group='',onlySaved=false){
 const base=DB.features.filter(f=>(!group||f.group===group)&&(!onlySaved||saved.has(f.id)));let items=filtered(base);
 const title=onlySaved?'把重要的功能，留在手边':group||'从一个功能点，读懂 PCIe';
 const coverage=DB.features.filter(f=>(f.protocolReferences||[]).length).length;
 $('#content').innerHTML=`<div class="hero"><div class="eyebrow">PERSONAL KNOWLEDGE BASE / PCI EXPRESS</div><h1>${esc(title)}</h1><p>围绕每个功能说明原理、用途、前提和检查方法，再定位到明确版本的协议章节。例子只是辅助理解，内容按块持续完善。</p><p><a href="#coverage">沿协议章节查覆盖 →</a> · <a href="#lookup">查状态、Credit与PIPE细节 →</a> · <a href="#generations">查 Gen1～Gen7 的变化 →</a> · <a href="#phy">学习 PHY／SerDes →</a> · <a href="#audit">看自查与待完善内容 →</a></p></div><div class="stats"><div class="stat"><b>${DB.features.length}</b><span>功能点</span></div><div class="stat"><b>${groups.length}</b><span>主题分类</span></div><div class="stat"><b>${coverage}</b><span>已定位来源章节</span></div><div class="stat"><b>${DB.documents.candidateCount}</b><span>本地文档候选</span></div></div><div class="toolbar"><span class="result-count">${items.length} 项${group?' · '+esc(group):''}${onlySaved?' · 已收藏':''}</span><select id="group-filter" aria-label="按分类筛选"><option value="">全部分类</option>${groups.map(g=>`<option value="${esc(g)}" ${g===group?'selected':''}>${esc(g)}</option>`).join('')}</select></div><div class="cards">${items.map(card).join('')}</div>${!items.length?'<div class="empty">没有匹配内容。可以换一个缩写、中文关键词或分类。</div>':''}<div class="note">“目录已定位”与“章节正文已核读”分别记录。实现选项和平台方案也单独标注，不能把所有项目都当成 PCIe Base 的独立标准功能。</div>`;
 $('#group-filter').addEventListener('change',e=>{location.hash=e.target.value?'group/'+encodeURIComponent(e.target.value):'home'});
}
function renderFeature(id){const f=DB.features.find(f=>f.id===id);if(!f){$('#content').innerHTML='<div class="empty">该功能点不存在。<a href="#home">返回目录</a></div>';return}
 const refs=f.protocolReferences||[];
 $('#content').innerHTML=`<a class="back" href="#group/${encodeURIComponent(f.group)}">← ${esc(f.group)}</a><div class="detail-header"><span class="tag">功能 ${f.id} · ${esc(f.status)}</span><h1>${esc(f.name)}</h1><p>${esc(f.intro)}</p><div class="buttons"><button class="button secondary" data-save="${f.id}">${saved.has(id)?'★ 已收藏':'☆ 收藏此项'}</button><button class="button secondary" data-read="${f.id}">${read.has(id)?'✓ 已读':'标记已读'}</button><span class="muted">内容整理：${esc(f.reviewed||'待核对')}</span></div></div><div class="detail-grid"><div class="prose">${(f.details||[]).length?`<nav class="detail-index" aria-label="详细规则目录"><h2>详细规则与表格</h2>${f.details.map((d,i)=>`<a href="${detailHref(f,d,i)}">${esc(d.title)}</a>`).join('')}</nav>`:''}${section('这个功能什么时候会用到',f.usage,1)}${section('它怎样工作',f.mechanism,2)}${section('使用前提与职责边界',f.prerequisites,3)}${section('帮助理解的小例子',f.example,4)}${section('检查方法与常见误区',f.checks,5)}${renderDetails(f)}<section id="part-6"><h2><span class="number">06</span>协议与资料在哪里提到</h2>${refs.length?refs.map((r,i)=>`<div class="ref"><h3>${esc(r.document)} · 版本 ${esc(r.version)}</h3><div class="locator">§ ${esc(r.section)} — ${esc(r.title)}<br>印刷页 ${r.page} / PDF 第 ${r.pdfPage} 页</div><p>${esc(r.verification)}</p><div class="buttons"><button class="button secondary" data-pdf="${id}:${i}">选择本地 PDF 并定位 ↗</button><a href="${esc(r.url)}" target="_blank" rel="noopener">${DB.protocols.find(p=>p.id===r.documentId)?.kind==='product-manual'?'规范目录（非产品原文）':'官方规范入口'} ↗</a></div></div>`).join(''):`<div class="note">${esc(f.referenceStatus||'该项对应独立规范或具体实现，准确来源尚待补充；没有猜测章节号。')}</div>`}${(f.sources||[]).map(s=>`<p class="muted"><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a></p>`).join('')}<p class="muted">章节位置绑定到明确版本；不同版本不混用页码。PDF 原文未随网站发布。相关标题可能是上层背景入口，后续会继续细化到直接规则与字段。</p></section><div class="buttons"><a class="button secondary" href="#feature/${id>1?id-1:id}">← 上一项</a><a class="button" href="#feature/${id<DB.features.length?id+1:id}">下一项 →</a></div></div><aside class="detail-aside"><div><h3>本页内容</h3>${['使用场景','工作机制','前提与边界','辅助例子','检查与误区','协议定位'].map((x,i)=>`<a href="#feature/${id}" data-part="part-${i+1}">${String(i+1).padStart(2,'0')} ${x}</a>`).join('')}</div><div><h3>来源状态</h3><p>${esc(f.referenceStatus||'待补充')}</p><p>学习笔记不替代规范；未开展硬件验证，也不把目录检索标成整章已经读完。</p><a href="#references">查看协议与资料目录 →</a></div><div><h3>持续完善</h3><p>每轮优先修正错误、核读来源、补充职责与规则，再记录实际变更。</p><a href="#updates">查看更新记录 →</a></div></aside></div>`;
 document.title=f.name+' · PCIe Study';
}
function renderReferences(){const q=$('#search').value.toLowerCase().trim();const docs=DB.documents.items.filter(d=>[d.title,...d.topics,d.format].join(' ').toLowerCase().includes(q));$('#content').innerHTML=`<div class="hero"><div class="eyebrow">SOURCES & PROTOCOL LOCATORS</div><h1>从说明，回到原始资料。</h1><p>规范版本、章节、页码独立保存。原始文档留在你的电脑，选择对应 PDF 后在浏览器中按页定位。</p></div>${DB.protocols.map(p=>`<article class="list-row"><span class="tag">${p.kind==='product-manual'?'产品实现资料':'已建立定位元数据'}</span><h2>${esc(p.title)} · 版本 ${esc(p.version)}</h2><p>${p.pages} 页 · ${esc(p.pageMapping)}</p><p class="muted">本地对应文件名：${esc(p.fileName)}</p><a href="${esc(p.url)}" target="_blank" rel="noopener">${p.kind==='product-manual'?'规范目录（产品原文仅本地）':'官方资料入口'} ↗</a></article>`).join('')}<div class="note">${esc(DB.documents.readStatus)} 文件名中的版本、修订、草案状态仍需核对。目录包含项目附带文档，不能把所有候选都当成 PCIe 规范。</div><div class="toolbar"><span class="result-count">${docs.length} / ${DB.documents.candidateCount} 个文件名候选 · 使用顶部搜索筛选</span></div>${docs.slice(0,100).map(d=>`<article class="list-row"><div class="list-meta">${esc(d.format)} · ${(d.bytes/1048576).toFixed(1)} MB · ${esc(d.topics.join(' / '))}</div><h2>${esc(d.title)}</h2><p>${esc(d.status)}</p></article>`).join('')}${docs.length>100?'<p class="muted">为便于浏览，先显示前 100 项；输入关键词可缩小范围。</p>':''}`}
function renderUpdates(){$('#content').innerHTML=`<div class="hero"><div class="eyebrow">CHANGELOG</div><h1>一步一步，把每项讲清楚。</h1><p>记录真正增加、核对或修正的内容；不会为了“每天更新”批量改写已经正确的说明。</p></div><div class="timeline">${DB.changelog.map(c=>`<article><time>${esc(c.date)}</time><h2>${esc(c.title)}</h2><p>${esc(c.summary)}</p><p class="muted">${esc(c.verification)}</p>${(c.features||[]).map(id=>`<a class="tag" href="#feature/${id}">功能 ${id}</a>`).join(' ')}</article>`).join('')}</div><div class="note">下一轮优先：${DB.maintenance.nextFeatureIds.slice(0,6).map(id=>{const f=DB.features.find(f=>f.id===id);return f?esc(f.name):id}).join('、')}。每日内容完善由已配置的智能任务执行；GitHub Actions 仅负责构建与发布，不自行生成学习内容。</div>`}
function render(){const r=route();$('#edition').textContent='更新 '+(DB.coverage?.edition||DB.builtDate);document.title='PCIe Study · 功能与协议索引';if(r.startsWith('feature/')){renderFeature(Number(r.split('/')[1]));if(r.split('/')[2]==='detail')document.getElementById('detail-'+r.split('/').slice(3).join('/'))?.scrollIntoView();}else if(r==='coverage'||r.startsWith('coverage/'))renderCoverage(r.split('/')[1]);else if(r==='lookup')renderLookup();else if(r==='phy')renderPhy();else if(r==='generations')renderGenerations();else if(r==='audit')renderAudit();else if(r==='references')renderReferences();else if(r==='updates')renderUpdates();else if(r==='bookmarks')renderHome('',true);else if(r.startsWith('group/'))renderHome(r.slice(6));else renderHome();document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',decodeURIComponent(a.hash.slice(1))===r));}
$('#groups').innerHTML=groups.map(g=>`<a href="#group/${encodeURIComponent(g)}">${esc(g)}<span>${DB.features.filter(f=>f.group===g).length}</span></a>`).join('');
$('#search').addEventListener('input',()=>{if(route().startsWith('feature/')){location.hash='home'}else render()});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();$('#search').focus()}if(e.key==='Escape')$('#search').blur()});
window.addEventListener('hashchange',()=>{window.scrollTo(0,0);render()});
document.addEventListener('click',e=>{const gen=e.target.closest('[data-gen]');if(gen){e.preventDefault();document.getElementById(gen.dataset.gen)?.scrollIntoView({behavior:'smooth'});return}const save=e.target.closest('[data-save]');if(save){const id=Number(save.dataset.save);saved.has(id)?saved.delete(id):saved.add(id);store();render();return}const mark=e.target.closest('[data-read]');if(mark){const id=Number(mark.dataset.read);read.has(id)?read.delete(id):read.add(id);store();render();return}const part=e.target.closest('[data-part]');if(part){e.preventDefault();document.getElementById(part.dataset.part)?.scrollIntoView({behavior:'smooth'});return}const chapter=e.target.closest('[data-coverage-pdf]');if(chapter){const [v,k]=chapter.dataset.coveragePdf.split(':');const c=DB.coverage.documents.find(d=>d.version===v)?.chapters.find(c=>c.section===k);if(c)choosePdfReference(c.locator);return}const pdf=e.target.closest('[data-pdf]');if(pdf){const [id,i]=pdf.dataset.pdf.split(':').map(Number);choosePdfReference(DB.features.find(f=>f.id===id).protocolReferences[i])}});
$('#pdf-file').addEventListener('change',e=>{const file=e.target.files?.[0];if(!file||!pdfTarget)return;if(!/\.pdf$/i.test(file.name)){toast('请选择 PDF 文件');return}if(pdfUrl)URL.revokeObjectURL(pdfUrl);pdfUrl=URL.createObjectURL(file);const target=pdfUrl+'#page='+pdfTarget.pdfPage;const doc=DB.protocols.find(p=>p.id===pdfTarget.documentId);const warning=file.name!==doc?.fileName?'<p class="muted">文件名与索引记录不同，请自行确认版本和页码后再打开。</p>':'';$('#pdf-open').innerHTML=warning+`<a class="button" href="${esc(target)}" target="_blank" rel="noopener">打开本地 PDF 第 ${pdfTarget.pdfPage} 页 ↗</a><p class="muted">${esc(file.name)} · 文件未上传，版本正确性请自行确认。</p>`});
window.addEventListener('beforeunload',()=>{if(pdfUrl)URL.revokeObjectURL(pdfUrl)});
render();

document.addEventListener('input',e=>{if(e.target.id!=='compliance-filter')return;let shown=0,total=0;for(const row of e.target.closest('.feature-detail').querySelectorAll('[data-setting]')){total++;row.hidden=!settingRowMatches(row.dataset.setting,row.textContent,e.target.value);if(!row.hidden)shown++}$('#setting-filter-status').textContent=shown+' / '+total+' 档；纯数字按档位编号精确匹配。'});

document.addEventListener('input',e=>{if(!['flit-byte','flit-width'].includes(e.target.id))return;const raw=$('#flit-byte').value;$('#flit-byte-result').textContent=flitByteResult(raw.trim()===''?NaN:Number(raw),Number($('#flit-width').value))});

document.addEventListener('input',e=>{if(e.target.id==='dlp-bytes'){$('#dlp-result').textContent=dlpResultText(e.target.value);return}if(!['ack-next','ack-ackd','ack-n','ack-max'].includes(e.target.id))return;const values=['next','ackd','n','max'].map(k=>{const v=$('#ack-'+k).value;return v.trim()===''?NaN:Number(v)});$('#ack-window-result').textContent=ackWindowText(...values)});

document.addEventListener('input',e=>{if(['cap-version','cap-raw','cap-control'].includes(e.target.id)){$('#cap-result').textContent=addressCapabilityText($('#cap-kind').value,$('#cap-version').value,$('#cap-raw').value,$('#cap-control').value);return}if(!['ats-range-address','ats-range-s','ats-range-stu','ats-range-purpose'].includes(e.target.id))return;const stu=$('#ats-range-stu').value;$('#ats-range-result').textContent=atsRangeText($('#ats-range-address').value,Number($('#ats-range-s').value),stu.trim()===''?NaN:Number(stu),$('#ats-range-purpose').value)});

document.addEventListener('input',e=>{
 const id=e.target.id;
 if(id.startsWith('acs-route-')){const val=k=>$('#acs-route-'+k).value;$('#acs-route-result').textContent=acsRouteText({version:val('version'),role:val('role'),type:val('type'),direction:val('direction'),target:val('target'),control:val('control'),at:Number(val('at')),vector:Number(val('vector')),ro:Number(val('ro'))});return;}
 if(id.startsWith('acs-vector-')){const raw=$('#acs-vector-target').value;$('#acs-vector-result').textContent=acsVectorText($('#acs-vector-size').value,raw.trim()===''?NaN:Number(raw),$('#acs-vector-mode').value);return;}
 if(id.startsWith('acs-reg-'))$('#acs-reg-result').textContent=acsRegistersText($('#acs-reg-cap').value,$('#acs-reg-ctl').value,$('#acs-reg-role').value);
});

document.addEventListener('input',e=>{
 if(e.target.id.startsWith('l1reg-')){const v=k=>$('#l1reg-'+k).value;$('#l1reg-result').textContent=l1ssRegisterText(v('cap'),v('c1'),v('c2'),v('status'),Number(v('version')),v('role'));return;}
 if(e.target.id.startsWith('l1entry-')){const v=k=>$('#l1entry-'+k).value;$('#l1entry-result').textContent=l1ssEntryText({dcap:v('dcap'),ucap:v('ucap'),control:v('control'),path:v('path'),asserted:Number(v('asserted')),snoop:v('snoop'),nosnoop:v('nosnoop')});}
});

document.addEventListener('input',e=>{
 if(e.target.id.startsWith('aer-')){const v=k=>$('#aer-'+k).value;$('#aer-result').textContent=aerSnapshotText(v('ue'),v('mask'),v('severity'),v('ce'),v('cmask'));return;}
 if(e.target.id.startsWith('cto-')){$('#cto-result').textContent=completionTimeoutText($('#cto-cap').value,$('#cto-control').value,$('#cto-fm').value==='1');}
});
