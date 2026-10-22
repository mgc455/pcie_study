'use strict';
const DB=window.PCIE_STUDY;

function choosePdfReference(r){pdfTarget=r;const p=DB.protocols.find(p=>p.id===r.documentId);$('#pdf-reference').textContent=`${r.document} Revision ${r.version} · §${r.section} · 印刷页 ${r.page} / PDF 第 ${r.pdfPage} 页。请选择：${p?.fileName||'对应版本文件'}`;$('#pdf-file').value='';$('#pdf-open').replaceChildren();$('#pdf-dialog').showModal()}
function coverageBlockLinks(blocks){return blocks.map(b=>{const f=DB.features.find(f=>f.id===b.featureId),d=f.details.find(d=>d.id===b.detailId);return `<a href="#feature/${f.id}/detail/${encodeURIComponent(d.id)}">${esc(d.title)} →</a>`}).join('')}
function coverageClauseMatches(c,q){return !q||[c.section,c.title,...c.reviewedBlocks.map(b=>{const f=DB.features.find(f=>f.id===b.featureId),d=f.details.find(d=>d.id===b.detailId);return f.name+' '+d.title})].join(' ').toLowerCase().includes(q)}
function renderCoverage(version='6.0',target=''){
 const cv=DB.coverage,current=cv.documents.find(d=>d.version===version)||cv.documents.find(d=>d.version==='6.0'),q=$('#search').value.trim().toLowerCase();
 const rows=current.chapters.filter(c=>coverageClauseMatches(c,q)||c.label.toLowerCase().includes(q)||(c.clauses||[]).some(x=>coverageClauseMatches(x,q)));
 const clauses=current.chapters.flatMap(c=>c.clauses||[]),linked=clauses.filter(c=>c.reviewedBlocks.length).length;
 $('#content').innerHTML=`<div class="hero"><div class="eyebrow">SPECIFICATION COVERAGE / ${esc(cv.edition)}</div><h1>按条款查规则，沿章序补缺口。</h1><p>${esc(cv.scope)}</p><p>本版目录展开 ${clauses.length} 个子条款入口，其中 ${linked} 个已有精确条款对应的选定规则链接。它们是导航数量，不是全文覆盖率；不把目录定位或局部规则计成整章读完。</p><p>搜索条款号（如 6.17.3）、英文标题或知识块标题；展开章／附录即可对照本版PDF。</p></div><nav class="coverage-versions" aria-label="选择Base版本">${cv.documents.map(d=>`<a class="tag ${d.version===current.version?'selected-version':''}" href="#coverage/${d.version}">Gen${d.generation} · Base ${esc(d.version)}</a>`).join('')}</nav><div class="note">仅定位：目录条目和页号，正文待核读。已有选定规则：可查下面的原创解释，仍不代表整个子条款全部完成。${esc(cv.indexVerification||'')} ${esc(current.clauseIndexStatus||'')}</div><div class="toolbar"><span>${esc(current.version)} · ${rows.length}/${current.chapters.length} 个章／附录 · ${esc(cv.edition)}</span></div>${rows.map(c=>{
 const shown=(c.clauses||[]).filter(x=>!q||coverageClauseMatches(c,q)||c.label.toLowerCase().includes(q)||coverageClauseMatches(x,q));
 return `<article class="list-row coverage-chapter" id="coverage-${esc(c.section)}"><h2>§${esc(c.section)} · ${esc(c.label)}</h2><p>${esc(c.title)}</p><button class="source-chip" data-coverage-pdf="${current.version}:${c.section}">Base ${esc(current.version)} · 印刷 ${c.locator.page} / PDF ${c.locator.pdfPage} ↗</button> <span class="tag">${c.status==='selected-rules-reviewed'?'选定规则已展开':'仅定位，待逐条整理'}</span><details ${(q||target===c.section||target.startsWith(c.section+'.'))?'open':''}><summary>展开子条款 · ${shown.length} 项</summary><div class="table-wrap" tabindex="0" role="region" aria-label="第${esc(c.section)}章子条款"><table class="generation-table"><thead><tr><th>条款与目录标题</th><th>版本绑定起始页</th><th>已整理内容／待核缺口</th></tr></thead><tbody>${shown.map(x=>`<tr id="coverage-${esc(x.section)}"><th scope="row"><a href="#coverage/${current.version}/${esc(x.section)}">§${esc(x.section)}</a><p>${esc(x.title)}</p></th><td><button class="source-chip" data-coverage-clause-pdf="${current.version}:${x.section}">印刷 ${x.locator.page} / PDF ${x.locator.pdfPage} ↗</button><p class="muted">${x.bodyStartVerified?'正文起始页已核读；整条未完成':'目录定位；正文起始页待逐条复核'}</p></td><td>${x.reviewedBlocks.length?`<span class="tag">已有选定规则，非整条完成</span><div class="coverage-blocks">${coverageBlockLinks(x.reviewedBlocks)}</div><p class="muted">继续核对未展开的规则、表图、交叉引用和异常分支。</p>`:'<span class="tag">仅定位，正文待核读</span>'}</td></tr>`).join('')}</tbody></table></div>${shown.length?'':'<p>当前过滤下没有子条款；本版目录未列出的更细层级仍需正文补录。</p>'}</details>${c.reviewedBlocks.length?`<details><summary>本章已有正文的全部知识块（含目录未单列条款）· ${c.reviewedBlocks.length}</summary><div class="coverage-blocks">${coverageBlockLinks(c.reviewedBlocks)}</div></details>`:''}<p>${esc(c.remaining)}</p>${c.candidateFeatureIds.length?`<details><summary>已有章节定位的 ${c.candidateFeatureIds.length} 个条目（不等于正文全读）</summary><div class="coverage-blocks">${c.candidateFeatureIds.map(id=>`<a href="#feature/${id}">${esc(DB.features.find(f=>f.id===id).name)}</a>`).join('')}</div></details>`:''}</article>`}).join('')}<article class="list-row"><h2>怎样持续推进</h2>${cv.method.map(p=>`<p>${esc(p)}</p>`).join('')}<p><a href="#lookup">按功能和细节查 →</a> · <a href="#generations">查代际概览 →</a> · <a href="#audit">看具体未解决问题 →</a></p></article>`;
 document.title='Base '+current.version+' 章序与覆盖 · PCIe Study';
 if(target)document.getElementById('coverage-'+target)?.scrollIntoView();
}

function renderPhy(){
 const p=DB.phy,q=$('#search').value.trim().toLowerCase();
 $('#content').innerHTML=`<div class="hero"><div class="eyebrow">PHY / SERDES / GEN5 → GEN6</div><h1>从 PIPE，到真正的差分信号。</h1><p>${esc(p.summary)}</p><p><a href="#group/${encodeURIComponent('PHY与SerDes')}">查看全部20项PHY主题 →</a> · <a href="#generations">对照Gen1～Gen7 →</a></p></div><div class="note">协议规范定义行为，PIPE定义边界，产品手册和RTL解释一种实现。这里将它们分别标注；原始代码、CDL、固件和商业文档正文不公开上传。</div>${p.testReferences?`<section class="panel"><h2>${esc(p.testReferences.title)}</h2><p>从回送点、有效计数窗口，查到压力源与测量模型边界。</p><div class="detail-links">${p.testReferences.ids.map(id=>`<a href="#feature/${id}">${esc(DB.features.find(f=>f.id===id).name)} →</a>`).join('')}</div></section>`:''}${p.controlReferences?`<section class="panel"><h2>${esc(p.controlReferences.title)}</h2><p>区分写应答、操作完成和链路训练完成；按当前运行速率核对字段。</p><div class="detail-links">${p.controlReferences.ids.map(id=>`<a href="#feature/${id}">${esc(DB.features.find(f=>f.id===id).name)} →</a>`).join('')}</div></section>`:''}${p.equalizationReferences?`<section class="panel"><h2>${esc(p.equalizationReferences.title)}</h2><div class="detail-links">${p.equalizationReferences.ids.map(id=>{const f=DB.features.find(f=>f.id===id);return `<a href="#feature/${id}">${esc(f.name)} →</a>`}).join('')}</div></section>`:''}${p.receiveReferences?`<section class="panel"><h2>${esc(p.receiveReferences.title)}</h2><p>从CDR和RxValid，查到对齐、逐lane Deskew与SKP时钟补偿。</p><div class="detail-links">${p.receiveReferences.ids.map(id=>`<a href="#feature/${id}">${esc(DB.features.find(f=>f.id===id).name)} →</a>`).join('')}</div></section>`:''}${p.timeReferences?`<section class="panel"><h2>${esc(p.timeReferences.title)}</h2><p>PTM的捕获点、管线补偿与Retimer不对称延迟，关联本地时钟和有效上下文。</p><div class="detail-links">${p.timeReferences.ids.map(id=>`<a href="#feature/${id}">${esc(DB.features.find(f=>f.id===id).name)} →</a>`).join('')}</div></section>`:''}${p.bootReferences?`<section class="panel"><h2>${esc(p.bootReferences.title)}</h2><div class="detail-links">${p.bootReferences.ids.map(id=>{const f=DB.features.find(f=>f.id===id);return `<a href="#feature/${id}">${esc(f.name)} →</a>`}).join('')}</div></section>`:''}${p.marginReferences?`<section class="panel"><h2>${esc(p.marginReferences.title)}</h2><div class="detail-links">${p.marginReferences.ids.map(id=>{const f=DB.features.find(x=>x.id===id);return `<a href="#feature/${id}">${esc(f.name)} →</a>`}).join('')}</div></section>`:''}${p.lowPowerReferences?`<article class="list-row"><h2>${esc(p.lowPowerReferences.title)}</h2><p>从协议状态查到PHY恢复：以下是关联主题，不计入20项PHY专属分类。</p><div class="detail-links">${p.lowPowerReferences.ids.map(id=>DB.features.find(f=>f.id===id)).filter(f=>!q||[f.name,...(f.details||[]).map(d=>d.title)].join(' ').toLowerCase().includes(q)).map(f=>`<a href="#feature/${f.id}">${esc(f.name)} →</a>`).join('')}</div></article>`:''}${p.flows.map(f=>`<article class="list-row"><h2>${esc(f.title)}</h2><ol class="phy-flow" aria-label="${esc(f.title)}">${f.stages.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p>${esc(f.note)}</p></article>`).join('')}${renderDetails({details:[{title:'Gen5与Gen6：先对比边界，再对比参数',table:p.compare}]})}${p.groups.map(g=>{const items=g.ids.map(id=>DB.features.find(f=>f.id===id)).filter(f=>!q||searchIndex.get(f.id).includes(q));return items.length?`<section class="phy-topic-group"><h2>${esc(g.title)}</h2><div class="cards">${items.map(card).join('')}</div></section>`:''}).join('')}<article class="list-row"><h2>按现象定位到对应层</h2>${p.debug.map(x=>`<h3>${esc(x.symptom)}</h3><p>${esc(x.checks)}</p>`).join('')}</article><article class="list-row"><h2>核读范围与待补齐内容</h2>${p.limits.map(t=>`<p>${esc(t)}</p>`).join('')}<h3>后续完善路线</h3>${p.next.map(t=>`<p>${esc(t)}</p>`).join('')}<a href="#references">查看本地版本化PDF入口 →</a></article>`;
 document.title='PHY与SerDes · PCIe Study';
}
function renderGenerations(){
 const g=DB.generations,q=$('#search').value.trim().toLowerCase();
 const items=g.items.filter(x=>[`gen${x.gen}`,`gen ${x.gen}`,x.rate+'',x.signaling,x.encoding,x.change,x.focus].join(' ').toLowerCase().includes(q));
 const links=x=>x.sourceIds.map(id=>{const s=g.sources.find(s=>s.id===id);return `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`}).join(' · ');
 $('#content').innerHTML=`<div class="hero"><div class="eyebrow">GEN1 → GEN7 / EVOLUTION</div><h1>每一代，究竟改了什么？</h1><p>${esc(g.status)}</p></div><div class="note">Gen 是链路速率代际；Base 规范修订、独立规范和 ECN 是功能规则的出处。ACS、ATS、SR-IOV 等是否支持，需要逐项检查能力与平台，不能仅凭 Gen 判断。</div><div class="table-wrap"><table class="generation-table"><caption>单向带宽对比：十进制 GB/s，未扣除全部协议开销</caption><thead><tr><th>代际</th><th>GT/s</th><th>调制 / 编码</th><th>x1 原始</th><th>x16 原始</th><th>x16 扣除编码后</th></tr></thead><tbody>${items.map(x=>`<tr><th><a href="#generations" data-gen="gen-${x.gen}">Gen${x.gen}</a></th><td>${x.rate}</td><td>${esc(x.signaling)} / ${esc(x.encoding)}</td><td>${(x.rate/8).toFixed(3)}</td><td>${(x.rate*2).toFixed(3)}</td><td>${x.efficiency?(x.rate*2*x.efficiency).toFixed(3):'另算 FLIT / 协议开销'}</td></tr>`).join('')}</tbody></table></div><div class="note">计算口径：原始单向带宽 = GT/s × lane 数 ÷ 8；Gen1/2 再乘 8/10，Gen3～5 再乘 128/130。Gen6/7 的标称 GT/s 已计入 PAM4 每符号 2 bit，不能再乘 2。双向合计 = 单向 × 2；TLP 包头、Completion、流控、空闲和重放还会降低实际吞吐，Gen6/7 不能沿用 128/130。此表由这些公式计算，不是实测性能。</div>${items.map(x=>`<article class="list-row generation-detail" id="gen-${x.gen}"><span class="tag">Gen${x.gen} · ${x.rate} GT/s</span><h2>主要变化</h2><p>${esc(x.change)}</p><h3>学习与检查重点</h3><p>${esc(x.focus)}</p><p>${x.featureIds.map(id=>{const f=DB.features.find(f=>f.id===id);return f?`<a class="tag" href="#feature/${id}">${esc(f.name)}</a>`:''}).join(' ')}</p><p>${links(x)}</p><p class="muted">来源核对：${esc(g.reviewed)} · 正文精确条款与该代完整差异仍在完善。</p></article>`).join('')}${!items.length?'<div class="empty">没有匹配代际，可搜索 Gen6、PAM4、编码、均衡等。</div>':''}<article class="list-row"><h2>建议学习顺序</h2>${g.learningPath.map(t=>`<p>${esc(t)}</p>`).join('')}<h2>接下来逐项补齐</h2>${g.nextResearch.map(t=>`<p>${esc(t)}</p>`).join('')}</article><article class="list-row"><h2>引用类型与限制</h2>${g.sources.map(s=>`<p><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)} ↗</a><br><span class="muted">${esc(s.kind)}</span></p>`).join('')}</article>`;
 document.title='Gen1～Gen7 演进 · PCIe Study';
}
function renderAudit(){const a=DB.audit;$('#content').innerHTML=`<div class="hero"><div class="eyebrow">SELF REVIEW / ${esc(a.date)}</div><h1>每日自查，留下可追溯的改进。</h1><p>${esc(a.summary)}</p></div>${a.externalComparison?`<section class="list-row"><h2>基础查漏与阅读路线</h2><p>${esc(a.externalComparison.scope)}</p><p><a href="${esc(a.externalComparison.source)}" target="_blank" rel="noopener">对照的学习仓库 ↗</a> · <a href="#feature/1/detail/basics-topology-reading-order">从基础阅读顺序开始 →</a></p><div class="table-wrap"><table class="generation-table"><thead><tr><th>学习主题</th><th>当前深度／缺口</th><th>站内入口</th></tr></thead><tbody>${a.externalComparison.items.map(x=>`<tr><th scope="row">${esc(x.topic)}</th><td>${esc(x.status)}</td><td><div class="coverage-blocks">${x.featureIds.map(id=>`<a href="#feature/${id}">${esc(DB.features.find(f=>f.id===id).name)} →</a>`).join('')}</div></td></tr>`).join('')}</tbody></table></div></section>`:''}${a.checks.map(c=>`<article class="list-row"><span class="tag">${esc(c.status)}</span><h2>${esc(c.name)}</h2><p>${esc(c.detail)}</p></article>`).join('')}<article class="list-row"><h2>尚未解决的问题</h2>${a.unresolved.map(t=>`<p>${esc(t)}</p>`).join('')}</article><p><a href="#updates">查看每轮实际内容变更 →</a></p>`;document.title='每日自查 · PCIe Study'}
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

function parseMarginByte(raw){const v=parseHex16(raw);return v!==null&&v<=255?v:null;}
function decodeMarginWord(raw){const v=parseHex16(raw);return v===null?null:{raw:v,receiver:v&7,type:(v>>>3)&7,usage:(v>>>6)&1,reserved:(v>>>7)&1,payload:v>>>8};}
function marginReceiverTarget(receiver,role,retimers,windowMode){
 if(role==='usp')return receiver===0?'Broadcast：本地USP':receiver===6?'Rx(F)：本地USP':null;
 if(receiver===0)return 'Broadcast：本地DSP和所选Retimer接收器';if(receiver===1)return 'Rx(A)：本地DSP';
 if(receiver<2||receiver>5)return null;const n=windowMode==='last'?3:1,index=n+Math.floor((receiver-2)/2);if(index>retimers)return null;
 return 'Rx('+((windowMode==='last'?['G','H','I','J']:['B','C','D','E'])[receiver-2])+')：第'+index+'颗Retimer的'+(receiver%2===0?'USP':'DSP')+'接收器';
}
function decodeMarginCommand(controlRaw,statusRaw,version,role,retimers,windowMode,indTiming,indVoltage){
 const c=decodeMarginWord(controlRaw),s=decodeMarginWord(statusRaw);if(!c||!s||![6,7].includes(version)||!['dsp','usp'].includes(role)||!Number.isInteger(retimers)||retimers<0||retimers>4||!['legacy','first','last'].includes(windowMode)||typeof indTiming!=='boolean'||typeof indVoltage!=='boolean')return null;
 const notes=[],rows=[],target=marginReceiverTarget(c.receiver,role,retimers,windowMode);let valid=true,command='',offset=null,direction=null,pipeDirection=null;
 if((version===6&&(retimers>2||windowMode!=='legacy'))||(retimers>2&&windowMode==='legacy')||(windowMode==='last'&&retimers<3)){valid=false;notes.push('规范/Retimer数量/窗口组合不适用：后两颗窗口需7.0 FRA且存在第三/第四颗。FRA能力仍须实际确认。');}
 rows.push('Control：Receiver='+c.receiver+'，Type='+c.type.toString(2).padStart(3,'0')+'，Usage='+c.usage+'，Payload=0x'+c.payload.toString(16).padStart(2,'0').toUpperCase()+'。');
 if(c.reserved||s.reserved)notes.push('Control/Status含RsvdP bit7=1；不赋予命令语义，不生成回写。');
 if(c.usage){command=version===7?'Usage=1：光Retimer侧带，非LMR':'Usage=1：本版保留，非LMR';valid=false;}
 else if(c.type===7&&c.receiver===0&&c.payload===0x9c)command='No Command';
 else if(c.type===3&&c.receiver===0){if(version===7&&windowMode!=='legacy'&&[0,2].includes(c.payload)){command='Assign Receiver Number：'+(c.payload===2?'选择后两颗':'恢复默认窗口');if(c.payload===2&&retimers<3){valid=false;notes.push('没有第三颗Retimer可供选择。');}}else{command='保留或不适用的Broadcast Type011';valid=false;}}
 else if(c.type===1&&c.receiver>0){
  const reports={136:'Report Margin Control Capabilities',137:'Report MNumVoltageSteps',138:'Report MNumTimingSteps',139:'Report MMaxTimingOffset',140:'Report MMaxVoltageOffset',141:'Report MSamplingRateVoltage',142:'Report MSamplingRateTiming',143:'Report MSampleCount',144:'Report MMaxLanes'};
  if(reports[c.payload])command=reports[c.payload];else if((c.payload<=0x87||c.payload>=0xa0)&&[2,4].includes(c.receiver)&&role==='dsp')command='Access Retimer Register @0x'+c.payload.toString(16);else{command='Reserved报告/接收器组合';valid=false;}
 }else if(c.type===2&&[0x0f,0x55].includes(c.payload))command=c.payload===0x0f?'Go to Normal Settings':'Clear Error Log';
 else if(c.type===2&&c.receiver>0&&(c.payload&0xc0)===0xc0)command='Set Error Count Limit='+ (c.payload&63);
 else if(c.type===3&&c.receiver>0){command='Timing Step';offset=c.payload&63;if(c.payload&128){valid=false;notes.push('Timing Payload[7]保留；端口命令应发0，不把它当第7位步数。');}if(indTiming){direction=c.payload&64?'左':'右';pipeDirection=c.payload&64?0:1;}else{direction='无独立左右选择';if(c.payload&64)notes.push('不支持独立左右，Payload[6]保留，应发0并由接收器忽略；不能解释成左。');}}
 else if(c.type===4&&c.receiver>0){command='Voltage Step';offset=c.payload&127;if(indVoltage){direction=c.payload&128?'下':'上';pipeDirection=c.payload&128?1:0;}else{direction='无独立上下选择';if(c.payload&128)notes.push('不支持独立上下，Payload[7]保留，应发0并由接收器忽略；不能解释成下。');}notes.push('还须确认MVoltageSupported和该速率实际偏移范围。');}
 else if(c.type===5&&c.receiver>0)command='Vendor Defined：需产品定义';else{command='Reserved或无效字段组合';valid=false;}
 if(!target){valid=false;notes.push('该Receiver Number在所选Port/Retimer窗口不存在或保留。');}
 rows.push('命令：'+command+'；目标：'+(target||'不适用')+'。');if(offset!==null)rows.push('Step数='+offset+'；方向='+direction+'；PIPE Control1[7]='+ (pipeDirection===null?'不作为有效方向':pipeDirection)+'。');
 if(command==='Timing Step'&&pipeDirection!==null)notes.push('Base Timing方向0右/1左；PIPE方向0左/1右，已按语义反转。');
 rows.push('Status：Receiver='+s.receiver+'，Type='+s.type.toString(2).padStart(3,'0')+'，Usage='+s.usage+'，Payload=0x'+s.payload.toString(16).padStart(2,'0').toUpperCase()+'。');
 if(s.usage)notes.push('Status Usage非0，不作为LMR完成回应。');
 else if([3,4].includes(s.type)){const st=s.payload>>>6,errorCount=s.payload&63,labels=['Too many errors：自动回默认','Setup：尚未开始','Margining in progress','NAK'];rows.push('Step回应：'+labels[st]+'；MErrorCount='+errorCount+(errorCount===63?'（饱和，不能当精确63次）':'')+'。');if([1,3].includes(st)&&errorCount)notes.push('Setup/NAK按定义MErrorCount应为0，输入回应不一致。');}
 else if(s.type===1)rows.push('Report/Access回应Payload=0x'+s.payload.toString(16)+'，必须结合所发查询解码，不按Step错误数解释。');
 else if(s.type===7)rows.push('No Command回应需Type=111、Receiver=0；Status Payload在No Command下不作有效结果，不能把其他Type默认值当已完成。');
 const expectedType=command.startsWith('Assign Receiver Number')?0:c.type;
 if(!c.usage&&!s.usage&&(s.type!==expectedType||(c.receiver!==0&&s.receiver!==c.receiver)))notes.push('Type/Receiver尚未匹配当前命令；可能旧回应或不响应，需按轮询规则确认。');
 if(c.receiver===0&&command!=='No Command')notes.push('Broadcast回应Receiver通常是实际响应接收器号，不要求回显000；最后响应者与拓扑有关，工具不假定所有窗口的汇聚顺序。');
 notes.push('只解码快照；Ready、速率≥16GT/s、当前Lane、ASPM/自动切速限制、能力范围及CRC另查。');
 return {valid,command,target,offset,direction,pipeDirection,control:c,status:s,rows,notes};
}
function marginCommandText(...args){const r=decodeMarginCommand(...args);return r?r.rows.concat(r.notes).join('\n'):'请输入有效16bit Control/Status，并选择有效规范、角色、Retimer数量/窗口和方向能力。';}
function marginRegisterExplorer(){return `<div class="flit-explorer" role="group" aria-label="Lane Margining命令查询"><div class="flit-controls"><label>Lane Control hex<input id="lmcmd-control" value="0819" spellcheck="false"></label><label>Lane Status hex<input id="lmcmd-status" value="8019" spellcheck="false"></label><label>Base修订<select id="lmcmd-version"><option value="7">7.0</option><option value="6">6.0</option></select></label><label>Port<select id="lmcmd-role"><option value="dsp">DSP</option><option value="usp">USP</option></select></label><label>Retimer数量<select id="lmcmd-retimers">${[0,1,2,3,4].map(x=>`<option value="${x}">${x}</option>`).join('')}</select></label><label>已确认的窗口<select id="lmcmd-window"><option value="legacy">传统（最多2颗）</option><option value="first">FRA Mode1 前两颗</option><option value="last">FRA Mode2 后两颗</option></select></label><label>独立左右<select id="lmcmd-it"><option value="1">支持</option><option value="0">不支持</option></select></label><label>独立上下<select id="lmcmd-iv"><option value="1">支持</option><option value="0">不支持</option></select></label></div><p id="lmcmd-result" class="note address-query-output" aria-live="polite">${esc(marginCommandText('0819','8019',7,'dsp',0,'legacy',true,true))}</p></div>`;}
function signalingUnits(rate,lanes,fraction){if(![2.5,5,8,16,32,64,128].includes(rate)||![1,2,4,8,16,32].includes(lanes)||!Number.isFinite(fraction)||fraction<0||fraction>1)return null;const bitsPerSymbol=rate>=64?2:1,baud=rate/bitsPerSymbol,uiPs=1000/baud;return {rate,lanes,fraction,bitsPerSymbol,baud,uiPs,nyquistGHz:baud/2,rawGBps:rate*lanes/8,bidirectionalRawGBps:rate*lanes/4,offsetPs:uiPs*fraction};}
function signalingUnitText(rate,lanes,fraction){const r=signalingUnits(rate,lanes,fraction);return r?`${r.rate} GT/s × x${r.lanes}，${r.bitsPerSymbol===2?'PAM4':'NRZ'}；每符号${r.bitsPerSymbol}bit。
符号率=${r.baud} GBd；符号UI=${r.uiPs} ps；Nyquist=${r.nyquistGHz} GHz。
${r.fraction} UI = ${r.offsetPs} ps（纯单位换算，非Step校准）。
单向原始=${r.rawGBps} GB/s；双向合计原始=${r.bidirectionalRawGBps} GB/s（十进制）。
未扣编码/FLIT/TLP开销，非应用吞吐；Nyquist不是所有产品PLL输出频率。`:'请选择标准速率/Lane数，UI比例为0～1的有限数值。';}
function signalingUnitExplorer(){return `<div class="flit-explorer" role="group" aria-label="符号UI与原始带宽查询"><div class="flit-controls"><label>速率GT/s<select id="sigunit-rate">${[2.5,5,8,16,32,64,128].map(x=>`<option value="${x}" ${x===64?'selected':''}>${x}</option>`).join('')}</select></label><label>Lane数<select id="sigunit-lanes">${[1,2,4,8,16,32].map(x=>`<option value="${x}" ${x===16?'selected':''}>x${x}</option>`).join('')}</select></label><label>UI比例<input id="sigunit-fraction" type="number" min="0" max="1" step="0.01" value="0.1"></label></div><p id="sigunit-result" class="note address-query-output" aria-live="polite">${esc(signalingUnitText(64,16,0.1))}</p></div>`;}
function decodeMarginParameters(p){
 if(!p||![16,32,64,128].includes(p.rate))return null;const names=['cap','nv','nt','mt','mv','sampling','sample','lanes'],vals=names.map(n=>parseMarginByte(p[n]));if(vals.some(x=>x===null))return null;
 const [cap,nvR,ntR,mtR,mvR,rateR,sampleR,lanesR]=vals,voltage=!!(cap&1),indVoltage=!!(cap&2),indTiming=!!(cap&4),method=(cap>>>3)&1,indSampler=!!(cap&16),nv=nvR&127,nt=ntR&63,mt=mtR&127,mv=mvR&127,sampling=rateR&63,sample=sampleR&127,lanes=(lanesR&31)+1,pam4=p.rate>=64,uiPs=1000/(p.rate/(pam4?2:1)),notes=[],rows=[];let valid=true;
 const bad=t=>{notes.push(t);valid=false;};if((cap&224)||(ntR&192)||(mtR&128)||(lanesR&224)||(voltage&&((nvR&128)||(mvR&128)))||(method===1&&(rateR&192))||(method===0&&(sampleR&128)))bad('回应Payload含保留位非0；先核对查询类型和原始读取。');
 if(nt<(pam4?10:6))bad('MNumTimingSteps低于该调制规定下限。');if(mt!==0&&(mt<(pam4?10:20)||mt>(pam4?35:50)))bad('MMaxTimingOffset超出该调制范围（0仅表示未披露）。');
 if(voltage){if(nv<(pam4?64:32))bad('MNumVoltageSteps低于该调制规定下限。');if(mv!==0&&(mv<5||mv>50))bad('MMaxVoltageOffset超出5%～50%（0仅表示未披露）。');}else if(p.rate>=32)bad('≥32GT/s应支持电压margining，回应却未宣告。');
 const maxTimePs=mt===0?null:mt/100*uiPs,maxVoltageMv=!voltage||mv===0?null:mv*10/(pam4?3:1),sampleBits=method===0?2**(sample/3):null,sampleFraction=method===1?(sampling+1)/64:null,minTimeMs=sampleFraction===null?null:1e8/(p.rate*1e9*sampleFraction)*1000;
 rows.push('当前'+p.rate+'GT/s '+(pam4?'PAM4':'NRZ')+'，符号UI='+uiPs+'ps。');rows.push('电压支持='+Number(voltage)+'；独立上下='+Number(indVoltage)+'；独立左右='+Number(indTiming)+'；独立采样器='+Number(indSampler)+'。');
 rows.push('时间：最大步数='+nt+'；最大偏移='+ (maxTimePs===null?'未披露（0）':mt+'% UI = '+maxTimePs+' ps')+'。');rows.push(voltage?'电压：最大步数='+nv+'；最大偏移='+(maxVoltageMv===null?'未披露（0）':mv+'% × '+(pam4?'1/3 V':'1 V')+' = '+maxVoltageMv.toFixed(4)+' mV')+'。':'未支持电压：忽略电压能力值，不生成电压偏移结论。');rows.push('并行Lane上限='+lanes+'（MMaxLanes编码+1）；当前协商宽度仍是约束。');
 if(method===0){rows.push('报告法0：MSampleCount='+sample+'，公式反解约'+sampleBits.toPrecision(6)+'个被测bit'+(sample===127?'（编码已饱和，可能更多）':'（量化值）')+'；SamplingRate字段不作有效比例。');if(sample===0)notes.push('SampleCount=0需结合是否已开始采样，不能只凭公式断言已测1bit。');}
 else rows.push('报告法1：SamplingRate='+sampling+' → '+(sampling+1)+'/64；理想有效采样至少1e8bit约需'+minTimeMs.toFixed(6)+' ms（排除Setup/暂停；不是整次扫描固定等待）。MSampleCount输入不作为有效分母。');
 if(!indSampler)notes.push('依赖采样器MErrorCount为逻辑事件数，不能除以bit样本叫BER。');notes.push('偏移只要求单调，不据最大偏移/步数推定每Step等长；0未披露也不等于0裕量。工具不判断硬件合规。');
 return {valid,voltage,indVoltage,indTiming,method,indSampler,nv,nt,mt,mv,lanes,pam4,uiPs,maxTimePs,maxVoltageMv,sampleBits,sampleFraction,minTimeMs,rows,notes};
}
function marginParameterText(p){const r=decodeMarginParameters(p);return r?r.rows.concat(r.notes).join('\n'):'请为所有回应Payload输入有效hex BYTE，并选择16/32/64/128GT/s。';}
function marginParameterExplorer(){const inputs=[['cap','88h 能力','17'],['nv','89h 电压步数','7f'],['nt','8Ah 时间步数','3f'],['mt','8Bh 时间最大%','19'],['mv','8Ch 电压最大%','0f'],['sampling','8Dh或8Eh 采样率','3f'],['sample','8Fh SampleCount','3c'],['lanes','90h MMaxLanes','0f']];const p=Object.fromEntries(inputs.map(x=>[x[0],x[2]]));p.rate=64;return `<div class="flit-explorer" role="group" aria-label="LMR能力与采样参数查询"><div class="flit-controls"><label>当前速率GT/s<select id="lmparam-rate">${[16,32,64,128].map(x=>`<option value="${x}" ${x===64?'selected':''}>${x}</option>`).join('')}</select></label>${inputs.map(([id,label,value])=>`<label>${label} 回应Payload hex<input id="lmparam-${id}" value="${value}" spellcheck="false"></label>`).join('')}</div><p id="lmparam-result" class="note address-query-output" aria-live="polite">${esc(marginParameterText(p))}</p></div>`;}

const RP_PIO_BITS=[[0,'Cfg UR Cpl'],[1,'Cfg CA Cpl'],[2,'Cfg CTO'],[8,'I/O UR Cpl'],[9,'I/O CA Cpl'],[10,'I/O CTO'],[16,'Mem UR Cpl'],[17,'Mem CA Cpl'],[18,'Mem CTO']];
function dpcTriggerPolicy(mode,event,masked,already,softwareSupported){
 if(![0,1,2,3].includes(mode)||!['local-ue','err-fatal','err-nonfatal','pio-ue','pio-advisory','software','dl-active'].includes(event)||[masked,already,softwareSupported].some(v=>typeof v!=='boolean'))return null;
 if(mode===3)return {valid:false,triggers:null,contained:already,reason:'Trigger Enable=11保留，不推断触发结果。'};
 if(already)return {valid:true,triggers:false,contained:true,reason:'当前已在DPC，保持隔离；本次动作不建立新触发原因。'};
 if(mode===0)return {valid:true,triggers:false,contained:false,reason:'DPC禁用；其他AER/PIO报告或Exception仍按自己的规则。'};
 let triggers=false,reason='';
 if(event==='local-ue'){triggers=!masked;reason=masked?'本端错误已屏蔽，不走此DPC触发入口。':'本端最终分类为未屏蔽不可纠正，01和10都触发。';}
 if(event==='err-fatal'){triggers=true;reason='收到ERR_FATAL，01和10都触发；Mask输入不作用于已收到消息。';}
 if(event==='err-nonfatal'){triggers=mode===2;reason=triggers?'收到ERR_NONFATAL，10触发。':'01不因收到ERR_NONFATAL触发；本端检测入口仍可触发。';}
 if(event==='pio-ue'){triggers=!masked;reason=masked?'RP PIO已屏蔽：不因此隔离，仍可能有适用同步Exception。':'PIO未屏蔽且Severity=1，启用的DPC触发；仅RP Extensions路径。';}
 if(event==='pio-advisory')reason='PIO Advisory不因此触发DPC；日志、ERR_COR/SysError/Exception另查。';
 if(event==='software'){triggers=softwareSupported;reason=triggers?'软件触发能力支持且已启用，写动作可触发。':'未宣告Software Triggering支持，不推定软件动作可用。';}
 if(event==='dl-active')reason='进入DL_Active是可选上线通知事件，不是DPC错误触发来源。';
 return {valid:true,triggers,contained:triggers,reason};
}
function dpcTriggerText(...args){const r=dpcTriggerPolicy(...args);return r?`${r.reason}\n本次新增DPC触发=${r.triggers===null?'未定义':Number(r.triggers)}；隔离状态=${Number(r.contained)}。\n输入为已完成角色/ANFE/Mask分类的事件，非从原始Status推断；未模拟实际硬件操作或IRQ。`:'请选择有效事件、Enable与能力条件。';}
function dpcTriggerExplorer(){return `<div class="flit-explorer" role="group" aria-label="DPC触发条件查询"><div class="flit-controls"><label>Trigger Enable<select id="dpct-mode"><option value="1">01</option><option value="2">10</option><option value="0">00 禁用</option><option value="3">11 保留</option></select></label><label>最终分类后的事件<select id="dpct-event"><option value="local-ue">本端不可纠正错误</option><option value="err-fatal">收到ERR_FATAL</option><option value="err-nonfatal">收到ERR_NONFATAL</option><option value="pio-ue">原生RP PIO Severity=1</option><option value="pio-advisory">RP PIO Advisory</option><option value="software">软件触发动作</option><option value="dl-active">Link进入DL_Active</option></select></label><label>本端/PIO错误Mask<select id="dpct-masked"><option value="0">未屏蔽</option><option value="1">已屏蔽</option></select></label><label>当前已在DPC<select id="dpct-already"><option value="0">否</option><option value="1">是</option></select></label><label>软件触发能力<select id="dpct-software"><option value="1">支持</option><option value="0">不支持</option></select></label></div><p id="dpct-result" class="note address-query-output" aria-live="polite">${esc(dpcTriggerText(1,'local-ue',false,false,true))}</p></div>`;}
function decodeDpcSnapshot(capRaw,controlRaw,statusRaw,sourceRaw,pioRaw,role,fmSupported,ecsSupported,dllActive){
 const values=[capRaw,controlRaw,statusRaw,sourceRaw].map(parseHex16),pio=parseHex32(pioRaw);if(values.some(v=>v===null)||pio===null||!['rp','dsp'].includes(role)||[fmSupported,ecsSupported,dllActive].some(v=>typeof v!=='boolean'))return null;
 const [cap,control,status,source]=values,extensions=!!(cap&32),effectiveExtensions=extensions&&role==='rp',triggered=!!(status&1),reasonCode=(status>>>1)&3,extensionCode=(status>>>5)&3,mode=control&3,fep=(status>>>8)&31,logSize=((cap>>>8)&15)+(fmSupported&&cap&8192?16:0),notes=[],rows=[];let valid=true;
 const bad=s=>{valid=false;notes.push(s);};if(mode===3)bad('Trigger Enable=11保留，不推断触发策略。');if(role==='dsp'&&extensions)bad('Switch DSP不能宣告RP Extensions；PIO/Busy不按有效RP语义解释。');
 if(effectiveExtensions&&((cap&0x10c0)!==0x10c0))bad('RP Extensions=1要求Poison Blocking、Software Triggering和DL_Active ERR_COR支持位均为1。');
 if(!extensions&&logSize!==0)bad('无RP Extensions时RP PIO Log Size应为0。');if(effectiveExtensions&&!fmSupported&&logSize<4)bad('不支持FM的RP扩展至少分配4DW日志。');
 if((cap&0xc000)||(control&0xfe00))notes.push('Capability/Control含RsvdP非0，按保留字段核对原始读取。');if(!fmSupported&&(cap&0x2000))notes.push('FM不支持，Capability[13]为RsvdP，不拼进Log Size。');if(status&0xc080)bad('Status RsvdZ位非0，核对原始输入。');
 if((control&32)&&!(cap&64))bad('Poison Egress Blocking Enable=1但无对应支持。');if((control&128)&&!(cap&4096))bad('DL_Active ERR_COR Enable=1但无对应支持。');if((control&256)&&!ecsSupported)bad('SIG_SFW Enable=1但ECS能力不支持，规范为未定义行为。');if((status&8192)&&!ecsSupported)bad('SIG_SFW Status在无ECS能力时应为0。');
 if(control&64)notes.push('Software Trigger读回应为0；输入可能是写入值/混合快照，不能当已触发状态。');
 const reason=triggered?(['本端未屏蔽不可纠正','收到ERR_NONFATAL','收到ERR_FATAL', ['RP PIO错误','软件触发','Reserved Extension','Reserved Extension'][extensionCode]][reasonCode]):null;
 if(triggered&&reasonCode===3&&extensionCode>1)bad('有效Trigger Reason使用了Reserved Extension。');
 const sourceValid=triggered&&[1,2].includes(reasonCode),busyValid=triggered&&effectiveExtensions,busy=busyValid?!!(status&16):null,fepValid=effectiveExtensions&&RP_PIO_BITS.some(([i])=>i===fep)&&!!((pio>>>fep)&1),releasePrerequisites=valid&&triggered&&!dllActive&&busy!==true;
 rows.push('Port='+ (role==='rp'?'Root Port':'Switch DSP')+'；RP Extensions='+Number(extensions)+'；IRQ Message Number='+(cap&31)+'。');rows.push('Trigger Enable='+mode.toString(2).padStart(2,'0')+'；DPC Completion Control='+((control&4)?'UR':'CA')+'；Trigger Status='+Number(triggered)+'。');rows.push(triggered?'原因='+reason+'。':'Trigger=0：Reason/Extension、RP Busy不作有效历史结论。');
 rows.push('DPC Interrupt Enable='+Number(!!(control&8))+'，Interrupt Status='+Number(!!(status&8))+'；清IRQ不清隔离。');rows.push('DPC ERR_COR Enable='+Number(!!(control&16))+'；DL_Active Enable='+Number(!!(control&128))+'；SIG_SFW Enable/Status='+Number(!!(control&256))+'/'+Number(!!(status&8192))+'。');
 rows.push(sourceValid?'Source ID有效：RID=0x'+source.toString(16).padStart(4,'0')+'（报告消息发起代理）。':'Source ID在当前原因/Trigger下未定义，忽略数值。');
 if(effectiveExtensions){rows.push('RP Busy='+ (busyValid?Number(busy):'当前无效')+'；PIO FEP='+fep+'，'+(fepValid?'对应Status置位，日志有效判据成立':'无有效PIO日志指针（默认31永久保留）')+'；Log Size='+logSize+' DW。');}else rows.push('没有适用RP Extensions：忽略PIO FEP/PIO输入，Busy为保留或不适用。');
 if(!triggered)rows.push('当前不在DPC；不提出清Trigger的动作。');else if(!valid)rows.push('配置/快照含不一致或保留编码，不提出解除隔离结论；先核对下列提示。');else rows.push(releasePrerequisites?'DLL Active=0且适用Busy不为1：仅必要硬件前提成立，仍需平台恢复/复位时序和其他禁链条件检查。':'必须继续保持DPC：'+(dllActive?'DLL Active仍为1。':'')+(busy===true?'RP Busy仍为1。':''));
 if(effectiveExtensions&&fmSupported)notes.push('FM日志还需最大已实现Type/OHC约束；不由Log Size单独判定当前记录长度。');if(pio&0xfff8f8f8)notes.push('PIO Status有保留位非0，包括永久保留bit31；不能当有效FEP。');
 return {valid,extensions,effectiveExtensions,triggered,mode,reasonCode,extensionCode,reason,sourceValid,source:sourceValid?source:null,busy,fep,fepValid,logSize,releasePrerequisites,rows,notes};
}
function dpcSnapshotText(...args){const r=decodeDpcSnapshot(...args);return r?r.rows.concat(r.notes).join('\n'):'请输入4个有效16bit hex WORD、1个32bit PIO Status，并选择角色/能力/Link状态。';}
function dpcRegisterExplorer(){const inputs=[['cap','DPC Capability +04h WORD','14e0'],['control','DPC Control +06h WORD','0019'],['status','DPC Status +08h WORD','1f09'],['source','DPC Source +0Ah WORD','0000'],['pio','RP PIO Status +0Ch DWORD','00000000']];return `<div class="flit-explorer" role="group" aria-label="DPC寄存器与释放前提"><div class="flit-controls">${inputs.map(([id,label,value])=>`<label>${label} hex<input id="dpcs-${id}" value="${value}" spellcheck="false"></label>`).join('')}<label>Port角色<select id="dpcs-role"><option value="rp">Root Port</option><option value="dsp">Switch DSP</option></select></label><label>FM支持<select id="dpcs-fm"><option value="0">否</option><option value="1">是</option></select></label><label>ECS支持<select id="dpcs-ecs"><option value="1">是</option><option value="0">否</option></select></label><label>DLL Link Active<select id="dpcs-active"><option value="0">0，已下线</option><option value="1">1，仍在线</option></select></label></div><p id="dpcs-result" class="note address-query-output" aria-live="polite">${esc(dpcSnapshotText('14e0','0019','1f09','0','0','rp',false,true,false))}</p></div>`;}
function rpPioPolicy(masked,severity,sysEnabled,exceptionEnabled,mode,cpuGenerated,exceptionSupported){
 if([masked,severity,sysEnabled,exceptionEnabled,cpuGenerated,exceptionSupported].some(v=>typeof v!=='boolean')||![0,1,2,3].includes(mode))return null;
 return {statusSet:true,logEligible:!masked,advisory:!masked&&!severity,dpc:mode===3?null:!masked&&severity&&mode!==0,sysError:!masked&&sysEnabled,exception:exceptionEnabled&&cpuGenerated&&exceptionSupported};
}
function decodeRpPioSnapshot(statusRaw,maskRaw,severityRaw,sysRaw,exceptionRaw,mode,cpuGenerated,exceptionSupported){
 const vals=[statusRaw,maskRaw,severityRaw,sysRaw,exceptionRaw].map(parseHex32);if(vals.some(v=>v===null)||![0,1,2,3].includes(mode)||[cpuGenerated,exceptionSupported].some(v=>typeof v!=='boolean'))return null;
 const [status,mask,severity,sys,exception]=vals,rows=[],notes=[],events=[];for(const [i,name]of RP_PIO_BITS){if(!((status>>>i)&1))continue;const m=!!((mask>>>i)&1),s=!!((severity>>>i)&1),p=rpPioPolicy(m,s,!!((sys>>>i)&1),!!((exception>>>i)&1),mode,cpuGenerated,exceptionSupported);events.push({bit:i,name,masked:m,severity:s,...p});rows.push('['+i+'] '+name+'：'+(m?'Masked':s?'Uncorrectable':'Advisory')+'；日志资格='+Number(p.logEligible)+'（仍需资源）；DPC='+ (p.dpc===null?'保留配置不推断':Number(p.dpc))+'；SysError='+Number(p.sysError)+'；同步Exception='+Number(p.exception)+'。');}
 if(!events.length)rows.push('当前无已定义PIO Status置位；不证明历史无错误，也不证明其他AER入口没有触发DPC。');
 const defined=0x70707;if((status&~defined)>>>0)notes.push('Status有RsvdZ非0；bit31永久保留，不是有效错误。');if(((mask|severity|sys|exception)&~defined)>>>0)notes.push('策略DWORD有保留位非0，不赋予错误策略意义。');if(mode===3)notes.push('DPC Enable=11保留，不推断触发结果；其他字段只按各自语义解码。');
 notes.push('PIO Severity=1是Uncorrectable、0是Advisory，不是AER Fatal/Non-Fatal。');notes.push('Mask不屏蔽适用同步Exception；CPU来源/跟踪/异常类型支持是前提。');notes.push('只分析原生UR Cpl/CA Cpl/CTO，未模拟AER主导的坏Completion分支；当前配置不证明与Status产生时相同，ERR_COR/IRQ另需使能及历史。');
 return {events,rows,notes};
}
function rpPioSnapshotText(...args){const r=decodeRpPioSnapshot(...args);return r?r.rows.concat(r.notes).join('\n'):'请输入5个有效32bit十六进制DWORD，并选择DPC/CPU异常条件。';}
function rpPioPolicyExplorer(){const inputs=[['status','RP PIO Status +0Ch','00010000'],['mask','RP PIO Mask +10h','00070707'],['severity','RP PIO Severity +14h','00000000'],['sys','RP PIO SysError +18h','00010000'],['exception','RP PIO Exception +1Ch','00010000']];return `<div class="flit-explorer" role="group" aria-label="RP PIO错误门控查询"><div class="flit-controls">${inputs.map(([id,label,value])=>`<label>${label} hex<input id="rppio-${id}" value="${value}" spellcheck="false"></label>`).join('')}<label>DPC Trigger Enable<select id="rppio-mode"><option value="1">01</option><option value="2">10</option><option value="0">00 禁用</option><option value="3">11 保留</option></select></label><label>已跟踪CPU指令请求<select id="rppio-cpu"><option value="1">是</option><option value="0">否/未确认</option></select></label><label>该类请求支持同步异常<select id="rppio-supported"><option value="1">支持</option><option value="0">不支持/未确认</option></select></label></div><p id="rppio-result" class="note address-query-output" aria-live="polite">${esc(rpPioSnapshotText('10000','70707','0','10000','10000',1,true,true))}</p></div>`;}

// Read-only protocol learning decoders; do not access hardware.
function decodeObff(capRaw,ctrlRaw,codeRaw,link='l0',d0=true,received=true){
 const cap=parseHex32(capRaw),ctrl=parseHex16(ctrlRaw),code=parseHex16(codeRaw);if(cap===null||ctrl===null||code===null||code>15||!['l0','l0s','l1'].includes(link))return null;
 const support=(cap>>>18)&3,enable=(ctrl>>>13)&3;const compatible=enable===0||(enable===3?!!(support&2):!!(support&1));
 const indication=code===0?'Idle':code===1?'OBFF':'CPU Active';const rows=[`Supported=${support.toString(2).padStart(2,'0')}；Enable=${enable.toString(2).padStart(2,'0')}；${compatible?'支持方式匹配':'能力与使能方式不匹配，不能视作合法配置'}。`,d0?'Function处于D0，可按适用OBFF规则响应。':'非D0：Function不得响应OBFF。'];
 let receive=received?(enable===0||support===0?'UR':enable===3?'undefined':'indication'):'not-received';
 if(received)rows.push(receive==='UR'?'Unsupported/Disabled接收OBFF Message：按UR处理。':receive==='undefined'?'WAKE#方式却收到OBFF Message：行为未定义，不能套用Message解码。':`Message Code=${code.toString(16)} → ${indication}${![0,1,15].includes(code)?'（保留Code按CPU Active处理）':''}。`);
 const transport=enable===0?'disabled':enable===3?'wake':link==='l0'?'send':enable===1?'discard':'wake-then-send';rows.push('传递方式：'+({disabled:'关闭',wake:'WAKE#信令',send:'L0发送Message',discard:'Message A在Tx L0s/L1丢弃', 'wake-then-send':'Message B先回L0再发送'})[transport]+'。');rows.push('窗口只是活动提示；不授予DMA、内存或供电权限。USP多Function控制须由Function0配置。');
 return {support,enable,compatible,indication,receive,transport,rows};
}
function obffText(...args){const r=decodeObff(...args);return r?r.rows.join('\n'):'请输入DevCap2 DWORD、DevCtrl2 WORD和0～F的Message Code。';}
function decodeDpa(capRaw,indRaw,statusRaw,ctrlRaw,arrayRaw){
 const cap=parseHex32(capRaw),ind=parseHex32(indRaw),status=parseHex16(statusRaw),ctrl=parseHex16(ctrlRaw);if([cap,ind,status,ctrl].includes(null))return null;
 const max=cap&31,unit=(cap>>>8)&3,scale=(cap>>>12)&3,values=[(cap>>>16)&255,cap>>>24],enabled=!!(status&256),target=ctrl&31,current=status&31;
 const tokens=String(arrayRaw).trim().split(/[\s,]+/);if(tokens.length!==max+1||tokens.some(t=>! /^(?:0x)?[0-9a-f]{1,2}$/i.test(t)))return null;
 const power=tokens.map(t=>parseInt(t.replace(/^0x/i,''),16)*[10,1,.1,.01][scale]);const monotonic=power.every((v,i)=>!i||v<=power[i-1]);
 const latencies=power.map((_,i)=>unit===3?null:values[(ind>>>i)&1]*[1,10,100][unit]);
 const rows=[`Substate_Max=${max}，要求${max+1}个BYTE；Status=${current}，Control=${target}。`, `Control Enabled=${Number(enabled)}：该位是RW1C，写1只会清0；软件不能直接写1重新使能。`,enabled?'控制生效仍受合法档号和转换规则约束。':'Control写入不影响当前档位；重新使能取决于规定复位。',`功率档顺序：${monotonic?'非递增（允许相同功率）':'存在递增，违反DPA档序规则'}。`];
 if(target>max||current>max)rows.push('警告：Status或Control超过Max，不能视作有效档位。');
 if(unit===3)rows.push('Latency Unit=11b保留，不能换算延迟。');
 power.forEach((v,i)=>rows.push(`档${i}：${Number(v.toFixed(8))} W；最大转换延迟=${latencies[i]===null?'保留编码':latencies[i]+' ms'}（Indicator选择Value${(ind>>>i)&1}）。`));rows.push('Status在转换中保守表示功率上界；Control等于Status不单独证明转换完成。DPA仅在D0内，VF不得实现。');
 return {max,unit,scale,enabled,target,current,power,latencies,monotonic,rows};
}
function dpaText(...args){const r=decodeDpa(...args);return r?r.rows.join('\n'):'输入4个合法寄存器hex值及Max+1个功率BYTE（空格或逗号分隔，每个00～FF）。';}
function decodeBudgetData(raw,extended=false,version='7.0'){
 const data=parseHex32(raw);if(data===null||!['6.0','7.0'].includes(version))return null;
 const base=data&255,scale=((data>>>8)&3)|(extended?((data>>>19)&4):0),sub=(data>>>10)&7,state=(data>>>13)&3,type=(data>>>15)&7,rail=(data>>>18)&7,present=extended&&!!(data>>>31),connector=(data>>>25)&63,number=(data>>>22)&7;
 let watts=null,interval=null,powerText='';const multiplier=[1,.1,.01,.001,10,100,null,null][scale];
 if(!extended&&scale===0&&base>=240){if(base===255)powerText='FFh为保留范围编码（>600W），不能当作255W或精确瓦数';else{const lo=base===240?239:250+(base-241)*25,hi=base===240?250:275+(base-241)*25;interval={minExclusive:lo,maxInclusive:hi};powerText=`(${lo}, ${hi}] W区间，非精确功率`;}}else if(multiplier===null)powerText='保留Data Scale，不能换算瓦数';else{watts=Number((base*multiplier).toFixed(8));powerText=watts+' W';}
 const names=['PME Aux','Aux','Idle','Sustained','EPR Sustained','EPR Maximum','Reserved','Maximum'];const rails=['12V','3.3V','1.5/1.8V','Reserved','48V','5V','Reserved','Thermal'];const pm=state===3?(type<=1?'D3Cold':'D3Hot'):['D0','D1','D2'][state];
 const connectorValid=present&&!(connector>=0x14&&connector<0x30)&&!(version==='6.0'&&((connector>=0x10&&connector<0x14)||connector===10||connector===11));
 const rows=[`Base=${base}；Data Scale=${scale}；${powerText}。`,`条件：${pm} / PM Sub State ${sub} / ${names[type]} / ${rails[rail]}。`];
 if(!extended&&(data>>>21))rows.push('Extended Enable=0但高位非零：快照不符合高位应为0的规则；高Scale和连接器字段均忽略。');
 rows.push(present?`Connector Number=${number}，Type=0x${connector.toString(16)}：${connectorValid?(connector>=16&&connector<=19?'7.0定义的12V-2x6；6.0该编码保留':'按本版Connector表查询'):'本版保留编码'}。`:'Extended Present无效或为0：不解读Connector Number/Type。');
 if(type===3||type===4||type===5||type===7)rows.push('本版默认测量窗口：'+(version==='6.0'?'Sustained为5s平均，Maximum为1ms移动窗口。':'Sustained为1s平均，Maximum为100μs移动窗口。')+'形态规范可明确另定。');
 rows.push('这是单条需求报告；不表示实际测量、已授予功率或限功率执行。不同PM Sub State不直接相加；Thermal不再与各Rail重复相加。');
 return {base,scale,sub,state,type,rail,pm,present,connector,number,connectorValid,watts,interval,rows};
}
function budgetText(...args){const r=decodeBudgetData(...args);return r?r.rows.join('\n'):'请输入32bit hex Data，选择规范版本和Extended Enable。';}
function powerInput(id,label,value){return `<label>${label}<input id="${id}" value="${value}" spellcheck="false"></label>`;}
function powerSelect(id,label,options){return `<label>${label}<select id="${id}">${options.map(([v,t])=>`<option value="${v}">${t}</option>`).join('')}</select></label>`;}
function obffRegisterExplorer(){return `<div class="flit-explorer" role="group" aria-label="OBFF字段查询"><div class="flit-controls">${powerInput('obff-cap','DevCap2 DWORD hex','000c0000')}${powerInput('obff-control','DevCtrl2 WORD hex','2000')}${powerInput('obff-code','Message Code hex','1')}${powerSelect('obff-link','发送端Link状态',[['l0','L0'],['l0s','Tx L0s'],['l1','L1']])}${powerSelect('obff-d0','Function处于D0',[['1','是'],['0','否']])}${powerSelect('obff-message','正在解读收到的Message',[['1','是'],['0','否，仅看使能/发送']])}</div><p id="obff-result" class="note address-query-output" aria-live="polite">${esc(obffText('c0000','2000','1'))}</p></div>`;}
function dpaRegisterExplorer(){return `<div class="flit-explorer" role="group" aria-label="DPA字段查询"><div class="flit-controls">${powerInput('dpa-cap','Capabilities DWORD hex','02011003')}${powerInput('dpa-indicator','Latency Indicator DWORD hex','0000000a')}${powerInput('dpa-status','Status WORD hex','0100')}${powerInput('dpa-control','Control WORD hex','0001')}${powerInput('dpa-array','Power Allocation BYTE数组 hex','64 50 50 20')}</div><p id="dpa-result" class="note address-query-output" aria-live="polite">${esc(dpaText('02011003','a','100','1','64 50 50 20'))}</p></div>`;}
function budgetRegisterExplorer(){return `<div class="flit-explorer" role="group" aria-label="Power Budgeting字段查询"><div class="flit-controls">${powerInput('budget-data','Data DWORD hex','000000f0')}${powerSelect('budget-ext','Extended Enable',[['0','0，传统格式'],['1','1，扩展格式']])}${powerSelect('budget-version','Base版本',[['7.0','7.0'],['6.0','6.0']])}</div><p id="budget-result" class="note address-query-output" aria-live="polite">${esc(budgetText('f0',false,'7.0'))}</p></div>`;}

function phyMemoryPlan(offsetRaw,lengthRaw,ecc=false){
 const offset=parseHex32(offsetRaw),t=String(lengthRaw).trim(),length=/^\d+$/.test(t)?Number(t):NaN;
 if(offset===null||!Number.isSafeInteger(length)||length<=0||length>65536||offset%4||length%4||offset+length>65536||typeof ecc!=='boolean')return null;
 const segments=[];let pos=offset,left=length;while(left){const count=Math.min(left,1024-pos%1024);segments.push({offset:pos,bytes:count,words:count/4});pos+=count;left-=count;}
 const physicalPerMemory=ecc?81920:65536,rows=[`所引3.02a：每组16384个word，有效数据65536 B；物理宽度${ecc?40:32}bit。`,`每组物理${physicalPerMemory} B，两组物理${physicalPerMemory*2} B；ECC额外位不扩展固件有效地址空间。`,`目标CCM内部偏移0x${offset.toString(16)}，长度${length} B，至少按1KiB边界拆为${segments.length}段。`];
 segments.forEach((s,i)=>rows.push(`${i+1}：偏移0x${s.offset.toString(16).padStart(4,'0')}，${s.bytes} B / ${s.words}个32bit有效word。`));rows.push('各段重新发起NONSEQ；仍须处理HREADY/仲裁，跨ICCM/DCCM前先排空数据阶段。这里只算数据字节分段，不生成ECC镜像、厂商地址或硬件写入。');
 return {offset,length,ecc,physicalPerMemory,effectivePerMemory:65536,segments,rows};
}
function phyMemoryText(...a){const r=phyMemoryPlan(...a);return r?r.rows.join('\n'):'请输入目标CCM内部hex字节偏移和十进制长度；起点/长度须4字节对齐，范围在64KiB有效数据内，长度大于0。';}
function phyClockBudget(cpuRaw,apbRaw,tckRaw=''){
 const number=x=>{const s=String(x).trim();return /^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)?Number(s):NaN;};const cpu=number(cpuRaw),apb=number(apbRaw),empty=String(tckRaw).trim()==='',tck=empty?null:number(tckRaw);
 if(!Number.isFinite(cpu)||!Number.isFinite(apb)||cpu<=0||apb<=0||cpu>1e6||apb>1e6||!empty&&(!Number.isFinite(tck)||tck<=0||tck>1e6))return null;
 const ns=22000/cpu+8000/apb,apbPeriods=22*apb/cpu+8,jtagValid=tck===null?null:tck*3<cpu,fmt=x=>Number(x.toFixed(6));
 const rows=[`3.02a产品公式：22×Tcpu + 8×Tapb = ${fmt(ns)} ns。`,`相当于${fmt(apbPeriods)}个APB周期的时长；这是时间比例，不承诺某次传输在固定整数拍完成。`,`CPU JTAG必须严格低于${fmt(cpu/3)} MHz（三分之一边界本身不满足）。`];
 if(tck!==null)rows.push(`输入TCK=${tck} MHz：${jtagValid?'满足该频率比例条件':'不满足严格小于条件'}。`);rows.push('不证明这些频率在交付支持范围内；不含软件全部调用、时钟停顿或异常恢复，不作为CDC/时序签核。');return {cpu,apb,tck,ns,apbPeriods,jtagValid,rows};
}
function phyClockText(...a){const r=phyClockBudget(...a);return r?r.rows.join('\n'):'请输入正数CPU/APB频率（MHz），TCK可留空；不接受指数、负数或非数字。';}
function phyBootSnapshot(o){
 const keys=['supplies','reset','reference','cpuClock','loaded','runAccepted','laneDone'];if(!o||keys.some(k=>typeof o[k]!=='boolean')||!['external','rom'].includes(o.method)||typeof o.bootDone!=='boolean'||typeof o.bootError!=='boolean')return null;
 const rows=['3.02a初始化观察表：只按你确认的阶段排查，单次电平不代替完整握手。'];const notes=[];
 if(o.runAccepted&&!o.loaded)notes.push('CPU运行应答已观察，但装载尚未确认：记录存在顺序/上下文不一致，先核镜像和握手历史。');
 if(o.laneDone&&(!o.runAccepted||o.reset))notes.push('lane完成观察与当前复位/CPU阶段不一致；可能混入旧状态，不能作为本次启动完成证据。');
 if(o.method==='rom'&&o.bootError)notes.push('ROM报告error：先排查装载，done本身不能消除此错误。');
 let stage;if(!o.supplies)stage='supplies';else if(o.reset)stage='reset';else if(!o.reference)stage='reference';else if(!o.cpuClock)stage='cpu-clock';else if(o.method==='rom'&&o.bootError)stage='boot-error';else if(o.method==='rom'&&!o.bootDone)stage='boot-wait';else if(!o.loaded)stage='load';else if(!o.runAccepted)stage='cpu-run';else if(!o.laneDone)stage='lane';else stage='initial-observed';
 const messages={supplies:'先确认电源稳定及产品POR时长。',reset:'当前仍在global reset：不要把复位期ack=1当lane ready；核对应接口复位与释放条件。',reference:'REFCLK/使能未确认：复位退出和lane完成不能只靠等待。','cpu-clock':'CPU管理时钟未确认：核CCM装载和MCU执行的时钟前提。','boot-error':'ROM装载报错，先核原因并重新确认内容。','boot-wait':'尚未确认bootloader完成，避免抢占它正在使用的CCM。',load:'尚未确认镜像完成装载；写ICCM前保持CPU暂停，并核所用接口的前提。','cpu-run':'装载已确认：核应用配置、CPU运行请求/应答及历史；不能只看当前req=0。',lane:'CPU运行应答已确认：继续核校准、lane reset/ack、目标P1与后续PCS切换。','initial-observed':'所选初始化里程碑已观察；仍须按PCS流程切换目标P-state/rate，再独立检查接收有效与协议训练。'};
 rows.push(messages[stage]);rows.push(...notes);rows.push('本工具不判断Link Up，也不执行复位、装载或寄存器操作；没有观察到某项不等于硬件一定故障。');return {stage,notes,rows};
}
function phyBootText(o){const r=phyBootSnapshot(o);return r?r.rows.join('\n'):'请选择有效的3.02a启动观察条件。';}
function phyMemoryExplorer(){return `<div class="flit-explorer" role="group" aria-label="PHY存储器容量与分段"><div class="flit-controls">${powerInput('phymem-offset','目标CCM内部偏移 hex（不含基址）','3f0')}${powerInput('phymem-length','有效数据长度 B（十进制）','64')}${powerSelect('phymem-ecc','物理SRAM模式',[['0','32bit，不带ECC'],['1','40bit，含ECC']])}</div><p id="phymem-result" class="note address-query-output" aria-live="polite">${esc(phyMemoryText('3f0','64',false))}</p></div>`;}
function phyClockExplorer(){return `<div class="flit-explorer" role="group" aria-label="PHY管理时钟预算"><div class="flit-controls">${powerInput('phyclk-cpu','CPU频率 MHz','500')}${powerInput('phyclk-apb','APB频率 MHz','100')}${powerInput('phyclk-tck','CPU JTAG TCK MHz（可空）','50')}</div><p id="phyclk-result" class="note address-query-output" aria-live="polite">${esc(phyClockText('500','100','50'))}</p></div>`;}
function phyBootExplorer(){const fields=[['supplies','电源/POR条件已确认','1'],['reset','当前global reset仍断言','0'],['reference','REFCLK及使能已确认','1'],['cpuClock','CPU时钟已确认','1'],['loaded','固件装载已确认','1'],['runAccepted','本次CPU run应答已观察','0'],['laneDone','本次lane ack撤销已观察','0'],['bootDone','ROM bootloader已完成','0'],['bootError','ROM bootloader报告error','0']];return `<div class="flit-explorer" role="group" aria-label="PHY启动观察排查"><div class="flit-controls">${powerSelect('phyboot-method','装载路径',[['external','外部APB/AHB/side-load'],['rom','ROM bootloader']])}${fields.map(([id,label,value])=>`<label>${label}<select id="phyboot-${id}"><option value="0" ${value==='0'?'selected':''}>否/尚未确认</option><option value="1" ${value==='1'?'selected':''}>是</option></select></label>`).join('')}</div><p id="phyboot-result" class="note address-query-output" aria-live="polite">${esc(phyBootText({supplies:true,reset:false,reference:true,cpuClock:true,loaded:true,runAccepted:false,laneDone:false,method:'external',bootDone:false,bootError:false}))}</p></div>`;}

const EQ5_PHASES={
 'dsp-1':{ec:1,ms:24,tolerance:12,duty:'建立双向TS交换',normal:'全configured lanes两连续EC01；选细调则Phase2，不细调且非Loopback则RcvrLock。'},
 'dsp-2':{ec:2,ms:32,tolerance:4,duty:'响应USP请求，调整自己的TX',normal:'全configured lanes两连续EC11 → Phase3。'},
 'dsp-3':{ec:3,ms:24,tolerance:2,duty:'请求/评估USP TX，并调本地RX',normal:'全lane最优；16/32GT/s还须全lane两连续Extend=0 → RcvrLock。'},
 'usp-0':{ec:0,ms:12,tolerance:6,duty:'应用已交换的preset，建立接收',normal:'全configured lanes两连续EC01 → Phase1。'},
 'usp-1':{ec:1,ms:12,tolerance:6,duty:'建立双向TS交换',normal:'全lane两连续EC10 → Phase2；全lane八连续EC00 → RcvrLock。'},
 'usp-2':{ec:2,ms:24,tolerance:2,duty:'请求/评估DSP TX，并调本地RX',normal:'全lane最优；16/32GT/s还须全lane两连续Extend=0 → Phase3。'},
 'usp-3':{ec:3,ms:32,tolerance:4,duty:'响应DSP请求，调整自己的TX',normal:'全configured lanes两连续EC00 → RcvrLock。'}
};
function eqPhaseInfo(role,phase,rate){
 const rule=EQ5_PHASES[role+'-'+phase];if(!['dsp','usp'].includes(role)||!Number.isInteger(phase)||![8,16,32].includes(rate)||!rule)return null;
 const normal=rate===8?rule.normal.replace('；16/32GT/s还须全lane两连续Extend=0',''):rule.normal;
 return {...rule,role,phase,rate,normal,rows:[`范围：Base5普通Link，${rate}GT/s，${role.toUpperCase()} Phase${phase}。`,`发送EC=${rule.ec.toString(2).padStart(2,'0')}；职责：${rule.duty}。`,normal,`未满足正常出口：${rule.ms}ms${rule.tolerance?'，容差+0～'+rule.tolerance+'ms':''}后进入Recovery.Speed（非Loopback）。`,'超时可置Complete，但不表示成功。此查询只列条件，不模拟整个LTSSM；Gen6/7与Loopback另查。']};
}
function eqPhaseText(...a){const r=eqPhaseInfo(...a);return r?r.rows.join('\n'):'本工具只列Base5、8/16/32GT/s普通Link：DSP从Phase1开始，USP从Phase0开始；其他组合未纳入。';}
function eqCoefficientCheck(fsRaw,lfRaw,preRaw,mainRaw,postRaw,reduced=false){
 const vs=[fsRaw,lfRaw,preRaw,mainRaw,postRaw].map(x=>{const s=String(x).trim();return /^\d{1,3}$/.test(s)?Number(s):NaN;});if(vs.some(v=>!Number.isInteger(v)||v<0||v>63)||typeof reduced!=='boolean')return null;
 const [fs,lf,pre,main,post]=vs,limit=Math.floor(fs/4),sum=pre+main+post,low=main-pre-post;const checks=[{name:'FS范围',pass:fs>=(reduced?12:24)&&fs<=63},{name:'C0为正',pass:main>0},{name:'pre≤floor(FS/4)',pass:pre<=limit},{name:'pre+main+post=FS',pass:sum===fs},{name:'main−pre−post≥LF',pass:low>=lf}];
 const valid=checks.every(x=>x.pass),rows=[`Base3/Base5 NRZ三tap；${reduced?'reduced':'full'} swing。FS=${fs}，LF=${lf}。`,`floor(FS/4)=${limit}；幅值和=${sum}；主tap减两侧=${low}。`,...checks.map(x=>(x.pass?'通过：':'不满足：')+x.name),valid?'所列数字条件通过；仍需完整编码/电气/通道验证。':'至少一项数字条件不满足，不能作为合法系数请求。','输入是TS语义的非负幅值，物理副tap符号及厂商引脚编码另核；不适用Gen6/7四tap，不预测BER。'];return {fs,lf,pre,main,post,reduced,limit,sum,low,checks,valid,rows};
}
function eqCoefficientText(...a){const r=eqCoefficientCheck(...a);return r?r.rows.join('\n'):'请输入0～63的十进制整数幅值（不是hex或负数tap），并选择swing模式。';}
function decodeSpeedSnapshot(vectorRaw,controlRaw,statusRaw,currentRate,role='dsp',functionZero=true){
 const vector=parseHex16(vectorRaw),control=parseHex16(controlRaw),status=parseHex16(statusRaw);if(vector===null||vector>127||control===null||status===null||![2.5,5,8,16,32].includes(currentRate)||!['dsp','usp'].includes(role)||typeof functionZero!=='boolean')return null;
 const target=control&15,rates=[2.5,5,8,16,32],targetRate=target>=1&&target<=5?rates[target-1]:null,supported=targetRate===null||vector===0?null:!!((vector>>>(target-1))&1),capReserved=!!(vector&96),applicable=role==='dsp',eqApplicable=role==='dsp'||functionZero;
 const complete=!!(status&2),phase1=!!(status&4),phase2=!!(status&8),phase3=!!(status&16),request=!!(status&32),success8=eqApplicable?complete&&phase3:null;
 const rows=[`Base5向量字段值=0x${vector.toString(16)}；Target编码=${target}，${targetRate===null?'本轮无可用物理速率映射':targetRate+'GT/s，'+(supported===null?'向量0，先核旧Max兼容路径':supported?'本端向量支持':'本端向量不支持，写此目标结果未定义')}。`];
 if(vector===0)rows.push('向量为0可能是早期/保留能力；须按旧Max字段兼容识别，本工具不猜支持集合。');if(capReserved)rows.push('向量含本轮Base5未定义的高速位置，不能按64/128GT/s支持解释。');
 rows.push(applicable?'DSP的Target是运行速率上限；仍需对端协商及训练。':functionZero?'USP在Enter Compliance=0时Target允许对运行无效果。':'非Function0 USP：相应控制/EQ字段为保留，不能据其数值控制或诊断组件。');
 if(eqApplicable)rows.push('Hardware Autonomous Speed Disable='+Number(!!(control&32))+'：不阻止初始到最高公共速率或可靠性降速。');
 if(eqApplicable)rows.push(`8GT/s状态：Complete=${Number(complete)}；P1/P2/P3=${Number(phase1)}/${Number(phase2)}/${Number(phase3)}；Request=${Number(request)}。`,success8?'Complete与P3成功判据成立；不能证明每阶段都实际执行过，也不代表当前Link可靠。':'尚未同时满足Complete和P3 Successful；Complete单独不是成功。');
 rows.push(currentRate===5?'当前5GT/s De-emphasis='+((status&1)?'-3.5':'-6')+'dB。':'当前非5GT/s：Status2[0]无定义，不解读为Preset。');
 if(currentRate>8)rows.push('当前'+currentRate+'GT/s的EQ结果还须读对应速率专用状态；Status2低位仍是8GT/s历史。');if(request&&eqApplicable)rows.push('Request为RW1CS：写1清掉请求，不是发起EQ命令。');rows.push('这是一组快照的选定字段解释，不访问设备、不提供重训写入。');return {vector,target,targetRate,supported,capReserved,applicable,eqApplicable,complete,phase1,phase2,phase3,request,success8,rows};
}
function speedSnapshotText(...a){const r=decodeSpeedSnapshot(...a);return r?r.rows.join('\n'):'输入7bit Supported Vector字段值、Control2/Status2 WORD hex，选择Base5速率和角色。';}
function eqPhaseExplorer(){return `<div class="flit-explorer" role="group" aria-label="均衡角色阶段查询"><div class="flit-controls">${powerSelect('eqphase-role','拓扑角色',[['dsp','DSP'],['usp','USP']])}${powerSelect('eqphase-phase','Phase',[['1','1'],['2','2'],['3','3'],['0','0（USP）']])}${powerSelect('eqphase-rate','Base5速率 GT/s',[['8','8'],['16','16'],['32','32']])}</div><p id="eqphase-result" class="note address-query-output" aria-live="polite">${esc(eqPhaseText('dsp',1,8))}</p></div>`;}
function eqCoefficientExplorer(){return `<div class="flit-explorer" role="group" aria-label="三tap系数约束查询"><div class="flit-controls">${[['fs','FS','48'],['lf','LF','12'],['pre','pre幅值','6'],['main','main','36'],['post','post幅值','6']].map(([id,t,v])=>powerInput('eqcoef-'+id,t+'（十进制）',v)).join('')}${powerSelect('eqcoef-reduced','Swing模式',[['0','Full swing'],['1','Reduced swing']])}</div><p id="eqcoef-result" class="note address-query-output" aria-live="polite">${esc(eqCoefficientText('48','12','6','36','6',false))}</p></div>`;}
function speedRegisterExplorer(){return `<div class="flit-explorer" role="group" aria-label="速率与8GT均衡快照"><div class="flit-controls">${powerInput('speedq-vector','Supported Vector字段值 hex（非整个DWORD）','1f')}${powerInput('speedq-control','Control2 WORD hex','0005')}${powerInput('speedq-status','Status2 WORD hex','001e')}${powerSelect('speedq-rate','当前速率 GT/s',[['32','32'],['16','16'],['8','8'],['5','5'],['2.5','2.5']])}${powerSelect('speedq-role','端口',[['dsp','DSP'],['usp','USP']])}${powerSelect('speedq-f0','Function0或单Function',[['1','是'],['0','否，多Function USP其他Function']])}</div><p id="speedq-result" class="note address-query-output" aria-live="polite">${esc(speedSnapshotText('1f','5','1e',32,'dsp',true))}</p></div>`;}

function decodeEprSnapshot(capRaw,ctrlRaw,statusRaw,role='usp',owner=true,linkUp=true,otherCause=false,formDefined=true){
 const cap=parseHex32(capRaw),control=parseHex16(ctrlRaw),status=parseHex16(statusRaw);if(cap===null||control===null||status===null||!['usp','vf','dsp'].includes(role)||[owner,linkUp,otherCause,formDefined].some(v=>typeof v!=='boolean'))return null;
 const support=(cap>>>24)&3,init=!!(cap&0x4000000),requestRaw=!!(control&0x800),detectedRaw=!!(status&64),scope=role==='usp',reserved=support===3;
 const requestApplicable=scope&&!reserved&&support>0&&owner,detectedApplicable=scope&&!reserved&&support>0,request=requestApplicable?requestRaw:null,detected=detectedApplicable?detectedRaw:null;
 const mechanisms=!scope||reserved?null:{formFactor:support===2,vendor:support>0||!init,autonomous:support>0||!init};
 const activeCause=detectedApplicable?(otherCause||request===true):null,valid=scope&&!reserved&&!(support===2&&!formDefined);
 const rows=[`原始DevCap2字段：Supported=${support.toString(2).padStart(2,'0')}；Init Required=${Number(init)}。`];
 if(role==='vf')rows.push('VF随PF；Request保留、Detected硬连0。Supported字段在章正文与寄存器表有冲突，本工具不裁决，查关联PF与正式勘误。');
 else if(role==='dsp')rows.push('DSP对应字段保留；Switch DSP随关联USP动作，不能把本端字段当独立控制。');
 else if(reserved)rows.push('Supported=11是保留值，不判定机制或恢复结论。');
 else{rows.push(`§6.24表允许：形态=${Number(mechanisms.formFactor)}，厂商=${Number(mechanisms.vendor)}，自主=${Number(mechanisms.autonomous)}。`);
 if(support===0)rows.push('00没有通告标准EPR支持；00/Init0允许厂商与自主机制，不等于本Function实现标准Request/Detected。');
 if(support===2&&!formDefined)rows.push('编码10的形态请求机制前提尚未核实；需补查对应形态规范，不能仅凭此输入判定硬件违规。');
 rows.push(requestApplicable?'有效Request='+Number(request)+'（已由输入确认本Function为最低编号支持非VF Function）。':'本Function的Request不适用/保留；其他Function的请求须另查。');
 if(detectedApplicable){rows.push('Detected='+Number(detected)+'；1可能是当前态或未清的历史，不单独推断已退出。');rows.push(activeCause?'仍有进入理由：写Detected无效果；不能通过清历史强制退出。':'未输入持续理由不证明已经退出；须确认真实退出后才能按RW1C清历史。');rows.push(init?(linkUp?'Init=1且USP仍Up：在途请求须正常完成；退出仍需软件介入。':'Init=1：若USP因EPR进入Down，退出需全Device复位及完整重配。'):'Init=0：EPR规则要求USP继续工作、在途请求正常完成，退出不需软件恢复；其他原因Link Down须另查。');}}
 if(!requestApplicable&&requestRaw)rows.push('输入在不适用/保留的Request位置读到1，不能解释为本Function有效请求。');
 if(!detectedApplicable&&detectedRaw)rows.push('不适用的Detected位置非0；VF应为0，其他保留位置按适用定义核。');
 rows.push('只解码所引Base6.0/7.0字段；不操作设备、不提供电气时序或精确当前功率，也不把EPR当日常DPA档。');
 return {support,init,requestApplicable,detectedApplicable,request,detected,mechanisms,activeCause,valid,rows};
}
function eprSnapshotText(...a){const r=decodeEprSnapshot(...a);return r?r.rows.join('\n'):'请输入DevCap2 DWORD、DevControl2和Device Status WORD hex，并选择有效角色/上下文。';}
function eprRegisterExplorer(){return `<div class="flit-explorer" role="group" aria-label="EPR字段与恢复查询"><div class="flit-controls">${powerInput('eprq-cap','DevCap2 DWORD hex','02000000')}${powerInput('eprq-control','DevControl2 WORD hex','0800')}${powerInput('eprq-status','Device Status C+0Ah WORD hex','0040')}${powerSelect('eprq-role','角色',[['usp','非VF USP Function'],['vf','VF（保留冲突）'],['dsp','DSP']])}${powerSelect('eprq-owner','最低编号支持的非VF Function已确认',[['1','是'],['0','否/尚未确认']])}${powerSelect('eprq-up','USP当前为DL_Up',[['1','是'],['0','否']])}${powerSelect('eprq-cause','其他Function/外部/自主原因仍存在',[['0','未输入持续原因'],['1','是']])}${powerSelect('eprq-form','对应形态已定义EPR机制',[['1','已确认'],['0','未确认']])}</div><p id="eprq-result" class="note address-query-output" aria-live="polite">${esc(eprSnapshotText('02000000','800','40'))}</p></div>`;}

function slotPowerValue(value,scale){
 if(!Number.isInteger(value)||value<0||value>255||!Number.isInteger(scale)||scale<0||scale>3)return null;
 if(scale===0&&value>=240){if(value===255)return {watts:null,interval:null,text:'FFh保留给>600W的Slot Power Limit，不是255W'};const lo=value===240?239:250+25*(value-241),hi=value===240?250:275+25*(value-241);return {watts:null,interval:[lo,hi],text:`(${lo}, ${hi}] W区间，非精确瓦数`};}
 const watts=Number((value*[1,.1,.01,.001][scale]).toFixed(8));return {watts,interval:null,text:watts+' W上限报告'};
}
function decodeSlotSnapshot(capRaw,controlRaw,statusRaw,cap2Raw,version='7.0',slot=true,dllReporting=true){
 const cap=parseHex32(capRaw),control=parseHex16(controlRaw),status=parseHex16(statusRaw),cap2=parseHex32(cap2Raw);if([cap,control,status,cap2].includes(null)||!['6.0','7.0'].includes(version)||[slot,dllReporting].some(v=>typeof v!=='boolean'))return null;
 const dllChanged=!!(status&256),dllEnabled=!!(control&4096),rows=[`Base${version}；Slot Implemented=${Number(slot)}；DLL State Changed=${Number(dllChanged)}，Enable=${Number(dllEnabled)}。`],notes=[];
 if(!slot){rows.push('没有已实现Slot：不解释Slot Capability和大部分Control/Status；DLL变化字段有独立适用条件。','无Slot端口的Presence状态有硬连1规则，不把这个1读成插着适配器。');if(!(status&64))notes.push('输入无Slot且Presence位为0，须核寄存器/适用条件。');if(version==='7.0'&&((cap2>>>1)&3)===3)notes.push('无Slot却报告SCap2 OOB PD支持=11，不符合该字段无Slot时00或10的约束。');return {slot:false,dllChanged,dllEnabled,presence:null,power:null,rows:rows.concat(notes),notes};}
 const hp=!!(cap&64),powerPresent=!!(cap&2),attentionPresent=!!(cap&8),powerLampPresent=!!(cap&16),mrlPresent=!!(cap&4),interlockPresent=!!(cap&0x20000),noCC=!!(cap&0x40000),slotNumber=cap>>>19,attention=(control>>>6)&3,powerLamp=(control>>>8)&3,powerCommand=powerPresent?!!(control&1024):null,presence=!!(status&64),inbandDisabled=!!(control&0x4000),disableSupported=!!(cap2&1),oob=version==='7.0'?(cap2>>>1)&3:null;
 const value=(cap>>>7)&255,scale=(cap>>>15)&3,power=slotPowerValue(value,scale),lamp=['Reserved','On','Blink','Off'];
 rows.push(`Slot Number=${slotNumber}；Hot-Plug Capable=${Number(hp)}；Hot-Plug Surprise读值=${Number(!!(cap&32))}（可能被SFI屏蔽）。`,`Slot Power Value=${value} / Scale=${scale}：${power.text}；不是当前功耗。`);
 rows.push('Attention灯='+ (attentionPresent?lamp[attention]:'未实现，不赋予控制含义')+'；Power灯='+(powerLampPresent?lamp[powerLamp]:'未实现，不赋予控制含义')+'。');
 if(attentionPresent&&attention===0||powerLampPresent&&powerLamp===0)notes.push('已实现灯的00编码保留，不能当灭灯。');
 rows.push(powerPresent?'Power命令最近写值='+Number(powerCommand)+'（0=On/1=Off），不保证实际供电相同。':'没有Power Controller：Control[10]读值未定义，不作为供电结论。');
 rows.push(`Presence报告=${Number(presence)}；MRL=${mrlPresent?((status&32)?'Open':'Closed'):'未实现'}；Interlock=${interlockPresent?((status&128)?'Engaged':'Disengaged'):'未实现'}。`);
 rows.push(`In-Band PD Disable=${Number(inbandDisabled)}，支持位=${Number(disableSupported)}；Presence取${inbandDisabled?'OOB专用（前提须支持）':'in-band/OOB的OR'}。`);
 if(inbandDisabled&&!disableSupported)notes.push('Disable置位但支持位为0，须核输入/实现；不能假设已合法关闭带内检测。');
 if(version==='7.0'){rows.push('SCap2 OOB PD='+['00：不表明是否支持','01：Reserved','10：不支持','11：支持'][oob]+'。');if(oob===1)notes.push('OOB PD编码01保留。');if(oob===2&&disableSupported)notes.push('OOB明确不支持却报告可关闭in-band，前提不一致。');}else rows.push('Base6.0不解释SCap2[2:1]为OOB能力；本版这些位置保留。');
 if(noCC){rows.push('No Command Completed Support=1：合法热插拔命令无需等完成位；不省略物理等待。');if(status&16||control&16)notes.push('无Command Completed支持时，其status/interrupt enable应为0。');}else rows.push('Command Completed='+Number(!!(status&16))+'：仅说明处理/接收下一条的语义，不证明物理动作完成。');
 if(!hp)notes.push('非Hot-Plug Capable端口写Control不得执行hot-plug命令。');if(control&2048)notes.push('Interlock Control为toggle触发，读回应为0；此输入不是正常读快照。');if(hp&&!dllReporting)notes.push('Hot-plug端口应支持DLL State Changed；核DLL Active Reporting能力。');
 rows.push('Auto Slot Power Limit Disable='+Number(!!(control&8192))+'，不等于关闭插槽电源。','快照不判定允许拔卡，也不据Presence/DLL变化宣布Configuration Ready。');return {slot:true,hp,powerPresent,noCC,slotNumber,attention:attentionPresent?attention:null,powerLamp:powerLampPresent?powerLamp:null,powerCommand,presence,inbandDisabled,disableSupported,oob,power,dllChanged,dllEnabled,notes,rows:rows.concat(notes)};
}
function slotSnapshotText(...a){const r=decodeSlotSnapshot(...a);return r?r.rows.join('\n'):'请输入Capability/Capability2 DWORD及Control/Status WORD hex，选择版本与实现条件。';}
function slotNotification(controlRaw,statusRaw,mode='msi',vectorUnmasked=true,intxDisabled=false,previousCondition=false){
 const control=parseHex16(controlRaw),status=parseHex16(statusRaw);if(control===null||status===null||!['intx','msi','msix'].includes(mode)||[vectorUnmasked,intxDisabled,previousCondition].some(v=>typeof v!=='boolean'))return null;
 const names=['Button','Power Fault','MRL Changed','Presence Changed','Command Completed','DLL State Changed'],pairs=[[0,0],[1,1],[2,2],[3,3],[4,4],[8,12]],events=pairs.map(([s,e],i)=>({name:names[i],statusBit:s,enableBit:e,pending:!!(status&(2**s)),enabled:!!(control&(2**e))})),eligible=events.some(x=>x.pending&&x.enabled),master=!!(control&32),condition=master&&eligible&&(mode==='intx'?!intxDisabled:vectorUnmasked),edge=mode==='intx'?null:condition&&!previousCondition;
 const rows=[`范围：合法支持的事件配置；HPIE=${Number(master)}，至少一组enabled pending=${Number(eligible)}。`,...events.map(x=>`${x.name}：status[${x.statusBit}]=${Number(x.pending)} / enable[${x.enableBit}]=${Number(x.enabled)}。`)];
 rows.push(mode==='intx'?`当前热插拔INTx源条件=${Number(condition)}；其他同Function中断源可能仍断言虚拟线。`:`${mode.toUpperCase()}合成条件：${Number(previousCondition)} → ${Number(condition)}；本次要求的FALSE→TRUE消息=${Number(edge)}。`);
 rows.push('Command Interrupt Disable只用于这里的INTx条件；MSI/MSI-X按相应向量mask。无PVM的MSI按未mask输入。','不计算PME唤醒、PBA或可选额外MSI；新增pending不等于新增同等数量中断，需处理共享来源。');return {events,eligible,master,condition,edge,rows};
}
function slotNotificationText(...a){const r=slotNotification(...a);return r?r.rows.join('\n'):'请输入两个WORD hex及有效中断上下文。';}
const NPEM_STATES=['OK','Locate','Fail','Rebuild','PFA','Hot Spare','In A Critical Array','In A Failed Array','Invalid Device Type','Disabled'];
function decodeNpem(capRaw,controlRaw,statusRaw,mode='readback'){
 const cap=parseHex32(capRaw),control=parseHex32(controlRaw),status=parseHex32(statusRaw);if([cap,control,status].includes(null)||!['readback','write-intent'].includes(mode))return null;
 const capable=!!(cap&1),resetCapable=!!(cap&2),enabled=!!(control&1),complete=!!(status&1),mandatoryMissing=capable?((~cap)&0x3c):0,unsupported=(control&0xffc)&~cap,states=NPEM_STATES.map((name,i)=>({name,bit:i+2,supported:!!(cap&2**(i+2)),requested:!!(control&2**(i+2)),effective:capable&&enabled&&!!(cap&control&2**(i+2))})),resetIntent=mode==='write-intent'&&enabled&&resetCapable&&!!(control&2),notes=[];
 if(mandatoryMissing)notes.push('NPEM Capable=1却缺少OK/Locate/Fail/Rebuild必需能力位。');if(unsupported)notes.push('Control含无对应能力的指示位，不赋予实际功能；相应字段可只读0。');if(mode==='readback'&&(control&2))notes.push('Initiate Reset读回必须为0；输入不是正常读快照。');if(control&2&&!resetCapable)notes.push('Reset未通告支持，不能把bit1视为有效复位命令。');if(status&0x00fffffe)notes.push('Status[23:1]应为RsvdZ，输入含非零保留位。');
 const rows=[`NPEM Capable=${Number(capable)}，Reset Capable=${Number(resetCapable)}（独立可选）；Enable=${Number(enabled)}。`];
 rows.push(enabled?'已启用；有能力的逻辑指示按Control解释。':'未启用：其他控制无效果，不能据此认定所有物理LED熄灭。');states.forEach(x=>rows.push(`bit${x.bit} ${x.name}：支持=${Number(x.supported)} / 控制=${Number(x.requested)} / 有效逻辑指示=${Number(x.effective)}。`));
 rows.push(mode==='readback'?'读回视角：bit1为0不说明从未发生过Reset。':`拟写视角：当前条件下Reset请求=${Number(resetIntent)}，不是PCIe Link Reset。`);
 rows.push(`Command Completed=${Number(complete)}：${complete?'可表示完成或允许硬连1的无等待实现；不能证明本次动作的物理结果':'默认值也为0；没有先前命令上下文不能直接认定正在busy'}。`);
 rows.push(`Enclosure-specific高字节：Cap=0x${(cap>>>24).toString(16)} / Control=0x${(control>>>24).toString(16)} / Status=0x${(status>>>24).toString(16)}。`,'一般软件改Control需保留专用高字节，写Status高字节应为00h；本工具不生成写值。','逻辑指示不启动重建、不禁用Function，不测量物理LED或SSD健康；串行/1秒超时和实现支持另核。');
 return {capable,resetCapable,enabled,complete,mandatoryMissing,unsupported,states,resetIntent,notes,rows:rows.concat(notes)};
}
function npemText(...a){const r=decodeNpem(...a);return r?r.rows.join('\n'):'请输入三个DWORD hex并选择读回或拟写视角。';}
function slotSnapshotExplorer(){return `<div class="flit-explorer" role="group" aria-label="Slot寄存器查询"><div class="flit-controls">${powerInput('slotq-cap','Slot Capability C+14h DWORD hex','0008005b')}${powerInput('slotq-control','Slot Control C+18h WORD hex','1338')}${powerInput('slotq-status','Slot Status C+1Ah WORD hex','0158')}${powerInput('slotq-cap2','Slot Capability2 C+34h DWORD hex','00000007')}${powerSelect('slotq-version','Base版本',[['7.0','7.0'],['6.0','6.0']])}${powerSelect('slotq-slot','Slot Implemented',[['1','是'],['0','否']])}${powerSelect('slotq-dll','DLL Active Reporting Capable',[['1','是'],['0','否']])}</div><p id="slotq-result" class="note address-query-output" aria-live="polite">${esc(slotSnapshotText('8005b','1338','158','7'))}</p></div>`;}
function slotNotificationExplorer(){return `<div class="flit-explorer" role="group" aria-label="Slot中断条件查询"><div class="flit-controls">${powerInput('slotirq-control','Slot Control WORD hex','1028')}${powerInput('slotirq-status','Slot Status WORD hex','0108')}${powerSelect('slotirq-mode','通知方式',[['msi','MSI'],['msix','MSI-X'],['intx','INTx']])}${powerSelect('slotirq-unmasked','向量未mask（无PVM选是）',[['1','是'],['0','否']])}${powerSelect('slotirq-disabled','Command Interrupt Disable',[['0','0'],['1','1']])}${powerSelect('slotirq-previous','前一完整合成条件',[['0','FALSE'],['1','TRUE']])}</div><p id="slotirq-result" class="note address-query-output" aria-live="polite">${esc(slotNotificationText('1028','108'))}</p></div>`;}
function npemExplorer(){return `<div class="flit-explorer" role="group" aria-label="NPEM字段查询"><div class="flit-controls">${powerInput('npemq-cap','Capability B+04h DWORD hex','0000003f')}${powerInput('npemq-control','Control B+08h DWORD hex','00000009')}${powerInput('npemq-status','Status B+0Ch DWORD hex','00000001')}${powerSelect('npemq-mode','Control解释视角',[['readback','读回快照'],['write-intent','拟写值（不会操作设备）']])}</div><p id="npemq-result" class="note address-query-output" aria-live="polite">${esc(npemText('3f','9','1'))}</p></div>`;}

function decodeVcResource(controlRaw,statusRaw,version='7.0',index=1,dlActive=true,peerEnabled=false,peerPending=true,svcActive=false,flitSupported=true){
 const control=parseHex32(controlRaw),status=parseHex16(statusRaw);if(control===null||status===null||!['6.0','7.0'].includes(version)||!Number.isInteger(index)||index<0||index>7||[dlActive,peerEnabled,peerPending,svcActive,flitSupported].some(x=>typeof x!=='boolean'))return null;
 const enabled=!!(control&0x80000000),vcId=(control>>>24)&7,map=control&255,tcs=Array.from({length:8},(_,i)=>i).filter(i=>map&2**i),select=(control>>>17)&7,pendingRaw=!!(status&2),pendingDefined=dlActive&&enabled&&!svcActive,pending=pendingDefined?pendingRaw:null,limitEnable=!!(control&0x40000000),limit=(control>>>27)&7,notes=[];
 if(index===0&&(vcId!==0||!(map&1)))notes.push('默认资源应为ID0且映射TC0；输入不符合默认资源约束。');if(index>0&&enabled&&(map&1))notes.push('扩展已启用VC不得映射TC0。');if(index>0&&enabled&&vcId===0)notes.push('扩展VC与默认VC0的ID冲突，需核所有已启用资源。');if(control&0x10000)notes.push('Load位读回应为0；输入不是正常读快照。');if(status&0xfffc)notes.push('Status保留位非零。');if(version==='6.0'&&svcActive)notes.push('SVC模式选择不适用于本工具所引6.0定义。');if(version==='7.0'&&svcActive&&enabled)notes.push('SVC已激活却读到传统VC Enable=1，需核模式/输入。');if(!enabled&&index===0&&(version==='6.0'||!svcActive))notes.push('本上下文的传统VC0应保持启用。');
 const gateReady=pendingDefined&&!pendingRaw&&peerEnabled&&!peerPending,rows=[`Base${version}；资源序号=${index}，VC ID=${vcId}；TC位图=0x${map.toString(16)} → ${tcs.length?tcs.map(t=>'TC'+t).join('、'):'无TC'}。`,`传统VC Enable=${Number(enabled)}；协商Pending=${pending===null?'当前未满足普通VC字段有效前提':Number(pending)}。`,`对端Enable=${Number(peerEnabled)} / Pending=${Number(peerPending)}；本工具的双方使能/协商必要条件=${Number(gateReady)}，不是完整可发送或QoS证明。`,`Port Arbitration Select=${select}，只在适用角色及能力支持时解释；Resource Table Status=${Number(!!(status&1))}，1为表待装载而非完成。`];
 if(!flitSupported)rows.push('未通告FM支持：不把共享FC字段解释为有效限制；所引7.0对两个字段明确保留，6.0正文措辞差异见详情。');else rows.push(`共享Limit Enable=${Number(limitEnable)}；编码=${limit}，${limitEnable?limit*12.5+'%上限（逐credit类）':'Limit值不参与限制'}；不等于带宽份额。`);
 if(svcActive)rows.push('SVC上下文：传统VC控制不作为有效调度配置；完整SVC协商须另查。');rows.push('单资源快照不检查TC重复映射、全部VC限制和、端到端credit/Ordering或真实硬件状态。');return {control,enabled,vcId,map,tcs,select,pending,pendingDefined,gateReady,limitEnable,limit,notes,rows:rows.concat(notes)};
}
function vcResourceText(...a){const r=decodeVcResource(...a);return r?r.rows.join('\n'):'请输入Resource Control DWORD / Status WORD hex及有效版本/上下文。';}
function arbitrationLayout(kind,select,entryCode,offsetRaw,baseRaw,phase,capRaw){
 const offset=parseHex32(offsetRaw),base=parseHex32(baseRaw),cap=parseHex32(capRaw);if(!['vc','port','function'].includes(kind)||![select,entryCode,phase].every(Number.isInteger)||select<0||select>7||entryCode<0||entryCode>3||phase<0||offset===null||offset>255||base===null||base<256||base>4092||base%4||cap===null||cap>255)return null;
 const legal=kind==='vc'?select<=3:select<=5,supported=!!(cap&2**select),rows=[];if(!legal||!supported){rows.push(!legal?'该层Select编码保留。':'Capability未通告所选算法。');return {valid:false,rows};}
 if(select===0)return {valid:true,phases:null,present:false,rows:['硬件固定仲裁：不假设表存在或具有固定长度；0不等于禁用。']};
 const phases=({1:32,2:64,3:128,4:128,5:256})[select],bits=kind==='vc'?4:2**entryCode,bytes=phases*bits/8,present=offset!==0,start=base+offset*16,end=start+bytes-1,phaseValid=phase<phases,wordOffset=phaseValid?Math.floor(phase*bits/32)*4:null,low=phaseValid?phase*bits%32:null,high=phaseValid?low+bits-1:null,inBounds=present&&end<=4095;
 rows.push(`${kind==='vc'?'VC组':kind==='port'?'Port':'Function'}：${select===4?'Time-based WRR':'WRR'}，${phases} phases，${bits} bit/项，共${bytes}字节。`);
 rows.push(present?`表地址=0x${base.toString(16)}+0x${offset.toString(16)}×16=0x${start.toString(16)}；末地址0x${end.toString(16)}；${inBounds?'未越出4KiB配置空间':'越出4KiB配置空间，需核错误输入/实现'}。`:'Offset=0表示无表；不把能力基址当表地址。');
 rows.push(phaseValid?`Phase ${phase}：表内DWORD偏移0x${wordOffset.toString(16)}，bits[${high}:${low}]。${present?'对应配置DWORD地址0x'+(start+wordOffset).toString(16):'未定位实际表地址'}。`:`Phase必须小于${phases}。`);
 if(kind==='vc')rows.push('每项低3bit为有效已启用VC ID，最高bit保留；Entry Size输入不改变VC表4bit规则。');if(kind==='function')rows.push('非ARI需留至少一个非实现编码；ARI必须4/8bit。此工具仅算布局，不裁定Function/组映射合法性。');rows.push('不检查其他能力/资源区间重叠、表项内容、真实装载或虚拟时隙时长。');return {valid:true,phases,bits,bytes,present,start:present?start:null,end:present?end:null,phaseValid,wordOffset,low,high,inBounds,rows};
}
function arbitrationLayoutText(...a){const r=arbitrationLayout(...a);return r?r.rows.join('\n'):'请输入合法的选择/项宽/Phase，8bit偏移与能力位图hex，以及对齐的配置基址hex（100h～FFCh）。';}
function portPhaseDecision(mode,port,egress,available,count=4){if(!['wrr','time'].includes(mode)||![port,egress,count].every(Number.isInteger)||count<1||count>256||port<0||port>=count||egress<0||egress>=count||typeof available!=='boolean')return null;
 const action=port===egress?(mode==='wrr'?'invalid':'idle'):available?'serve':mode==='wrr'?'skip':'idle',rows=[`Port表：${mode==='wrr'?'普通WRR':'Time-based WRR'}；phase选择Port${port}，出口Port${egress}，候选事务=${Number(available)}。`];
 rows.push(({invalid:'非法配置：普通WRR的phase不能填本Egress Port号。',idle:'本phase为idle时隙；等下一虚拟时隙才推进，不立即借给下一phase。',skip:'该Ingress无此VC事务：立即跳过当前phase。',serve:mode==='wrr'?'服务该Ingress该VC的一笔事务，完成后立即推进。':'本虚拟时隙服务该Ingress该VC的一笔事务，下一虚拟时隙推进。'})[action]);rows.push('available输入假设候选已满足该事务Ordering/FC及实现门控；不模拟传输时间和端到端带宽。');return {action,rows};}
function portPhaseText(...a){const r=portPhaseDecision(...a);return r?r.rows.join('\n'):'请输入合法Port编号/总数与调度模式。';}
function vcResourceExplorer(){return `<div class="flit-explorer" role="group" aria-label="VC资源与协商查询"><div class="flit-controls">${powerInput('vcq-control','Resource Control DWORD hex','81000080')}${powerInput('vcq-status','Resource Status WORD hex','0000')}${powerSelect('vcq-version','Base版本',[['7.0','7.0'],['6.0','6.0']])}${powerInput('vcq-index','资源序号（十进制0～7）','1')}${powerSelect('vcq-dl','DL_Active',[['1','是'],['0','否']])}${powerSelect('vcq-peer','对端同VC已Enable',[['0','未确认/否'],['1','是']])}${powerSelect('vcq-pending','对端Pending',[['1','未确认/1'],['0','0']])}${powerSelect('vcq-svc','本端是否已切SVC',[['0','否'],['1','是']])}${powerSelect('vcq-fm','Flit Mode Supported',[['1','是'],['0','否']])}</div><p id="vcq-result" class="note address-query-output" aria-live="polite">${esc(vcResourceText('81000080','0'))}</p></div>`;}
function arbitrationLayoutExplorer(){return `<div class="flit-explorer" role="group" aria-label="仲裁表布局查询"><div class="flit-controls">${powerSelect('arbtq-kind','仲裁层',[['vc','VC组'],['port','Port'],['function','Function']])}${powerInput('arbtq-select','Select编号（十进制）','1')}${powerSelect('arbtq-width','Entry Size编码（VC组忽略）',[['0','00：1bit'],['1','01：2bit'],['2','10：4bit'],['3','11：8bit']])}${powerInput('arbtq-offset','Table Offset字段 hex','10')}${powerInput('arbtq-base','能力基址 hex','180')}${powerInput('arbtq-phase','Phase编号（十进制）','7')}${powerInput('arbtq-cap','对应Arbitration Capability字段 hex','0f')}</div><p id="arbtq-result" class="note address-query-output" aria-live="polite">${esc(arbitrationLayoutText('vc',1,0,'10','180',7,'f'))}</p></div>`;}
function portPhaseExplorer(){return `<div class="flit-explorer" role="group" aria-label="Port phase条件查询"><div class="flit-controls">${powerSelect('arbph-mode','调度模式',[['wrr','普通WRR'],['time','Time-based WRR']])}${powerInput('arbph-port','phase选择Port（十进制）','0')}${powerInput('arbph-egress','Egress Port（十进制）','2')}${powerSelect('arbph-available','该VC有可服务候选事务',[['0','否'],['1','是']])}${powerInput('arbph-count','Port编号范围0～N-1，N（十进制）','4')}</div><p id="arbph-result" class="note address-query-output" aria-live="polite">${esc(portPhaseText('wrr',0,2,false,4))}</p></div>`;}

function rxNumber(raw,min,max){const s=String(raw).trim();if(!s||s.length>50||!/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[-+]?\d+)?$/i.test(s))return null;const n=Number(s);return Number.isFinite(n)&&n>=min&&n<=max?n:null;}
function ctleProfile(version,rate){if(!['6.0','7.0'].includes(version)||![8,16,32,64,128].includes(rate)||version==='6.0'&&rate===128)return null;const cfg={8:{poles:[2,8],fixedZeros:[],variablePole:2,k:8,min:-12,max:-6},16:{poles:[2,16],fixedZeros:[],variablePole:2,k:16,min:-12,max:-6},32:{poles:[.7425,9.5,28,28],fixedZeros:[.45],variablePole:9.5,k:.7425*28*28/.45,min:-15,max:-5},64:{poles:[.325,7.7,22,28,32,32],fixedZeros:[.25,7.7],variablePole:7.7,k:.325*22*28*32*32/(.25*7.7),min:-15,max:-5},128:{poles:[.675,11.088,39.6,50.4,57.6,57.6],fixedZeros:[.45,11.088],variablePole:11.088,k:.675*39.6*50.4*57.6*57.6/(.45*11.088),min:-15,max:0}}[rate];return {...cfg,rate,version};}
function ctleResponse(version,rate,gainRaw,frequencyRaw,context='model'){
 const p=ctleProfile(version,rate),gain=rxNumber(gainRaw,-100,100),frequency=rxNumber(frequencyRaw,0,1000);if(!p||gain===null||frequency===null||!['model','calibration'].includes(context))return null;
 const step=rate===16&&context==='calibration'?.25:1,allowed=gain>=p.min&&gain<=p.max&&Math.abs(gain/step-Math.round(gain/step))<1e-9;if(!allowed)return {valid:false,rows:[`所选参考范围${p.min}～${p.max}dB，当前查询步进${step}dB；输入不在该扫描网格。`,'8/16GT/s为所引minimum range，不代表实际PHY可调范围。']};
 const linear=10**(gain/20),zeros=[...p.fixedZeros,p.variablePole*linear],db=20*(Math.log10(p.k)+zeros.reduce((a,z)=>a+Math.log10(Math.hypot(frequency,z)),0)-p.poles.reduce((a,z)=>a+Math.log10(Math.hypot(frequency,z)),0)),nyquist=rate>=64?rate/4:rate/2,rows=[`Base${version} / ${rate}GT/s参考CTLE；A_DC=${linear.toPrecision(8)}（电压比）。`,`极点 GHz：${p.poles.join('、')}；零点 GHz：${zeros.map(x=>Number(x.toPrecision(8))).join('、')}。`,`f=${frequency}GHz：|H|=${db.toFixed(6)}dB，相对DC差=${(db-gain).toFixed(6)}dB；不是全频峰值搜索。`,`本速率Nyquist=${nyquist}GHz；当前模型扫描步进${step}dB。`,'仅计算行为CTLE频点响应：不含信道/封装/DFE/噪声，不估算EH/EW或BER，不生成寄存器写值。'];return {valid:true,linear,poles:p.poles,zeros,db,relativeDb:db-gain,nyquist,step,rows};
}
function ctleResponseText(...a){const r=ctleResponse(...a);return r?r.rows.join('\n'):'请选择本版支持的8/16/32/64/128GT/s，输入有限DC gain与0～1000GHz频率；6.0不接受128GT/s。';}
function rxMicroMv(raw){const s=String(raw).trim();if(!/^[+-]?(?:\d+(?:\.\d{1,6})?|\.\d{1,6})$/.test(s)||s.length>24)return null;const neg=s.startsWith('-'),t=s.replace(/^[+-]/,''),[whole,frac='']=t.split('.'),n=BigInt(whole||'0')*1000000n+BigInt(frac.padEnd(6,'0'));return n<=1000000000000n?(neg?-n:n):null;}
function dfeReference(version,rate,h0Raw,tapsRaw){if(!['6.0','7.0'].includes(version)||![8,16,32,64,128].includes(rate)||version==='6.0'&&rate===128)return null;const h0=rxMicroMv(h0Raw),txt=String(tapsRaw).trim(),parts=txt?txt.split(/[\s,，]+/):[],taps=parts.map(rxMicroMv),count={8:1,16:2,32:3,64:16,128:1}[rate];if(h0===null||h0<=0n||taps.length!==count||taps.includes(null))return null;
 const abs=taps.map(x=>x<0n?-x:x),checks=[],add=(name,pass)=>checks.push({name,pass});let weightedRatio=null;
 if(rate===8||rate===16){add('|d1| ≤ 30mV',abs[0]<=30000000n);if(rate===16)add('|d2| ≤ 20mV',abs[1]<=20000000n);}
 if(rate===32){add('|d1|/h0 ≤ 0.8',abs[0]*10n<=h0*8n);add('|d2| ≤ 20mV',abs[1]<=20000000n);add('|d3| ≤ 20mV',abs[2]<=20000000n);}
 if(rate===64){add('|d1|/h0 < 0.55',abs[0]*100n<h0*55n);const w=[100n,100n,85n,60n,25n,10n,...Array(10).fill(5n)],sum=abs.reduce((a,x,i)=>a+x*w[i],0n);weightedRatio=Number(sum)/Number(h0)/100;add('16tap加权幅度和/h0 < 0.85',sum<h0*85n);}
 if(rate===128)add('|d1|/h0 < 0.5',abs[0]*2n<h0);
 const ratio=Number(abs[0])/Number(h0),pass=checks.every(x=>x.pass),rows=[`Base${version} / ${rate}GT/s参考DFE；已输入${count}tap，电压单位mV。`,`首tap幅度比=${ratio.toPrecision(10)}${weightedRatio===null?'':'；加权和比='+weightedRatio.toPrecision(10)}。`,...checks.map(x=>`${x.name}：${x.pass?'满足':'不满足'}。`),`数学界限合取=${Number(pass)}；十进制固定点比较，等号按原条款处理。`,'不证明真实DFE burst安全、实际BER或合规，不把这些电压转换成任何产品寄存器编码。'];return {pass,checks,ratio,weightedRatio,tapCount:count,rows};
}
function dfeReferenceText(...a){const r=dfeReference(...a);return r?r.rows.join('\n'):'请选择版本/速率，输入正h0与对应数量的tap（mV，逗号/空格分隔，最多6位小数）；8/16/32/64/128GT/s需1/2/3/16/1tap，128仅7.0。';}
function eyeCalibrationTarget(version,rate,ehRaw,ewRaw,countRaw){if(!['6.0','7.0'].includes(version)||![16,32,64,128].includes(rate)||version==='6.0'&&rate===128)return null;const eh=rxNumber(ehRaw,0,100000),ew=rxNumber(ewRaw,0,100000),count=rxNumber(countRaw,0,1000000);if(eh===null||ew===null||count===null||!Number.isInteger(count))return null;
 const cfg={16:{eh:[13.5,16.5],ew:[18.25,19.25],targetEh:15,targetEw:18.75,ber:'10^-12'},32:{eh:[13.5,16.5],ew:[8.875,9.875],targetEh:15,targetEw:9.375,ber:'10^-12'},64:{eh:[5.5,6.5],ew:[2.825,3.425],targetEh:6,targetEw:3.125,ber:'10^-6'},128:{eh:[9.5,10.5],ew:[1.4125,1.7125],targetEh:10,targetEw:1.5625,ber:'10^-6'}}[rate],ehOk=eh>=cfg.eh[0]&&eh<=cfg.eh[1],ewOk=ew>=cfg.ew[0]&&ew<=cfg.ew[1],countOk=count>=5,rows=[`Base${version} / ${rate}GT/s ${rate>=64?'Top eye':'Eye'}校准均值；统计口径${cfg.ber}。`,`EH目标${cfg.targetEh}mV，区间[${cfg.eh.join(', ')}]：输入${eh} → ${ehOk?'在范围内':'范围外'}。`,`EW目标${cfg.targetEw}ps，区间[${cfg.ew.join(', ')}]：输入${ew} → ${ewOk?'在范围内':'范围外'}。`,`测量次数${count}：${countOk?'达到至少5次':'未达到至少5次'}；仍需独立确认稳定性。`,'这里只检查两项均值与次数，不检查信号源/压力组合、完整工具流程、其余眼、DUT误码率或认证。'];return {...cfg,ehOk,ewOk,countOk,necessaryConditions:ehOk&&ewOk&&countOk,rows};}
function eyeCalibrationText(...a){const r=eyeCalibrationTarget(...a);return r?r.rows.join('\n'):'请输入有效版本/速率、非负EH(mV)/EW(ps)均值与整数测量次数；128GT/s仅7.0。';}
function ctleResponseExplorer(){return `<div class="flit-explorer" role="group" aria-label="参考CTLE频点查询"><div class="flit-controls">${powerSelect('rxctle-version','Base版本',[['7.0','7.0'],['6.0','6.0']])}${powerSelect('rxctle-rate','速率GT/s',[['64','64'],['128','128'],['32','32'],['16','16'],['8','8']])}${powerInput('rxctle-gain','DC gain dB','-10')}${powerInput('rxctle-frequency','频率GHz','16')}${powerSelect('rxctle-context','扫描用途',[['model','模型/信道曲线'],['calibration','压力眼校准（16G细扫）']])}</div><p id="rxctle-result" class="note address-query-output" aria-live="polite">${esc(ctleResponseText('7.0',64,'-10','16'))}</p></div>`;}
function dfeReferenceExplorer(){return `<div class="flit-explorer" role="group" aria-label="参考DFE界限查询"><div class="flit-controls">${powerSelect('rxdfe-version','Base版本',[['7.0','7.0'],['6.0','6.0']])}${powerSelect('rxdfe-rate','速率GT/s',[['64','64（16tap）'],['128','128（1tap）'],['32','32（3tap）'],['16','16（2tap）'],['8','8（1tap）']])}${powerInput('rxdfe-h0','主游标幅度h0 mV','100')}${powerInput('rxdfe-taps','d1起的完整tap mV列表','54,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0')}</div><p id="rxdfe-result" class="note address-query-output" aria-live="polite">${esc(dfeReferenceText('7.0',64,'100','54,31,0,0,0,0,0,0,0,0,0,0,0,0,0,0'))}</p></div>`;}
function eyeCalibrationExplorer(){return `<div class="flit-explorer" role="group" aria-label="压力眼校准均值查询"><div class="flit-controls">${powerSelect('rxeye-version','Base版本',[['7.0','7.0'],['6.0','6.0']])}${powerSelect('rxeye-rate','速率GT/s',[['64','64'],['128','128'],['32','32'],['16','16']])}${powerInput('rxeye-eh','EH均值 mV（PAM4为top eye）','6')}${powerInput('rxeye-ew','EW均值 ps（PAM4为top eye）','3.125')}${powerInput('rxeye-count','测量次数（需确认稳定）','5')}</div><p id="rxeye-result" class="note address-query-output" aria-live="polite">${esc(eyeCalibrationText('7.0',64,'6','3.125','5'))}</p></div>`;}

function rasEccOutcome(kind,bits,correction=true,multistream=false,ram=true){if(!['ecc','parity'].includes(kind)||!Number.isInteger(bits)||bits<0||bits>8||[correction,multistream,ram].some(x=>typeof x!=='boolean'))return null;
 const effectiveCorrection=kind==='ecc'&&(correction||multistream);let guaranteedDetection=null,correctedOutput=false,reportClass='not-guaranteed';if(bits===0){guaranteedDetection=false;reportClass='none';}else if(kind==='ecc'&&bits===1){guaranteedDetection=true;correctedOutput=effectiveCorrection;reportClass='correctable-class';}else if(kind==='ecc'&&bits===2||kind==='parity'&&bits===1){guaranteedDetection=true;reportClass='uncorrectable-class';}
 const rows=[`6.50a已核能力子集：${kind==='ecc'?'ECC':'Parity'}，单个保护组中已知${bits}bit错误。`,`检测保证=${guaranteedDetection===null?'未由所引1/2bit能力保证':Number(guaranteedDetection)}；产品报告类别=${reportClass}。`,`本次输出纠正=${Number(correctedOutput)}${kind==='ecc'&&bits===1&&!correctedOutput?'；禁纠正不改变该产品的可纠正分类，不能据标签当数据已修复':''}。`];if(multistream&&kind==='ecc')rows.push('所引多流实现纠正恒启用；输入的禁纠正请求不作为可实现配置。');if(ram&&kind==='ecc')rows.push('该产品纠正读出数据不自动回写RAM；不能从输出纠正推断存储单元已修复。');if(kind==='parity')rows.push('Parity不纠正；多bit是否改变奇偶取决于分组和模式，不能凭总bit数作全路径保证。');rows.push('输入错误数是假设，不是syndrome解码；不提供产品编码、注入命令、AER通知保证或Base Corrected语义裁决。');return {effectiveCorrection,guaranteedDetection,correctedOutput,reportClass,rows};}
function rasEccText(...a){const r=rasEccOutcome(...a);return r?r.rows.join('\n'):'请选择ECC/Parity、单组0～8个已知错误bit及有效条件。';}
function parityBytes(raw){const s=String(raw).trim().replace(/\s+/g,'');if(!s||s.length>128||s.length%2||!/^[0-9a-f]+$/i.test(s))return null;return Array.from({length:s.length/2},(_,i)=>parseInt(s.slice(i*2,i*2+2),16));}
function parityDemo(sentRaw,receivedRaw,mode='even'){const sent=parityBytes(sentRaw),received=parityBytes(receivedRaw);if(!sent||!received||sent.length!==received.length||!['odd','even'].includes(mode))return null;const pop=n=>{let k=0;for(let b=0;b<8;b++)k+=(n>>>b)&1;return k;},groups=sent.map((b,i)=>{const protection=(pop(b)%2)^(mode==='odd'?1:0),changed=pop(b^received[i]),failed=((pop(received[i])+protection)%2)!==(mode==='odd'?1:0);return {index:i,protection,changed,failed};}),changedBits=groups.reduce((a,g)=>a+g.changed,0),failingGroups=groups.filter(g=>g.failed).length,rows=[`通用逐字节${mode==='even'?'偶':'奇'}Parity演示：${sent.length}组；假设保护bit传输正确且不变。`,`数据共翻转${changedBits}bit；校验失败组数=${failingGroups}。`,...groups.map(g=>`字节${g.index}：原Parity=${g.protection}，数据翻转${g.changed}bit → ${g.failed?'校验失败':'奇偶关系仍满足'}。`)];if(changedBits&&failingGroups===0)rows.push('有数据变化却未报警：同组偶数翻转可保持Parity关系；这不是数据健康证明。');rows.push('非产品user位图/保护码算法；不含地址、控制、握手或保护bit本身故障，不估算整体安全覆盖率。');return {groups,changedBits,failingGroups,rows};}
function parityDemoText(...a){const r=parityDemo(...a);return r?r.rows.join('\n'):'请输入等长的1～64字节数据hex（可加空格），并选择奇/偶Parity；不接受0x或不完整字节。';}
function cdmEvidence(implemented=true,complete=false,registerError=false,checkerError=false,outputCapable=false,outputEnabled=false,outputError=false,outputLogicError=false){if([implemented,complete,registerError,checkerError,outputCapable,outputEnabled,outputError,outputLogicError].some(x=>typeof x!=='boolean'))return null;
 if(!implemented)return {classification:'not-applicable',locationValid:false,rows:['未确认实现CDM检查：不把输入状态解释为该功能结果，先查生成配置。','无错误记录不能证明已执行检查。']};
 const inconsistent=!outputCapable&&(outputEnabled||outputError||outputLogicError),anyError=registerError||checkerError||outputCapable&&(outputError||outputLogicError),classification=inconsistent?'inconsistent-context':anyError?'error-history':complete?'completed-no-error-record':'no-completion-evidence',locationValid=registerError,rows=[`语义输入：完成历史=${Number(complete)}；寄存器比较错=${Number(registerError)}；扫描逻辑错=${Number(checkerError)}。`,`输出检查：实现=${Number(outputCapable)} / 当前使能=${Number(outputEnabled)} / 比较错历史=${Number(outputError)} / 检查器错历史=${Number(outputLogicError)}。`,`结果=${classification}；不证明是新一轮完成或当前仍有活动故障。`,`寄存器错误地址/PF-VF记录有效条件=${Number(locationValid)}（寄存器比较错误成立）；实际取证仍需确认记录属于哪次事件。`];
 if(inconsistent)rows.push('未实现输出路径却输入该路径使能/错误，先核上下文，不能把这些值当有效诊断。');if(!outputCapable||!outputEnabled)rows.push('输出路径当前未确认监测，不从零错误记录推断输出健康。');if(outputCapable&&!outputEnabled&&(outputError||outputLogicError))rows.push('当前禁用不使sticky历史失效：它可能来自此前已启用阶段。');if(checkerError||outputCapable&&outputLogicError)rows.push('检查器自身有错误历史，不能用被检查对象无错记录宣布健康。');if(complete&&anyError)rows.push('完成与错误可以同时出现：完成不是通过标志。');rows.push('仅解释6.50a所引概念，不解码厂商位图、不生成清除/注入/复位写值。');return {classification,locationValid,anyError,inconsistent,rows};}
function cdmEvidenceText(...a){const r=cdmEvidence(...a);return r?r.rows.join('\n'):'请输入有效的能力/状态条件。';}
function rasEccExplorer(){return `<div class="flit-explorer" role="group" aria-label="内部保护能力解释"><div class="flit-controls">${powerSelect('rasecc-kind','保护类别',[['ecc','ECC'],['parity','Parity']])}${powerInput('rasecc-bits','单组已知错误bit数0～8','1')}${powerSelect('rasecc-correction','请求启用纠正',[['1','是'],['0','否']])}${powerSelect('rasecc-multi','多流纠正恒启用配置',[['0','否'],['1','是']])}${powerSelect('rasecc-ram','是否RAM读出场景',[['1','是'],['0','数据通路']])}</div><p id="rasecc-result" class="note address-query-output" aria-live="polite">${esc(rasEccText('ecc',1))}</p></div>`;}
function parityDemoExplorer(){return `<div class="flit-explorer" role="group" aria-label="逐字节Parity原理演示"><div class="flit-controls">${powerInput('raspar-sent','发送字节hex','00 00')}${powerInput('raspar-received','接收字节hex','03 00')}${powerSelect('raspar-mode','奇偶约定',[['even','偶Parity'],['odd','奇Parity']])}</div><p id="raspar-result" class="note address-query-output" aria-live="polite">${esc(parityDemoText('0000','0300'))}</p></div>`;}
function cdmEvidenceExplorer(){const fields=[['implemented','已确认生成CDM检查','1'],['complete','有Complete历史','0'],['register','有寄存器比较错','0'],['checker','有扫描检查器错','0'],['outcap','已实现输出检查','0'],['outenable','当前启用输出检查','0'],['outerror','有输出比较错历史','0'],['outlogic','有输出检查器错历史','0']];return `<div class="flit-explorer" role="group" aria-label="CDM结果语义查询"><div class="flit-controls">${fields.map(([k,label,v])=>powerSelect('cdmev-'+k,label,v==='1'?[['1','是'],['0','否']]:[['0','否'],['1','是']])).join('')}</div><p id="cdmev-result" class="note address-query-output" aria-live="polite">${esc(cdmEvidenceText())}</p></div>`;}

function tphSnapshot(capRaw,ctrlRaw,msixImplemented=false,msixEntries=1){
 const cap=parseHex32(capRaw),ctrl=parseHex32(ctrlRaw);if(cap===null||ctrl===null||typeof msixImplemented!=='boolean'||!Number.isInteger(msixEntries)||msixEntries<1||msixEntries>2048)return null;
 const mode=ctrl&7,enable=(ctrl>>>8)&3,location=(cap>>>9)&3,sizeField=(cap>>>16)&2047,entries=location===1||location===2?sizeField+1:null,ext=!!(cap&256),supported=mode<=2&&!!(cap&(1<<mode)),issues=[];
 if(!(cap&1))issues.push('No ST Supported必须为1');if(!supported)issues.push(mode>2?'ST Mode编码保留':'所选ST模式未被能力支持');if(enable===2)issues.push('Requester Enable=10为保留编码');if(enable===3&&!ext)issues.push('允许Extended但能力未支持Extended');if(location===3)issues.push('Table Location=11为保留编码');if(!(cap&6)&&location!==0)issues.push('仅No ST模式时Table Location必须为00');if(location===1&&entries>64)issues.push('能力内ST表最多64项');if(location===2&&(!msixImplemented||entries>msixEntries))issues.push('MSI-X位置需要已实现的MSI-X且ST表不大于其表');
 return {mode,enable,location,entries,ext,supported,issues,valid:issues.length===0,tphAllowed:issues.length===0&&(enable===1||enable===3),extendedAllowed:issues.length===0&&enable===3&&ext};
}
function tphSnapshotText(...args){const r=tphSnapshot(...args);return r?`Mode=${r.mode}；Enable=${r.enable}；Location=${r.location}；${r.entries===null?'无已定义表项数':r.entries+'项'}；TPH允许=${+r.tphAllowed}，Extended允许=${+r.extendedAllowed}。${r.issues.length?r.issues.join('；'):'所检查条件相容'}。这里只解释输入快照，不证明Completer、路由及软件平台已准备好。`:'请输入两个32bit十六进制寄存器，以及1～2048项MSI-X表条件。';}
function tphTableAddress(location,sizeField,index,baseRaw,mode,vectorCount){
 if(![1,2].includes(location)||!Number.isInteger(sizeField)||sizeField<0||sizeField>2047||!Number.isInteger(index)||index<0||index>2047||![0,1,2].includes(mode)||!Number.isInteger(vectorCount)||vectorCount<1||vectorCount>2048||!/^(?:0x)?[0-9a-f]{1,16}$/i.test(String(baseRaw).trim()))return null;
 const base=BigInt('0x'+String(baseRaw).trim().replace(/^0x/i,'')),entries=sizeField+1,issues=[];let address=null;
 if(location===1&&(base<0x100n||base%4n||entries>64||base+12n+2n*BigInt(entries)>4096n))issues.push('能力内表基址/对齐/64项限制/配置空间边界不合法');
 if(location===2&&base%8n)issues.push('已解析的MSI-X表基址必须QWORD对齐');
 const ignored=mode===1&&index>=vectorCount,inTable=index<entries;
 if(!inTable)issues.push('索引越过ST表；短表的省略TPH、ST=0或实现自定选择需查设备，不能自动取余');
 if(mode===0)issues.push('No ST模式所有ST为0，不从该索引选择ST');if(ignored)issues.push('Interrupt Vector模式中超出已启用向量范围的条目被忽略');
 if(!issues.length){address=base+(location===1?12n+2n*BigInt(index):16n*BigInt(index)+14n);if(address+1n>0xffffffffffffffffn){address=null;issues.push('16bit表项地址超出64bit范围');}}
 return {entries,inTable,ignored,address:address===null?null:'0x'+address.toString(16).toUpperCase(),issues};
}
function tphTableText(...args){const r=tphTableAddress(...args);return r?`${r.entries}项；${r.address?'ST半字地址='+r.address:r.issues.join('；')}。Location01输入TPH能力配置基址B；Location10输入已解析的MSI-X表内存基址M。Device Specific模式仅演示已明确选择的表索引，不推断设备如何选ST。`:'请输入合法位置、Size编码、索引、十六进制基址、ST模式和向量范围。';}
function tphSnapshotExplorer(){return `<div class="explorer"><label>Capability DWORD（hex）<input id="tphq-cap" value="00000307"></label><label>Control DWORD（hex）<input id="tphq-ctrl" value="00000301"></label><label>实现MSI-X<select id="tphq-msix"><option value="0">否</option><option value="1">是</option></select></label><label>MSI-X表项数<input id="tphq-count" type="number" min="1" max="2048" value="1"></label><p id="tphq-result" aria-live="polite">${esc(tphSnapshotText('00000307','00000301',false,1))}</p></div>`;}
function tphTableExplorer(){return `<div class="explorer"><label>ST表位置<select id="tphtq-location"><option value="1">01 能力内</option><option value="2">10 MSI-X表内</option></select></label><label>Size字段N-1<input id="tphtq-size" type="number" value="3" min="0" max="2047"></label><label>索引i<input id="tphtq-index" type="number" value="3" min="0" max="2047"></label><label>基址hex<input id="tphtq-base" value="180"></label><label>ST Mode<select id="tphtq-mode"><option value="1">1 Interrupt Vector</option><option value="0">0 No ST</option><option value="2">2 Device Specific</option></select></label><label>已启用向量范围大小<input id="tphtq-vectors" type="number" value="4" min="1" max="2048"></label><p id="tphtq-result" aria-live="polite">${esc(tphTableText(1,3,3,'180',1,4))}</p></div>`;}
document.addEventListener('input',e=>{
 if(e.target.id.startsWith('tphq-')){const v=k=>$('#tphq-'+k).value;$('#tphq-result').textContent=tphSnapshotText(v('cap'),v('ctrl'),v('msix')==='1',v('count').trim()===''?NaN:Number(v('count')));}
 if(e.target.id.startsWith('tphtq-')){const v=k=>$('#tphtq-'+k).value,n=k=>v(k).trim()===''?NaN:Number(v(k));$('#tphtq-result').textContent=tphTableText(n('location'),n('size'),n('index'),v('base'),n('mode'),n('vectors'));}
});

function configHex64(raw){const s=String(raw).trim().replace(/^0x/i,'');return /^[0-9a-f]{1,16}$/i.test(s)?BigInt('0x'+s):null;}
function configHexText(n){return '0x'+n.toString(16).toUpperCase();}
function memoryBarSnapshot(version,lowRaw,highRaw,probeLowRaw,probeHighRaw){
 const low=parseHex32(lowRaw),high=parseHex32(highRaw),pl=parseHex32(probeLowRaw),ph=parseHex32(probeHighRaw);
 if(!['6.0','7.0'].includes(version)||[low,high,pl,ph].some(x=>x===null))return null;
 const type=(low>>>1)&3,issues=[],width=type===2?64:32;
 if(low&1)issues.push('本工具仅处理Memory BAR');if(type!==0&&type!==2)issues.push('Memory Type为保留编码');if((low&15)!==(pl&15))issues.push('探测回读的只读属性与保存值不一致');if(width===32&&(high!==0||ph!==0))issues.push('32bit BAR请将两个高DWORD输入0，不要误拼下一BAR');
 const max=(1n<<BigInt(width))-1n,base=(BigInt(low)&0xfffffff0n)|(width===64?BigInt(high)<<32n:0n),mask=(BigInt(pl)&0xfffffff0n)|(width===64?BigInt(ph)<<32n:0n);
 let size=null,limit=null,aligned=null;
 if(mask===0n)issues.push('地址掩码为0；不能据此输出有效大小，请确认未实现/输入/发现机制');
 else {size=((~mask)&max)+1n;if((size&(size-1n))!==0n)issues.push('地址掩码不连续，大小不是2的幂');if(size<128n)issues.push('普通Memory BAR申请范围小于128字节');if(width===32&&size>0x80000000n)issues.push('32bit Memory BAR范围超过所引2GiB上限');aligned=base%size===0n;if(!aligned)issues.push('BAR基址未按资源大小自然对齐');limit=base+size-1n;if(limit>max)issues.push('资源范围超出BAR地址位宽');}
 return {width,base:configHexText(base),mask:configHexText(mask),size:size===null?null:size.toString(),limit:limit===null?null:configHexText(limit),aligned,valid:issues.length===0,issues,bit3:version==='6.0'?`6.0 Prefetchable=${(low>>>3)&1}`:'7.0 bit3历史定义弃用，不据此推断预读/写合并'};
}
function memoryBarText(...args){const r=memoryBarSnapshot(...args);return r?`${r.width}bit；基址=${r.base}；掩码=${r.mask}；大小=${r.size??'无法确认'}字节；末地址=${r.limit??'无法确认'}。${r.bit3}。${r.issues.length?'检查问题：'+r.issues.join('；'):'所检查输入相容；仍需Command、桥窗口和平台资源映射'}。`:'请输入6.0/7.0和四个32bit十六进制DWORD；32bit BAR高DWORD填0。';}
function bridgeMemoryWindow(version,kind,implemented,baseRaw,limitRaw,upperBaseRaw,upperLimitRaw){
 if(!['6.0','7.0'].includes(version)||!['mem32','wide'].includes(kind)||typeof implemented!=='boolean')return null;
 if(!implemented)return {state:'not-implemented',valid:true,base:null,limit:null,size:null,issues:[]};
 const b=parseHex16(baseRaw),l=parseHex16(limitRaw),ub=parseHex32(upperBaseRaw),ul=parseHex32(upperLimitRaw);if([b,l,ub,ul].some(x=>x===null))return null;
 const bt=b&15,lt=l&15,issues=[];let useUpper=false;
 if(kind==='mem32'){if(bt||lt)issues.push('20h/22h低4bit应为0');}
 else {if(bt!==lt||bt>1||lt>1)issues.push('窗口类型不一致或编码保留');if(version==='6.0'&&bt!==1)issues.push('所引6.0 PCIe桥实现Prefetchable窗口须支持64bit');useUpper=bt===1;}
 const base=(BigInt(b&0xfff0)<<16n)|(useUpper?BigInt(ub)<<32n:0n),limit=(BigInt(l&0xfff0)<<16n)|0xfffffn|(useUpper?BigInt(ul)<<32n:0n),closed=base>limit;
 return {state:issues.length?'invalid':closed?'closed':'range',valid:issues.length===0,base:configHexText(base),limit:configHexText(limit),size:issues.length||closed?null:(limit-base+1n).toString(),upperIgnored:!useUpper,issues};
}
function bridgeMemoryText(...args){const r=bridgeMemoryWindow(...args);return !r?'请输入合法版本、窗口和十六进制WORD/DWORD。':r.state==='not-implemented'?'已明确选择未实现，不从全0读值推断地址范围。':`${r.state==='closed'?'窗口关闭，Base大于Limit':r.state==='invalid'?'输入/能力不合法':'窗口范围'}：${r.base}～${r.limit}（含末地址）；大小=${r.size??'不作为有效范围'}字节。${r.issues.join('；')} ${r.upperIgnored?'高32bit在本类型中忽略。':''}这只解码单窗口，不证明使能、整条路径或安全条件满足。`;}
function ecamAddress(baseRaw,n,bus,device,fn,offset,size){
 const base=configHex64(baseRaw);if(base===null||![n,bus,device,fn,offset,size].every(Number.isInteger)||n<1||n>8||bus<0||bus>255||device<0||device>31||fn<0||fn>7||offset<0||offset>4095||![1,2,4].includes(size))return null;
 const span=1n<<BigInt(n+20),issues=[];if(base%span)issues.push('Bus0基址未按所配置ECAM窗口大小对齐');if(bus>=2**n)issues.push('目标Bus超出n位可表示范围');if(offset+size>4096)issues.push('访问超出该Function的4KiB配置空间');if(offset%size||Math.floor(offset/4)!==Math.floor((offset+size-1)/4))issues.push('本工具仅处理自然对齐且不跨DW访问');
 const address=base+(BigInt(bus)<<20n)+(BigInt(device)<<15n)+(BigInt(fn)<<12n)+BigInt(offset);if(address+BigInt(size)-1n>0xffffffffffffffffn)issues.push('地址超出64bit');return {address:configHexText(address),windowBytes:span.toString(),valid:issues.length===0,issues};
}
function ecamAddressText(...args){const r=ecamAddress(...args);return r?`${r.valid?'ECAM地址='+r.address:'输入不满足条件：'+r.issues.join('；')}；窗口大小=${r.windowBytes}字节。公式基址对应Bus0，限非ARI，Segment选择与平台映射另行确认。`:'请输入64bit十六进制基址、n=1～8、Bus=0～255、Device=0～31、Function=0～7、偏移0～4095及大小1/2/4。';}
function memoryBarExplorer(){return `<div class="explorer"><label>规范<select id="barq-version"><option>6.0</option><option>7.0</option></select></label>${[['low','保存BAR低DWORD','80000000'],['high','保存高DWORD，32bit填0','0'],['probe-low','探测回读低DWORD','FFFF0000'],['probe-high','探测回读高DWORD，32bit填0','0']].map(([k,l,v])=>`<label>${l}<input id="barq-${k}" value="${v}"></label>`).join('')}<p id="barq-result" aria-live="polite">${esc(memoryBarText('6.0','80000000','0','FFFF0000','0'))}</p></div>`;}
function bridgeMemoryExplorer(){return `<div class="explorer"><label>规范<select id="bridgeq-version"><option>6.0</option><option>7.0</option></select></label><label>窗口<select id="bridgeq-kind"><option value="mem32">20h/22h Memory</option><option value="wide">24h/26h 宽Memory（按版本解释）</option></select></label><label>明确是否实现<select id="bridgeq-implemented"><option value="1">已实现</option><option value="0">未实现</option></select></label>${[['base','Base WORD','8000'],['limit','Limit WORD','80F0'],['upper-base','Base Upper32','0'],['upper-limit','Limit Upper32','0']].map(([k,l,v])=>`<label>${l}<input id="bridgeq-${k}" value="${v}"></label>`).join('')}<p id="bridgeq-result" aria-live="polite">${esc(bridgeMemoryText('6.0','mem32',true,'8000','80F0','0','0'))}</p></div>`;}
function ecamAddressExplorer(){return `<div class="explorer"><label>Bus0基址hex<input id="ecamq-base" value="E0000000"></label>${[['bits','Bus位数n','8'],['bus','Bus（十进制）','2'],['device','Device（十进制）','0'],['fn','Function（十进制）','0'],['offset','配置字节偏移（十进制）','256']].map(([k,l,v])=>`<label>${l}<input id="ecamq-${k}" type="number" value="${v}"></label>`).join('')}<label>访问字节数<select id="ecamq-size"><option>4</option><option>2</option><option>1</option></select></label><p id="ecamq-result" aria-live="polite">${esc(ecamAddressText('E0000000',8,2,0,0,256,4))}</p></div>`;}
document.addEventListener('input',e=>{
 if(e.target.id.startsWith('barq-')){const v=k=>$('#barq-'+k).value;$('#barq-result').textContent=memoryBarText(v('version'),v('low'),v('high'),v('probe-low'),v('probe-high'));}
 if(e.target.id.startsWith('bridgeq-')){const v=k=>$('#bridgeq-'+k).value;$('#bridgeq-result').textContent=bridgeMemoryText(v('version'),v('kind'),v('implemented')==='1',v('base'),v('limit'),v('upper-base'),v('upper-limit'));}
 if(e.target.id.startsWith('ecamq-')){const v=k=>$('#ecamq-'+k).value,n=k=>v(k).trim()===''?NaN:Number(v(k));$('#ecamq-result').textContent=ecamAddressText(v('base'),n('bits'),n('bus'),n('device'),n('fn'),n('offset'),n('size'));}
});

function ptmSnapshot(capRaw,ctrlRaw,role,flitSupported,upstreamDspEnabled){
 const cap=parseHex32(capRaw),ctrl=parseHex32(ctrlRaw);if(cap===null||ctrl===null||!['ep','rciep','rp','rcrb','switch'].includes(role)||typeof flitSupported!=='boolean'||typeof upstreamDspEnabled!=='boolean')return null;
 const req=!!(cap&1),resp=!!(cap&2),rootCap=!!(cap&4),eptm=!!(cap&8),adapt=!!(cap&16),enabled=!!(ctrl&1),rootSelect=!!(ctrl&2),local=(cap>>>8)&255,effective=(ctrl>>>8)&255,issues=[],notes=[];
 if(rootCap&&!resp)issues.push('Root Capable要求Responder Capable');if(['ep','rciep'].includes(role)&&rootCap)issues.push('普通EP/RCiEP不能报告Root Capable');if(role==='switch'&&(!req||!resp))issues.push('PTM Switch需Requester和Responder能力');if(['ep','rciep'].includes(role)&&!req)issues.push('本查询所选Endpoint角色需Requester能力');if(['rp','rcrb'].includes(role)&&!resp)issues.push('本查询所选RP/RCRB角色需Responder能力');
 if(rootSelect&&!rootCap)issues.push('Root Select不能据此建立不支持的Root角色');if(flitSupported&&!eptm)issues.push('MUST@FLIT按支持能力判定：需ePTM，即使当前运行NFM');
 if(enabled&&['ep','switch'].includes(role)&&!rootSelect&&!upstreamDspEnabled)issues.push('向上请求时间前，同Link的DSP需已使能');
 if(enabled&&role==='switch'&&rootSelect&&!upstreamDspEnabled)notes.push('独立Switch Root与通用使能顺序的结合需完整层级信息；本工具不作裁决');
 return {req,resp,rootCap,eptm,adapt,enabled,rootSelect,local,effective,localApplicable:rootCap,effectiveApplicable:req,activeRoot:enabled&&rootSelect&&rootCap&&resp,valid:issues.length===0,issues,notes,contextValid:null};
}
function ptmGranularityLabel(code,field='effective'){return code===0?(field==='local'?'无本地时钟、传播上游信息':'未知粒度'):code===255?'>254 ns':code+' ns';}
function ptmSnapshotText(...args){const r=ptmSnapshot(...args);return r?`Requester=${+r.req}，Responder=${+r.resp}，Root Capable=${+r.rootCap}，ePTM=${+r.eptm}，Adaptation=${+r.adapt}；Enable=${+r.enabled}，Root Select=${+r.rootSelect}。Local=${r.localApplicable?ptmGranularityLabel(r.local,'local'):'字段保留，不据读值猜时钟周期'}；Effective=${r.effectiveApplicable?ptmGranularityLabel(r.effective):'此角色不作Requester粒度解释'}。${r.issues.length?r.issues.join('；'):'所检查条件未见冲突'}。${r.notes.join('；')} 不推导Context Valid、精度或全部拓扑合法性。`:'请输入两个32bit十六进制DWORD和明确的角色、Flit Mode Supported及上方DSP使能条件。';}
function ptmUnsigned(raw,bits){const s=String(raw).trim();if(!/^\d{1,20}$/.test(s))return null;const n=BigInt(s);return n<(1n<<BigInt(bits))?n:null;}
function ptmHalfNs(n){return (n/2n).toString()+(n%2n?'.5':'');}
function ptmTimeEstimate(t1Raw,t4Raw,pRaw,t2CurrentRaw){
 const t1=ptmUnsigned(t1Raw,64),t4=ptmUnsigned(t4Raw,64),p=ptmUnsigned(pRaw,32),t2=ptmUnsigned(t2CurrentRaw,64);if([t1,t4,p,t2].some(x=>x===null))return null;
 const issues=[];if(t4<t1)issues.push('t4小于t1：本工具不处理回卷/跨纪元');const rtt=t4-t1,link=rtt-p,masterTwice=2n*t2-link;if(link<0n)issues.push('往返间隔小于上一轮Responder处理间隔，请核轮次/单位/字节序/失效');if(masterTwice<0n)issues.push('本轮Master Time减去估计延迟为负，不作无符号回卷');
 return {valid:issues.length===0,issues,rtt:rtt.toString(),responder:p.toString(),linkRoundTrip:link.toString(),oneWay:link<0n?null:ptmHalfNs(link),masterAtCurrentT1:issues.length?null:ptmHalfNs(masterTwice)};
}
function ptmTimeText(...args){const r=ptmTimeEstimate(...args);return !r?'请输入十进制整数ns：t1/t4/t2′限64bit，P限32bit。':r.valid?`前轮R=${r.rtt} ns，P=${r.responder} ns；链路往返估计=${r.linkRoundTrip} ns，单程估计=${r.oneWay} ns；本轮t1′对应Master Time估计=${r.masterAtCurrentT1} ns。使用相邻dialog历史、统一尺度及对称/稳定时延假设；算术相容不证明Context Valid。`:'未给出有效估计：'+r.issues.join('；');}
function ptmPathGranularity(rootCode,sourceRaw){
 if(!Number.isInteger(rootCode)||rootCode<1||rootCode>255)return null;
 const s=String(sourceRaw).trim(),parts=s?s.split(/[\s,，]+/):[];if(parts.length>64||parts.some(x=>!/^\d{1,3}$/.test(x)||Number(x)>255))return null;const sources=parts.map(Number),unknown=sources.includes(0),code=unknown?0:Math.max(rootCode,...sources);
 return {code,unknown,exactNs:code>0&&code<255?code:null,label:ptmGranularityLabel(code),sources};
}
function ptmPathText(...args){const r=ptmPathGranularity(...args);return r?`Effective候选编码=${r.code}（0x${r.code.toString(16).toUpperCase().padStart(2,'0')}），${r.label}。${r.unknown?'路径有Switch来源00h，不忽略为已知的精确粒度。':'按已确认适用的路径编码取最粗者，FFh不作255ns精确值。'} 不推导真实误差；纯Requester保留字段不应加入列表。`:'Root编码须为1～255；中间来源可为空或最多64个0～255十进制编码，用逗号/空格分隔。';}
function ptmSnapshotExplorer(){return `<div class="explorer"><label>Capability DWORD hex<input id="ptmc-cap" value="00000009"></label><label>Control DWORD hex<input id="ptmc-ctrl" value="00000801"></label><label>参与角色<select id="ptmc-role"><option value="ep">Endpoint Requester</option><option value="rciep">RCiEP Requester</option><option value="rp">Root Port Responder</option><option value="rcrb">RCRB Responder</option><option value="switch">Switch</option></select></label><label>Flit Mode Supported能力<select id="ptmc-flit"><option value="1">支持（不是当前是否FM）</option><option value="0">不支持</option></select></label><label>同Link上方DSP已使能<select id="ptmc-upstream"><option value="1">是</option><option value="0">否/未确认</option></select></label><p id="ptmc-result" aria-live="polite">${esc(ptmSnapshotText('9','801','ep',true,true))}</p></div>`;}
function ptmTimeExplorer(){return `<div class="explorer">${[['t1','前轮t1，已换算ns','1000'],['t4','前轮t4，已换算ns','1120'],['p','ResponseD携带前轮P，ns','40'],['t2','本轮t2′ Master Time，ns','5000']].map(([k,l,v])=>`<label>${l}<input id="ptmt-${k}" inputmode="numeric" value="${v}"></label>`).join('')}<p id="ptmt-result" aria-live="polite">${esc(ptmTimeText('1000','1120','40','5000'))}</p></div>`;}
function ptmPathExplorer(){return `<div class="explorer"><label>Root粒度编码（十进制）<input id="ptmg-root" type="number" min="1" max="255" value="4"></label><label>已确认适用的中间来源编码<input id="ptmg-sources" value="8,2"></label><p id="ptmg-result" aria-live="polite">${esc(ptmPathText(4,'8,2'))}</p></div>`;}
document.addEventListener('input',e=>{
 if(e.target.id.startsWith('ptmc-')){const v=k=>$('#ptmc-'+k).value;$('#ptmc-result').textContent=ptmSnapshotText(v('cap'),v('ctrl'),v('role'),v('flit')==='1',v('upstream')==='1');}
 if(e.target.id.startsWith('ptmt-')){const v=k=>$('#ptmt-'+k).value;$('#ptmt-result').textContent=ptmTimeText(v('t1'),v('t4'),v('p'),v('t2'));}
 if(e.target.id.startsWith('ptmg-')){const v=k=>$('#ptmg-'+k).value;$('#ptmg-result').textContent=ptmPathText(v('root').trim()===''?NaN:Number(v('root')),v('sources'));}
});

function rxAlignmentRule(phase,event){
 if(!['unaligned','aligned','locked'].includes(phase)||!['eieos','sds','invalid','skp','other'].includes(event))return null;
 const names={unaligned:'Unaligned',aligned:'Aligned',locked:'Locked'};
 let next=[phase],action='在本查询范围内保持当前概念阶段；没有给出额外状态转移。',strength='范围内无额外转移';
 if(phase==='unaligned'&&event==='eieos'){next=['aligned'];action='按识别到的EIEOS调整边界，进入Aligned。';strength='必须';}
 else if(phase==='aligned'&&event==='eieos'){action='若EIEOS边界与当前边界不同，必须调整；保持Aligned。';strength='条件成立时必须';}
 else if(phase==='aligned'&&event==='sds'){next=['locked'];action='进入Locked，后续Data Stream不得随意重新定位。';strength='必须';}
 else if(phase==='aligned'&&event==='invalid'){next=['aligned','unaligned'];action='允许退到Unaligned；也可保持Aligned，规范未要求唯一下一阶段。';strength='允许';}
 else if(phase==='locked'&&event==='invalid'){next=['unaligned','aligned'];action='必须离开Locked，可返回Unaligned或Aligned。';strength='必须退出';}
 else if(phase!=='unaligned'&&event==='skp'){action='识别有效SKP后按其可变长度所需调整边界，这是显式例外；概念阶段本身不因此改变。';strength='SKP例外';}
 else if(phase==='locked'){action='正在处理Data Stream时不得重新定位Block。此查询不模拟停止数据流、Recovery或Loopback。';strength='禁止任意调整';}
 return {next,action,strength,phase:names[phase]};
}
function rxAlignmentText(phase,event){const r=rxAlignmentRule(phase,event);return r?`${r.phase} → ${r.next.join(' / ')}；${r.strength}。${r.action} 仅限128b/130b已识别事件，非硬件FSM或完整协议合规裁决。`:'请选择有效阶段和事件。';}
function rxAlignmentExplorer(){return `<div class="note"><label>当前概念阶段 <select id="rxal-phase"><option value="unaligned">Unaligned</option><option value="aligned">Aligned</option><option value="locked">Locked</option></select></label> <label>已识别事件 <select id="rxal-event"><option value="eieos">EIEOS（可能指向新边界）</option><option value="sds">SDS</option><option value="invalid">00b / 11b Sync Header</option><option value="skp">合法变长SKP</option><option value="other">其他/正常Data Stream</option></select></label><p id="rxal-result" aria-live="polite">${esc(rxAlignmentText('unaligned','eieos'))}</p></div>`;}
function skpShape(version,rate,mode,type,direction,length){
 rate=Number(rate);length=Number(length);
 if(!['6.0','7.0'].includes(version)||!Number.isFinite(rate)||!Number.isInteger(length)||length<=0||!['nfm','fm'].includes(mode)||!['basic','standard','control'].includes(type)||!['tx','rx'].includes(direction))return null;
 const rates=version==='6.0'?[2.5,5,8,16,32,64]:[2.5,5,8,16,32,64,128];
 if(!rates.includes(rate))return {applicable:false,reason:'所选正式版本不覆盖此速率组合。'};
 if(rate>=64&&mode!=='fm')return {applicable:false,reason:'64/128 GT/s须使用FM。'};
 let encoding,unit,allowed,types;
 if(rate<=5){encoding='8b/10b';unit='Symbols（含COM）';types=['basic'];allowed=direction==='tx'?[4]:[2,3,4,5,6];}
 else if(rate<=32){encoding='128b/130b';unit='Symbols（不含Sync Header）';types=rate===8&&mode==='nfm'?['standard']:['standard','control'];allowed=direction==='tx'?[16]:[8,12,16,20,24];}
 else{encoding='1b/1b';unit='bytes';types=['control'];allowed=direction==='tx'?[40]:[24,32,40,48,56];}
 if(!types.includes(type))return {applicable:false,encoding,unit,reason:'该速率/模式不使用所选SKP类型。',types};
 return {applicable:true,encoding,unit,allowed,valid:allowed.includes(length)};
}
function skpShapeText(v,r,m,t,d,l){const x=skpShape(v,r,m,t,d,l);if(!x)return '请输入完整有效选项和正整数长度。';if(!x.applicable)return '不适用：'+x.reason;return `${x.encoding}，${d.toUpperCase()}允许 ${x.allowed.join(' / ')} ${x.unit}。输入长度${x.valid?'在普通格式范围内':'不在普通格式范围内'}。仅核类型/长度，未核Payload、CRC、调度、Loopback或多lane条件。`;}
function skpShapeExplorer(){return `<div class="note"><label>版本 <select id="skpq-version"><option>6.0</option><option>7.0</option></select></label> <label>速率 GT/s <select id="skpq-rate">${[2.5,5,8,16,32,64,128].map(x=>`<option ${x===8?'selected':''}>${x}</option>`).join('')}</select></label> <label>模式 <select id="skpq-mode"><option value="nfm">NFM</option><option value="fm">FM</option></select></label> <label>类型 <select id="skpq-type"><option value="standard">Standard</option><option value="control">Control</option><option value="basic">COM + SKP（8b/10b）</option></select></label> <label>方向 <select id="skpq-direction"><option value="rx">RX</option><option value="tx">TX</option></select></label> <label>长度 <input id="skpq-length" type="number" min="1" step="1" value="16"></label><p id="skpq-result" aria-live="polite">${esc(skpShapeText('6.0',8,'nfm','standard','rx',16))}</p></div>`;}
function elasticDrift(mhz,writer,reader,us,depth,start){
 const vals=[mhz,writer,reader,us,depth,start];if(!vals.every(Number.isFinite)||mhz<=0||writer<=-1e6||reader<=-1e6||us<0||!Number.isInteger(depth)||depth<=0||!Number.isInteger(start)||start<0||start>depth)return null;
 const delta=writer-reader,slope=mhz*delta*1e-6,change=slope*us,end=start+change,until=slope===0?null:(slope>0?(depth-start)/slope:start/-slope);
 if(![slope,change,end].every(Number.isFinite)||until!==null&&!Number.isFinite(until))return null;
 return {delta,change,end,until,direction:slope>0?'趋向写满':slope<0?'趋向读空':'无净频差漂移',inside:end>=0&&end<=depth};
}
function elasticDriftText(...args){const x=elasticDrift(...args);if(!x)return '请输入有限数值：entry MHz需大于0，时间非负，深度正整数、起始占用为范围内整数；ppm不能使时钟频率为零或负数。';const n=v=>Number(v.toPrecision(9)).toString();return `写−读 ${n(x.delta)} ppm，${x.direction}；占用变化 ${n(x.change)} entries，末占用 ${n(x.end)} entries，${x.inside?'处于输入深度范围内':'已越过输入深度边界'}。${x.until===null?'此模型中没有净漂移边界时间':`从起点到${x.delta>0?'满':'空'}边界约 ${n(x.until)} µs`}。理想连续流，无SKP补偿/停顿/CDC；结果不是最小FIFO深度或硬件验证。`;}
function elasticDriftExplorer(){return `<div class="note">${[['mhz','标称entry频率 MHz',250],['writer','写端频偏 ppm',300],['reader','读端频偏 ppm',-300],['us','持续时间 µs',10],['depth','输入深度 entries',32],['start','初始占用 entries',16]].map(([id,label,value])=>`<label>${label} <input id="elbf-${id}" type="number" value="${value}" step="any"></label> `).join('')}<p id="elbf-result" aria-live="polite">${esc(elasticDriftText(250,300,-300,10,32,16))}</p></div>`;}
document.addEventListener('input',e=>{
 const id=e.target?.id||'';
 if(id.startsWith('rxal-'))$('#rxal-result').textContent=rxAlignmentText($('#rxal-phase').value,$('#rxal-event').value);
 if(id.startsWith('skpq-')){const v=x=>$('#skpq-'+x).value;$('#skpq-result').textContent=skpShapeText(v('version'),v('rate'),v('mode'),v('type'),v('direction'),v('length'));}
 if(id.startsWith('elbf-')){const vals=['mhz','writer','reader','us','depth','start'].map(x=>{const v=$('#elbf-'+x).value;return v.trim()===''?NaN:Number(v)});$('#elbf-result').textContent=elasticDriftText(...vals);}
});

function tagRangeRule(version,ext,ten,fourteen,path){
 if(!['6.0','7.0'].includes(version)||![ext,ten,fourteen].every(x=>x===0||x===1)||![5,8,10,14].includes(path))return null;
 let bits=path===5?5:fourteen&&path>=14?14:ten&&path>=10?10:ext?8:5;
 const lo=bits===14?1024:bits===10?256:0,hi=bits===14?16383:bits===10?1023:bits===8?255:31;
 return {bits,lo,hi,count:hi-lo+1,compatibility:bits===14?(version==='7.0'?'7.0强烈推荐该范围，同时为兼容允许256～16383；较小尺寸选择另遵其范围。':'6.0表2-11列该范围，但p154正文给256～16383，存在不一致；不能据本工具判兼容值违规。'):''};
}
function tagRangeText(v,e,t,f,p){const r=tagRangeRule(v,e,t,f,p);return r?`非UIO，表列最大可用档位 ${r.bits} bit：${r.lo}～${r.hi}，范围内 ${r.count} 个值。${r.compatibility} 假设使能符合本地能力/模式；不检测VF、P2P、别名、在途资源或实际并发量。`:'请选择正式版本、三个位和目标/路径共同能力。';}
function tagRangeExplorer(){return `<div class="note"><label>版本 <select id="tagq-version"><option>6.0</option><option selected>7.0</option></select></label> ${[['fourteen','14-bit Enable'],['ten','10-bit Enable'],['ext','Extended Enable']].map(([id,label])=>`<label>${label} <select id="tagq-${id}"><option value="0">0</option><option value="1" selected>1</option></select></label> `).join('')}<label>目标/路径共同能力 <select id="tagq-path">${[5,8,10,14].map(x=>`<option ${x===14?'selected':''}>${x}</option>`).join('')}</select></label><p id="tagq-result" aria-live="polite">${esc(tagRangeText('7.0',1,1,1,14))}</p></div>`;}
function txReadAddress(value){const s=String(value).trim();if(!/^(?:0x)?[0-9a-f]{1,16}$/i.test(s))return null;return BigInt(s.toLowerCase().startsWith('0x')?s:'0x'+s);}
function completionPlan(address,bytes,mrrs,mps,profile){
 const a=txReadAddress(address),sizes=[128,256,512,1024,2048,4096];
 if(a===null||!Number.isInteger(bytes)||bytes<4||bytes>4096||bytes%4||!sizes.includes(mrrs)||!sizes.includes(mps)||!['rc64','rc128','other128'].includes(profile))return null;
 if(a%4n)return {valid:false,reason:'本工具仅接受DW对齐、全BE的普通MRd。'};
 if(bytes>mrrs)return {valid:false,reason:'单笔请求超过输入MRRS，应先拆请求。'};
 if(a/4096n!==(a+BigInt(bytes)-1n)/4096n)return {valid:false,reason:'本笔地址/Length跨4-KB，应先拆请求。'};
 const rcb=profile==='rc64'?64:128;let cursor=a,remaining=bytes;const rows=[];
 while(remaining){let take=Math.min(remaining,mps);if(take<remaining)take=Number((cursor+BigInt(take))/BigInt(rcb)*BigInt(rcb)-cursor);if(take<=0) return {valid:false,reason:'给定约束无法构造该方案。'};
  rows.push({address:'0x'+cursor.toString(16),bytes:take,dw:take/4,byteCount:remaining,byteCountField:remaining===4096?0:remaining,lowerAddress:Number(cursor%128n)});cursor+=BigInt(take);remaining-=take;
 }
 return {valid:true,rcb,rows,total:bytes};
}
function completionPlanText(...args){const r=completionPlan(...args);if(!r)return '请输入64-bit十六进制地址、4～4096且为4倍数的byte数和有效尺寸选项。';if(!r.valid)return r.reason;return `一种可行方案：RCB=${r.rcb}，${r.rows.length}个CplD，总计${r.total} bytes。非唯一方案；不检查实际信用/目标支持/ATS/UIO/BCM或错误终止。\n地址 | Payload bytes | Length DW | Byte Count(解码/字段) | Lower Address\n`+r.rows.map(x=>`${x.address} | ${x.bytes} | ${x.dw} | ${x.byteCount} / 0x${x.byteCountField.toString(16)} | 0x${x.lowerAddress.toString(16).padStart(2,'0')}`).join('\n');}
function completionPlanExplorer(){return `<div class="note"><label>请求DW地址（hex） <input id="cplq-address" value="10020"></label> <label>请求byte数（全BE） <input id="cplq-bytes" type="number" value="256" min="4" step="4"></label> ${[['mrrs','Requester MRRS',512],['mps','有效Completion Payload上限',128]].map(([id,label,initial])=>`<label>${label} <select id="cplq-${id}">${[128,256,512,1024,2048,4096].map(x=>`<option ${x===initial?'selected':''}>${x}</option>`).join('')}</select></label> `).join('')}<label>Completer <select id="cplq-profile"><option value="rc64">Root Complex，RCB64</option><option value="rc128">Root Complex，RCB128</option><option value="other128">其他System Element，RCB128</option></select></label><pre id="cplq-result" style="white-space:pre-wrap" aria-live="polite">${esc(completionPlanText('10020',256,512,128,'rc64'))}</pre></div>`;}
function readByteEnable(address,dw,first,last){
 const a=txReadAddress(address);if(a===null||!Number.isInteger(dw)||dw<1||dw>1024||!/^[01]{4}$/.test(first)||!/^[01]{4}$/.test(last))return null;
 if(a%4n)return {valid:false,reason:'请求地址应为DW对齐地址；低两位由BE表达。'};
 if(a/4096n!==(a+BigInt(dw*4)-1n)/4096n)return {valid:false,reason:'请求Address/Length跨4-KB。'};
 const f=parseInt(first,2),l=parseInt(last,2),pop=x=>[0,1,2,3].reduce((s,i)=>s+((x>>i)&1),0),low=x=>{for(let i=0;i<4;i++)if(x&(1<<i))return i;return 0;},high=x=>{for(let i=3;i>=0;i--)if(x&(1<<i))return i;return 0;};
 if(dw===1&&l!==0)return {valid:false,reason:'Length1 DW时Last BE必须0000。'};
 if(dw>1&&(f===0||l===0))return {valid:false,reason:'Length大于1 DW时First/Last BE均不得为0。'};
 if(dw>1&&!(dw===2&&a%8n===0n)&&(![8,12,14,15].includes(f)||![1,3,7,15].includes(l)))return {valid:false,reason:'此长度/地址不满足QW对齐2 DW例外，使能byte必须连续。'};
 const zero=dw===1&&f===0,offset=low(f),byteCount=zero?1:dw===1?high(f)-offset+1:dw*4-offset-(3-high(l));
 return {valid:true,zero,byteCount,field:byteCount===4096?0:byteCount,lowerAddress:Number((a+BigInt(offset))%128n),enabled:dw===1?pop(f):pop(f)+pop(l)+(dw-2)*4,payloadBytes:dw*4};
}
function readByteEnableText(...args){const r=readByteEnable(...args);if(!r)return '请输入64-bit十六进制DW地址、解码后的Length1～1024 DW，以及恰好四位0/1的First/Last BE。';if(!r.valid)return '不满足本查询的普通NFM读约束：'+r.reason;return `范围内字段规则通过：Byte Count=${r.byteCount}（字段0x${r.field.toString(16)}），首包Lower Address=0x${r.lowerAddress.toString(16).padStart(2,'0')}；使能${r.enabled} bytes，完整数据区${r.payloadBytes} bytes（若全由一包返回）。${r.zero?'零字节读特殊情况：仍需1 DW Completion Payload，内容任意。':''} 仅查NFM、TH=0普通MRd的BE/地址与计数，不检查MRRS、目标访问或完整拆分。`;}
function readByteEnableExplorer(){return `<div class="note"><label>DW地址（hex） <input id="beq-address" value="1000"></label> <label>解码Length DW <input id="beq-dw" type="number" value="4" min="1" max="1024"></label> <label>First BE（二进制） <input id="beq-first" value="1000" maxlength="4"></label> <label>Last BE（二进制） <input id="beq-last" value="0001" maxlength="4"></label><p id="beq-result" aria-live="polite">${esc(readByteEnableText('1000',4,'1000','0001'))}</p></div>`;}
document.addEventListener('input',e=>{
 const id=e.target?.id||'',num=id=>{const v=$(id).value;return v.trim()===''?NaN:Number(v)};
 if(id.startsWith('tagq-'))$('#tagq-result').textContent=tagRangeText($('#tagq-version').value,num('#tagq-ext'),num('#tagq-ten'),num('#tagq-fourteen'),num('#tagq-path'));
 if(id.startsWith('cplq-'))$('#cplq-result').textContent=completionPlanText($('#cplq-address').value,num('#cplq-bytes'),num('#cplq-mrrs'),num('#cplq-mps'),$('#cplq-profile').value);
 if(id.startsWith('beq-'))$('#beq-result').textContent=readByteEnableText($('#beq-address').value,num('#beq-dw'),$('#beq-first').value,$('#beq-last').value);
});

function packetLayoutById(id){for(const f of DB.features)for(const d of f.details||[])for(const layout of d.packetLayouts||[])if(layout.id===id)return layout;return null;}
function packetFieldRange(row,start,width){const a=row*4+Math.floor(start/8),b=row*4+Math.floor((start+width-1)/8),hi=7-start%8,lo=7-(start+width-1)%8;return a===b?`Byte ${a}[${hi===lo?hi:hi+':'+lo}]`:`Byte ${a}[${hi}] → Byte ${b}[${lo}]`;}
function packetSelection(layout,key){const fragments=[];let width=0;for(let r=0;r<layout.rows.length;r++){let start=0;for(const f of layout.rows[r]){if(f.key===key){fragments.push({field:f,range:packetFieldRange(r,start,f.width)});width+=f.width;}start+=f.width;}}
 if(!fragments.length)return '选择图中的字段，查看位宽、位置和说明。';
 return `图中该逻辑字段合计 ${width} bit${fragments.length>1?'，分布在 '+fragments.length+' 个片段':''}。`+fragments.map(x=>`${x.field.label} · ${x.range} · ${x.field.width} bit：${x.field.help}`).join(' ');
}
function packetBoard(layout,key=layout.rows.flat().some(f=>f.key==='tag')?'tag':layout.rows[0][0].key){
 return `<div class="packet-view" data-packet-view="${esc(layout.id)}"><p class="packet-version">${esc(layout.version)} · ${esc(layout.lengthLabel||layout.headerBits+' bit 基础头')}</p><div class="packet-scroll" tabindex="0" role="region" aria-label="${esc(layout.title)}逐位结构，可横向滚动"><div class="packet-board">${layout.rows.map((fields,row)=>{let start=0;const bitCount=fields.reduce((n,f)=>n+f.width,0);return `<div class="packet-row-title">${esc(layout.rowLabel||'DW')} ${row} · byte ${row*4}～${row*4+Math.ceil(bitCount/8)-1} · ${bitCount} bit</div><div class="packet-byte-axis">${Array.from({length:Math.ceil(bitCount/8)},(_,i)=>i).map(i=>`<span>Byte ${row*4+i}</span>`).join('')}</div><div class="packet-bit-axis">${Array.from({length:bitCount},(_,i)=>`<span>${7-i%8}</span>`).join('')}</div><div class="packet-word">${fields.map(f=>{const at=start;start+=f.width;return `<button type="button" class="packet-field ${f.key===key?'is-selected':''} ${f.label==='R'?'is-reserved':''}" style="grid-column:span ${f.width}" data-packet-field="${esc(f.key)}" aria-pressed="${f.key===key}" title="${esc(f.label+' · '+packetFieldRange(row,at,f.width)+' · '+f.width+' bit')}"><span class="packet-field-label">${esc(f.label)}</span><small>${f.width}b</small></button>`}).join('')}${bitCount<32?`<span class="packet-unused" style="grid-column:span ${32-bitCount}">不属于该包</span>`:''}</div>`}).join('')}</div></div><p class="packet-field-help" data-packet-help role="status" aria-live="polite">${esc(packetSelection(layout,key))}</p><div class="packet-parts" aria-label="包长度组成">${layout.parts.map(p=>`<div><b>${esc(p.label)}</b><span>${esc(p.size)}</span></div>`).join('')}</div><p class="packet-note">${esc(layout.note)}</p></div>`;
}
function renderPacketLayouts(f,d){const layouts=d.packetLayouts||[];if(!layouts.length)return '';const id='packet-select-'+f.id+'-'+d.id;return `<figure class="packet-figure"><figcaption><b>逐bit包结构</b><span>每行32 bit · 点击字段联动查看</span></figcaption><label class="packet-select-label" for="${esc(id)}">选择格式 <select id="${esc(id)}" data-packet-select>${layouts.map(l=>`<option value="${esc(l.id)}">${esc(l.title)}</option>`).join('')}</select></label><p class="packet-reading">${esc(d.packetReading||'从左到右按Header byte偏移递增，每个byte内按bit 7→0展示；这是字段布局，不能当作串行发送位序。窄屏可横向滚动图，说明保持在下方。')}</p><div data-packet-body>${packetBoard(layouts[0])}</div></figure>`;}
document.addEventListener('change',e=>{if(!e.target.hasAttribute?.('data-packet-select'))return;const layout=packetLayoutById(e.target.value),figure=e.target.closest('.packet-figure');if(layout&&figure)figure.querySelector('[data-packet-body]').innerHTML=packetBoard(layout);});
document.addEventListener('click',e=>{const button=e.target.closest?.('[data-packet-field]');if(!button)return;const view=button.closest('[data-packet-view]'),layout=packetLayoutById(view.dataset.packetView),key=button.dataset.packetField;if(!layout)return;for(const b of view.querySelectorAll('[data-packet-field]')){const selected=b.dataset.packetField===key;b.classList.toggle('is-selected',selected);b.setAttribute('aria-pressed',String(selected));}view.querySelector('[data-packet-help]').textContent=packetSelection(layout,key);});

function packetFlitRegion(byte){return byte<236?'TLP':byte<242?'DLP':byte<250?'CRC':'ECC';}
function packetFlitByteText(byte){if(!Number.isInteger(byte)||byte<0||byte>255)return '请选择0～255的字节。';const region=packetFlitRegion(byte),ranges={TLP:'byte0～235 · 236 B / 1888 bit；可含多个TLP、NOP或跨Flit片段，不等于应用净数据',DLP:'byte236～241 · 6 B / 48 bit；链路控制/序号及32-bit控制负载',CRC:'byte242～249 · 8 B / 64 bit；Flit CRC，不是NFM的逐TLP LCRC',ECC:'byte250～255 · 6 B / 48 bit；三组ECC各2 byte，归组不简单沿用i mod3'};return `Flit byte ${byte}，逻辑线性bit偏移 ${byte*8}～${byte*8+7}（偏移标尺，不是串行位序）→ ${region}区。${ranges[region]}。`;}
function packetFlitMap(){return `<figure class="packet-figure packet-flit"><figcaption><b>FLIT整体结构 · 256 B = 2048 bit</b><span>Base6.0 / 7.0 · 点击任意byte查看区域</span></figcaption><p class="ft-pack-gateway">236 B里面还分包头、扩展头、数据和尾部。<a href="#feature/13/detail/flit-tlp-internal-anatomy">展开TLP区域内部结构与跨FLIT示意 →</a></p><div class="packet-flit-bar" aria-label="FLIT各区长度比例">${[['TLP',236],['DLP',6],['CRC',8],['ECC',6]].map(([k,n])=>`<span class="region-${k}" style="flex:${n}" title="${k} ${n} B"></span>`).join('')}</div><div class="packet-parts">${[['TLP','236 B / 1888 bit · byte0～235'],['DLP','6 B / 48 bit · byte236～241'],['CRC','8 B / 64 bit · byte242～249'],['ECC','6 B / 48 bit · byte250～255']].map(([k,n])=>`<div><b>${k}</b><span>${n}</span></div>`).join('')}</div><p class="packet-reading">下面每格1 byte（8 bit），按逻辑byte偏移从0到255排列。它是整个Link的一份Flit，不是每条lane各256 B；格子的数字是偏移，不是数据值。</p><div class="packet-scroll" tabindex="0" role="region" aria-label="FLIT 256字节图"><div class="packet-flit-grid">${Array.from({length:256},(_,i)=>`<button type="button" class="region-${packetFlitRegion(i)}" data-flit-map-byte="${i}" aria-label="Flit byte ${i}，${packetFlitRegion(i)}区">${i}<small>${packetFlitRegion(i)}</small></button>`).join('')}</div></div><p class="packet-field-help" data-flit-map-help role="status" aria-live="polite">${esc(packetFlitByteText(236))}</p><p class="packet-note">不含SKP等Ordered Set和线路编码开销；TLP在236-byte区域内的切分随内容而变，不能把一行/一个Flit当成一个固定大小TLP。更细的DLP位图在本页对应块中，ECC逻辑lane/组映射可用原有逐字节查询。</p></figure>`;}
function renderPacketGallery(){const entries=DB.features.flatMap(f=>(f.details||[]).filter(d=>d.packetLayouts?.length||d.packetByteLayout||d.flitTlpPacking||d.fmTlpSizeQuery).map(d=>({f,d}))),q=$('#search').value.trim().toLowerCase(),shown=entries.filter(({f,d})=>!q||[f.name,d.title,JSON.stringify(d)].join(' ').toLowerCase().includes(q));$('#content').innerHTML=`<div class="hero"><div class="eyebrow">PACKET ATLAS / TLP · DLLP · FLIT</div><h1>包有多大，字段在哪里。</h1><p>先看完整组成，再逐bit定位。图中标明版本、模式和长度口径；从下方来源按钮打开自己的PDF对照。</p></div><nav class="detail-index" aria-label="包图目录">${shown.map(({f,d})=>`<a href="#packet-map-${f.id}-${esc(d.id)}" data-packet-jump="packet-map-${f.id}-${esc(d.id)}">${esc(d.title)}</a>`).join('')}</nav>${shown.map(({f,d})=>`<article class="list-row" id="packet-map-${f.id}-${esc(d.id)}"><h2>${esc(d.title)}</h2><p><a href="${detailHref(f,d,0)}">回到功能正文与规则 →</a></p>${d.packetByteLayout?packetFlitMap():''}${d.flitTlpPacking?renderFlitTlpPacking():''}${d.fmTlpSizeQuery?fmTlpSizeExplorer():''}${renderPacketLayouts(f,d)}<div class="detail-sources">${detailSources(f,d)}</div></article>`).join('')}${shown.length?'':'<div class="empty">当前没有匹配的包图，可搜索TLP、DLLP、FLIT、Completion或InitFC。</div>'}`;document.title='包结构图 · PCIe Study';}
document.addEventListener('click',e=>{const byte=e.target.closest?.('[data-flit-map-byte]');if(byte){const figure=byte.closest('.packet-flit');figure.querySelector('[data-flit-map-help]').textContent=packetFlitByteText(Number(byte.dataset.flitMapByte));for(const b of figure.querySelectorAll('[data-flit-map-byte]'))b.classList.toggle('is-byte-selected',b===byte);}const jump=e.target.closest?.('[data-packet-jump]');if(jump){e.preventDefault();document.getElementById(jump.dataset.packetJump)?.scrollIntoView({behavior:'smooth',block:'start'});}});

const FM_TLP_COMMON_TYPES={mrd32:{code:3,base:3,data:false,read:true},mrd64:{code:32,base:4,data:false,read:true},mwr32:{code:64,base:3,data:true},mwr64:{code:96,base:4,data:true},cpl:{code:10,base:3,data:false},cpld:{code:74,base:3,data:true}};
function fmTlpSize(type,lengthRaw,ohc,ts){const t=FM_TLP_COMMON_TYPES[type];if(!t||![lengthRaw,ohc,ts].every(Number.isInteger)||lengthRaw<0||lengthRaw>1023||ohc<0||ohc>31||ts<0||ts>7)return null;const decoded=lengthRaw===0?1024:lengthRaw,e=[0,1,2,4][ohc>>3],ohcDW=(ohc&1)+((ohc>>1)&1)+((ohc>>2)&1)+e,trailerDW=[0,1,1,2,2,3,4,5][ts],payloadDW=t.data?decoded:0,totalDW=t.base+ohcDW+payloadDW+trailerDW;return {type,code:t.code,baseDW:t.base,ohcDW,trailerDW,payloadDW,requestBytes:t.read?decoded*4:null,totalBytes:totalDW*4,totalBits:totalDW*32};}
function fmTlpSizeText(type,l,o,t){const r=fmTlpSize(type,l,o,t);if(!r)return '请输入已列类型及整数范围：Raw Length0～1023、OHC0～31、TS0～7。';return `FM Type=0x${r.code.toString(16).padStart(2,'0')}：Base ${r.baseDW*4} B + OHC ${r.ohcDW*4} B + 本包Payload ${r.payloadDW*4} B + Trailer ${r.trailerDW*4} B = ${r.totalBytes} B / ${r.totalBits} bit。${r.requestBytes!==null?`请求读取 ${r.requestBytes} B，但请求Payload为0 B。`:''} 未计Local Prefix；这是格式长度计算，不验证MPS/MRRS、目标能力、必需OHC、IDE、状态、地址或组合合法性。`;}
function fmTlpSizeExplorer(){return `<div class="note flit-controls"><label>普通FM Type <select id="ftsize-type">${Object.keys(FM_TLP_COMMON_TYPES).map(k=>`<option value="${k}" ${k==='mwr64'?'selected':''}>${k.toUpperCase()}</option>`).join('')}</select></label><label>Raw Length（十进制） <input id="ftsize-length" type="number" min="0" max="1023" value="32"></label><label>OHC位图（十进制0～31） <input id="ftsize-ohc" type="number" min="0" max="31" value="0"></label><label>TS编码（十进制0～7） <input id="ftsize-ts" type="number" min="0" max="7" value="0"></label><p id="ftsize-result" aria-live="polite">${esc(fmTlpSizeText('mwr64',32,0,0))}</p></div>`;}
function fmTlpPackingModel(scenario){const sizes={single128:[128],two64:[64,64],cross256:[256]}[scenario];if(!sizes)return null;let stream=0;const pieces=[];sizes.forEach((n,i)=>{const name=String.fromCharCode(65+i),packetStart=stream;pieces.push({kind:'header',name,length:16,start:stream,packetStart});stream+=16;pieces.push({kind:'data',name,length:n,start:stream,packetStart});stream+=n;});const rows=[];
 for(let offset=0;offset<stream;offset+=236){const segments=[];for(const p of pieces){const begin=Math.max(offset,p.start),end=Math.min(offset+236,p.start+p.length);if(begin<end)segments.push({kind:p.kind,name:p.name,start:begin-offset,length:end-begin,packetOffset:begin-p.packetStart});}const used=Math.min(236,stream-offset);if(used<236)segments.push({kind:'nop',name:'NOP',start:used,length:236-used,packetOffset:null});for(const[k,start,length]of [['dlp',236,6],['crc',242,8],['ecc',250,6]])segments.push({kind:k,name:k.toUpperCase(),start,length,packetOffset:null});rows.push({index:rows.length,segments});}
 return {scenario,sizes,streamBytes:stream,rows};
}
function fmPackingLabel(s){return s.kind==='header'?'H_'+s.name:s.kind==='data'?'D_'+s.name:s.name;}
function fmPackingDescription(s){const region=`Flit byte${s.start}～${s.start+s.length-1}，${s.length} B / ${s.length*8} bit`;if(s.kind==='header'||s.kind==='data')return `${region}：TLP ${s.name}的${s.kind==='header'?'Header Base':'Data Payload'}，包内byte${s.packetOffset}～${s.packetOffset+s.length-1}。`;if(s.kind==='nop')return `${region}：${s.length/4}个1 DW NOP TLP，不是业务数据或任意填充。`;return `${region}：本FLIT自己的${s.name}，不属于TLP ${s.name==='DLP'?'内容':'Payload'}。`;}
function fmPackingBody(scenario){const m=fmTlpPackingModel(scenario);if(!m)return '';return `<div class="ft-pack-view" data-ft-pack-view="${esc(scenario)}"><p class="packet-reading">${m.sizes.map((n,i)=>`TLP ${String.fromCharCode(65+i)}：Header16 B + Payload${n} B = ${16+n} B（Length=${n/4} DW）`).join('；')}。图中H表示头，D表示数据；每个横条是一份完整256 B FLIT。</p>${m.rows.map(row=>`<section class="ft-pack-row"><h3>FLIT ${row.index}</h3><div class="packet-scroll" tabindex="0" role="region" aria-label="FLIT ${row.index}内部TLP装载"><div class="ft-pack-track">${row.segments.map((s,i)=>`<button type="button" class="ft-part-${s.kind}" style="flex:${s.length}" data-ft-pack-segment="${row.index}:${i}" title="${esc(fmPackingDescription(s))}">${esc(fmPackingLabel(s))}</button>`).join('')}</div></div><div class="ft-pack-key">${row.segments.map(s=>`<span class="ft-part-${s.kind}">${esc(fmPackingLabel(s))} · byte${s.start}～${s.start+s.length-1} · ${s.length} B${s.packetOffset!==null?' · TLP内'+s.packetOffset+'～'+(s.packetOffset+s.length-1):''}</span>`).join('')}</div></section>`).join('')}<p class="packet-field-help" data-ft-pack-help role="status" aria-live="polite">${esc(scenario==='cross256'?'第二个FLIT从TLP A的包内byte236继续，剩余36 B都是数据，不会重复发送TLP头。':'一个FLIT可包含多个TLP；每个TLP自己的Header仍占TLP区域，余下空闲位置以NOP TLP填充。')}</p><p class="packet-note">这是前提限定的示意，不是完整编码器：普通全BE MWr64，地址0x1000、Type60h、OHC=0、TS=0、无Prefix/IDE，适用MPS至少覆盖所选Payload。三个方案的每半FLIT非NOP计数均不超过4。点击横条查看片段范围。</p></div>`;}
function renderFlitTlpPacking(){return `<figure class="packet-figure"><figcaption><b>把236B展开：TLP自己的头和数据怎样装入FLIT</b><span>全Link的一份FLIT · byte不是每lane独占</span></figcaption><label class="packet-select-label">选择示意 <select data-ft-pack-select><option value="two64">两个64 B写Payload：两包共用一份FLIT</option><option value="single128">一个128 B写Payload：头+数据+NOP</option><option value="cross256">一个256 B写Payload：同一TLP跨两份FLIT</option></select></label><div data-ft-pack-body>${fmPackingBody('two64')}</div><p><a href="#feature/13/detail/fm-memory-tlp-bit-layout">继续展开Header每一bit →</a> · <a href="#feature/13/detail/fm-tlp-size-query">计算Base/OHC/Payload/Trailer长度 →</a></p></figure>`;}
document.addEventListener('input',e=>{if(!e.target.id?.startsWith('ftsize-'))return;const n=k=>{const v=$('#ftsize-'+k).value;return v.trim()===''?NaN:Number(v)};$('#ftsize-result').textContent=fmTlpSizeText($('#ftsize-type').value,n('length'),n('ohc'),n('ts'));});
document.addEventListener('change',e=>{if(!e.target.hasAttribute?.('data-ft-pack-select'))return;const figure=e.target.closest('.packet-figure');if(figure&&fmTlpPackingModel(e.target.value))figure.querySelector('[data-ft-pack-body]').innerHTML=fmPackingBody(e.target.value);});
document.addEventListener('click',e=>{const b=e.target.closest?.('[data-ft-pack-segment]');if(!b)return;const view=b.closest('[data-ft-pack-view]'),m=fmTlpPackingModel(view.dataset.ftPackView),[r,i]=b.dataset.ftPackSegment.split(':').map(Number),s=m?.rows[r]?.segments[i];if(s)view.querySelector('[data-ft-pack-help]').textContent=fmPackingDescription(s);});

function renderDetails(f){return (f.details||[]).map((d,i)=>`<section class="feature-detail" id="detail-${esc(detailKey(d,i))}"><h2>${esc(d.title)} ${f.id?`<a class="permalink" href="${detailHref(f,d,i)}" aria-label="链接到 ${esc(d.title)}">#</a>`:''}</h2>${(d.paragraphs||[]).map(p=>`<p>${esc(p)}</p>`).join('')}${d.packetByteLayout?packetFlitMap():''}${d.flitTlpPacking?renderFlitTlpPacking():''}${d.fmTlpSizeQuery?fmTlpSizeExplorer():''}${renderPacketLayouts(f,d)}${d.id==='uio-timeout-trace-query'?uioTimeoutTraceExplorer():''}${d.id==='timeout-report-policy-query'?timeoutRecoveryExplorer():''}${d.id==='l1ss-exit-timing-query'?l12ExitTimingExplorer():''}${d.id==='recovery-lock-branch-query'?recoveryLockExplorer():''}${d.id==='speed-window-target-query'?recoverySpeedExplorer():''}${d.id==='width-entry-version-query'?widthEntryExplorer():''}${d.id==='product-shared-pll-query'?sharedPllExplorer():''}${d.id==='pg5-event-query'?productPgExplorer():''}${d.id==='context-selection-query'?contextSelectionExplorer():''}${d.id==='pme-delivery-state-query'?pmeDeliveryExplorer():''}${d.id==='turnoff-gather-query'?pmeGatherExplorer():''}${d.id==='pme-native-register-query'?pmeNativeExplorer():''}${d.id==='uio-boundary-split-query'?uioBoundaryExplorer():''}${d.id==='svc-register-decoder'?svcRegisterExplorer():''}${d.id==='svc-link-configuration-query'?svcPairExplorer():''}${d.id==='svc-register-bit-diagram'?svcRegisterDiagram():''}${d.id==='refclk-removal-query'?refClockExplorer():''}${d.id==='rx-wake-evidence-query'?rxWakeExplorer():''}${d.id==='deep-pm-trace-query'?deepPmExplorer():''}${d.id==='deep-pm-original-handshake-diagram'?deepPmDependencyDiagram():''}${d.id==='restore-original-window-diagram'?restoreWindowDiagram():''}${d.id==='uio-completion-ledger-query'?uioLedgerExplorer():''}${d.id==='pam4-four-tap-query'?pam4CoefficientExplorer():''}${d.id==='rx-eval-query'?rxEvalExplorer():''}${d.id==='recal-sequence-query'?recalExplorer():''}${d.id==='message-routing-query'?messageRouteExplorer():''}${d.id==='nosnoop-policy-query'?noSnoopExplorer():''}${d.id==='tc-link-mapping-query'?tcMappingExplorer():''}${d.nelbPathDiagram?nelbPathDiagram():''}${d.id==='nelb-state-query'?nelbExplorer():''}${d.id==='prbs-period-query'?prbsPeriodExplorer():''}${d.id==='ber-window-query'?berWindowExplorer():''}${d.id==='ordering-pair-query'?orderingPairExplorer():''}${d.id==='atomic-operation-query'?atomicOperationExplorer():''}${d.id==='atomic-capability-query'?atomicCapabilityExplorer():''}${d.id==='pipe-preset-query'?pipePresetExplorer():''}${d.id==='pipe-message-transaction-query'?pipeMessageExplorer():''}${d.id==='pipe-rate-policy-query'?pipeRateExplorer():''}${d.id==='pipe-local-preset-fetch-versus-apply'?pipeTxControlFlow():''}${d.id==='compliance-all-settings'?`<label class="setting-filter-label">筛选档位／图样 <input id="compliance-filter" type="search" placeholder="如 #84、167、128 LSTP4" aria-label="筛选Compliance档位"></label><p id="setting-filter-status" class="muted" aria-live="polite">167 / 167 档；纯数字按档位编号精确匹配。</p>`:''}${d.id==='ecc-group-map'?flitByteExplorer():''}${d.id==='dlp-live-decoder'?dlpDecoder():''}${d.id==='sequence-window-explorer'?ackWindowExplorer():''}${d.id==='ats-register-decoder'?addressCapabilityExplorer('ats'):''}${d.id==='pasid-register-decoder'?addressCapabilityExplorer('pasid'):''}${d.id==='pri-register-decoder'?addressCapabilityExplorer('pri'):''}${d.id==='ats-range-explorer'?atsRangeExplorer():''}${d.id==='acs-route-explorer'?acsRouteExplorer():''}${d.id==='egress-vector-explorer'?acsVectorExplorer():''}${d.id==='enhanced-register-decoder'?acsRegisterExplorer():''}${d.id==='l1ss-entry-explorer'?l1ssEntryExplorer():''}${d.id==='l1ss-register-decoder'?l1ssRegisterExplorer():''}${d.id==='aer-register-explorer'?aerRegisterExplorer():''}${d.id==='completion-timeout-explorer'?completionTimeoutExplorer():''}${d.id==='margin-register-explorer'?marginRegisterExplorer():''}${d.id==='margin-parameter-explorer'?marginParameterExplorer():''}${d.id==='signaling-unit-explorer'?signalingUnitExplorer():''}${d.id==='dpc-trigger-explorer'?dpcTriggerExplorer():''}${d.id==='dpc-register-explorer'?dpcRegisterExplorer():''}${d.id==='obff-register-explorer'?obffRegisterExplorer():''}${d.id==='dpa-register-explorer'?dpaRegisterExplorer():''}${d.id==='budget-register-explorer'?budgetRegisterExplorer():''}${d.id==='fw-memory-query'?phyMemoryExplorer():''}${d.id==='startup-snapshot-query'?phyBootExplorer():''}${d.id==='clock-management-query'?phyClockExplorer():''}${d.id==='speed-register-query'?speedRegisterExplorer():''}${d.id==='eq-phase-query'?eqPhaseExplorer():''}${d.id==='epr-register-explorer'?eprRegisterExplorer():''}${d.id==='hotplug-slot-query'?slotSnapshotExplorer():''}${d.id==='hotplug-notification-query'?slotNotificationExplorer():''}${d.id==='npem-query'?npemExplorer():''}${d.id==='vc-register-query'?vcResourceExplorer():''}${d.id==='arb-table-query'?arbitrationLayoutExplorer():''}${d.id==='arb-phase-query'?portPhaseExplorer():''}${d.id==='ctle-response-query'?ctleResponseExplorer():''}${d.id==='rx-dfe-constraint-query'?dfeReferenceExplorer():''}${d.id==='rx-eye-target-query'?eyeCalibrationExplorer():''}${d.id==='ras-ecc-query'?rasEccExplorer():''}${d.id==='ras-parity-query'?parityDemoExplorer():''}${d.id==='cdm-semantic-query'?cdmEvidenceExplorer():''}${d.id==='tph-requester-query'?tphSnapshotExplorer():''}${d.id==='tph-table-query'?tphTableExplorer():''}${d.id==='bar-mask-query'?memoryBarExplorer():''}${d.id==='bridge-window-query'?bridgeMemoryExplorer():''}${d.id==='ecam-address-query'?ecamAddressExplorer():''}${d.id==='ptm-capability-query'?ptmSnapshotExplorer():''}${d.id==='ptm-timestamp-query'?ptmTimeExplorer():''}${d.id==='ptm-granularity-query'?ptmPathExplorer():''}${d.id==='block-alignment-query'?rxAlignmentExplorer():''}${d.id==='skp-shape-query'?skpShapeExplorer():''}${d.id==='elastic-drift-query'?elasticDriftExplorer():''}${d.id==='tag-range-query'?tagRangeExplorer():''}${d.id==='completion-plan-query'?completionPlanExplorer():''}${d.id==='byte-enable-query'?readByteEnableExplorer():''}${d.id==='ffe-coefficient-query'?eqCoefficientExplorer():''}${d.id==='rp-pio-policy-explorer'?rpPioPolicyExplorer():''}${d.table?`<div class="table-wrap" tabindex="0" role="region" aria-label="${esc(d.title)}"><table class="generation-table"><caption>${esc(d.title)}</caption><thead><tr>${d.table.columns.map(c=>`<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${d.table.rows.map(row=>`<tr ${d.id==='compliance-all-settings'?`data-setting="${esc(row[0])}"`:''}>${row.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:''}<div class="detail-sources">${detailSources(f,d)}</div></section>`).join('')}
function detailMatches(f){const words=$('#search').value.trim().toLowerCase().split(/\s+/).filter(Boolean);return words.length?(f.details||[]).map((d,i)=>({d,i})).filter(({d})=>words.every(w=>JSON.stringify(d).toLowerCase().includes(w))):[]}
function renderLookup(){const ids=[59,4,5,6,11,16,137,169,179,111,112,9,164,175,178,10,170,174,93,94,95,13,14,98,68,69,70,71,72,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,175,99,100,101,102,103,104,136,171,173,177,180,105,106,107,90,91,183,176,3,172,92,138,139,114,115,116,109,110,117,118,1,17,20,21,38,57,97,36,18,40,41,42,43,47,48,119,120,8,12,22,23,24,25,26,27,28,29,31,30,113,33],q=$('#search').value.trim();const features=ids.map(id=>DB.features.find(f=>f.id===id));$('#content').innerHTML=`<div class="hero"><div class="eyebrow">PROTOCOL REFERENCE / STATES · CREDITS · PIPE</div><h1>把协议细节，查到条件。</h1><p>按子状态、转移条件、计数、定时器和接口字段查询。每块显示明确版本及PDF物理页，选择自己的文档即可对照。</p><p>按块关联已核读的正式版正文；6.0/7.0的细节与早期修订差异分别标注，七代全部条款仍在逐项完善。</p><p><a href="#feature/1/detail/basics-topology-reading-order">按基础阅读顺序开始 →</a> · <a href="#audit">查看基础查漏对照 →</a></p></div><div class="note">输入完整子状态名或关键词，例如 Polling.Active、NPH、Merged、96 ms、RxValid、PERST、FLR、ECC、TLPs per Half Flit、ANFE、Completion Timeout、Header Log、Margin、PAM4、CTLE、DPC、RP PIO、Surprise Down。全站功能目录也会检索这些详情。</div>${features.map(f=>{const ds=q?detailMatches(f):(f.details||[]).map((d,i)=>({d,i}));return ds.length?`<article class="list-row"><span class="tag">功能 ${f.id} · ${ds.length} 个知识块</span><h2><a href="#feature/${f.id}">${esc(f.name)}</a></h2><div class="detail-links">${ds.map(({d,i})=>`<a href="${detailHref(f,d,i)}">${esc(d.title)} →</a>`).join('')}</div></article>`:''}).join('')}${q&&!features.some(f=>detailMatches(f).length)?'<div class="empty">这些专题没有匹配细节，可到全部功能搜索其他主题。</div>':''}`;document.title='协议细节查询 · PCIe Study'}
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
function renderReferences(){const q=$('#search').value.toLowerCase().trim();const docs=DB.documents.items.filter(d=>[d.title,...d.topics,d.format].join(' ').toLowerCase().includes(q));$('#content').innerHTML=`<div class="hero"><div class="eyebrow">SOURCES & PROTOCOL LOCATORS</div><h1>从说明，回到原始资料。</h1><p>规范版本、章节、页码独立保存。原始文档留在你的电脑，选择对应 PDF 后在浏览器中按页定位。</p></div>${DB.protocols.map(p=>`<article class="list-row"><span class="tag">${p.kind==='product-manual'?'产品实现资料':'已建立定位元数据'}</span><h2>${esc(p.title)} · 版本 ${esc(p.version)}</h2><p>${p.pages} 页 · ${esc(p.pageMapping)}</p><p class="muted">本地对应文件名：${esc(p.fileName||'不公开原文件名；按标题和版本选择自己的 PDF')}</p><a href="${esc(p.url)}" target="_blank" rel="noopener">${p.kind==='product-manual'?'规范目录（产品原文仅本地）':'官方资料入口'} ↗</a></article>`).join('')}<div class="note">${esc(DB.documents.readStatus)} 文件名中的版本、修订、草案状态仍需核对。目录包含项目附带文档，不能把所有候选都当成 PCIe 规范。</div><div class="toolbar"><span class="result-count">${docs.length} / ${DB.documents.candidateCount} 个文件名候选 · 使用顶部搜索筛选</span></div>${docs.slice(0,100).map(d=>`<article class="list-row"><div class="list-meta">${esc(d.format)} · ${(d.bytes/1048576).toFixed(1)} MB · ${esc(d.topics.join(' / '))}</div><h2>${esc(d.title)}</h2><p>${esc(d.status)}</p></article>`).join('')}${docs.length>100?'<p class="muted">为便于浏览，先显示前 100 项；输入关键词可缩小范围。</p>':''}`}
function renderUpdates(){$('#content').innerHTML=`<div class="hero"><div class="eyebrow">CHANGELOG</div><h1>一步一步，把每项讲清楚。</h1><p>记录真正增加、核对或修正的内容；不会为了“每天更新”批量改写已经正确的说明。</p></div><div class="timeline">${DB.changelog.map(c=>`<article><time>${esc(c.date)}</time><h2>${esc(c.title)}</h2><p>${esc(c.summary)}</p><p class="muted">${esc(c.verification)}</p>${(c.features||[]).map(id=>`<a class="tag" href="#feature/${id}">功能 ${id}</a>`).join(' ')}</article>`).join('')}</div><div class="note">下一轮优先：${DB.maintenance.nextFeatureIds.slice(0,6).map(id=>{const f=DB.features.find(f=>f.id===id);return f?esc(f.name):id}).join('、')}。每日内容完善由已配置的智能任务执行；GitHub Actions 仅负责构建与发布，不自行生成学习内容。</div>`}
function render(){const r=route();$('#edition').textContent='更新 '+(DB.coverage?.edition||DB.builtDate);document.title='PCIe Study · 功能与协议索引';if(r.startsWith('feature/')){renderFeature(Number(r.split('/')[1]));if(r.split('/')[2]==='detail')document.getElementById('detail-'+r.split('/').slice(3).join('/'))?.scrollIntoView();}else if(r==='coverage'||r.startsWith('coverage/'))renderCoverage(r.split('/')[1],r.split('/')[2]||'');else if(r==='lookup')renderLookup();else if(r==='packets')renderPacketGallery();else if(r==='phy')renderPhy();else if(r==='generations')renderGenerations();else if(r==='audit')renderAudit();else if(r==='references')renderReferences();else if(r==='updates')renderUpdates();else if(r==='bookmarks')renderHome('',true);else if(r.startsWith('group/'))renderHome(r.slice(6));else renderHome();document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',decodeURIComponent(a.hash.slice(1))===r));}
$('#groups').innerHTML=groups.map(g=>`<a href="#group/${encodeURIComponent(g)}">${esc(g)}<span>${DB.features.filter(f=>f.group===g).length}</span></a>`).join('');
$('#search').addEventListener('input',()=>{if(route().startsWith('feature/')){location.hash='home'}else render()});
document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();$('#search').focus()}if(e.key==='Escape')$('#search').blur()});
window.addEventListener('hashchange',()=>{window.scrollTo(0,0);render()});
document.addEventListener('click',e=>{const gen=e.target.closest('[data-gen]');if(gen){e.preventDefault();document.getElementById(gen.dataset.gen)?.scrollIntoView({behavior:'smooth'});return}const save=e.target.closest('[data-save]');if(save){const id=Number(save.dataset.save);saved.has(id)?saved.delete(id):saved.add(id);store();render();return}const mark=e.target.closest('[data-read]');if(mark){const id=Number(mark.dataset.read);read.has(id)?read.delete(id):read.add(id);store();render();return}const part=e.target.closest('[data-part]');if(part){e.preventDefault();document.getElementById(part.dataset.part)?.scrollIntoView({behavior:'smooth'});return}const clause=e.target.closest('[data-coverage-clause-pdf]');if(clause){const [v,k]=clause.dataset.coverageClausePdf.split(':');const x=DB.coverage.documents.find(d=>d.version===v)?.chapters.flatMap(c=>c.clauses||[]).find(c=>c.section===k);if(x)choosePdfReference(x.locator);return}const chapter=e.target.closest('[data-coverage-pdf]');if(chapter){const [v,k]=chapter.dataset.coveragePdf.split(':');const c=DB.coverage.documents.find(d=>d.version===v)?.chapters.find(c=>c.section===k);if(c)choosePdfReference(c.locator);return}const pdf=e.target.closest('[data-pdf]');if(pdf){const [id,i]=pdf.dataset.pdf.split(':').map(Number);choosePdfReference(DB.features.find(f=>f.id===id).protocolReferences[i])}});
$('#pdf-file').addEventListener('change',e=>{const file=e.target.files?.[0];if(!file||!pdfTarget)return;if(!/\.pdf$/i.test(file.name)){toast('请选择 PDF 文件');return}if(pdfUrl)URL.revokeObjectURL(pdfUrl);pdfUrl=URL.createObjectURL(file);const target=pdfUrl+'#page='+pdfTarget.pdfPage;const doc=DB.protocols.find(p=>p.id===pdfTarget.documentId);const warning=doc?.fileName&&file.name!==doc.fileName?'<p class="muted">文件名与索引记录不同，请自行确认版本和页码后再打开。</p>':'';$('#pdf-open').innerHTML=warning+`<a class="button" href="${esc(target)}" target="_blank" rel="noopener">打开本地 PDF 第 ${pdfTarget.pdfPage} 页 ↗</a><p class="muted">${esc(file.name)} · 文件未上传，版本正确性请自行确认。</p>`});
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

document.addEventListener('input',e=>{
 if(e.target.id.startsWith('lmcmd-')){const v=k=>$('#lmcmd-'+k).value;$('#lmcmd-result').textContent=marginCommandText(v('control'),v('status'),Number(v('version')),v('role'),Number(v('retimers')),v('window'),v('it')==='1',v('iv')==='1');return;}
 if(e.target.id.startsWith('lmparam-')){const p=Object.fromEntries(['cap','nv','nt','mt','mv','sampling','sample','lanes'].map(k=>[k,$('#lmparam-'+k).value]));p.rate=Number($('#lmparam-rate').value);$('#lmparam-result').textContent=marginParameterText(p);return;}
 if(e.target.id.startsWith('sigunit-')){const v=k=>$('#sigunit-'+k).value;$('#sigunit-result').textContent=v('fraction').trim()===''?'请输入UI比例。':signalingUnitText(Number(v('rate')),Number(v('lanes')),Number(v('fraction')));}
});

document.addEventListener('input',e=>{
 if(e.target.id.startsWith('dpct-')){const v=k=>$('#dpct-'+k).value;$('#dpct-result').textContent=dpcTriggerText(Number(v('mode')),v('event'),v('masked')==='1',v('already')==='1',v('software')==='1');return;}
 if(e.target.id.startsWith('dpcs-')){const v=k=>$('#dpcs-'+k).value;$('#dpcs-result').textContent=dpcSnapshotText(v('cap'),v('control'),v('status'),v('source'),v('pio'),v('role'),v('fm')==='1',v('ecs')==='1',v('active')==='1');return;}
 if(e.target.id.startsWith('rppio-')){const v=k=>$('#rppio-'+k).value;$('#rppio-result').textContent=rpPioSnapshotText(v('status'),v('mask'),v('severity'),v('sys'),v('exception'),Number(v('mode')),v('cpu')==='1',v('supported')==='1');}
});

document.addEventListener('input',e=>{
 if(e.target.id.startsWith('obff-')){const v=k=>$('#obff-'+k).value;$('#obff-result').textContent=obffText(v('cap'),v('control'),v('code'),v('link'),v('d0')==='1',v('message')==='1');return;}
 if(e.target.id.startsWith('dpa-')){const v=k=>$('#dpa-'+k).value;$('#dpa-result').textContent=dpaText(v('cap'),v('indicator'),v('status'),v('control'),v('array'));return;}
 if(e.target.id.startsWith('budget-')){const v=k=>$('#budget-'+k).value;$('#budget-result').textContent=budgetText(v('data'),v('ext')==='1',v('version'));}
});

document.addEventListener('input',e=>{
 if(e.target.id.startsWith('phymem-')){const v=k=>$('#phymem-'+k).value;$('#phymem-result').textContent=phyMemoryText(v('offset'),v('length'),v('ecc')==='1');return;}
 if(e.target.id.startsWith('phyclk-')){const v=k=>$('#phyclk-'+k).value;$('#phyclk-result').textContent=phyClockText(v('cpu'),v('apb'),v('tck'));return;}
 if(e.target.id.startsWith('phyboot-')){const v=k=>$('#phyboot-'+k).value;const o={method:v('method')};for(const k of ['supplies','reset','reference','cpuClock','loaded','runAccepted','laneDone','bootDone','bootError'])o[k]=v(k)==='1';$('#phyboot-result').textContent=phyBootText(o);}
});

document.addEventListener('input',e=>{
 if(e.target.id.startsWith('eqphase-')){const v=k=>$('#eqphase-'+k).value;$('#eqphase-result').textContent=eqPhaseText(v('role'),Number(v('phase')),Number(v('rate')));return;}
 if(e.target.id.startsWith('eqcoef-')){const v=k=>$('#eqcoef-'+k).value;$('#eqcoef-result').textContent=eqCoefficientText(v('fs'),v('lf'),v('pre'),v('main'),v('post'),v('reduced')==='1');return;}
 if(e.target.id.startsWith('speedq-')){const v=k=>$('#speedq-'+k).value;$('#speedq-result').textContent=speedSnapshotText(v('vector'),v('control'),v('status'),Number(v('rate')),v('role'),v('f0')==='1');}
});

document.addEventListener('input',e=>{if(!e.target.id.startsWith('eprq-'))return;const v=k=>$('#eprq-'+k).value;$('#eprq-result').textContent=eprSnapshotText(v('cap'),v('control'),v('status'),v('role'),v('owner')==='1',v('up')==='1',v('cause')==='1',v('form')==='1');});

document.addEventListener('input',e=>{
 if(e.target.id.startsWith('slotq-')){const v=k=>$('#slotq-'+k).value;$('#slotq-result').textContent=slotSnapshotText(v('cap'),v('control'),v('status'),v('cap2'),v('version'),v('slot')==='1',v('dll')==='1');return;}
 if(e.target.id.startsWith('slotirq-')){const v=k=>$('#slotirq-'+k).value;$('#slotirq-result').textContent=slotNotificationText(v('control'),v('status'),v('mode'),v('unmasked')==='1',v('disabled')==='1',v('previous')==='1');return;}
 if(e.target.id.startsWith('npemq-')){const v=k=>$('#npemq-'+k).value;$('#npemq-result').textContent=npemText(v('cap'),v('control'),v('status'),v('mode'));}
});

document.addEventListener('input',e=>{
 if(e.target.id.startsWith('vcq-')){const v=k=>$('#vcq-'+k).value;$('#vcq-result').textContent=vcResourceText(v('control'),v('status'),v('version'),v('index').trim()===''?NaN:Number(v('index')),v('dl')==='1',v('peer')==='1',v('pending')==='1',v('svc')==='1',v('fm')==='1');return;}
 if(e.target.id.startsWith('arbtq-')){const v=k=>$('#arbtq-'+k).value,n=k=>v(k).trim()===''?NaN:Number(v(k));$('#arbtq-result').textContent=arbitrationLayoutText(v('kind'),n('select'),n('width'),v('offset'),v('base'),n('phase'),v('cap'));return;}
 if(e.target.id.startsWith('arbph-')){const v=k=>$('#arbph-'+k).value,n=k=>v(k).trim()===''?NaN:Number(v(k));$('#arbph-result').textContent=portPhaseText(v('mode'),n('port'),n('egress'),v('available')==='1',n('count'));}
});

document.addEventListener('input',e=>{
 if(e.target.id.startsWith('rxctle-')){const v=k=>$('#rxctle-'+k).value;$('#rxctle-result').textContent=ctleResponseText(v('version'),Number(v('rate')),v('gain'),v('frequency'),v('context'));return;}
 if(e.target.id.startsWith('rxdfe-')){const v=k=>$('#rxdfe-'+k).value;$('#rxdfe-result').textContent=dfeReferenceText(v('version'),Number(v('rate')),v('h0'),v('taps'));return;}
 if(e.target.id.startsWith('rxeye-')){const v=k=>$('#rxeye-'+k).value;$('#rxeye-result').textContent=eyeCalibrationText(v('version'),Number(v('rate')),v('eh'),v('ew'),v('count'));}
});

document.addEventListener('input',e=>{
 if(e.target.id.startsWith('rasecc-')){const v=k=>$('#rasecc-'+k).value;$('#rasecc-result').textContent=rasEccText(v('kind'),v('bits').trim()===''?NaN:Number(v('bits')),v('correction')==='1',v('multi')==='1',v('ram')==='1');return;}
 if(e.target.id.startsWith('raspar-')){const v=k=>$('#raspar-'+k).value;$('#raspar-result').textContent=parityDemoText(v('sent'),v('received'),v('mode'));return;}
 if(e.target.id.startsWith('cdmev-')){const v=k=>$('#cdmev-'+k).value==='1';$('#cdmev-result').textContent=cdmEvidenceText(v('implemented'),v('complete'),v('register'),v('checker'),v('outcap'),v('outenable'),v('outerror'),v('outlogic'));}
});

// PIPE 7.1 read-only teaching tools. They do not issue hardware transactions.
function pipeUnsigned(value,max){if(typeof value!=='string'&&typeof value!=='number')return null;const s=String(value).trim();if(!/^(?:0x[0-9a-f]+|[0-9]+)$/i.test(s))return null;const n=Number(s);return Number.isSafeInteger(n)&&n>=0&&n<=max?n:null;}
function pipeMessageBytes(cmd,address,data){
 const c=pipeUnsigned(cmd,5);if(c===null)return null;
 const addr=[1,2,3].includes(c)?pipeUnsigned(address,4095):0,d=[1,2,4].includes(c)?pipeUnsigned(data,255):0;
 if(addr===null||d===null)return null;
 const out=[{byte:(c<<4)|(addr>>8),meaning:[0,4,5].includes(c)?'Cmd[3:0] | 0000':'Cmd[3:0] | Addr[11:8]'}];
 if([1,2,3].includes(c))out.push({byte:addr&255,meaning:'Addr[7:0]'});
 if([1,2,4].includes(c))out.push({byte:d,meaning:'Data[7:0]'});
 return out;
}
function pipeMessageText(cmd,address,data){const r=pipeMessageBytes(cmd,address,data);if(!r)return '请输入有效命令、12-bit地址（0～4095）和8-bit数据（0～255）；允许0x前缀。';return r.map((x,i)=>`t${i?'+'+i:''}：0x${x.byte.toString(16).toUpperCase().padStart(2,'0')} · ${x.byte.toString(2).padStart(8,'0')} · ${x.meaning}`).join('\n')+`\n传输 ${r.length} 个连续PCLK周期；不含操作完成延迟。事务内部00h仍是当前周期内容。`;}
function pipeMessageExplorer(){return `<div class="flit-explorer"><div class="flit-controls"><label>命令 <select id="pipemb-cmd"><option value="2">write_committed · 2h</option><option value="1">write_uncommitted · 1h</option><option value="3">read · 3h</option><option value="4">read completion · 4h</option><option value="5">write_ack · 5h</option><option value="0">NOP · 0h</option></select></label><label>12-bit地址 <input id="pipemb-address" value="0x402" spellcheck="false"></label><label>8-bit数据 <input id="pipemb-data" value="0x01" spellcheck="false"></label></div><pre id="pipemb-result" class="note address-query-output pipe-query-result" aria-live="polite">${esc(pipeMessageText('2','0x402','0x01'))}</pre><p class="muted">只读编码：无地址/数据的命令忽略对应输入。首拍高4 bit是Cmd，低4 bit按类型解释。</p></div>`;}
function pipePresetInfo(rate,preset){
 const r=pipeUnsigned(rate,128),p=pipeUnsigned(preset,10);if(![2,5,8,16,32,64,128].includes(r)||p===null)return null;
 if(r===2||r===5)return {rate:r,preset:p,index:null,taps:0,reason:r===2?'2.5 GT/s须选择−3.5 dB；不运行该P0～P10动态映射查询。':'5 GT/s使用低速de-emphasis编码；不运行该P0～P10动态映射查询。',deadline:r===5?128:null};
 const bank={8:'LocalFS/LocalLF：403h/404h',16:'LocalG4FS/LocalG4LF：405h/406h',32:'LocalG5FS/LocalG5LF：00Ch/00Dh',64:'LocalG6FS/LocalG6LF：408h/409h',128:'LocalG7FS/LocalG7LF：40Bh/40Ch'}[r];
 return {rate:r,preset:p,index:r===64?null:({8:0,16:11,32:22,128:45}[r]+p),taps:r>=64?4:3,bank,deadline:256,uncertain:r===64};
}
function pipePresetText(rate,preset){const x=pipePresetInfo(rate,preset);if(!x)return '请选择已列运行速率和P0～P10。';if(!x.taps)return x.reason+(x.deadline?'\n§8.6在P0的5 GT/s TX更新正文上限128 ns。':'');return `${x.rate} GT/s · P${x.preset}\n`+(x.uncertain?'LocalPresetIndex：64 GT/s表7-17存在跳号，待官方核对，不输出猜测编码。':`LocalPresetIndex：${x.index} / ${x.index.toString(2).padStart(6,'0')}b`)+`\n${x.taps} tap；PHY→MAC返回C−1/C0/C+1：400h/401h/402h低6位`+(x.taps===4?'；C−2：407h低6位':'')+`\n本端参数：${x.bank}\nMAC→PHY应用C−1/C0/C+1：402h/403h/404h低6位`+(x.taps===4?'；C−2：409h低6位':'')+'\n§8.6高速TX更新正文256 ns；§9.9即时映射/示例128 ns另有上下文和待核差异。查询映射≠应用设置≠EQ成功。';}
function pipePresetExplorer(){return `<div class="flit-explorer"><div class="flit-controls"><label>当前运行速率 <select id="pipepre-rate">${[[2,'2.5'],[5,'5'],[8,'8'],[16,'16'],[32,'32'],[64,'64'],[128,'128']].map(([v,t])=>`<option value="${v}" ${v===32?'selected':''}>${t} GT/s</option>`).join('')}</select></label><label>Preset <select id="pipepre-preset">${Array.from({length:11},(_,p)=>`<option value="${p}" ${p===4?'selected':''}>P${p}</option>`).join('')}</select></label></div><pre id="pipepre-result" class="note address-query-output pipe-query-result" aria-live="polite">${esc(pipePresetText('32','4'))}</pre></div>`;}
function pipeRatePolicy(o){
 if(!o||!['input','output'].includes(o.clock)||!['P0','P0s','P1','P2'].includes(o.power)||!['txIdle','rxStandby','rate','width','pclk','optional'].every(k=>typeof o[k]==='boolean'))return null;
 const changed=o.rate||o.width||o.pclk,allowed=['P0','P1'].includes(o.power)&&o.txIdle&&(o.power!=='P0'||o.rxStandby);
 let handshake='none';
 if(o.clock==='input'&&changed){if(!o.rate)handshake='unresolved';else handshake=o.pclk||o.optional?'required':'not-required-by-parameter';}
 return {changed,allowed,handshake};
}
function pipeRateText(o){const x=pipeRatePolicy(o);if(!x)return '请输入有效PCLK方向、功耗状态及布尔条件。';if(!x.changed)return '未请求Rate/Width/PCLK_Rate变化。工具不据此判断其他操作是否允许。';return `切换前提：${x.allowed?'满足本工具检查的P0/P1、TxElecIdle及P0的RxStandby条件':'不满足；先检查P0/P1、TxElecIdle及P0的RxStandby'}\n`+({none:'PCLK由PHY输出：不使用输入PCLK专用Ok/Ack；该拓扑为legacy，不用于PIPE7.1 Gen5及以后设计。',required:'PCLK输入：此组合要求Ok/Ack。请求→等Ok→安全切换并稳定→置Ack→PhyStatus→见Ok低撤Ack。','not-required-by-parameter':'PCLK输入：Rate改变而PCLK_Rate稳定，按本次所选PHY参数无需Ok/Ack，仍须等PhyStatus完成。',unresolved:'Rate稳定但其他项改变：表8-3标Not applicable，不能据此断言允许或免握手，须查PHY及信号规则。'}[x.handshake])+'\n完成前不得开始其他操作、再改速、改功耗或释放空闲/待机。组合是否受PHY支持仍须另核；PhyStatus不是LTSSM L0。';}
function pipeRateExplorer(){const yn=(id,title,value)=>`<label>${title} <select id="piperate-${id}"><option value="1" ${value?'selected':''}>是</option><option value="0" ${!value?'selected':''}>否</option></select></label>`;const o={clock:'input',power:'P0',txIdle:true,rxStandby:true,rate:true,width:false,pclk:true,optional:false};return `<div class="flit-explorer"><div class="flit-controls"><label>PCLK方向 <select id="piperate-clock"><option value="input">输入PHY</option><option value="output">PHY输出 · legacy</option></select></label><label>当前功耗 <select id="piperate-power">${['P0','P0s','P1','P2'].map(x=>`<option>${x}</option>`).join('')}</select></label>${yn('txIdle','TxElecIdle=1',true)}${yn('rxStandby','RxStandby=1',true)}${yn('rate','Rate改变',true)}${yn('width','Width改变',false)}${yn('pclk','PCLK_Rate改变',true)}${yn('optional','PHY要求每次Rate改变都握手',false)}</div><pre id="piperate-result" class="note address-query-output pipe-query-result" aria-live="polite">${esc(pipeRateText(o))}</pre></div>`;}
function pipeTxControlFlow(){return `<ol class="phy-flow" aria-label="本地TX动态映射与应用流程"><li>MAC请求速率＋Preset映射</li><li>PHY返回本端FS/LF与系数</li><li>MAC保存、核对并选择</li><li>MAC成组提交TxDeemph</li><li>PHY更新本端TX；协议另判EQ结果</li></ol>`;}
function pipeToolsInput(e){
 const id=e.target.id||'',v=k=>document.getElementById(k).value;
 if(id.startsWith('pipemb-'))document.getElementById('pipemb-result').textContent=pipeMessageText(v('pipemb-cmd'),v('pipemb-address'),v('pipemb-data'));
 if(id.startsWith('pipepre-'))document.getElementById('pipepre-result').textContent=pipePresetText(v('pipepre-rate'),v('pipepre-preset'));
 if(id.startsWith('piperate-')){const o={clock:v('piperate-clock'),power:v('piperate-power')};for(const k of ['txIdle','rxStandby','rate','width','pclk','optional'])o[k]=v('piperate-'+k)==='1';document.getElementById('piperate-result').textContent=pipeRateText(o);}
}
document.addEventListener('input',pipeToolsInput);
document.addEventListener('change',pipeToolsInput);

// Kept outside route rendering so every page, including deep links, has the control.
document.getElementById('back-to-top').addEventListener('click',()=>{
 document.getElementById('content').focus({preventScroll:true});
 const reduced=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 window.scrollTo({top:0,left:0,behavior:reduced?'instant':'smooth'});
});

function orderingPair(o){
 const booleans=['sameTC','ro','ido','requestersDifferent','completerDifferent','sameTransaction','noRoPass','pciBridge','knownWriteCompletion'];
 if(!o||!['P','R','N','C'].includes(o.first)||!['P','R','N','C'].includes(o.later)||!['ordinary','uio','flowide'].includes(o.scope)||!['none','same','different'].includes(o.pasidRelation)||!booleans.every(k=>typeof o[k]==='boolean'))return null;
 if(o.scope!=='ordinary')return {code:'scope',rule:'§2.4.2 / §6.33',reason:'UIO或Flow-Through IDE不在本普通排序查询范围，不能套表2-42。'};
 if(!o.sameTC)return {code:'unconstrained',rule:'§2.4.1范围',reason:'不同TC没有本表规定的排序关系；这不证明应用/平台不存在其他约束。'};
 const idRequest=o.ido&&(o.requestersDifferent||o.pasidRelation==='different');
 const result=(code,rule,reason)=>({code,rule,reason});
 if(o.first==='P'){
  if(o.later==='P')return o.ro&&!o.noRoPass||idRequest?result('may','A2b','后发RO路径未被No RO PR-PR限制，或后发IDO满足Requester/PASID条件；可以越过。'):result('no','A2a','没有有效放宽条件；No RO PR-PR只限制RO路径，不限制有效IDO。');
  if(o.later==='R')return idRequest?result('may','B2b','后发Read的IDO满足身份条件。'):result('no','B2a','Read的RO不单独放宽B2；缺少有效IDO条件。');
  if(o.later==='N')return o.ro||idRequest?result('may','C2b','假定类型允许所填属性：后发RO或有效IDO允许越过。'):result('no','C2a','后发带数据NP没有有效放宽条件。');
  return o.ro||o.ido&&o.completerDifferent||o.knownWriteCompletion?result('may','D2b','RO、IDO且Completer不同，或已确定是I/O/配置写Completion的例外。'):result('no','D2a','Completion不得越过Posted；不能用Request的PASID公式代替本条件。');
 }
 if(o.first==='R'||o.first==='N')return ['P','C'].includes(o.later)?result('must',o.later==='P'?'A3/A4':'D3/D4','必须具备越过受阻NP的能力以避免死锁；仍需遵守Credit和公平性。'):result('may','B3/B4/C3/C4','NP之间可越过，也可保持顺序。');
 if(o.later==='C')return o.sameTransaction?result('no','D5b','同Transaction ID的Completions不得越过，RO/IDO不能覆盖此规则。'):result('may','D5a','不同Transaction ID的Completions允许越过。');
 if(o.later==='P')return o.pciBridge?result('must','A5b','仅指conventional PCI模式桥内PCIe→PCI方向的特例。'):result('may','A5a','一般Posted对Completion允许越过，不要求每次越过。');
 return result('may','B5/C5','NP对Completion允许越过。');
}
function orderingPairText(o){const x=orderingPair(o);if(!x)return '请选择有效类型、适用范围和身份关系。';return `${{must:'Yes：必须允许越过',may:'Y/N：可以越过，也可保持顺序',no:'No：禁止越过',unconstrained:'不属于同TC排序域',scope:'普通矩阵不适用'}[x.code]}\n规则 ${x.rule}：${x.reason}\n先发列：${o.first}；后发行：${o.later}。RO/IDO输入只代表后发事务。属性合法性、使能、整个系统进展仍须另核。`;}
function orderingPairExplorer(){const choose=(id,label,options,selected)=>`<label>${label}<select id="ordpair-${id}">${options.map(([v,t])=>`<option value="${v}" ${String(v)===String(selected)?'selected':''}>${t}</option>`).join('')}</select></label>`,yn=(id,t,b)=>choose(id,t,[['1','是'],['0','否']],b?'1':'0'),types=[['P','P · Posted'],['R','R · NP Read'],['N','N · NP with Data'],['C','C · Completion']];const o={first:'P',later:'R',scope:'ordinary',sameTC:true,ro:true,ido:false,requestersDifferent:false,pasidRelation:'none',completerDifferent:false,sameTransaction:true,noRoPass:false,pciBridge:false,knownWriteCompletion:false};return `<div class="flit-explorer" role="group" aria-label="事务排序查询"><div class="flit-controls">${choose('first','先发事务 / 列',types,'P')}${choose('later','后发事务 / 行',types,'R')}${choose('scope','模式',[['ordinary','普通非UIO且非Flow-Through IDE'],['uio','UIO'],['flowide','Flow-Through IDE']],'ordinary')}${yn('sameTC','相同TC',true)}${yn('ro','后发RO=1',true)}${yn('ido','后发IDO=1',false)}${yn('requestersDifferent','两Request的Requester身份不同（FM含Segment）',false)}${choose('pasidRelation','两Request的PASID关系',[['none','至少一包无PASID'],['same','两包都有，相同'],['different','两包都有，不同']],'none')}${yn('completerDifferent','后发Cpl的Completer与前发P的Requester不同',false)}${yn('sameTransaction','两个Cpl属于同Transaction ID',true)}${yn('noRoPass','适用转发元件的No RO PR-PR=1',false)}${yn('pciBridge','Posted对Completion符合传统PCI桥方向特例',false)}${yn('knownWriteCompletion','确认后发Cpl对应I/O或配置写',false)}</div><pre id="ordpair-result" class="note address-query-output atomic-query-output" aria-live="polite">${esc(orderingPairText(o))}</pre><p class="muted">不能仅凭无数据Cpl推断I/O/配置写；桥特例需满足conventional PCI模式和PCIe→PCI方向。非相关输入不会影响其他单元。</p></div>`;}
function atomicHex(value,bits){if(typeof value!=='string'&&typeof value!=='number')return null;const s=String(value).trim().replace(/^0x/i,'');if(!s||s.length>Math.ceil(bits/4)||!/^[0-9a-f]+$/i.test(s))return null;return BigInt('0x'+s);}
function atomicShape(op,bits){if(!['fetchadd','swap','cas'].includes(op)||![32,64,128].includes(bits))return null;const architected=bits!==128||op==='cas',bytes=bits/8;return {architected,operandBytes:bytes,requestBytes:architected?bytes*(op==='cas'?2:1):null,requestDW:architected?bytes*(op==='cas'?2:1)/4:null,returnBytes:bytes};}
function atomicOperation(op,bits,address,old,first,second){
 const shape=atomicShape(op,bits);if(!shape)return null;if(!shape.architected)return {...shape,error:'128-bit FetchAdd/Swap没有架构定义，不能因目标支持128-bit CAS而使用。'};
 const a=atomicHex(address,64),v=atomicHex(old,bits),x=atomicHex(first,bits),y=op==='cas'?atomicHex(second,bits):0n;
 if([a,v,x,y].includes(null))return null;
 if(a%BigInt(shape.operandBytes)!==0n)return {...shape,error:'地址未按一个operand自然对齐；AtomicOp-aware Completer须作为Malformed处理。'};
 const mask=(1n<<BigInt(bits))-1n,matched=op==='cas'?v===x:null,n=op==='fetchadd'?(v+x)&mask:op==='swap'?x:matched?y:v,hex=z=>z.toString(16).toUpperCase().padStart(bits/4,'0'),bytes=z=>Array.from({length:shape.operandBytes},(_,i)=>Number((z>>BigInt(i*8))&255n));
 return {...shape,address:a.toString(16).toUpperCase(),old:hex(v),next:hex(n),matched,payload:op==='cas'?[...bytes(x),...bytes(y)]:bytes(x),returned:bytes(v),memoryEnd:(a+BigInt(shape.operandBytes)-1n).toString(16).toUpperCase()};
}
function atomicOperationText(op,bits,address,old,first,second){const r=atomicOperation(op,bits,address,old,first,second);if(!r)return '请输入有效操作、位宽、64-bit十六进制地址及对应位宽的十六进制数值；可用0x前缀。';if(r.error)return r.error;const bytes=x=>x.map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join(' ');return `请求Length=${r.requestDW} DW / Payload ${r.requestBytes} B；目标只访问${r.operandBytes} B：${r.address}h～${r.memoryEnd}h\n返回旧值：${r.old}h\n目标新值：${r.next}h${r.matched===null?'':`\nCAS比较${r.matched?'相等，更新':'不相等，保持原值（不是协议错误）'}`}\nPayload byte0起：${bytes(r.payload)}\n成功返回旧值的byte0起：${bytes(r.returned)}\n线上每个数值低有效byte先放；目标内存端序另定。这里只模拟成功执行，不判断实际能力或并发一致性。`;}
function atomicOperationExplorer(){return `<div class="flit-explorer" role="group" aria-label="原子操作结果查询"><div class="flit-controls"><label>操作<select id="atomop-op"><option value="fetchadd">FetchAdd</option><option value="swap">Swap</option><option value="cas" selected>CAS</option></select></label><label>Operand位宽<select id="atomop-bits"><option>32</option><option selected>64</option><option>128</option></select></label>${[['address','目标地址 / hex','0xFF8'],['old','目标旧值 / hex','0x1234'],['first','add / swap / compare值 / hex','0x1234'],['second','CAS第二operand：swap值 / hex','0xABCD']].map(([k,t,v])=>`<label>${t}<input id="atomop-${k}" value="${v}" spellcheck="false"></label>`).join('')}</div><pre id="atomop-result" class="note address-query-output atomic-query-output" aria-live="polite">${esc(atomicOperationText('cas',64,'0xFF8','0x1234','0x1234','0xABCD'))}</pre></div>`;}
function atomicCapability(o){
 if(!o||!['6.0','7.0'].includes(o.version)||!['ep','rp'].includes(o.role)||typeof o.known!=='boolean')return null;
 const shape=atomicShape(o.op,o.bits);if(!shape)return null;
 if(!shape.architected)return {issues:['所选Type/operand组合没有架构定义。'],gates:[],ready:false};
 const command=atomicHex(o.command,16),control=atomicHex(o.control,16),target=atomicHex(o.target,32);if([command,control,target].includes(null)||typeof o.path!=='string')return null;
 const bit=(x,n)=>!!(x&(1n<<BigInt(n))),lines=o.path.trim()?o.path.trim().split(/[\n,;]+/).map(x=>x.trim()):[];if(lines.length>64)return null;
 const gates=[{label:'Requester实际能力已由实现文档确认',ok:o.known},{label:'Requester Enable · Control2[6]',ok:bit(control,6)}];
 if(o.role==='ep'||o.version==='6.0')gates.push({label:'Bus Master Enable · Command[2]',ok:bit(command,2)});
 if(o.role==='rp'&&o.version==='7.0')gates.push({label:'RP本Link的Egress Blocking · Control2[7]清0',ok:!bit(control,7)});
 for(let i=0;i<lines.length;i++){const parts=lines[i].split('/');if(parts.length!==2)return null;const cap=atomicHex(parts[0],32),ctl=atomicHex(parts[1],16);if(cap===null||ctl===null)return null;gates.push({label:`路径端口${i+1} · Routing Supported[6]`,ok:bit(cap,6)},{label:`路径端口${i+1} · Egress Blocking[7]清0`,ok:!bit(ctl,7)});}
 const targetBit={32:7,64:8,128:9}[o.bits];gates.push({label:`目标${o.bits}-bit${o.bits===128?' CAS':''} Completer · Capabilities2[${targetBit}]`,ok:bit(target,targetBit)});
 return {gates,issues:gates.filter(g=>!g.ok).map(g=>g.label),ready:gates.every(g=>g.ok)};
}
function atomicCapabilityText(o){const r=atomicCapability(o);if(!r)return '请输入有效角色/版本与十六进制寄存器；每个路径端口一行 Capabilities2/Control2，最多64口。VF需先核PF生效值。';return `${r.ready?'已输入的门控条件通过':'仍有未确认或未满足条件'}\n`+(r.gates.length?r.gates.map(x=>`${x.ok?'✓':'待检查'} ${x.label}`).join('\n'):r.issues.join('\n'))+'\n通过不证明RC端口对、ACS、BAR/MSE、目标区域、端序、Credit或运行状态正确；Enable可写不是Requester能力证明。';}
function atomicCapabilityExplorer(){const o={version:'7.0',role:'ep',known:true,op:'fetchadd',bits:32,command:'0004',control:'0040',target:'00000180',path:'00000040/0000'};return `<div class="flit-explorer" role="group" aria-label="AtomicOp能力快照查询"><div class="flit-controls"><label>规范版本<select id="atomcap-version"><option>6.0</option><option selected>7.0</option></select></label><label>Requester角色<select id="atomcap-role"><option value="ep">Endpoint · 非VF</option><option value="rp">Root Port · CPU发起</option></select></label><label>已由实现文档确认Requester能力<select id="atomcap-known"><option value="1">是</option><option value="0">尚未确认</option></select></label><label>操作<select id="atomcap-op"><option value="fetchadd">FetchAdd</option><option value="swap">Swap</option><option value="cas">CAS</option></select></label><label>Operand位宽<select id="atomcap-bits"><option>32</option><option>64</option><option>128</option></select></label>${[['command','Requester Command / hex','0004'],['control','Requester Control2 / hex','0040'],['target','目标Capabilities2 / hex','00000180']].map(([k,t,v])=>`<label>${t}<input id="atomcap-${k}" value="${v}" spellcheck="false"></label>`).join('')}<label>路径端口 Cap2/Control2 · hex · 一行一口<textarea id="atomcap-path" rows="3" spellcheck="false">00000040/0000</textarea></label></div><pre id="atomcap-result" class="note address-query-output atomic-query-output" aria-live="polite">${esc(atomicCapabilityText(o))}</pre></div>`;}
function orderingAtomicInput(e){const id=e.target.id||'',v=k=>document.getElementById(k).value;
 if(id.startsWith('ordpair-')){const o={};for(const k of ['first','later','scope','pasidRelation'])o[k]=v('ordpair-'+k);for(const k of ['sameTC','ro','ido','requestersDifferent','completerDifferent','sameTransaction','noRoPass','pciBridge','knownWriteCompletion'])o[k]=v('ordpair-'+k)==='1';document.getElementById('ordpair-result').textContent=orderingPairText(o);}
 if(id.startsWith('atomop-'))document.getElementById('atomop-result').textContent=atomicOperationText(v('atomop-op'),Number(v('atomop-bits')),v('atomop-address'),v('atomop-old'),v('atomop-first'),v('atomop-second'));
 if(id.startsWith('atomcap-')){const o={known:v('atomcap-known')==='1',bits:Number(v('atomcap-bits'))};for(const k of ['version','role','op','command','control','target','path'])o[k]=v('atomcap-'+k);document.getElementById('atomcap-result').textContent=atomicCapabilityText(o);}
}
document.addEventListener('input',orderingAtomicInput);
document.addEventListener('change',orderingAtomicInput);

function testByteHex(value){if(typeof value==='number')return Number.isInteger(value)&&value>=0&&value<=255?value:null;if(typeof value!=='string')return null;const s=value.trim().replace(/^0x/i,'');return /^[0-9a-f]{1,2}$/i.test(s)?parseInt(s,16):null;}
function nelbPosition(arch,pos){
 if(!['original','serdes'].includes(arch)||!Number.isInteger(pos)||pos<0||pos>7)return null;
 const original=['PIPE接口边界','Elastic Buffer入口','Ser/Des的PIPE接口侧','Ser/Des的die-pad侧','高速数字/模拟路径1','PHY专有路径1','PHY专有路径2','PHY专有路径3'];
 const reserved=arch==='serdes'&&[1,2].includes(pos),coverage=pos===0?'短回送：不能证明SerDes、模拟前端或外部通道。':pos===1?'Original的Elastic Buffer入口回送；未经过的TX/RX上游段不能据此判好。':pos===2?'Original的串并边界回送；相应编码/对齐等路径仍需按图与实现确认。':pos===3?'串并路径附近内部回送；CDR/模拟前端是否经过须查具体回路，不能证明封装/PCB。':pos===4?'高速数字/模拟路径，实际覆盖、调谐与失真须查PHY；不能自动证明外部通道。':'专有路径，只有产品说明才能确定覆盖，不能按编号推断。';
 return {reserved,title:reserved?'Reserved · SerDes不定义此位置':original[pos],coverage:reserved?'不能沿用Original编码。':coverage};
}
function nelbSnapshot(o){
 const bools=['txOff','rxOff','pclk','writeAck','statusFresh','statusAck','messageExitSupported','resetAsserted'];
 if(!o||!['original','serdes'].includes(o.arch)||!['enter','exit-message','exit-reset'].includes(o.action)||!bools.every(k=>typeof o[k]==='boolean'))return null;
 const control=testByteHex(o.control),status=testByteHex(o.status),mask=testByteHex(o.mask);if([control,status,mask].includes(null))return null;
 const pos=control&7,p=nelbPosition(o.arch,pos),enabled=!!(control&128),state=!!(status&1),error=!!(status&2),supported=!!(mask&(1<<pos));const warnings=[];
 if(control&120)warnings.push('Control[6:3]保留位非0，先核输入和实现约束。');if(status&252)warnings.push('Status[7:2]保留位非0，先核快照解释。');
 if(o.arch==='original'&&!(mask&7)||o.arch==='serdes'&&!(mask&1))warnings.push('输入支持mask未包含该架构在表7-24中可用的最低支持候选；核对PHY说明。');
 const result=(stage,text)=>({position:pos,positionInfo:p,enabled,state,error,supported,warnings,stage,text});
 if(o.action==='exit-reset')return o.resetAsserted?result('reset-exit','已按lane reset退出路径处理；复位释放、PHY ready和正常训练还需另确认。'):result('need-reset','选择reset退出时需真正断言PIPE lane reset，不能把清Enable当成替代。');
 if(warnings.some(x=>x.includes('保留位')))return result('reserved','输入含保留位，工具不据此宣布操作合法或完成；不把它直接判为PCIe Malformed TLP。');
 if(!o.pclk||!o.txOff||!o.rxOff)return result('preconditions','本次消息握手写请求时，须TX/RX关闭且PCLK运行；不能在被停掉的PCLK上继续等消息。');
 if(o.action==='enter'&&!enabled||o.action==='exit-message'&&enabled)return result('control-mismatch','Enable与所选进入/消息退出动作不一致。');
 if(o.action==='enter'&&(p.reserved||!supported))return result('unsupported-position','所选位置保留或不在输入的PHY支持mask内，不能当成功路径。进入错误响应应保持正常State=0。');
 if(o.action==='exit-message'&&!o.messageExitSupported)return result('reset-required','实现未声明消息退出支持，应使用lane reset退出；清Enable可能报告NELB Error。');
 if(!o.writeAck)return result('wait-control-ack','先确认本次Control写已得到write_ack；此Ack仍不表示模式切换完成。');
 if(!o.statusFresh)return result('wait-status','等待本次操作后的新Status写入，旧State不能当作本次完成。');
 if(error)return result(o.action==='enter'&&state?'inconsistent-entry':'operation-error',o.action==='enter'&&state?'新进入响应同时Error=1、State=1，不符合进入失败保持正常的规则；核对轮次和快照。':o.action==='enter'?'进入错误：应保持正常模式，不开始NELB训练。':'退出错误：不能放行正常训练；按实现说明reset或阻止功能继续。');
 if(state!==(o.action==='enter'))return result('wait-state','新Status尚未表示目标模式；继续核PHY内部设置与本次响应。');
 if(!o.statusAck)return result('reply-status-ack','MAC还需给PHY推送的Status回write_ack，完成双向握手。');
 return result(o.action==='enter'?'entered':'normal',o.action==='enter'?'已确认本次State=1与握手收尾，可开始NELB训练；不是已经Link Up或SI认证。':'已确认本次State=0与握手收尾，可开始正常模式训练；不是已经PHY ready或L0。');
}
function nelbSnapshotText(o){const r=nelbSnapshot(o);if(!r)return '请输入有效架构/动作、8-bit十六进制Control/Status/支持mask及布尔条件。';return `位置${r.position}：${r.positionInfo.title}\nEnable=${+r.enabled} · State=${+r.state} · Error=${+r.error}\n${r.text}\n覆盖解释：${r.positionInfo.coverage}`+(r.warnings.length?'\n注意：'+r.warnings.join(' '):'')+'\n输入mask是教学示例或手册数据，不代表每个PHY的统一能力。';}
function nelbPathDiagram(){return `<figure class="nelb-path-diagram"><figcaption><b>内部回送覆盖层次 · 原创职责示意</b></figcaption><ol class="phy-flow"><li>MAC图样/比较器</li><li>PIPE边界：LB0</li><li>编码/对齐/缓冲侧：Original LB1/2；SerDes保留1/2</li><li>串并路径附近：LB3</li><li>高速数字/模拟：LB4；专有LB5～7需产品说明</li></ol><div class="note">上图按覆盖层次排列，不是每条模式都经过全部模块的单一信号连线。TX→回送点→RX的具体返回路径、f时钟/宽度适配、CDR/前端覆盖须查对应图与产品；封装、PCB和对端不因内部回环而自动被验证。</div></figure>`;}
function nelbExplorer(){const yn=(k,t,v)=>`<label>${t}<select id="nelbq-${k}"><option value="1" ${v?'selected':''}>是</option><option value="0" ${!v?'selected':''}>否</option></select></label>`;const o={arch:'serdes',action:'enter',control:'80',status:'01',mask:'19',txOff:true,rxOff:true,pclk:true,writeAck:true,statusFresh:true,statusAck:true,messageExitSupported:false,resetAsserted:false};return `<div class="flit-explorer" role="group" aria-label="NELB握手快照查询"><div class="flit-controls"><label>架构<select id="nelbq-arch"><option value="serdes">SerDes PIPE</option><option value="original">Original PIPE</option></select></label><label>所查动作<select id="nelbq-action"><option value="enter">进入</option><option value="exit-message">消息退出</option><option value="exit-reset">lane reset退出</option></select></label>${[['control','PHY 801h Control / hex','80'],['status','MAC 800h Status / hex','01'],['mask','手册支持位置mask / hex · 示例19','19']].map(([k,t,v])=>`<label>${t}<input id="nelbq-${k}" value="${v}" spellcheck="false"></label>`).join('')}${yn('txOff','本次握手写请求时TX关闭',true)}${yn('rxOff','本次握手写请求时RX关闭',true)}${yn('pclk','本次握手时PCLK运行',true)}${yn('writeAck','本次Control已收到write_ack',true)}${yn('statusFresh','已收到本次操作的新Status写入',true)}${yn('statusAck','MAC已给本次Status回Ack',true)}${yn('messageExitSupported','PHY明确支持消息退出',false)}${yn('resetAsserted','已断言lane reset',false)}</div><pre id="nelbq-result" class="note address-query-output phytest-output" aria-live="polite">${esc(nelbSnapshotText(o))}</pre></div>`;}
function phyTestNumber(value){const s=String(value).trim();if(!s)return null;const n=Number(s);return Number.isFinite(n)?n:null;}
function prbsPeriodInfo(n,gbps,seconds,confirmed){n=phyTestNumber(n);const rate=phyTestNumber(gbps),time=phyTestNumber(seconds);if(!Number.isInteger(n)||n<2||n>63||rate===null||rate<=0||time===null||time<0||!Number.isFinite(rate*1e9*time)||typeof confirmed!=='boolean')return null;if(!confirmed)return {confirmed:false,order:n};const period=(1n<<BigInt(n))-1n,periodSeconds=Number(period)/(rate*1e9);return {confirmed:true,order:n,periodBits:period.toString(),periodSeconds,cycles:time/periodSeconds,comparedBitsEstimate:rate*1e9*time};}
function phyTestFormat(x){return Number.isFinite(x)?x===0?'0':Math.abs(x)>=1e5||Math.abs(x)<1e-3?x.toExponential(6):Number(x.toPrecision(7)).toString():'超出数值范围';}
function prbsPeriodText(n,gbps,seconds,confirmed){const r=prbsPeriodInfo(n,gbps,seconds,confirmed);if(!r)return '请输入阶数2～63、正的有效比较Gbit/s和非负观察秒数。';if(!r.confirmed)return `n=${r.order}；未确认primitive/反馈约定/有效种子等最大长度条件，不输出确定周期。\n这个工具不据阶数推断产品支持或具体Polynomial。`;return `假定最大长度：2^${r.order}−1 = ${r.periodBits} bit / 周期\n一个周期约 ${phyTestFormat(r.periodSeconds)} s；所给观察时间约含 ${phyTestFormat(r.cycles)} 个周期\n按给定有效速率×时间估算比较bit数：${phyTestFormat(r.comparedBitsEstimate)}\n周期bit数为整数精确值；时间/周期数为浮点估算。输入已是bit-rate，不再乘PAM4或lane倍数；没有验证实际窗口有效。`;}
function prbsPeriodExplorer(){return `<div class="flit-explorer" role="group" aria-label="PRBS周期数学查询"><div class="flit-controls"><label>阶数n · 2～63<input id="prbsq-order" value="31" inputmode="numeric"></label><label>有效比较速率 / Gbit/s<input id="prbsq-gbps" value="32" inputmode="decimal"></label><label>观察时间 / s<input id="prbsq-seconds" value="1" inputmode="decimal"></label><label>已确认最大长度条件<select id="prbsq-confirmed"><option value="0">尚未确认</option><option value="1">是 · 按抽象最大长度模型计算</option></select></label></div><pre id="prbsq-result" class="note address-query-output phytest-output" aria-live="polite">${esc(prbsPeriodText('31','32','1',false))}</pre></div>`;}
function phyTestCount(value){const s=String(value).trim();return /^[0-9]{1,100}$/.test(s)?BigInt(s):null;}
function berWindowInfo(o){
 if(!o||!['bit','fber','symbol','event'].includes(o.metric)||typeof o.valid!=='boolean'||typeof o.iid!=='boolean')return null;
 const n=phyTestCount(o.bits),e=phyTestCount(o.errors),confidence=phyTestNumber(o.confidence),rate=phyTestNumber(o.gbps),target=phyTestNumber(o.target);
 if(n===null||n===0n||e===null||e>n||confidence===null||confidence<=0||confidence>=100||rate===null||rate<=0||!Number.isFinite(rate*1e9)||target===null||target<=0||target>=1)return null;
 const C=confidence/100,qualified=o.metric==='bit'&&o.valid&&o.iid,upper=qualified&&e===0n?-Math.expm1(Math.log1p(-C)/Number(n)):null;
 const plannedBits=Math.ceil(Math.log1p(-C)/Math.log1p(-target));if(!Number.isFinite(plannedBits))return null;
 return {bits:n.toString(),errors:e.toString(),ratio:o.metric==='bit'?Number(e)/Number(n):null,qualified,upper,plannedBits,plannedSeconds:plannedBits/(rate*1e9),confidence,target,measuredZero:e===0n,windowSeconds:Number(n)/(rate*1e9)};
}
function berWindowText(o){const r=berWindowInfo(o);if(!r)return '请输入非零整数分母、0～分母的错误数、0～100之间的置信百分比、正的有效Gbit/s及0～1之间的目标p。';let t=`输入分母N=${r.bits}；错误计数=${r.errors}\n`;
 if(r.ratio===null)t+='口径不是普通bit错误，本工具不把这些计数拼成普通BER。\n';else t+=`${o.valid?'样本bit错误比率':'原始计数比值（窗口无效，不能宣称有效BER）'}：${phyTestFormat(r.ratio)}\n`;
 if(r.upper!==null)t+=`在所选有效窗口/IID条件下，零错误的单侧${r.confidence}%上界：${phyTestFormat(r.upper)}\n`;else t+=r.measuredZero?'不输出零误码置信界：需普通bit口径、有效窗口及IID假设。\n':'已观察到错误：不使用零错误公式，未提供非零错误的置信区间。\n';
 return t+`独立的假设性零错误规划：目标p≤${phyTestFormat(r.target)}、置信${r.confidence}%时，N约 ${phyTestFormat(r.plannedBits)} bit，约 ${phyTestFormat(r.plannedSeconds)} s\n规划假定窗口连续有效且IID；它不是对本次无效数据的补救，也不是PCIe认证测试时长。时间/界限为浮点估算；PAM4和lane倍数不再另乘。`;}
function berWindowExplorer(){const o={bits:'3000000000000',errors:'0',confidence:'95',gbps:'32',target:'1e-12',valid:true,iid:true,metric:'bit'};return `<div class="flit-explorer" role="group" aria-label="BER有效窗口与统计规划"><div class="flit-controls">${[['bits','实际比较bit分母 · 整数','3000000000000'],['errors','错误计数 · 整数','0'],['confidence','单侧置信度 / %','95'],['gbps','有效比较Gbit/s','32'],['target','假设性规划目标p','1e-12']].map(([k,t,v])=>`<label>${t}<input id="berq-${k}" value="${v}" spellcheck="false"></label>`).join('')}<label>错误统计口径<select id="berq-metric"><option value="bit">普通bit错误</option><option value="fber">First-bit / FBER</option><option value="symbol">符号错误</option><option value="event">FEC / CRC等事件</option></select></label><label>窗口/分母有效、无失锁/溢出/中途清零<select id="berq-valid"><option value="1">已确认</option><option value="0">未确认或无效</option></select></label><label>接受bit错误IID统计假设<select id="berq-iid"><option value="1">是 · 仅该数学模型</option><option value="0">否 / 存在突发或选择偏差</option></select></label></div><pre id="berq-result" class="note address-query-output phytest-output" aria-live="polite">${esc(berWindowText(o))}</pre></div>`;}
function phyTestInput(e){const id=e.target.id||'',v=k=>document.getElementById(k).value;
 if(id.startsWith('nelbq-')){const o={};for(const k of ['arch','action','control','status','mask'])o[k]=v('nelbq-'+k);for(const k of ['txOff','rxOff','pclk','writeAck','statusFresh','statusAck','messageExitSupported','resetAsserted'])o[k]=v('nelbq-'+k)==='1';document.getElementById('nelbq-result').textContent=nelbSnapshotText(o);}
 if(id.startsWith('prbsq-'))document.getElementById('prbsq-result').textContent=prbsPeriodText(v('prbsq-order'),v('prbsq-gbps'),v('prbsq-seconds'),v('prbsq-confirmed')==='1');
 if(id.startsWith('berq-')){const o={valid:v('berq-valid')==='1',iid:v('berq-iid')==='1'};for(const k of ['bits','errors','confidence','gbps','target','metric'])o[k]=v('berq-'+k);document.getElementById('berq-result').textContent=berWindowText(o);}
}
document.addEventListener('input',phyTestInput);
document.addEventListener('change',phyTestInput);

// R26: read-only protocol queries. No hardware writes or device access.
function protocolByte(v,max=255){if(typeof v==='number')return Number.isInteger(v)&&v>=0&&v<=max?v:null;if(typeof v!=='string')return null;const s=v.trim().replace(/^0x/i,'');if(!/^[0-9a-f]{1,4}$/i.test(s))return null;const n=parseInt(s,16);return n<=max?n:null;}
function messageRouteInfo(o){
 if(!o||!['6.0','7.0'].includes(o.version)||!['nfm','fm'].includes(o.mode)||!['upstream','downstream'].includes(o.ingress)||!Number.isInteger(o.r)||o.r<0||o.r>7)return null;
 const names=['到RC','按地址','按ID','从RC广播','本地终止','汇聚到RC','保留编码','保留编码'];
 const paths=['Switch Upstream出口','与Memory地址路由相同','与Completion的ID路由相同','全部Switch Downstream出口','当前接收器终止','PME_TO_Ack专用汇聚规则','接收器终止','接收器终止'];
 const wrong=o.r===0&&o.ingress==='upstream'||o.r===3&&o.ingress==='downstream'||o.r===5&&o.ingress==='upstream';
 const notes=['仅解释r，不证明具体Message Code / Msg或MsgD组合合法。Posted消息不要求Completion。'];
 if(wrong)notes.push('所选入口违反该方向规则；Switch可选检查，实施后违规按Malformed TLP归接收Port。');
 if(o.r===5)notes.push('101只允许PME_TO_Ack；其他Code即属错误。完整汇聚时序不在本查询范围。');
 if(o.r===1){notes.push('所引Base消息表未定义实际采用地址路由的消息，须另查具体消息规范。');notes.push(o.version==='7.0'&&o.mode==='fm'?'7.0 FM地址路由Message：AT=01保留；支持FM的组件需64-bit地址，低于4GiB高32位填0。':'本选择AT=00；不能从7.0规则倒推早期低地址消息格式。');}
 else notes.push('本选择AT=00；接收端不要求或鼓励检查AT。');
 if(o.mode==='fm'&&o.r===2)notes.push('跨Segment需OHC-A4、DSV=1；DSV=0时Destination Segment=00h。需PASID也必须A4。');
 if(o.version==='7.0'&&o.mode==='fm'&&o.r===0)notes.push('需要PASID / ER / PMR的到RC消息必须包含OHC-A1。');
 if(o.r>=6)notes.push('保留路由不是合法消息构造许可，不应将其透明泛洪。');
 return {r:o.r,name:names[o.r],path:paths[o.r],directionError:wrong,reserved:o.r>=6,notes};
}
function messageRouteText(o){const r=messageRouteInfo(o);return r?`r=${r.r.toString(2).padStart(3,'0')}：${r.name}\n基本动作：${r.path}\n${r.notes.join('\n')}`:'请选择Base6.0/7.0、NFM/FM、Switch入口与0～7路由编码。';}
function messageRouteExplorer(){const o={r:0,version:'7.0',mode:'fm',ingress:'downstream'};return `<div class="flit-explorer" role="group" aria-label="Message路由查询"><div class="flit-controls"><label>Base版本<select id="msgq-version"><option>7.0</option><option>6.0</option></select></label><label>当前模式<select id="msgq-mode"><option value="fm">FM</option><option value="nfm">NFM</option></select></label><label>Switch收到包的入口<select id="msgq-ingress"><option value="downstream">Downstream Port</option><option value="upstream">Upstream Port</option></select></label><label>r[2:0]<select id="msgq-r">${['到RC','按地址','按ID','RC广播','Local','Gathered','Reserved','Reserved'].map((x,i)=>`<option value="${i}">${i.toString(2).padStart(3,'0')} · ${x}</option>`).join('')}</select></label></div><pre id="msgq-result" class="note address-query-output protocol-query-output" aria-live="polite">${esc(messageRouteText(o))}</pre></div>`;}
function noSnoopInfo(o){
 if(!o||!['memory','msi','cfg','io','message','uio'].includes(o.kind)||typeof o.uncached!=='boolean')return null;
 const attr=protocolByte(o.attr,7),control=protocolByte(o.control,65535);if(attr===null||control===null)return null;
 const ns=!!(attr&1),ro=!!(attr&2),ido=!!(attr&4),enabled=!!(control&0x800);let stage;
 if(!ns)stage='not-requested';else if(['msi','cfg','io'].includes(o.kind))stage='forbidden';else if(o.kind==='message')stage='message-review';else if(!enabled)stage='disabled';else if(!o.uncached)stage='cache-unproven';else if(o.kind==='uio')stage='uio-review';else stage='necessary-conditions';
 return {attr,control,ns,ro,ido,enabled,stage};
}
function noSnoopText(o){const r=noSnoopInfo(o);if(!r)return '请输入0～7的逻辑Attr和0～FFFF的Device Control十六进制快照，并确认请求类别与缓存条件。';
 const text={'not-requested':'No Snoop未置位：该事务期望硬件一致性；此结果不验证RO/IDO及整个事务合法性。',forbidden:'此请求语义必须清No Snoop；Enable=1也不能覆盖类型限制。','message-review':'Message通常不允许NS，只有具体定义的例外可用；本查询不放行消息例外。',disabled:'No Snoop已置位但Device Control[11]=0，不满足发起许可。','cache-unproven':'Enable=1仍不够：尚未证明地址不在系统任何cache中。','uio-review':'普通NS许可前提具备，但UIO需额外检查Group II同Transaction ID属性一致及FM/VC等规则，本查询不判完整通过。','necessary-conditions':'所引NS必要条件具备，仍非平台DMA同步、映射/隔离或整体事务合法性证明。'};
 return `逻辑Attr：IDO=${Number(r.ido)} / RO=${Number(r.ro)} / No Snoop=${Number(r.ns)}\nDevice Control（PCIe Capability+08h）[11]=${Number(r.enabled)}\n${text[r.stage]}\n输入为普通Function的Device Control；VF对应位置保留。NS不改变排序，也不强制禁止硬件snoop。`;
}
function noSnoopExplorer(){const o={kind:'memory',attr:'1',control:'0800',uncached:false};return `<div class="flit-explorer" role="group" aria-label="No Snoop必要条件查询"><div class="flit-controls"><label>请求语义<select id="nsq-kind">${[['memory','普通MRd/MWr'],['msi','MSI/MSI-X写'],['cfg','Configuration'],['io','I/O'],['message','Message · 不自动放行例外'],['uio','UIO · 仅显示额外核对']].map(([k,t])=>`<option value="${k}">${t}</option>`).join('')}</select></label><label>逻辑Attr[2:0] · hex<input id="nsq-attr" value="1" spellcheck="false"></label><label>Device Control WORD · hex<input id="nsq-control" value="0800" spellcheck="false"></label><label>已保证该地址不在系统任何cache中<select id="nsq-uncached"><option value="0">未证明</option><option value="1">是 · 平台契约已建立</option></select></label></div><pre id="nsq-result" class="note address-query-output protocol-query-output" aria-live="polite">${esc(noSnoopText(o))}</pre></div>`;}
function tcBitmapArray(v){if(typeof v!=='string')return null;const a=v.trim().split(/[\s,]+/);if(a.length!==8)return null;const n=a.map(s=>protocolByte(s));return n.some(x=>x===null)?null:n;}
function tcMappingInfo(o){
 if(!o||!['traditional','svc-uio'].includes(o.scope)||!Number.isInteger(o.tc)||o.tc<0||o.tc>7)return null;
 const a=tcBitmapArray(o.a),b=tcBitmapArray(o.b),ea=protocolByte(o.ea),eb=protocolByte(o.eb);if(!a||!b||ea===null||eb===null)return null;
 const targets=(arr,t)=>arr.flatMap((mask,i)=>mask&(1<<t)?[i]:[]),issues=[];
 if(o.scope!=='traditional')return {scope:o.scope,issues:['SVC/UIO有专属默认分配和模式约束，不用传统静态映射判通过。'],ok:false,selected:null};
 for(const [name,arr,en]of [['A',a,ea],['B',b,eb]]){
  if(!(en&1))issues.push(`${name}：VC0必须启用。`);
  const zero=targets(arr,0);if(zero.length!==1||zero[0]!==0)issues.push(`${name}：TC0必须且只能映射VC0。`);
  for(let t=0;t<8;t++)if(targets(arr,t).length>1)issues.push(`${name}：TC${t}重复映到多个VC（含未启用资源）。`);
 }
 for(let t=0;t<8;t++)if(targets(a,t).join(',')!==targets(b,t).join(','))issues.push(`TC${t}链路两端映射不一致。`);
 if(ea!==eb)issues.push('两端启用VC ID集合不匹配；不能确认一致配置。');
 const ta=targets(a,o.tc),tb=targets(b,o.tc),activeA=ta.filter(v=>ea&(1<<v)),activeB=tb.filter(v=>eb&(1<<v));
 if(activeA.length!==1)issues.push(`所选TC${o.tc}在A端没有唯一已启用VC映射。`);
 if(activeB.length!==1)issues.push(`所选TC${o.tc}在B端没有唯一已启用VC映射。`);
 return {scope:o.scope,issues,ok:issues.length===0,selected:{tc:o.tc,a:ta,b:tb,activeA,activeB}};
}
function tcMappingText(o){const r=tcMappingInfo(o);if(!r)return '每端需8个0～FF十六进制TC位图（顺序为VC0～7），启用位图0～FF，TC选择0～7。';if(!r.selected)return r.issues.join('\n');const x=r.selected;
 return `TC${x.tc}：A端→${x.a.map(v=>'VC'+v).join(', ')||'未映射'}；B端→${x.b.map(v=>'VC'+v).join(', ')||'未映射'}\n${r.ok?'已检查的传统静态映射条件一致；Enable不证明协商完成。':r.issues.join('\n')}\n未映射到已启用VC的事务可能触发TC过滤/Malformed，不能简单视为Credit不足。\n本工具不检查Credit、仲裁、实际缓冲/资源个数、MFVC内部层级、SVC/UIO或端到端QoS保证。`;
}
function tcMappingExplorer(){const o={scope:'traditional',tc:7,a:'7F 80 00 00 00 00 00 00',b:'7F 80 00 00 00 00 00 00',ea:'03',eb:'03'};return `<div class="flit-explorer" role="group" aria-label="传统TC到VC链路映射检查"><div class="flit-controls"><label>规则范围<select id="tcq-scope"><option value="traditional">传统VC静态映射</option><option value="svc-uio">SVC/UIO · 另需专属规则</option></select></label><label>所选TC<select id="tcq-tc">${Array.from({length:8},(_,i)=>`<option value="${i}" ${i===7?'selected':''}>TC${i}</option>`).join('')}</select></label>${[['a','A端：VC0～7的TC位图',o.a],['b','B端：VC0～7的TC位图',o.b],['ea','A端启用VC位图 · hex',o.ea],['eb','B端启用VC位图 · hex',o.eb]].map(([k,t,v])=>`<label>${t}<input id="tcq-${k}" value="${v}" spellcheck="false"></label>`).join('')}</div><pre id="tcq-result" class="note address-query-output protocol-query-output" aria-live="polite">${esc(tcMappingText(o))}</pre></div>`;}
function protocolQueryInput(e){const id=e.target.id||'',v=k=>document.getElementById(k).value;
 if(id.startsWith('msgq-'))document.getElementById('msgq-result').textContent=messageRouteText({version:v('msgq-version'),mode:v('msgq-mode'),ingress:v('msgq-ingress'),r:Number(v('msgq-r'))});
 if(id.startsWith('nsq-'))document.getElementById('nsq-result').textContent=noSnoopText({kind:v('nsq-kind'),attr:v('nsq-attr'),control:v('nsq-control'),uncached:v('nsq-uncached')==='1'});
 if(id.startsWith('tcq-')){const o={tc:Number(v('tcq-tc'))};for(const k of ['scope','a','b','ea','eb'])o[k]=v('tcq-'+k);document.getElementById('tcq-result').textContent=tcMappingText(o);}
}
document.addEventListener('input',protocolQueryInput);
document.addEventListener('change',protocolQueryInput);

// R27: numerical teaching models and read-only interface snapshots.
function eqInteger(v,max=63){if(typeof v==='number')return Number.isInteger(v)&&v>=0&&v<=max?v:null;if(typeof v!=='string'||!/^\d+$/.test(v.trim()))return null;const n=Number(v);return Number.isSafeInteger(n)&&n<=max?n:null;}
function pam4CoefficientInfo(o){
 if(!o||!['6.0','7.0'].includes(o.version)||!['full','reduced'].includes(o.swing))return null;
 const n={};for(const k of ['rate','fs','lf','a2','a1','c0','ap']){n[k]=eqInteger(o[k],k==='rate'?128:63);if(n[k]===null)return null;}
 if(![64,128].includes(n.rate))return null;
 if(o.version==='6.0'&&n.rate===128)return {supported:false,reason:'Base6.0本轮依据仅覆盖64GT/s，不替128GT/s作规范判断。'};
 const {fs,lf,a2,a1,c0,ap}=n,sum=a2+a1+c0+ap,low=c0-a1+a2-ap,min=o.swing==='full'?24:12;
 const checks=[['FS范围',fs>=min&&fs<=63,`${min} ≤ ${fs} ≤ 63`],['C0为正',c0>0,`${c0} > 0`],['第一前游标',a1<=Math.floor(fs/4),`${a1} ≤ floor(${fs}/4)=${Math.floor(fs/4)}`],['绝对值预算',sum===fs,`${a2}+${a1}+${c0}+${ap}=${sum}；FS=${fs}`],['LF下限',low>=lf,`${c0}−${a1}+${a2}−${ap}=${low} ≥ ${lf}`],['第二前游标',a2<=Math.floor(fs/8),`${a2} ≤ floor(${fs}/8)=${Math.floor(fs/8)}`]];
 const signed=[a2,-a1,c0,-ap],norm=fs>0?signed.map(v=>v/fs):null;let volts=null,db=null;
 if(norm){const [c2,c1,main,post]=norm;volts={Va:c2+c1+main-post,Vb:c2+c1+main+post,Vc1:c2-c1+main+post,Vc2:-c2+c1+main+post,Vd:c2-c1+main-post};if(Object.values(volts).every(v=>v>0))db={de:20*Math.log10(volts.Vb/volts.Va),pre1:20*Math.log10(volts.Vc1/volts.Vb),pre2:20*Math.log10(volts.Vc2/volts.Vb),boost:20*Math.log10(volts.Vd/volts.Vb)};}
 return {supported:true,...n,checks,valid:checks.every(x=>x[1]),signed,norm,sum,low,volts,db};
}
function eqDisplay(n){return Number.isFinite(n)?Number(n.toPrecision(6)).toString():'未定义';}
function pam4CoefficientText(o){const r=pam4CoefficientInfo(o);if(!r)return '请选择Base6.0/7.0及64/128GT/s，输入0～63的十进制整数FS/LF和四tap幅值。';if(!r.supported)return r.reason;
 let t=r.checks.map(([name,pass,expr])=>`${pass?'✓':'×'} ${name}：${expr}`).join('\n');t+=`\n物理符号（整数幅度尺度）：[${r.signed.join(', ')}]\n${r.valid?'所引数字必要条件通过':'至少一项数字必要条件失败'}；不等于Preset电气精度、信道或BER通过。`;
 if(r.volts)t+='\n理想归一化电平：'+Object.entries(r.volts).map(([k,v])=>`${k}=${eqDisplay(v)}`).join('，');
 t+=r.db?`\n理想dB：de-emphasis=${eqDisplay(r.db.de)}，pre1=${eqDisplay(r.db.pre1)}，pre2=${eqDisplay(r.db.pre2)}，boost=${eqDisplay(r.db.boost)}`:'\n参考电平非正或FS为0：不输出相应dB。';
 return t+'\n电平/比值是输入系数的数学结果；无效候选也不能用这些结果绕过失败项。';
}
function pam4FirSamples(r){if(!r||!r.supported||!r.norm)return null;const input=[-1,-1,-1/3,1/3,1,1,-1,-1/3,1,1/3,-1,1,1/3,1/3,-1/3,-1];const [c2,c1,c0,cp]=r.norm;const rows=[];for(let n=2;n<input.length-1;n++)rows.push({n,input:input[n],output:c2*input[n-2]+c1*input[n-1]+c0*input[n]+cp*input[n+1]});return rows;}
function pam4FirDiagram(o){const r=pam4CoefficientInfo(o),a=pam4FirSamples(r);if(!a)return '<p class="muted">输入有效FS及支持的版本/速率后显示数学模型。</p>';const max=Math.max(1,...a.map(x=>Math.abs(x.output)))*1.15,x=i=>55+i*650/(a.length-1),y=v=>130-v/max*90,pts=k=>a.map((v,i)=>`${x(i).toFixed(2)},${y(v[k]).toFixed(2)}`).join(' ');
 return `<figure class="eq-fir-figure"><figcaption>原创离散TX FIR演示 · ${r.valid?'数字必要条件通过':'无效候选，仅展示计算'} · 不是眼图/真实电压测量</figcaption><div class="eq-taps">${['c−2','c−1','c0','c+1'].map((t,i)=>`<span>${t}<strong>${eqDisplay(r.norm[i])}</strong></span>`).join('')}</div><svg viewBox="0 0 760 270" role="img" aria-label="固定PAM4符号串经过四抽头加权后的离散样本；蓝线为输入，橙线为输出。"><line x1="50" y1="130" x2="720" y2="130" stroke="currentColor" opacity=".25"/><polyline points="${pts('input')}" fill="none" stroke="#4c8bdc" stroke-width="2" stroke-dasharray="6 4"/><polyline points="${pts('output')}" fill="none" stroke="#df8234" stroke-width="3"/>${a.map((v,i)=>`<circle cx="${x(i)}" cy="${y(v.output)}" r="3.5" fill="#df8234"/>`).join('')}<text x="55" y="24" fill="currentColor">蓝虚线 x[n]：−1、−1/3、+1/3、+1</text><text x="55" y="246" fill="currentColor">橙线 y[n]：按明确索引加权；纵轴为归一化幅度，非mV</text></svg><p class="muted">y[n]=c−2·x[n−2]+c−1·x[n−1]+c0·x[n]+c+1·x[n+1]。图内不含信道、带宽、抖动、RX或FEC。</p></figure>`;
}
function pam4CoefficientExplorer(){const o={version:'7.0',rate:'64',swing:'full',fs:'48',lf:'16',a2:'6',a1:'12',c0:'26',ap:'4'};return `<div class="flit-explorer" role="group" aria-label="PAM4四抽头必要约束与理想电压"><div class="flit-controls"><label>Base版本<select id="p4q-version"><option>7.0</option><option>6.0</option></select></label><label>GT/s<select id="p4q-rate"><option>64</option><option>128</option></select></label><label>摆幅模式<select id="p4q-swing"><option value="full">Full swing</option><option value="reduced">Reduced swing</option></select></label>${[['fs','FS','48'],['lf','LF','16'],['a2','|C−2| · 正物理tap','6'],['a1','|C−1| · 负物理tap','12'],['c0','C0','26'],['ap','|C+1| · 负物理tap','4']].map(([k,t,v])=>`<label>${t}<input id="p4q-${k}" value="${v}" inputmode="numeric"></label>`).join('')}</div><pre id="p4q-result" class="note protocol-query-output" aria-live="polite">${esc(pam4CoefficientText(o))}</pre><div id="p4q-figure">${pam4FirDiagram(o)}</div></div>`;}
function rxDirectionInfo(rate,b0,b1){const r=eqInteger(rate,128),a=protocolByte(b0),b=protocolByte(b1);if(![8,16,32,64,128].includes(r)||a===null||b===null)return null;const pam=r>=64,steps=pam?[0,1,-1,2,-2,4,-4,null]:[0,1,-1,null],codes=pam?[[a&7,'C−2'],[(a>>4)&7,'C−1'],[b&7,'C0'],[(b>>4)&7,'C+1']]:[[a&3,'C−1'],[(a>>2)&3,'C0'],[(a>>4)&3,'C+1']];return {pam,reservedBits:pam?!!((a|b)&0x88):!!(a&0xc0),directions:codes.map(([code,tap])=>({tap,code,step:steps[code],ignored:r===8&&tap==='C0',physicalStep:steps[code]===null?null:steps[code]*(tap==='C−1'||tap==='C+1'?-1:1)}))};}
function rxEvalInfo(o){if(!o||!['01','2','3'].includes(o.phase)||!['fom','direction'].includes(o.kind))return null;for(const k of ['issued','requestAck','fresh','committed','feedbackAck','aborted'])if(typeof o[k]!=='boolean')return null;
 const control=protocolByte(o.control),fom=protocolByte(o.fom),direction=rxDirectionInfo(o.rate,o.d0,o.d1);if(control===null||fom===null||!direction)return null;
 const active=!!(control&1),progress=!!(control&2),invalid=!!(control&4);let stage;
 if(o.aborted)stage='ignore-aborted';else if(o.phase==='01')stage='phase01-scope';else if(!o.issued)stage=o.fresh?'unassociated-feedback':'idle';else if(invalid)stage='retry-last-valid';else if(!o.requestAck)stage='control-ack';else if(active&&!progress)stage='missing-progress';else if(!o.fresh||!o.committed)stage='wait-feedback';else if(o.kind==='direction'&&direction.directions.some(x=>x.step===null&&!x.ignored))stage='reserved-feedback';else if(!o.feedbackAck)stage='feedback-ack';else stage='completed';
 return {stage,control,fom,active,progress,invalid,direction,reservedControl:!!(control&0xf8)};
}
function rxEvalText(o){const r=rxEvalInfo(o);if(!r)return '请选择所列速率、Phase与格式，输入合法byte快照，并提供本次消息事件上下文。';const states={'phase01-scope':'Phase0/1另有Preset已应用提示和生命周期条件；本查询不套Phase2/3完成判据。','ignore-aborted':'已中止：包括与反馈重叠的情形，MAC必须忽略本次迟到反馈，不据FOM推进。','unassociated-feedback':'有反馈但未确认本次请求：不能沿用旧事件证明完成。',idle:'未确认有本次评估请求。','retry-last-valid':'InvalidRequest已置位：先使PHY获知无效，再按最后有效设置重评；新Eval时可同拍清0。','control-ack':'尚未确认最初控制写的Ack；核对消息账本，该Ack本身也不是评估完成。','missing-progress':'Phase2/3里Eval有效却没有阶段InProgress，需核对控制上下文。','wait-feedback':'等待本次新反馈的write_committed；数值相同不代表未完成，旧读值也不代表完成。','reserved-feedback':'方向包含保留编码：不能据它计算/应用候选，先核支持格式与事件。','feedback-ack':'本次反馈已提交，应回消息Ack；这与最初控制写Ack不同。',completed:'已观察到所输入的本次反馈提交/应答；可按正常流程结束本次Eval，不代表整个均衡或Link Up完成。'};
 let t=`Control3：Eval=${Number(r.active)}，InProgress=${Number(r.progress)}，InvalidRequest=${Number(r.invalid)}\n${states[r.stage]}\n`;
 if(o.kind==='fom')t+=`FOM=${r.fom}（0最差/255最好；无通用通过阈值）。\n`;else t+=r.direction.directions.map(x=>`${x.tap}：${x.ignored?'8GT/s忽略主tap建议':x.step===null?'保留编码':`幅值步进${x.step>=0?'+':''}${x.step}；物理符号步进${x.physicalStep>=0?'+':''}${x.physicalStep}`}`).join('\n')+'\n';
 if(r.reservedControl||o.kind==='direction'&&r.direction.reservedBits)t+='检测到保留位置非零：仅报告快照，不自行推导额外Malformed规则。\n';return t+'反馈格式按PHY能力选择，不需要同时等FOM和方向；不自动应用系数，不设统一超时。';
}
function eqBoolSelect(id,title,v){return `<label>${title}<select id="${id}"><option value="1" ${v?'selected':''}>是</option><option value="0" ${!v?'selected':''}>否 / 未确认</option></select></label>`;}
function rxEvalExplorer(){const o={rate:'64',phase:'2',kind:'fom',control:'03',fom:'00',d0:'00',d1:'00',issued:true,requestAck:true,fresh:true,committed:true,feedbackAck:true,aborted:false};return `<div class="flit-explorer" role="group" aria-label="RX评估反馈与中止查询"><div class="flit-controls"><label>GT/s<select id="rxev-rate">${[8,16,32,64,128].map(v=>`<option ${v===64?'selected':''}>${v}</option>`).join('')}</select></label><label>Phase范围<select id="rxev-phase"><option value="2">Phase2</option><option value="3">Phase3</option><option value="01">Phase0/1 · 另查条件</option></select></label><label>PHY反馈格式<select id="rxev-kind"><option value="fom">FOM</option><option value="direction">方向</option></select></label>${[['control','Control3 · hex','03'],['fom','FOM byte · hex','00'],['d0','NRZ Bh / PAM4 Eh · hex','00'],['d1','PAM4 Fh · NRZ忽略 · hex','00']].map(([k,t,v])=>`<label>${t}<input id="rxev-${k}" value="${v}" spellcheck="false"></label>`).join('')}${[['issued','已确认本次请求',true],['requestAck','初始控制写已Ack',true],['fresh','反馈属于本次',true],['committed','反馈已write_committed',true],['feedbackAck','已回反馈消息Ack',true],['aborted','本次已中止（含与反馈重叠）',false]].map(([k,t,v])=>eqBoolSelect('rxev-'+k,t,v)).join('')}</div><pre id="rxev-result" class="note protocol-query-output" aria-live="polite">${esc(rxEvalText(o))}</pre></div>`;}
function recalInfo(o){if(!o||!['yes','no','unknown'].includes(o.support)||!['controller','phy'].includes(o.origin))return null;for(const k of ['nelb','pclk','notified','noticeAck','recovery','requested','requestAck','doneFresh','doneAck'])if(typeof o[k]!=='boolean')return null;let stage;
 if(o.support!=='yes')stage='check-support';else if(o.nelb)stage='nelb-forbidden';else if(!o.pclk)stage='need-clock';else if(o.origin==='phy'&&!o.notified)stage='need-notice';else if(o.origin==='phy'&&!o.noticeAck)stage='ack-notice';else if(!o.recovery)stage='need-recovery';else if(!o.requested)stage='need-request';else if(!o.requestAck)stage='request-ack';else if(!o.doneFresh)stage='wait-done';else if(!o.doneAck)stage='done-ack';else stage='exit-permitted';return {stage,origin:o.origin};}
function recalText(o){const r=recalInfo(o);if(!r)return '请提供支持情况、发起方向与本次校准事件上下文。';const t={'check-support':'先核PHY是否实现/要求该可选握手，不假设所有PIPE7.1 PHY均支持。','nelb-forbidden':'DNELB中禁止IORecal；可能没有响应，不能按正常模式强等Done。','need-clock':'Message Bus需要PCLK运行，先完成必要时钟/功耗恢复。','need-notice':'所选PHY发起路径尚未观察本次PhyIORecalRequest。','ack-notice':'应确认收到本次PHY通知并回消息Ack；通知不是校准已完成。','need-recovery':'本次必须已确认进入Recovery，不能在L0按正常数据操作执行Recal。','need-request':'MAC随后通过PHY 4h[1]发IORecal；PHY通知不替代该请求。','request-ack':'核对本次控制写Ack；Ack不等于重新校准完成。','wait-done':'等待PHY通过MAC 5h[1]发送本次IORecalDone，不复用旧Done。','done-ack':'本次完成事件已到，应回消息Ack；操作完成与消息应答各自记录。','exit-permitted':'本次完成链条已按输入确认，可按LTSSM规则退出Recovery；还不等于L0/DL_Active或业务恢复。'};return t[r.stage]+'\nRxEqTrainDone（MAC5h[0]）不能冒充IORecalDone（MAC5h[1]）。\n不驱动硬件，不规定通用校准超时，不推断固件重载或全局复位。';}
function recalFlowDiagram(){return `<figure class="recal-flow-figure"><figcaption>原创IORecal流程 · 方框是接口里程碑，非完整LTSSM状态机</figcaption><ol class="recal-flow"><li><strong>PHY可选通知</strong><span>PHY→MAC：6h[0]<br>PhyIORecalRequest + Ack</span></li><li><strong>Recovery / PCLK</strong><span>MAC确认协议前提<br>控制器主动发起从此步开始</span></li><li><strong>请求重新校准</strong><span>MAC→PHY：4h[1]<br>IORecal + 请求写Ack</span></li><li><strong>等待新完成事件</strong><span>PHY→MAC：5h[1]<br>IORecalDone + Ack</span></li><li><strong>允许按规则恢复</strong><span>退出Recovery另依LTSSM<br>不直接等同Link Up</span></li></ol></figure>`;}
function recalExplorer(){const o={support:'yes',origin:'phy',nelb:false,pclk:true,notified:true,noticeAck:true,recovery:true,requested:true,requestAck:true,doneFresh:false,doneAck:false};return `${recalFlowDiagram()}<div class="flit-explorer" role="group" aria-label="PHY重新校准里程碑查询"><div class="flit-controls"><label>已核对握手支持<select id="recalq-support"><option value="yes">是 · 手册确认</option><option value="unknown">未核对</option><option value="no">不支持</option></select></label><label>本次发起者<select id="recalq-origin"><option value="phy">PHY通知MAC</option><option value="controller">控制器主动</option></select></label>${[['nelb','当前为DNELB',false],['pclk','消息PCLK运行',true],['notified','本次PHY通知已到',true],['noticeAck','已回通知Ack',true],['recovery','本次已确认进入Recovery',true],['requested','MAC本次IORecal已提交',true],['requestAck','本次请求写已Ack',true],['doneFresh','本次新IORecalDone已到',false],['doneAck','已回新Done消息Ack',false]].map(([k,t,v])=>eqBoolSelect('recalq-'+k,t,v)).join('')}</div><pre id="recalq-result" class="note protocol-query-output" aria-live="polite">${esc(recalText(o))}</pre></div>`;}
function eqDetailInput(e){const id=e.target.id||'',v=k=>document.getElementById(k).value;
 if(id.startsWith('p4q-')){const o={};for(const k of ['version','rate','swing','fs','lf','a2','a1','c0','ap'])o[k]=v('p4q-'+k);document.getElementById('p4q-result').textContent=pam4CoefficientText(o);document.getElementById('p4q-figure').innerHTML=pam4FirDiagram(o);}
 if(id.startsWith('rxev-')){const o={};for(const k of ['rate','phase','kind','control','fom','d0','d1'])o[k]=v('rxev-'+k);for(const k of ['issued','requestAck','fresh','committed','feedbackAck','aborted'])o[k]=v('rxev-'+k)==='1';document.getElementById('rxev-result').textContent=rxEvalText(o);}
 if(id.startsWith('recalq-')){const o={support:v('recalq-support'),origin:v('recalq-origin')};for(const k of ['nelb','pclk','notified','noticeAck','recovery','requested','requestAck','doneFresh','doneAck'])o[k]=v('recalq-'+k)==='1';document.getElementById('recalq-result').textContent=recalText(o);}
}
document.addEventListener('input',eqDetailInput);
document.addEventListener('change',eqDetailInput);

// Daily 2026-10-22: count-only UIO completion accounting, not address reassembly.
function uioDwList(value){if(typeof value!=='string')return null;const a=value.trim().split(/[\s,]+/);if(!value.trim()||a.length>256)return null;const n=a.map(s=>/^\d+$/.test(s)?Number(s):NaN);return n.every(v=>Number.isInteger(v)&&v>=1&&v<=1024)?n:null;}
function uioLedgerInfo(o){if(!o||!['read','write'].includes(o.kind)||typeof o.closed!=='boolean')return null;const requests=uioDwList(o.requests);if(!requests||o.kind==='read'&&requests.length!==1||typeof o.completions!=='string')return null;const tokens=o.completions.trim()?o.completions.trim().split(/[\s,]+/):[];if(tokens.length>256)return null;const completions=[];
 for(const token of tokens){const m=token.match(/^(\d+):(SC|RRS|CA|UR|RESERVED)$/i);if(!m)return null;const dw=Number(m[1]);if(!Number.isInteger(dw)||dw<1||dw>1024)return null;completions.push({dw,status:m[2].toUpperCase()});}
 const issued=requests.reduce((n,v)=>n+v,0),returned=completions.reduce((n,v)=>n+v.dw,0),statuses=completions.map(x=>x.status==='RESERVED'?'UR':x.status);const aggregate=!statuses.length?null:statuses.includes('UR')?'UR':statuses.includes('CA')?'CA':statuses.includes('RRS')?'RRS':'SC';const balanced=issued===returned,overrun=returned>issued,closed=o.kind==='read'||o.closed;
 return {issued,returned,remaining:issued-returned,aggregate,balanced,overrun,closed,countedBatchComplete:balanced&&closed,stage:overrun?'overcount':!balanced?'pending':!closed?'open-balanced':'count-balanced'};
}
function uioLedgerText(o){const r=uioLedgerInfo(o);if(!r)return '输入每笔已解码DW数（1～1024），完成项写作 DW:SC / RRS / CA / UR / RESERVED；一次最多256项是工具限制。读只接受一笔未完成请求。';const states={overcount:'完成数超过已发数，账本不一致；先排查重复事件、错误ID或输入。',pending:'尚有DW未记完成；已发现错误也不取消剩余DW责任。','open-balanced':'当前计数相等但同ID写批次尚未关闭，不能据此宣称一个已关闭批次完成。','count-balanced':'已关闭输入窗口的DW账本平衡；仍需地址/类型和其它协议检查，不能仅凭数量证明完整合法。'};
 return `已发 ${r.issued} DW；已完成 ${r.returned} DW；差额 ${r.remaining} DW\n${states[r.stage]}\n已观察的聚合状态：${r.aggregate||'尚无完成'}（UR > CA > RRS > SC；未定义状态按UR）\n此查询不核重复/重叠地址、数据重组、WCB/RCB、能力、TC/VC或全部错误处理。Length是记账DW，不由BE缩减；普通非UIO完成规划仍用原工具。`;
}
function uioLedgerExplorer(){const o={kind:'write',requests:'64 64',completions:'32:SC 64:CA 32:SC',closed:true};return `<div class="flit-explorer" role="group" aria-label="UIO同ID完成DW账本"><div class="flit-controls"><label>UIO类型<select id="uioacc-kind"><option value="write">Group II 写</option><option value="read">Group III 读 · 单笔</option></select></label><label>同ID每笔请求DW（十进制）<input id="uioacc-requests" value="64 64" spellcheck="false"></label><label>每份完成DW:状态<input id="uioacc-completions" value="32:SC 64:CA 32:SC" spellcheck="false"></label><label>写批次已停止发同ID新请求<select id="uioacc-closed"><option value="1">是</option><option value="0">否 · 仍为开放批次</option></select></label></div><pre id="uioacc-result" class="note protocol-query-output" aria-live="polite">${esc(uioLedgerText(o))}</pre></div>`;}
function uioLedgerInput(e){if(!(e.target.id||'').startsWith('uioacc-'))return;const v=k=>document.getElementById('uioacc-'+k).value;document.getElementById('uioacc-result').textContent=uioLedgerText({kind:v('kind'),requests:v('requests'),completions:v('completions'),closed:v('closed')==='1'});}
document.addEventListener('input',uioLedgerInput);document.addEventListener('change',uioLedgerInput);

// R28: read-only PIPE power/receive evidence tools. No hardware access.
function refClockInfo(o){
 const states=['P0','P0s','P1','P2','L1-specific'];
 if(!o||!states.includes(o.state)||!states.includes(o.target)||!['implemented','absent','unknown'].includes(o.interface)||!['0','1','unknown'].includes(o.required)||typeof o.platformAllows!=='boolean'||typeof o.completed!=='boolean')return null;
 const same=o.state===o.target,pairs=['P0:P0s','P0s:P0','P0:P1','P1:P0','P0:P2','P2:P0'];
 const transition=same?'same':pairs.includes(o.state+':'+o.target)?'standard':'needs-evidence';
 const allowedState=['P1','P2','L1-specific'].includes(o.state),requireConflict=o.interface==='implemented'&&o.required==='1'&&!allowedState;
 const reasons=[];
 if(!allowedState)reasons.push('当前状态要求保留参考时钟');
 if(o.interface!=='implemented')reasons.push('未取得此可选接口的明确许可，请核产品/平台控制契约');
 else if(o.required!=='1')reasons.push(o.required==='0'?'RefClkRequired#=0明确要求保留':'RefClkRequired#电平未确认');
 if(!o.platformAllows)reasons.push('平台/协议移除条件尚未确认');
 if(!o.completed)reasons.push('当前所述功耗转换尚未完成');
 return {transition,allowedState,requireConflict,reasons,removalConditionsMet:reasons.length===0,branchCaution:o.state==='P2'&&o.target==='P1'};
}
function refClockText(o){const r=refClockInfo(o);if(!r)return '请提供有效状态、接口/电平及布尔条件。';return [r.removalConditionsMet?'已输入的REFCLK移除条件均已确认；这不是完整平台时序认证。':'仍不能依据当前输入释放参考时钟：'+r.reasons.join('；'),r.transition==='standard'?'目标转换属于六条普通标准转换。':r.transition==='same'?'目标与当前状态相同，不代表曾完成转换。':'目标转换需要对应PHY/方案的额外依据。',r.branchCaution?'P2→P1在PIPE表/图与六条清单间存在差异，待官方/产品澄清。':'',r.requireConflict?'电平与状态规则矛盾：该状态不应撤销RefClkRequired#。':'','工具不驱动CLKREQ#；判断移除以当前态为准，目标态尚未完成不能提前使用其许可。'].filter(Boolean).join('\n');}
function pwrSelect(id,label,items,value){return `<label>${esc(label)}<select id="${id}">${items.map(([v,t])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(t)}</option>`).join('')}</select></label>`;}
function pwrBool(id,label,value){return pwrSelect(id,label,[['0','否 / 0'],['1','是 / 1']],value?'1':'0');}
function refClockInput(){return {state:$('#refwake-state').value,target:$('#refwake-target').value,interface:$('#refwake-interface').value,required:$('#refwake-required').value,platformAllows:$('#refwake-platform').value==='1',completed:$('#refwake-completed').value==='1'};}
function refClockExplorer(){const o={state:'P1',target:'P0',interface:'implemented',required:'0',platformAllows:true,completed:true},states=['P0','P0s','P1','P2','L1-specific'].map(x=>[x,x]);return `<div class="flit-explorer"><div class="flit-controls">${pwrSelect('refwake-state','当前PHY态',states,o.state)}${pwrSelect('refwake-target','计划目标态',states,o.target)}${pwrSelect('refwake-interface','RefClkRequired#接口',[['implemented','已实现'],['absent','未实现'],['unknown','未知']],o.interface)}${pwrSelect('refwake-required','RefClkRequired#电平',[['0','0：仍需参考'],['1','1：已准备移除'],['unknown','未知']],o.required)}${pwrBool('refwake-platform','平台/协议允许移除',true)}${pwrBool('refwake-completed','所述当前转换已完成',true)}</div><p id="refwake-result" class="protocol-query-output" aria-live="polite">${esc(refClockText(o))}</p></div>`;}

function rxWakeInfo(o){
 if(!o||!['original','serdes'].includes(o.arch)||!['P0','P0s','P1','P2'].includes(o.power)||![2.5,5,8,16,32,64,128].includes(o.rate)||!['none','eval','train','recal'].includes(o.operation)||['standby','status','valid','eiDisabled','elecIdle','changed'].some(k=>typeof o[k]!=='boolean'))return null;
 const applicable=['P0','P0s'].includes(o.power),aborted=o.changed&&o.operation!=='none',eiForced=o.eiDisabled;
 return {applicable,status:applicable?(o.status?'standby':'active'):null,aborted,eiForced,eiContradiction:eiForced&&!o.elecIdle,highRate:o.rate!==2.5,validMeaning:o.arch==='serdes'?'recovered-clock-stable':'architecture-qualified-data',linkUp:false,pending:applicable&&o.standby!==o.status};
}
function rxWakeText(o){const r=rxWakeInfo(o);if(!r)return '请输入有效架构、PCIe速率、状态和布尔观察。';return [r.applicable?`RxStandby请求${o.standby?'待机':'活动'}；Status报告${o.status?'待机':'高速RX活动'}${r.pending?'，两者尚不一致，不能从快照判断等待时长或失败。':'。'}`:'P1/P2中忽略RxStandby，RxStandbyStatus不适用；不解码为Active。',r.aborted?'操作期间RxStandby发生变化：PHY应中止该RX操作并返回握手；Ack不表示成功。':'未输入三类操作期间的待机变化证据。',r.eiForced?'EI检测器关闭，RxElecIdle强制高，不能证明线端空闲。':'未禁用检测器；若刚重新启用还须确认检测逻辑已可工作。',r.eiContradiction?'观察矛盾：检测器禁用时却输入RxElecIdle=0，请核采样/适用范围。':'',r.highRate?'当前速率的EI入口必须用MAC逻辑判定，不能仅靠RxElecIdle。':'2.5GT/s低速样例也不能把输入活动与RxValid当成同一事件。',o.valid?(o.arch==='serdes'?'SerDes RxValid=1只说明恢复RxCLK稳定，MAC还需取得符号/块对齐。':'Original RxValid=1按编码/BlockAlignControl解释，不能由此宣布Link Up。'):'RxValid=0：未取得该架构定义的接收有效证据。','单次快照不证明边沿、定时和完整恢复；未判断L0、DL_Active或BER。'].filter(Boolean).join('\n');}
function rxWakeInput(){const o={arch:$('#rxwake-arch').value,power:$('#rxwake-power').value,rate:Number($('#rxwake-rate').value),operation:$('#rxwake-operation').value};for(const k of ['standby','status','valid','eiDisabled','elecIdle','changed'])o[k]=$('#rxwake-'+k).value==='1';return o;}
function rxWakeExplorer(){const o={arch:'serdes',power:'P0',rate:64,operation:'none',standby:false,status:false,valid:true,eiDisabled:false,elecIdle:false,changed:false};return `<div class="flit-explorer"><div class="flit-controls">${pwrSelect('rxwake-arch','架构',[['original','Original'],['serdes','SerDes']],o.arch)}${pwrSelect('rxwake-power','PHY态',['P0','P0s','P1','P2'].map(x=>[x,x]),o.power)}${pwrSelect('rxwake-rate','速率GT/s',[2.5,5,8,16,32,64,128].map(x=>[String(x),String(x)]),String(o.rate))}${pwrSelect('rxwake-operation','观察中的RX操作',[['none','无'],['eval','RxEqEval'],['train','RxEqTraining'],['recal','IORecal']],o.operation)}${[['standby','RxStandby'],['status','RxStandbyStatus'],['valid','RxValid'],['eiDisabled','RxEIDetectDisable'],['elecIdle','RxElecIdle'],['changed','操作期间RxStandby发生改变']].map(([k,t])=>pwrBool('rxwake-'+k,t,o[k])).join('')}</div><p id="rxwake-result" class="protocol-query-output" aria-live="polite">${esc(rxWakeText(o))}</p></div>`;}

function deepPmTraceInfo(o){
 if(!o||!['P1','P2','P0'].includes(o.initialState)||typeof o.events!=='string'||typeof o.idle!=='boolean'||o.events.length>6000)return null;
 const tokens=o.events.trim()?o.events.trim().split(/[\s,;]+/):[];if(tokens.length>256)return null;
 const s={power:o.initialState,req:1,ack:1,restore:1,rail:true,pclk:true,cycles:0,usedRestore:false,phase:'idle',removed:false},log=[];
 for(let i=0;i<tokens.length;i++){
  const t=tokens[i];let error='';
  if(s.restore===0&&['req0','ack0','req1','ack1'].includes(t)){
   error='Restore窗口内普通PIPE输入切换被忽略，本工具不能将这次握手边沿当成已接收';
  }else if(t==='req0'){
   if(s.power==='P0')error='P0禁止断言DeepPMReq#';else if(s.req!==1||s.ack!==1)error='上一许可握手未闭环';else{s.req=0;s.phase='request';}
  }else if(t==='ack0'){
   if(s.req!==0||s.ack!==1)error='Ack#置低需要新的Req#许可';else{s.ack=0;s.phase='permitted';}
  }else if(t==='req1'){
   if(s.req!==0||s.ack!==0)error='本模型完整握手需先收到许可Ack#';else{s.req=1;s.phase='exit-wait';}
  }else if(t==='ack1'){
   if(s.req!==1||s.ack!==0)error='退出Ack#需要已撤销Req#';else{s.ack=1;s.phase='exited';}
  }else if(t==='restore0'){
   if(s.restore===0)error='恢复窗口已有效';else{s.restore=0;s.usedRestore=true;s.cycles=0;}
  }else if(t==='restore1'){
   if(s.restore!==0)error='没有正在进行的恢复窗口';else if(!s.rail)error='电源尚未恢复，不能宣布上下文恢复结束';else{s.restore=1;s.cycles=0;}
  }else if(t==='poweroff'){
   if(!o.idle)error='断电前PIPE不空闲或仍有在途操作';else if(s.req!==0||s.ack!==0)error='学习路径需先完成非P0深睡许可握手';else if(s.restore!==0)error='本恢复路径要求电源轨变化前Restore#已有效';else if(!s.rail)error='电源已关闭';else{s.rail=false;s.pclk=false;s.cycles=0;s.removed=true;}
  }else if(t==='poweron'){
   if(s.rail)error='电源已经有效';else if(s.restore!==0)error='上电ramp前Restore#未有效';else{s.rail=true;}
  }else if(t==='pclk0'){s.pclk=false;s.cycles=0;
  }else if(t==='pclk1'){if(!s.rail)error='电源未恢复，不能在本模型宣布PCLK有效';else s.pclk=true;
  }else if(/^tick:[0-9]+$/.test(t)){
   const n=Number(t.slice(5));if(!Number.isSafeInteger(n)||n<1||n>1000000)error='周期数需为1～1000000整数（工具上限）';else if(!s.pclk||!s.rail)error='PCLK未活动，不能累计周期';else if(s.usedRestore&&s.restore===1)s.cycles=Math.min(1000000,s.cycles+n);
  }else if(t==='powerP0'||t==='sync'){
   if(s.restore===0)error='Restore窗口内同步输入被忽略';else if(!s.rail||!s.pclk)error='电源/PCLK尚未有效';else if(s.usedRestore&&s.cycles<32)error='恢复窗口结束后有效PCLK不足32周期';else if(t==='powerP0'&&(s.req!==1||s.ack!==1))error='先确认退出DeepPM，再改变PowerDown';else if(t==='powerP0')s.power='P0';
  }else error='未知事件；不接受任意寄存器/脚本命令';
  log.push({index:i+1,event:t,error});if(error)return {valid:false,failedAt:i+1,error,state:{...s},log};
 }
 return {valid:true,failedAt:null,error:null,state:s,log};
}
function deepPmTraceText(o){const r=deepPmTraceInfo(o);if(!r)return '输入无效：状态P0/P1/P2、空闲布尔值、事件文本≤6000字符/256事件。';const s=r.state;return [r.valid?'所输入事件通过本学习模型的顺序检查。':`第${r.failedAt}项 ${r.log[r.log.length-1].event}：${r.error}`,`当前 Req#=${s.req} / Ack#=${s.ack}；PHY态=${s.power}；Restore#=${s.restore}；恢复后有效PCLK计数=${s.cycles}`,s.req===0&&s.ack===0?'仅确认允许深睡，不能从Ack#证明实际已经省电/掉电。':s.req===1&&s.ack===0?'正在等待退出完成，不可先改PowerDown。':'深睡闭环状态不等于LTSSM链路完成。',s.usedRestore?'模型假设上下文已在掉电前正确保存、窗口结束前已恢复；不验证保存内容与模拟电源。':'未使用Restore路径；32周期不是普通功耗转换的统一等待。','事件：req0 ack0 req1 ack1 restore0 restore1 poweroff poweron pclk0 pclk1 tick:N powerP0 sync。初始为运行快照，不模拟复位默认Req#=0；周期上限为工具限制，非规范超时。'].join('\n');}
function deepPmInput(){return {initialState:$('#deepphy-state').value,idle:$('#deepphy-idle').value==='1',events:$('#deepphy-events').value};}
function deepPmExplorer(){const o={initialState:'P2',idle:true,events:'req0 ack0 restore0 poweroff poweron restore1 pclk1 tick:32 req1 ack1 powerP0 sync'};return `<div class="flit-explorer"><div class="flit-controls">${pwrSelect('deepphy-state','运行快照初始PHY态',['P0','P1','P2'].map(x=>[x,x]),o.initialState)}${pwrBool('deepphy-idle','断电前PIPE空闲且无在途操作',true)}<label class="power-trace-label">事件顺序（可编辑）<textarea id="deepphy-events" rows="4" maxlength="6000">${esc(o.events)}</textarea></label></div><p class="note">可用短路径：req0 ack0 req1 ack1 powerP0；不会模拟真实深睡或产生控制写。</p><p id="deepphy-result" class="protocol-query-output" aria-live="polite">${esc(deepPmTraceText(o))}</p></div>`;}
function deepPmDependencyDiagram(){return `<figure class="power-dependency"><figcaption>原创依赖示意 · 无比例时间轴</figcaption><ol><li>非P0中 MAC：Req# ↓（许可）</li><li>PHY：Ack# ↓（应答许可）</li><li class="power-optional">允许内部进一步省电：可能延后，甚至没有实际发生</li><li>MAC：Req# ↑（要求退出）</li><li>PHY：先退出深睡，再 Ack# ↑</li><li>MAC：确认退出后才能改变PowerDown；另等对应PhyStatus</li></ol><p>进入应答 ≠ 实际掉电；退出应答 ≠ 已经P0/L0。</p></figure>`;}
function restoreWindowDiagram(){return `<figure class="power-dependency"><figcaption>原创上下文恢复示意 · 不规定产品内部并行关系</figcaption><div class="power-stages"><span>事先保存 / PIPE空闲</span><span>Restore#=0<br>电源变化与恢复上下文<br>普通PIPE输入切换被忽略</span><span>Restore# ↑<br>立即恢复监测</span><span>PCLK活动<br>退出后至少32周期</span><span>允许同步切换<br>仍需其它功耗/训练条件</span></div><p>窗口内周期不计入退出后的32周期；不是32ns或32个REFCLK/RxCLK周期。</p></figure>`;}
for(const type of ['input','change'])document.addEventListener(type,e=>{const id=e.target.id||'';if(id.startsWith('refwake-'))$('#refwake-result').textContent=refClockText(refClockInput());if(id.startsWith('rxwake-'))$('#rxwake-result').textContent=rxWakeText(rxWakeInput());if(id.startsWith('deepphy-'))$('#deepphy-result').textContent=deepPmTraceText(deepPmInput());});


// R29: decoded UIO ranges and SVC configuration evidence, no register access.
function uioAddress64(t){if(typeof t!=='string'||!/^(?:0x[0-9a-f]+|[0-9]+)$/i.test(t.trim()))return null;try{const a=BigInt(t.trim());return a>=0n&&a<(1n<<64n)?a:null;}catch{return null;}}
function uioBoundaryInfo(o){
 if(!o||!['read','write'].includes(o.kind)||!Number.isInteger(o.dw)||o.dw<1||o.dw>1024||![128,256,512,1024,2048,4096].includes(o.limit)||typeof o.disable256!=='boolean')return null;
 const a=uioAddress64(o.address),size=BigInt(o.dw)*4n;if(a===null||a%4n||a+size>(1n<<64n))return null;
 const end=a+size-1n,cross256=a/256n!==end/256n,cross4k=a/4096n!==end/4096n,overLimit=size>BigInt(o.limit),rows=[];
 let p=a,left=size;
 while(left){const limits=[left,BigInt(o.limit),4096n-p%4096n];if(!o.disable256)limits.push(256n-p%256n);const n=limits.reduce((x,y)=>x<y?x:y),dw=Number(n/4n);rows.push({address:'0x'+p.toString(16),end:'0x'+(p+n-1n).toString(16),bytes:Number(n),dw,lengthCode:dw===1024?0:dw});p+=n;left-=n;}
 return {address:'0x'+a.toString(16),end:'0x'+end.toString(16),bytes:Number(size),cross256,cross4k,overLimit,validRequest:!cross4k&&!overLimit&&(o.disable256||!cross256),rows,kind:o.kind,limitName:o.kind==='read'?'MRRS':'MPS'};
}
function uioBoundaryText(o){const r=uioBoundaryInfo(o);if(!r)return '请输入64-bit范围内DW对齐地址、1～1024DW已解码长度、标准MPS/MRRS值与布尔开关。';return [`原范围 ${r.address} ～ ${r.end}，${r.bytes} B。`,r.validRequest?'原请求通过本工具的地址边界及长度检查。':'原请求需要拆分：'+[r.cross256&&!o.disable256?'跨256B边界':'',r.cross4k?'跨4KB边界':'',r.overLimit?'超过'+r.limitName:''].filter(Boolean).join('；'),`Boundary Disable=${o.disable256?1:0}；4KB规则始终保留；${r.limitName}=${o.limit}B。`,`建议 ${r.rows.length} 笔（连续、全DW范围）：`,...r.rows.map((x,i)=>`${i+1}. ${x.address}～${x.end}：${x.dw} DW / ${x.bytes} B；Length编码=0x${x.lengthCode.toString(16).padStart(3,'0')}`),'仅请求范围/长度检查；不证明路径、权限、BE/OHC、Tag及完成重组合法。'].join('\n');}
function uioBoundaryInput(){return {address:$('#uiobnd-address').value,dw:Number($('#uiobnd-dw').value),kind:$('#uiobnd-kind').value,limit:Number($('#uiobnd-limit').value),disable256:$('#uiobnd-disable').value==='1'};}
function uioBoundaryExplorer(){const o={address:'0xff0',dw:128,kind:'write',limit:512,disable256:false};return `<div class="flit-explorer"><div class="flit-controls"><label>DW基址<input id="uiobnd-address" value="${o.address}" spellcheck="false"></label><label>总访问DW（已解码）<input id="uiobnd-dw" type="number" min="1" max="1024" value="128"></label>${pwrSelect('uiobnd-kind','请求类型',[['read','UIOMRd / MRRS'],['write','UIOMWr / MPS']],o.kind)}${pwrSelect('uiobnd-limit','相应MPS/MRRS上限B',[128,256,512,1024,2048,4096].map(n=>[String(n),String(n)]),'512')}${pwrBool('uiobnd-disable','UIO Request 256B Boundary Disable',false)}</div><p id="uiobnd-result" class="protocol-query-output" aria-live="polite">${esc(uioBoundaryText(o))}</p></div>`;}

function svcU32(v){if(typeof v==='number')return Number.isInteger(v)&&v>=0&&v<=0xffffffff?v:null;if(typeof v!=='string'||!/^(?:0x[0-9a-f]+|[0-9]+)$/i.test(v.trim()))return null;const n=Number(v.trim());return Number.isInteger(n)&&n>=0&&n<=0xffffffff?n:null;}
function svcProtocolCompatible(id,supported,selected){
 if(id===0)return supported===0&&selected===0;
 if(selected===0)return false;
 if(supported>=4||selected>=3)return null;
 if(supported===0||supported===1)return selected===1;
 if(supported===2)return selected===2;
 return selected===1||selected===2;
}
function svcRegisterInfo(o){
 if(!o||!Number.isInteger(o.index)||o.index<0||o.index>7||typeof o.linkActive!=='boolean'||typeof o.flitSupported!=='boolean')return null;
 const names=['cap1','portControl','portStatus','resourceCap','resourceControl','resourceStatus'],v={};for(const k of names){v[k]=svcU32(o[k]);if(v[k]===null)return null;}
 const count=v.cap1&7;if(o.index>count)return null;
 const vcid=(v.resourceCap>>>12)&7,supported=(v.resourceCap>>>8)&15,selected=(v.resourceControl>>>8)&15,map=v.resourceControl&255,enabled=!!(v.resourceControl>>>31),limitEnable=!!((v.resourceControl>>>30)&1),limitCode=(v.resourceControl>>>27)&7,useLegacy=!!(v.portStatus&1),pendingDefined=o.linkActive&&enabled,pending=pendingDefined?!!(v.resourceStatus&2):null,issues=[];
 if((o.index===0&&vcid!==0)||(o.index!==0&&vcid===0))issues.push('资源序号与首资源VC0/其它非零ID要求矛盾');
 if(vcid===0&&!(map&1)||vcid!==0&&enabled&&(map&1))issues.push('TC0归属错误');
 const compatible=svcProtocolCompatible(vcid,supported,selected);if(compatible===false)issues.push('协议支持/选择或VC0专用编码冲突');if(compatible===null)issues.push('保留/厂商协议组合，不证明可用');
 if(useLegacy&&enabled)issues.push('Use VC/MFVC=1时SVC资源不应启用');if(vcid===0&&enabled===useLegacy)issues.push('VC0 Enable应为Use VC/MFVC反值');
 if(selected===2&&!o.flitSupported)issues.push('不支持FM却选择UIO');
 return {count,total:count+1,index:o.index,offsets:[0x14+o.index*12,0x18+o.index*12,0x1c+o.index*12],vcid,supported,selected,map,tcs:Array.from({length:8},(_,i)=>i).filter(i=>map&(1<<i)),enabled,useLegacy,pendingDefined,pending,limitEnable: o.flitSupported?limitEnable:null,limitCode,percent:limitCode*12.5,limitEffective:o.flitSupported&&limitEnable,completedHint:!!(v.portControl&1),compatible,issues};
}
function svcRegisterText(o){const r=svcRegisterInfo(o);if(!r)return '请输入有效32-bit寄存器值、0～7资源序号；序号不得超过Extended VC Count。';return [`Extended Count=${r.count}，总资源=${r.total}；序号=${r.index}，实际VC ID=${r.vcid}。`,`资源相对偏移：Capability 0x${r.offsets[0].toString(16)} / Control 0x${r.offsets[1].toString(16)} / Status 0x${r.offsets[2].toString(16)}。`,`Supported=${r.supported} / Selected=${r.selected}；Map=0x${r.map.toString(16).padStart(2,'0')} → TC${r.tcs.length?r.tcs.join(', TC'):'无'}。`,`当前机制=${r.useLegacy?'VC/MFVC传统机制':'SVC'}；SVC Enable=${r.enabled?1:0}；Port完成提示=${r.completedHint?1:0}（不是总开关）。`,r.pendingDefined?`Pending=${r.pending?1:0}；仍须检查对端。`:'Pending不适用：未满足DL_Active且本资源Enable。',r.limitEnable===null?'Flit Mode Supported=0：Limit Enable为RsvdP，不解释其读值。':r.limitEffective?`共享上限=${r.percent}%（各Credit类型独立）。`:'Limit Enable=0：上限编码忽略，不表示0%可用。',r.issues.length?'需处理：'+r.issues.join('；'):'本快照未发现所列单资源矛盾；尚未验证两端/全Port配置。','不读取或写入硬件；快照不能证明重配顺序、完整能力或实际Shared FC已运行。'].join('\n');}
function svcRegisterInput(){const o={index:Number($('#svcreg-index').value),linkActive:$('#svcreg-active').value==='1',flitSupported:$('#svcreg-flit').value==='1'};for(const k of ['cap1','portControl','portStatus','resourceCap','resourceControl','resourceStatus'])o[k]=$('#svcreg-'+k).value;return o;}
function svcRegisterExplorer(){const o={cap1:'1',portControl:'0',portStatus:'0',index:1,resourceCap:'0x3200',resourceControl:'0x80000208',resourceStatus:'0',linkActive:true,flitSupported:true};return `<div class="flit-explorer"><div class="flit-controls">${[['cap1','Port Capability1'],['portControl','Port Control'],['portStatus','Port Status'],['resourceCap','Resource Capability'],['resourceControl','Resource Control'],['resourceStatus','Resource Status']].map(([k,t])=>`<label>${t}<input id="svcreg-${k}" value="${esc(o[k])}" spellcheck="false"></label>`).join('')}<label>资源序号n<input id="svcreg-index" type="number" min="0" max="7" value="1"></label>${pwrBool('svcreg-active','DL_Active',true)}${pwrBool('svcreg-flit','Flit Mode Supported（能力）',true)}</div><p id="svcreg-result" class="protocol-query-output" aria-live="polite">${esc(svcRegisterText(o))}</p></div>`;}

function svcResourceList(t){
 if(typeof t!=='string'||t.length>12000)return null;let a;try{a=JSON.parse(t);}catch{return null;}if(!Array.isArray(a)||a.length<1||a.length>8)return null;
 const result=[];for(const x of a){if(!x||!Number.isInteger(x.id)||x.id<0||x.id>7||!Number.isInteger(x.protocol)||x.protocol<0||x.protocol>15||typeof x.enabled!=='boolean'||typeof x.pending!=='boolean')return null;const map=svcU32(x.map);if(map===null||map>255)return null;result.push({...x,map});}return result;
}
function svcPairInfo(o){
 if(!o||typeof o.linkActive!=='boolean'||!['FM','NFM'].includes(o.mode)||!Number.isInteger(o.tc)||o.tc<0||o.tc>7||!['uio-read','uio-write','uio-completion','non-uio'].includes(o.traffic))return null;
 const a=svcResourceList(o.local),b=svcResourceList(o.peer);if(!a||!b)return null;
 const issues=[],notes=[];
 for(const[name,rows]of [['本端',a],['对端',b]]){
  const ids=new Set();for(const x of rows){if(ids.has(x.id))issues.push(name+'重复VC ID '+x.id);ids.add(x.id);if(x.id===0&&x.protocol!==0||x.id!==0&&x.protocol===0)issues.push(name+'协议0仅给VC0');if(x.protocol>=3)issues.push(name+'保留/厂商协议不在通用检查范围');if(x.id===0&&!(x.map&1)||x.id!==0&&x.enabled&&(x.map&1))issues.push(name+'TC0归属错误');}
  if(!ids.has(0))issues.push(name+'缺少VC0记录（要求输入完整资源快照）');
  const activeUIO=rows.filter(x=>x.enabled&&x.protocol===2);
  if(activeUIO.length===1&&activeUIO[0].id!==3)issues.push(name+'只启用一个UIO VC时必须为VC3');
  if(activeUIO.length===2&&(!activeUIO.some(x=>x.id===3)||!activeUIO.some(x=>x.id===4)))issues.push(name+'启用两个UIO VC时须为VC3和VC4');
  if(activeUIO.length>2)issues.push(name+'超过两条UIO VC的配置不在本工具已核读范围');
  for(let tc=0;tc<8;tc++)if(rows.filter(x=>(x.map&(1<<tc))).length>1)issues.push(name+'TC'+tc+'重复映射');
 }
 for(const x of a){const y=b.find(y=>y.id===x.id);if(!y){issues.push('对端缺VC'+x.id);continue;}if(x.map!==y.map)issues.push('VC'+x.id+'两端TC映射不一致');if(x.protocol!==y.protocol)issues.push('VC'+x.id+'两端协议选择不一致');if(x.enabled!==y.enabled)issues.push('VC'+x.id+'两端Enable不一致');}
 for(const y of b)if(!a.some(x=>x.id===y.id))issues.push('本端缺VC'+y.id);
 const localTarget=a.filter(x=>x.enabled&&(x.map&(1<<o.tc))),peerTarget=b.filter(x=>x.enabled&&(x.map&(1<<o.tc))),target=localTarget.length===1?localTarget[0]:null,peer=peerTarget.length===1?peerTarget[0]:null;
 let egress='not-evaluated';
 if(localTarget.length!==1||peerTarget.length!==1){egress='unmapped';issues.push('目标TC未唯一映射到两端已启用VC；无启用映射的接收/出口按Malformed规则');}
 else{
  const uio=o.traffic!=='non-uio',mismatch=uio?target.protocol!==2:target.protocol===2;
  if(uio&&o.mode==='NFM'||mismatch){egress=uio&&o.traffic==='uio-completion'?'block-uncorrectable':uio?'block-no-translation-error':'block-non-uio-per-fc';issues.push('目标协议/模式不允许本流量；按不可翻译出口规则阻止');}
  else if(target.protocol>=3)egress='not-evaluated';else egress='pass-mode-protocol';
 }
 if(!o.linkActive)issues.push('DL_Active=0：Pending没有有效完成含义');
 for(const[name,rows]of [['本端',a],['对端',b]])for(const x of rows)if(x.enabled&&o.linkActive&&x.pending)issues.push(name+'VC'+x.id+'仍Pending');
 if(target&&peer&&target.id!==peer.id)issues.push('目标TC两端落在不同VC ID');
 const structuralPass=issues.length===0;notes.push('结构检查通过不证明全路径UIO/Requester能力+BME、错误/超时和Shared FC限额配置正确');
 return {issues,notes,egress,targetId:target?.id??null,peerId:peer?.id??null,structuralPass};
}
function svcPairText(o){const r=svcPairInfo(o);if(!r)return '输入无效：两端完整JSON资源数组（1～8项），字段id/map/protocol/enabled/pending，及有效Link/TC/流量条件。';return [r.structuralPass?'两端快照通过本工具的结构、模式/协议和协商检查。':'需处理：\n'+r.issues.map(x=>'• '+x).join('\n'),`目标TC${o.tc} → 本端VC${r.targetId??'未映射'} / 对端VC${r.peerId??'未映射'}。`,`出口判断=${r.egress}。`,r.egress==='block-no-translation-error'?'该UIO请求被阻止，但不报告此翻译错误；不等于成功。':r.egress==='block-uncorrectable'?'UIO完成被阻止，按不可纠正错误处理。':r.egress==='block-non-uio-per-fc'?'non-UIO误入UIO VC须按具体FC类别判定错误，工具未从一个总类猜测。':'',...r.notes,'protocol：0=仅VC0；1=扩展non-UIO；2=UIO。map按bit对应TC，例如0x08是TC3。不执行配置写。'].filter(Boolean).join('\n');}
function svcPairInput(){return {local:$('#svcpair-local').value,peer:$('#svcpair-peer').value,linkActive:$('#svcpair-active').value==='1',mode:$('#svcpair-mode').value,tc:Number($('#svcpair-tc').value),traffic:$('#svcpair-traffic').value};}
function svcPairExplorer(){const local=JSON.stringify([{id:0,map:'0x01',protocol:0,enabled:true,pending:false},{id:3,map:'0x08',protocol:2,enabled:true,pending:false}],null,2),o={local,peer:local,linkActive:true,mode:'FM',tc:3,traffic:'uio-write'};return `<div class="flit-explorer"><div class="flit-controls"><label class="power-trace-label">本端完整资源JSON<textarea id="svcpair-local" rows="8" maxlength="12000">${esc(local)}</textarea></label><label class="power-trace-label">对端完整资源JSON<textarea id="svcpair-peer" rows="8" maxlength="12000">${esc(local)}</textarea></label>${pwrBool('svcpair-active','DL_Active',true)}${pwrSelect('svcpair-mode','目标出口Link模式',[['FM','FM'],['NFM','NFM']],'FM')}${pwrSelect('svcpair-tc','目标TC',Array.from({length:8},(_,n)=>[String(n),String(n)]),'3')}${pwrSelect('svcpair-traffic','目标流量',[['uio-read','UIO读'],['uio-write','UIO写'],['uio-completion','UIO完成'],['non-uio','non-UIO']],o.traffic)}</div><p id="svcpair-result" class="protocol-query-output" aria-live="polite">${esc(svcPairText(o))}</p></div>`;}
function svcRegisterDiagram(){const rows=[['Capability','31:15 RsvdP',17,'14:12 VC ID',3,'11:8 Protocols Supported',4,'7:0 RsvdP',8],['Control','31 Enable',1,'30 Limit Enable',1,'29:27 Shared Limit',3,'26:12 RsvdP',15,'11:8 Selected',4,'7:0 TC Map',8],['Status','31:2 RsvdZ',30,'1 Pending',1,'0 RsvdZ',1]];return `<figure class="power-dependency svc-register-figure"><figcaption>原创SVC资源寄存器位图 · 配置DWORD bit31 → bit0</figcaption>${rows.map(([name,...fields])=>`<p>${esc(name)}</p><div class="svc-bitrow" role="img" aria-label="${esc(name+' '+fields.filter((_,i)=>i%2===0).join('，'))}">${fields.filter((_,i)=>i%2===0).map((label,i)=>`<span style="flex:${fields[i*2+1]}" title="${esc(label)}">${esc(label)}</span>`).join('')}</div>`).join('')}<p>窄字段通过悬停及下方位表查询；此图不是TLP或线上传输格式。</p></figure>`;}
for(const type of ['input','change'])document.addEventListener(type,e=>{const id=e.target.id||'';if(id.startsWith('uiobnd-'))$('#uiobnd-result').textContent=uioBoundaryText(uioBoundaryInput());if(id.startsWith('svcreg-'))$('#svcreg-result').textContent=svcRegisterText(svcRegisterInput());if(id.startsWith('svcpair-'))$('#svcpair-result').textContent=svcPairText(svcPairInput());});


// R30: read-only conceptual PME control and observation models.
function pmeDeliveryInfo(o){
 if(!o||!['communicating','noncommunicating','sent','reactivation'].includes(o.state)||!['status-set','service-clear','turnoff','restored','timeout'].includes(o.event)||typeof o.enabled!=='boolean'||!Number.isFinite(o.timeoutMs)||o.timeoutMs<95||o.timeoutMs>150||!Number.isFinite(o.elapsedMs)||o.elapsedMs<0||o.elapsedMs>1000000)return null;
 const transitions={
  'communicating:status-set':['sent',['在L0按传递前提发送PM_PME']],
  'communicating:turnoff':['noncommunicating',['发送PME_TO_Ack','随后完成L2/L3 Ready入口；本边是概念复合动作']],
  'noncommunicating:status-set':['reactivation',['启动WAKE#/Beacon等适用唤醒机制']],
  'noncommunicating:restored':['communicating',['电源/时钟和相关复位恢复；返回可通信阶段']],
  'sent:service-clear':['communicating',['来源PME_Status已被软件清除，重新可发']],
  'sent:timeout':['sent',['来源Status仍未清，重新发送PM_PME；不能通信时先恢复Link']],
  'sent:turnoff':['reactivation',['发送PME_TO_Ack','保留未服务事件并启动唤醒']],
  'reactivation:restored':['sent',['恢复至可事务状态','清必要的唤醒信号并发送PM_PME']]
 };
 const t=transitions[o.state+':'+o.event];if(!t)return {defined:false,eligible:false,next:o.state,actions:[],reason:'本组概念图/文字未定义此组合，不推断为强制自环或错误恢复'};
 if(!o.enabled&&(o.event==='status-set'||o.event==='timeout'||o.state==='reactivation'&&o.event==='restored'))return {defined:true,eligible:false,next:o.state,actions:[],reason:'PME传递未使能：Status仍可置位，但不能按本边发PME/启动唤醒；不推定该图以外的后续状态'};
 if(!o.enabled&&o.state==='sent'&&o.event==='turnoff')return {defined:true,eligible:false,next:o.state,actions:['仍须接受并应答TurnOff，不能以PME_En=0拒绝'],reason:'未满足图中传递已启用假设，不推定后续唤醒转移或必须保持原态'};
 if(o.event==='timeout'&&o.elapsedMs<o.timeoutMs)return {defined:true,eligible:false,next:o.state,actions:[],reason:'尚未达到所选PME服务超时；不是关机等待定时器'};
 return {defined:true,eligible:true,next:t[0],actions:t[1],reason:'按已核读的概念转移；不模拟完整Link/电源/软件时序'};
}
function pmeStateName(s){return {communicating:'Communicating',noncommunicating:'Non-communicating',sent:'PME Sent',reactivation:'Link Reactivation'}[s]||s;}
function pmeDeliveryText(o){const r=pmeDeliveryInfo(o);if(!r)return '输入无效：四态/事件、使能布尔值、95～150ms服务超时及非负已等待ms。';return [`当前 ${pmeStateName(o.state)} → ${pmeStateName(r.next)}`,r.eligible?'本事件满足所输入的转移资格。':'本事件未产生该转移：'+r.reason,...r.actions.map(x=>'• '+x),`PME服务超时所选值=${o.timeoutMs}ms；已等待=${o.elapsedMs}ms。名义100ms的允许容差为95～150ms。`,'restored在本工具指电源/时钟、相关复位及可事务Link条件已经满足，不是任意一个reset引脚边沿。单步查询不推断重复边沿、Status历史或Link Up。'].join('\n');}
function pmeDeliveryInput(){return {state:$('#pmest-state').value,event:$('#pmest-event').value,enabled:$('#pmest-enabled').value==='1',timeoutMs:Number($('#pmest-timeout').value),elapsedMs:Number($('#pmest-elapsed').value)};}
function pmeDeliveryDiagram(selected='communicating'){
 const cells=[['communicating',20,40,'Communicating'],['noncommunicating',420,40,'Non-communicating'],['sent',20,250,'PME Sent'],['reactivation',420,250,'Link Reactivation']];
 const links=[['C→S','Status置位：发PM_PME'],['C→N','TurnOff：Ack后Ready'],['N→C','恢复（无待报告事件）'],['N→R','Status置位：启动唤醒'],['S→C','软件清来源Status'],['S→S','服务超时：重发'],['S→R','TurnOff：Ack并唤醒'],['R→S','恢复：清唤醒、发PM_PME']];
 return `<figure class="power-dependency pme-state-figure"><figcaption>原创PME四态示意 · C / N / S / R见状态框；边的完整资格见转移表</figcaption><svg viewBox="0 0 760 370" role="img" aria-label="PME四态。当前${esc(pmeStateName(selected))}。C到S发消息，C到N回应关机，N到R唤醒，S超时重发，R恢复后到S。"><path d="M180 105 V245 M580 105 V245 M330 75 H415 M420 285 H335 M325 285 H420" fill="none" stroke="currentColor" stroke-width="2"/>${cells.map(([id,x,y,label],i)=>`<rect x="${x}" y="${y}" width="310" height="65" rx="12" class="${id===selected?'pme-state-selected':'pme-state-node'}"/><text x="${x+155}" y="${y+28}" text-anchor="middle">${['C','N','S','R'][i]} · ${label}</text><text x="${x+155}" y="${y+50}" text-anchor="middle" font-size="12">${id===selected?'当前查询态':'概念控制态，不是LTSSM编码'}</text>`).join('')}</svg><div class="table-wrap"><table class="generation-table"><caption>图中全部转移及动作</caption><tbody>${links.map(([edge,t])=>`<tr><th scope="row">${edge}</th><td>${t}</td></tr>`).join('')}</tbody></table></div><p>线段仅为状态关系示意，不是时间比例图；全部8条边以表为准。</p></figure>`;
}
function pmeDeliveryExplorer(){const o={state:'sent',event:'turnoff',enabled:true,timeoutMs:100,elapsedMs:100};return `<div class="flit-explorer"><div class="flit-controls">${pwrSelect('pmest-state','当前概念态',['communicating','noncommunicating','sent','reactivation'].map(s=>[s,pmeStateName(s)]),o.state)}${pwrSelect('pmest-event','事件',[['status-set','来源Status置位'],['service-clear','软件清来源Status'],['turnoff','收到TurnOff / 复合应答与Ready'],['restored','恢复至可事务状态'],['timeout','服务超时事件']],o.event)}${pwrBool('pmest-enabled','PME传递已使能',true)}<label>选择的服务超时ms<input id="pmest-timeout" type="number" min="95" max="150" step="0.1" value="100"></label><label>已等待ms<input id="pmest-elapsed" type="number" min="0" value="100"></label></div><p id="pmest-result" class="protocol-query-output" aria-live="polite">${esc(pmeDeliveryText(o))}</p><div id="pmest-diagram">${pmeDeliveryDiagram(o.state)}</div></div>`;}

function pmeGatherPorts(t){if(typeof t!=='string'||t.length>16000)return null;let a;try{a=JSON.parse(t);}catch{return null;}if(!Array.isArray(a)||!a.length||a.length>32)return null;const ids=new Set();for(const x of a){if(!x||typeof x.id!=='string'||!x.id.length||x.id.length>32||ids.has(x.id)||typeof x.ack!=='boolean'||typeof x.ready!=='boolean')return null;ids.add(x.id);}return a;}
function pmeGatherInfo(o){
 if(!o||!['none','send-ack','upstream-tlp','main-power-off','fundamental-reset'].includes(o.reset)||['proxySent','localPrepared','originReady','timeoutExpired'].some(k=>typeof o[k]!=='boolean')||!Number.isFinite(o.elapsedNs)||o.elapsedNs<0||o.elapsedNs>1e12)return null;
 const ports=pmeGatherPorts(o.ports);if(!ports)return null;const observedAllAck=ports.every(x=>x.ack),allReady=ports.every(x=>x.ready),reset=o.reset!=='none',scored=reset?[]:ports.filter(x=>x.ack).map(x=>x.id),allScored=scored.length===ports.length;
 const invalidated=['main-power-off','fundamental-reset'].includes(o.reset),canProxy=allScored&&!o.proxySent,upstreamReadyPrereqs=!invalidated&&allReady&&o.proxySent&&o.localPrepared,normalPrereqs=upstreamReadyPrereqs&&o.originReady,waitSatisfied=o.originReady&&o.elapsedNs>=100;
 return {ports,reset,invalidated,scored,observedAllAck,allReady,canProxy,upstreamReadyPrereqs,normalRuleSatisfied:normalPrereqs&&waitSatisfied,waitSatisfied,timeoutBranch:o.timeoutExpired,inconsistent:o.originReady&&!upstreamReadyPrereqs,powerSafe:false};
}
function pmeGatherText(o){const r=pmeGatherInfo(o);if(!r)return '输入有效参与端口JSON（1～32项，不重复id，ack/ready布尔值）与观察条件、非负ns。';return [`参与DSP=${r.ports.map(x=>x.id).join(', ')}；本次聚合计分=${r.scored.length}/${r.ports.length}。`,r.reset?'发生规定的聚合重置事件：旧计分清除，不撤回历史已发Ack，也不自动改变实际Link Ready状态。':r.canProxy?'已收齐本次参与DSP的Ack，可按本条向上发送代理Ack。':o.proxySent?'历史代理已发送，不能据旧计分重复发送；新代次须另取证。':'尚未收齐本次Ack，不能据已有包数量声明代理应答资格。',r.allReady?'全部参与DSP观察为Ready。':'仍有参与DSP未Ready。',r.upstreamReadyPrereqs?'已输入本级上行Ready所述前提。':'本级Ready前提尚未全部确认：下游Ready、代理已发、本地准备需分别看。',r.timeoutBranch?'已输入电源管理超时触发：按异常策略可继续；正常全Ready后100ns要求不适用。该结果不证明缺失Ack/Ready成功。':r.normalRuleSatisfied?'已输入的正常路径条件及源端全Ready后至少100ns已满足；不代表所有平台掉电条件已验证。':'正常路径尚未满足源端全Ready及其后100ns/相关前提。',r.invalidated?'发生主电源移除/复位：不据旧Ready输入给出正常推进结论，需重新取证。':'',r.inconsistent?'观察不一致：源端全Ready与下游/本地前提不相符，请核本次代次/采样。':'','计时输入只指观察全源端Ready之后，不是TurnOff发出之后；超时触发由外部策略提供。工具不执行断电、不验证真实电源安全。'].filter(Boolean).join('\n');}
function pmeGatherInput(){const o={ports:$('#pmegather-ports').value,reset:$('#pmegather-reset').value,elapsedNs:Number($('#pmegather-elapsed').value)};for(const k of ['proxySent','localPrepared','originReady','timeoutExpired'])o[k]=$('#pmegather-'+k).value==='1';return o;}
function pmeGatherExplorer(){const o={ports:JSON.stringify([{id:'DSP-A',ack:true,ready:true},{id:'DSP-B',ack:false,ready:false}],null,2),reset:'none',proxySent:false,localPrepared:true,originReady:false,timeoutExpired:false,elapsedNs:0};return `<div class="flit-explorer"><div class="flit-controls"><label class="power-trace-label">本次参与DSP快照JSON<textarea id="pmegather-ports" rows="7" maxlength="16000">${esc(o.ports)}</textarea></label>${pwrSelect('pmegather-reset','最近聚合重置事件',[['none','无，使用本次计分'],['send-ack','USP已发送TO_Ack'],['upstream-tlp','USP收到任意TLP'],['main-power-off','Switch主电源移除'],['fundamental-reset','Fundamental Reset']],o.reset)}${[['proxySent','历史本次代理Ack已发送'],['localPrepared','本地掉电前准备完成'],['originReady','发起点全部相关Links已Ready'],['timeoutExpired','电源管理超时已触发']].map(([k,t])=>pwrBool('pmegather-'+k,t,o[k])).join('')}<label>观察全源端Ready后ns<input id="pmegather-elapsed" type="number" min="0" value="0"></label></div><p id="pmegather-result" class="protocol-query-output" aria-live="polite">${esc(pmeGatherText(o))}</p></div>`;}

function pmeNativeInfo(o){
 if(!o||!['INTx','MSI','MSIX'].includes(o.mode)||['native','interruptDisable','vectorMasked','pvm','previousQualified'].some(k=>typeof o[k]!=='boolean'))return null;
 const pmcsr=svcU32(o.pmcsr),rootControl=svcU32(o.rootControl),rootStatus=svcU32(o.rootStatus);if(pmcsr===null||pmcsr>0xffff||rootControl===null||rootControl>0xffff||rootStatus===null)return null;
 const sourceStatus=!!(pmcsr&0x8000),sourceEnabled=!!(pmcsr&0x100),rootEnabled=!!(rootControl&8),rootSet=!!(rootStatus&0x10000),requester=rootSet?(rootStatus&0xffff):null,pending=rootSet?!!(rootStatus&0x20000):null,maskApplies=o.mode==='MSIX'||o.mode==='MSI'&&o.pvm;
 const qualified=o.mode==='INTx'?!o.interruptDisable&&rootEnabled&&rootSet:(!maskApplies||!o.vectorMasked)&&rootEnabled&&rootSet;
 return {sourceStatus,sourceEnabled,rootEnabled,rootSet,requester,pending,maskApplies,qualified:o.native?qualified:null,intxContribution:o.native&&o.mode==='INTx'?qualified:null,msiRising:o.native&&o.mode!=='INTx'?!o.previousQualified&&qualified:null};
}
function pmeNativeText(o){const r=pmeNativeInfo(o);if(!r)return '请输入PMCSR/Root Control的16-bit值、Root Status的32-bit值及有效通知模式/布尔条件。';return [`来源 PMCSR.PME_En=${r.sourceEnabled?1:0} / PME_Status=${r.sourceStatus?1:0}。Status不受Enable门控。`,`Root PME Interrupt Enable=${r.rootEnabled?1:0} / PME Status=${r.rootSet?1:0}。`,r.requester===null?'Root Requester ID当前无有效来源含义（Root Status=0）。':`Root Requester ID=0x${r.requester.toString(16).padStart(4,'0')}；PME Pending=${r.pending?1:0}。`,!o.native?'未选择Native软件模型：不从这些输入猜测Legacy通知方式。':o.mode==='INTx'?`PME对INTx的电平贡献=${r.intxContribution?'断言':'未断言'}；其它共享中断源未建模。`:`MSI组合条件=${r.qualified?1:0}；前次=${o.previousQualified?1:0}；本次假→真=${r.msiRising?'是，应通知':'否，不由当前保持电平要求重复通知'}。`,o.mode==='MSI'&&!o.pvm?'MSI不支持PVM：输入向量mask不参加本条件。':'',r.pending?'清Root Status后可能交付下一PME并更新ID；不等于清来源PMCSR.Status。':'','工具不发中断、不清状态，不知道真实队列；PME_En不被用于门控Root已有PME报告。'].filter(Boolean).join('\n');}
function pmeNativeInput(){const o={pmcsr:$('#pmenative-pmcsr').value,rootControl:$('#pmenative-rootControl').value,rootStatus:$('#pmenative-rootStatus').value,mode:$('#pmenative-mode').value};for(const k of ['native','interruptDisable','vectorMasked','pvm','previousQualified'])o[k]=$('#pmenative-'+k).value==='1';return o;}
function pmeNativeExplorer(){const o={pmcsr:'0x8100',rootControl:'0x0008',rootStatus:'0x00031234',mode:'MSIX',native:true,interruptDisable:false,vectorMasked:false,pvm:true,previousQualified:false};return `<div class="flit-explorer"><div class="flit-controls">${[['pmcsr','来源PMCSR'],['rootControl','Root Control'],['rootStatus','Root Status']].map(([k,t])=>`<label>${t}<input id="pmenative-${k}" value="${o[k]}" spellcheck="false"></label>`).join('')}${pwrSelect('pmenative-mode','Root通知模式',[['INTx','INTx'],['MSI','MSI'],['MSIX','MSI-X']],o.mode)}${[['native','已采用Native PME软件模型'],['interruptDisable','Command.Interrupt Disable'],['vectorMasked','关联向量已屏蔽'],['pvm','MSI支持PVM'],['previousQualified','前一时刻完整组合条件为真']].map(([k,t])=>pwrBool('pmenative-'+k,t,o[k])).join('')}</div><p id="pmenative-result" class="protocol-query-output" aria-live="polite">${esc(pmeNativeText(o))}</p></div>`;}
for(const type of ['input','change'])document.addEventListener(type,e=>{const id=e.target.id||'';if(id.startsWith('pmest-')){const o=pmeDeliveryInput();$('#pmest-result').textContent=pmeDeliveryText(o);$('#pmest-diagram').innerHTML=pmeDeliveryDiagram(o.state);}if(id.startsWith('pmegather-'))$('#pmegather-result').textContent=pmeGatherText(pmeGatherInput());if(id.startsWith('pmenative-'))$('#pmenative-result').textContent=pmeNativeText(pmeNativeInput());});

// R31: product-specific necessary conditions; no hardware access.
function sharedPllInfo(o){
 if(!o||typeof o.force!=='boolean'||typeof o.active!=='boolean'||typeof o.links!=='string'||o.links.length>16000)return null;
 let links;try{links=JSON.parse(o.links);}catch{return null;}
 if(!Array.isArray(links)||!links.length||links.length>32||links.some(x=>!x||typeof x.id!=='string'||!x.id.trim()||x.id.length>64||['selected','requested','pclkConsumer','offComplete'].some(k=>typeof x[k]!=='boolean'))||new Set(links.map(x=>x.id.trim())).size!==links.length)return null;
 const voters=links.filter(x=>x.selected&&x.requested).map(x=>x.id),clockUsers=links.filter(x=>x.pclkConsumer),waiting=clockUsers.filter(x=>!x.offComplete).map(x=>x.id),demand=o.force||voters.length>0;
 return {voters,waiting,demand,clockUsers:clockUsers.length,canReleaseForce:waiting.length===0,canConfigure:!demand&&!o.active,refPrereqs:!demand&&!o.active};
}
function sharedPllText(o){const r=sharedPllInfo(o);if(!r)return '输入1～32个消费者JSON，id不重复，selected/requested/pclkConsumer/offComplete均为布尔值，Force/实际状态有效。';return [`本PLL默认请求汇聚=${r.demand?1:0}；Force=${o.force?1:0}；Lane请求者=${r.voters.join(', ')||'无已列请求'}。`,r.canReleaseForce?'已列输入PCLK消费者均已完成停钟功耗转换；满足撤Force的这条前提。':'不能据本次观察撤Force；仍待停钟功耗完成：'+r.waiting.join(', '),`实际PLL状态=${o.active?'仍开':'已关'}；本条PLL配置更新前提=${r.canConfigure?'满足':'不满足'}。`,r.refPrereqs?'本PLL的撤参考时钟必要条件已输入；其它PLL/消费者与系统条件仍须检查。':'尚不满足本PLL所述撤参考时钟前提，不能以请求已清替代实际状态。','仅针对Gen6 PMA3.02a默认策略和PCS1.75a该输入PCLK模式；offComplete包含已观察同步PhyStatus后才停PCLK。未列消费者、寄存器override、PLL锁定、电源安全及完整SoC不由此验证。'].join('\n');}
function productDependencyDiagram(kind){
 const specs={pll:['共享PLL · 原创必要条件图',['全部输入PCLK使用Link完成停钟功耗转换','才可撤Force；汇总所有Lane的PLL请求','实际PLL关闭后才改对应PLL配置','退出：恢复参考/PLL/PCLK，再改变同步PowerDown']],pg:['Gen5外部PG · 原创因果顺序',['上层已许可 → PHY准备保存/隔离完成','才请求关开关；实际电源可按系统需要保留','退出：请求开电源 → 两类稳定反馈','恢复参考/完成配置 → 上层另行训练']],context:['静态Context · 原创所有权交接',['镜像/支持组合/选择ID已核对','Link映射与reset前稳定 → 请求捕获使能','Raw PCS读镜像并回填静态控制设置','可选调试暂停 → 固件初始化 → Link训练']]};
 const [title,steps]=specs[kind];return `<figure class="product-dependency"><figcaption>${title}</figcaption><ol>${steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol><p>顺序表示已说明的依赖；框间不按时间比例，未展开全部异常和并行分支。</p></figure>`;
}
function sharedPllInput(){return {links:$('#sharedpll-links').value,force:$('#sharedpll-force').value==='1',active:$('#sharedpll-active').value==='1'};}
function sharedPllExplorer(){const o={links:JSON.stringify([{id:'Link-A',selected:true,requested:false,pclkConsumer:true,offComplete:true},{id:'Link-B',selected:true,requested:true,pclkConsumer:true,offComplete:false}],null,2),force:true,active:true};return `<div class="flit-explorer"><div class="flit-controls"><label class="power-trace-label">同一PLL的Lane/时钟消费者JSON<textarea id="sharedpll-links" rows="12" maxlength="16000">${esc(o.links)}</textarea></label>${pwrBool('sharedpll-force','PLL Force有效',true)}${pwrBool('sharedpll-active','实际PLL仍开',true)}</div><p>selected=Lane选择此PLL；requested=Lane请求PLL；pclkConsumer=此Link以它供输入PCLK；offComplete=已完成所述停钟功耗转换。所有消费者须由你完整列出。</p><p id="sharedpll-result" class="protocol-query-output" aria-live="polite">${esc(sharedPllText(o))}</p>${productDependencyDiagram('pll')}</div>`;}

function productPgInfo(text){
 if(typeof text!=='string'||text.length>16000)return null;const events=text.trim().split(/[\s,;，；]+/).filter(Boolean);if(events.length>128)return null;
 const s={stage:'normal',pcsStable:false,pmaStable:false,refEnabled:false,refClock:false,ackHigh:false,railsOff:false,complete:false};
 for(let i=0;i<events.length;i++){
  const e=events[i];let error='';
  if(e==='request-entry'){if(s.stage!=='normal')error='入口请求只能在本模型起点发起';else s.stage='preparing';}
  else if(e==='prepared'){if(s.stage!=='preparing')error='先请求准备，再观察PHY保存/隔离及撤参考请求完成';else s.stage='prepared';}
  else if(e==='gate'){if(s.stage!=='prepared')error='尚未观察准备完成，不能提前PG reset/关开关请求';else s.stage='gated';}
  else if(e==='rails-off'){if(s.stage!=='gated'||s.railsOff)error='实际掉电只能作为本次开关请求撤销后的观察';else s.railsOff=true;}
  else if(e==='wake'){if(s.stage!=='gated')error='本模型先完成本次入口，再撤PG reset请求恢复';else s.stage='waking';}
  else if(e==='pcs-stable'||e==='pma-stable'){if(s.stage!=='waking')error='恢复请求后分别记录新的电源稳定反馈';else s[e==='pcs-stable'?'pcsStable':'pmaStable']=true;}
  else if(e==='ref-enable'||e==='ref-clock'){if(s.stage!=='waking'||!s.pcsStable||!s.pmaStable)error='先有本次PCS与PMA稳定反馈，再确认参考恢复条件';else s[e==='ref-enable'?'refEnabled':'refClock']=true;}
  else if(e==='ack-high'){if(s.stage!=='waking'||!s.refEnabled)error='尚未恢复参考许可，不能关联本次上电Ack';else s.ackHigh=true;}
  else if(e==='configured'){if(s.stage!=='waking'||!s.refEnabled||!s.refClock||!s.ackHigh)error='需两类稳定、参考许可/时钟与本次Ack高再低的完成证据';else{s.stage='configured';s.complete=true;}}
  else error='未知事件，不猜测此产品的额外恢复分支';
  if(error)return {valid:false,index:i,event:e,error,state:s};
 }
 return {valid:true,count:events.length,state:s};
}
function productPgText(t){const r=productPgInfo(t);if(!r)return '输入不超过128个学习事件，或清空查看起点。';if(!r.valid)return `第${r.index+1}项 ${r.event} 缺少前提：${r.error}。\n此前阶段=${r.state.stage}。工具仅检查所列顺序，不命令硬件。`;return [`已接受${r.count}项；阶段=${r.state.stage}。`,r.state.complete?'已提供本次PHY配置完成证据；仍不代表LTSSM/DLL/业务恢复。':'当前轨迹未到最终配置完成，可继续补观察。',r.state.railsOff?'本次记录了实际电源关闭。':'未记录实际电源关闭；原文允许其它SoC需求让电源继续ON，不据此报错。','必要条件学习轨迹，非完整内部FSM。ref-clock事件表示稳定反馈后的参考恢复观察，不声称物理参考绝不能更早保持运行。没有超时数值、模拟波形或断电安全结论。'].join('\n');}
function productPgExplorer(){const t='request-entry prepared gate rails-off wake pcs-stable pma-stable ref-enable ref-clock ack-high configured';return `<div class="flit-explorer"><label class="power-trace-label">Gen5 2.02a观察事件<textarea id="prodpg-events" rows="5" maxlength="16000">${t}</textarea></label><p>事件：request-entry请求准备；prepared准备完成；gate断言PG reset/请求关开关；rails-off可选实际掉电；wake请求恢复；pcs-stable / pma-stable；ref-enable许可；ref-clock恢复观察；ack-high本次Ack高；configured最终Ack低/配置完成。默认上层许可和PG模式已满足。</p><p id="prodpg-result" class="protocol-query-output" aria-live="polite">${esc(productPgText(t))}</p>${productDependencyDiagram('pg')}</div>`;}

function contextSelectionInfo(o){
 if(!o||!Number.isInteger(o.id)||o.id<0||o.id>255||typeof o.available!=='string'||o.available.length>2048||!['yes','no','unknown'].includes(o.supported)||!['init','rate','none'].includes(o.trigger)||!['waiting','restoring','restored'].includes(o.phase)||['loaded','stable','enabled','changed','txPaused','rxPaused'].some(k=>typeof o[k]!=='boolean'))return null;
 const words=o.available.trim()?o.available.trim().split(/[\s,，]+/):[];if(words.some(s=>!/^\d{1,3}$/.test(s)||Number(s)>255))return null;const ids=words.map(Number);if(new Set(ids).size!==ids.length)return null;
 const known=ids.includes(o.id),ready=known&&o.supported==='yes'&&o.loaded&&o.stable&&o.enabled,requestEligible=ready&&(o.trigger==='init'||o.trigger==='rate'&&o.changed),pause=o.txPaused||o.rxPaused;
 return {known,ready,requestEligible,phase:o.phase,firmwareBoundary:o.phase==='restored'&&ready&&!pause,paused:pause};
}
function contextSelectionText(o){const r=contextSelectionInfo(o);if(!r)return '输入8-bit整数ID与不重复的0～255 ID集合，并选择有效配置/触发/阶段及布尔条件。';return [`ID=${o.id}；${r.known?'在所输入镜像目录内':'不在所输入镜像目录内'}；支持组合=${{yes:'已核支持',no:'已核不支持',unknown:'尚未确认'}[o.supported]}。`,r.requestEligible?'满足本工具所列本次Context请求资格。':!o.changed&&o.trigger==='rate'?'Rate事件但此选择未变：不据此认定该类Context必须重新回填；其它TX/RX/Common选择另查。':'未满足本工具所列请求前提；不推断硬件会如何处理无效选择。',o.phase==='restoring'?'回填仍进行，外部CR Parallel/JTAG访问可能被stall。':o.phase==='restored'?r.paused?'已输入Context完成，但至少一侧调试暂停仍有效；不是固件可开始的交接点。':r.firmwareBoundary?'已输入Context完成且两侧调试暂停释放，满足所述交接条件；不保证全部固件启动前提。':'虽输入Context完成，镜像/配置等证据仍不一致，不能据此宣告恢复有效。':'仍在等待阶段，不能将选择资格当作完成。','工具的ID目录为学习输入，不含厂商实际配置。静态Context完成≠动态校准恢复≠ICCM/DCCM掉电保持≠PIPE Restore窗口结束≠Link Up。'].join('\n');}
function contextSelectionInput(){const o={id:Number($('#ctxselect-id').value),available:$('#ctxselect-available').value,supported:$('#ctxselect-supported').value,trigger:$('#ctxselect-trigger').value,phase:$('#ctxselect-phase').value};if(!$('#ctxselect-id').value.trim())o.id=NaN;for(const k of ['loaded','stable','enabled','changed','txPaused','rxPaused'])o[k]=$('#ctxselect-'+k).value==='1';return o;}
function contextSelectionExplorer(){const o={id:2,available:'0, 2, 5',supported:'yes',trigger:'rate',phase:'restored',loaded:true,stable:true,enabled:true,changed:true,txPaused:true,rxPaused:false};return `<div class="flit-explorer"><div class="flit-controls"><label>示例选择ID<input id="ctxselect-id" type="number" min="0" max="255" value="2"></label><label>学习用有效ID集合<input id="ctxselect-available" value="0, 2, 5" maxlength="2048"></label>${pwrSelect('ctxselect-supported','配置组合核对',[['yes','已核支持'],['no','已核不支持'],['unknown','尚未确认']],'yes')}${pwrSelect('ctxselect-trigger','本次触发',[['init','初始化'],['rate','Rate变化'],['none','无触发']],'rate')}${pwrSelect('ctxselect-phase','观察阶段',[['waiting','待回填'],['restoring','回填中'],['restored','已回填']],'restored')}${[['loaded','本次镜像已装载'],['stable','reset释放前选择已稳定'],['enabled','请求捕获时Context已使能'],['changed','该类Context选择已变化'],['txPaused','TX调试暂停有效'],['rxPaused','RX调试暂停有效']].map(([k,t])=>pwrBool('ctxselect-'+k,t,o[k])).join('')}</div><p>0/2/5为任意学习用示例，不代表真实厂商镜像配置。TX、RX、Common分别查询，不模拟所有Link。</p><p id="ctxselect-result" class="protocol-query-output" aria-live="polite">${esc(contextSelectionText(o))}</p>${productDependencyDiagram('context')}</div>`;}
for(const type of ['input','change'])document.addEventListener(type,e=>{const id=e.target.id||'';if(id.startsWith('sharedpll-'))$('#sharedpll-result').textContent=sharedPllText(sharedPllInput());if(id==='prodpg-events')$('#prodpg-result').textContent=productPgText($('#prodpg-events').value);if(id.startsWith('ctxselect-'))$('#ctxselect-result').textContent=contextSelectionText(contextSelectionInput());});

// R32: decoded snapshots and selected LTSSM arcs, not a complete simulator.
function recoveryRate(v,r){return (v==='6.0'?[2.5,5,8,16,32,64]:v==='7.0'?[2.5,5,8,16,32,64,128]:[]).includes(r);}
function recoveryLanes(t){
 if(typeof t!=='string'||t.length>20000)return null;let a;try{a=JSON.parse(t);}catch{return null;}
 if(!Array.isArray(a)||!a.length||a.length>32)return null;const seen=new Set();
 for(const x of a){if(!x||typeof x.id!=='string'||!x.id.trim()||x.id.length>64||seen.has(x.id.trim())||!['TS1','TS2'].includes(x.kind)||!['match','PAD','other'].includes(x.link)||!Number.isInteger(x.run)||x.run<0||x.run>1000000||!Number.isInteger(x.ec)||x.ec<0||x.ec>3||['laneMatch','sc','aligned'].some(k=>typeof x[k]!=='boolean'))return null;seen.add(x.id.trim());}return a;
}
function recoveryLockInfo(o){
 if(!o||!recoveryRate(o.version,o.rate)||!recoveryRate(o.version,o.entryRate)||!['FM','NFM'].includes(o.mode)||o.rate>=64&&o.mode!=='FM'||!Number.isFinite(o.elapsedMs)||o.elapsedMs<0||o.elapsedMs>1000000||!Number.isInteger(o.txTS1)||o.txTS1<0||o.txTS1>1000000||['directed','extended','changed','bothHigher','only25','eqPending'].some(k=>typeof o[k]!=='boolean'))return null;
 const lanes=recoveryLanes(o.lanes);if(!lanes)return null;
 const match=x=>x.aligned&&x.link==='match'&&x.laneMatch;
 const normal=lanes.every(x=>match(x)&&x.run>=8&&x.sc===o.directed&&(o.rate<8||x.kind!=='TS1'||x.ec===0));
 const anySpeed=lanes.some(x=>match(x)&&x.run>=8&&x.sc),anyPad=o.version==='7.0'&&o.mode==='FM'&&lanes.some(x=>x.aligned&&x.kind==='TS2'&&x.run>=8&&x.link==='PAD'&&x.laneMatch);
 const base={normal,anySpeed,anyPad,lanes:lanes.length,target:null};
 if(o.eqPending)return {...base,next:'待核均衡入口',reason:'均衡相关角色/入口尚未排除，不由本工具决定RcvrLock出口。'};
 if(normal&&(!o.extended||o.txTS1>=1024))return {...base,next:'Recovery.RcvrCfg',reason:'normal：全部已列配置Lane满足本工具连续窗口，Extended Synch发送条件已满足。'};
 if(o.elapsedMs<24)return {...base,next:'保持观察',reason:'正常接收/发送前提未全满足，且未到24ms。'};
 if(o.extended&&o.txTS1<1024)return {...base,next:'待核Extended Synch交互',reason:'超时同时尚未完成Extended Synch发送，工具不推断完整交互。'};
 if((anySpeed||anyPad)&&(o.rate>2.5||o.bothHigher))return {...base,next:'Recovery.RcvrCfg',reason:'timeout-1：任一Lane规定证据及速率条件成立，不是all-Lane正常成功。'};
 if(!o.changed&&o.rate>2.5)return {...base,next:'Recovery.Speed',target:o.rate>=64?32:2.5,reason:'timeout-2：未在本次Recovery成功改速，按当前编码回退。'};
 if(o.changed)return {...base,next:'Recovery.Speed',target:o.entryRate,reason:'timeout-3：回从L0/L1进入本次Recovery时的原速。'};
 const anyMatched=lanes.some(x=>match(x)&&x.run>=1),matchNoSc=lanes.some(x=>match(x)&&x.run>=1&&!x.sc);
 if(anyMatched&&((!o.directed&&matchNoSc)||(o.rate===2.5&&o.only25)))return {...base,next:'Configuration',reason:'timeout-4：有匹配TS历史及规定未切速条件；清directed。'};
 return {...base,next:'Detect',reason:'timeout-5：所列更早出口均未满足。'};
}
function recoveryLockText(o){const r=recoveryLockInfo(o);if(!r)return '输入有效版本/速率/模式、非负计数与时间，以及不重复Lane JSON。≥64GT/s须FM。';return [`所列出口：${r.next}${r.target===null?'':`，目标 ${r.target}GT/s`}。`,r.reason,`all-Lane普通窗口=${r.normal?1:0}；any-Lane切速证据=${r.anySpeed?1:0}；7.0 FM PAD TS2替代=${r.anyPad?1:0}。`,'每个run表示本次已对齐后、按适用规则连续合格的同类TS1或TS2窗口；混合序列/隐式1b编号须另核。JSON须覆盖全部配置Lane。不是原始TS解析器，不决定EQ优先、共模计时或所有同刻事件。'].join('\n');}
function recoveryBranchDiagram(kind){const a={lock:['RcvrLock · 原创分支顺序',['先单独核均衡入口','全部Lane正常条件 + 发送门槛 → RcvrCfg','24ms后：先any-Lane协商证据 → RcvrCfg','否则：降速 → 回原速 → Configuration → Detect']],speed:['Speed · 原创因果与目标',['发EIOSQ → TX进入EI','取得RX已EI证据后才允许改频','再满足800ns或6µs下限及1ms上限','目标按成功协商 / 回原速 / 编码回退选择']],width:['RcvrCfg改宽 · 原创条件组合',['先分NFM/FM及6.0/7.0','按正确格式识别8个接收序列与PAD字段','检查16个发送TS2的起点；FM另检查1ms','全部条件成立才到Configuration；新宽度仍待协商']]};const [title,steps]=a[kind];return `<figure class="product-dependency"><figcaption>${title}</figcaption><ol>${steps.map(x=>`<li>${esc(x)}</li>`).join('')}</ol><p>图只覆盖正文说明的选定规则，箭头不表示时间比例或完整LTSSM优先级。</p></figure>`;}
function recoveryLockInput(){const o={version:$('#rlock-version').value,rate:Number($('#rlock-rate').value),entryRate:Number($('#rlock-entryRate').value),mode:$('#rlock-mode').value,lanes:$('#rlock-lanes').value,txTS1:Number($('#rlock-txTS1').value),elapsedMs:Number($('#rlock-elapsedMs').value)};for(const k of ['directed','extended','changed','bothHigher','only25','eqPending'])o[k]=$('#rlock-'+k).value==='1';for(const k of ['txTS1','elapsedMs'])if(!$('#rlock-'+k).value.trim())o[k]=NaN;return o;}
function recoveryRateSelect(id,label,value){return pwrSelect(id,label,[2.5,5,8,16,32,64,128].map(x=>[String(x),x+'GT/s']),String(value));}
function recoveryLockExplorer(){const o={version:'7.0',rate:32,entryRate:32,mode:'FM',lanes:JSON.stringify([{id:'L0',kind:'TS1',run:8,link:'match',laneMatch:true,sc:false,ec:0,aligned:true},{id:'L1',kind:'TS1',run:3,link:'match',laneMatch:true,sc:false,ec:0,aligned:true}],null,2),directed:false,extended:false,changed:false,bothHigher:true,only25:false,eqPending:false,txTS1:100,elapsedMs:24};return `<div class="flit-explorer"><div class="flit-controls">${pwrSelect('rlock-version','Base版本',[['6.0','6.0'],['7.0','7.0']],o.version)}${recoveryRateSelect('rlock-rate','当前速率',o.rate)}${recoveryRateSelect('rlock-entryRate','从L0/L1进入Recovery的原速',o.entryRate)}${pwrSelect('rlock-mode','当前模式',[['FM','Flit Mode'],['NFM','Non-Flit Mode']],o.mode)}<label class="power-trace-label">全部配置Lane快照JSON<textarea id="rlock-lanes" rows="14" maxlength="20000">${esc(o.lanes)}</textarea></label>${[['directed','directed_speed_change'],['extended','Extended Synch'],['changed','本次已成功改速'],['bothHigher','双方均广告≥5GT/s'],['only25','共同最高仅2.5GT/s'],['eqPending','尚有待核的均衡入口']].map(([k,t])=>pwrBool('rlock-'+k,t,o[k])).join('')}<label>本次连续发送TS1数<input id="rlock-txTS1" type="number" min="0" value="100"></label><label>本态已等待ms<input id="rlock-elapsedMs" type="number" min="0" value="24"></label></div><p>run为合格连续窗口；link=match/PAD/other；laneMatch为已按该格式解码的编号匹配；sc为speed_change；ec取0～3；aligned为本次接收对齐已确认。</p><p id="rlock-result" class="protocol-query-output" aria-live="polite">${esc(recoveryLockText(o))}</p>${recoveryBranchDiagram('lock')}</div>`;}

function recoverySpeedInfo(o){
 if(!o||!recoveryRate(o.version,o.rate)||!recoveryRate(o.version,o.entryRate)||!recoveryRate(o.version,o.common)||!['cfg','lock','eq'].includes(o.source)||['success','changed','eios','rxEi','enhanced'].some(k=>typeof o[k]!=='boolean')||!Number.isFinite(o.extraNs)||o.extraNs<0||o.extraNs>1000000000||!Number.isFinite(o.elapsedMs)||o.elapsedMs<0||o.elapsedMs>1000000||![48,96].includes(o.timeoutMs)||o.success&&o.source!=='cfg')return null;
 let target=null,targetNote='',changedNext=false;
 if(o.source==='cfg'&&o.success){target=o.common;changedNext=true;targetNote='成功协商分支：共同最高速率；即使相同也走Speed。';}
 else if(o.changed){target=o.entryRate;targetNote='本次已经改速，回原始Recovery入口速率。';}
 else if(o.rate>=64&&o.version==='6.0'){if(o.source==='lock'||o.source==='cfg'){target=32;targetNote='入口态明确1b/1b回32GT/s；保留6.0 Speed通用else写2.5GT/s的差异。';}else targetNote='6.0其它1b/1b失败来源保留待核，不静默套2.5或32GT/s。';}
 else {target=o.rate>=64?32:2.5;targetNote='按7.0明确编码回退或低速编码规则。';}
 let timeouts=[],timerNote='';
 if(o.version==='6.0'){timeouts=[48];timerNote='6.0 Speed正文48ms。';}
 else if(o.rate<64&&o.enhanced&&o.entryRate>=64){timerNote='两句分别按Speed入口<64和Recovery入口≥64增强判定，混合快照保留待核。';}
 else if(o.rate<64){timeouts=[48];timerNote='7.0 Speed入口<64GT/s的48ms分支。';}
 else if(o.rate===64&&!o.enhanced){timeouts=[48,96];timerNote='7.0 64GT/s非增强允许48或96ms，强烈推荐96ms。';}
 else if(o.enhanced&&o.entryRate>=64){timeouts=[96];timerNote='7.0 Recovery入口≥64GT/s且增强编码：96ms。';}
 else timerNote='输入未被本次核读的超时句明确覆盖，不补造结果。';
 const minNs=o.success?800:6000,canChange=o.eios&&o.rxEi,windowOK=canChange&&o.extraNs>=minNs&&o.extraNs<=1000000,selectedValid=timeouts.includes(o.timeoutMs);
 return {target,targetNote,changedNext,timeouts,timerNote,minNs,canChange,windowOK,windowOver:o.extraNs>1000000,selectedValid,timeoutReached:selectedValid&&o.elapsedMs>=o.timeoutMs};
}
function recoverySpeedText(o){const r=recoverySpeedInfo(o);if(!r)return '输入有效Base/速率、入口、布尔条件、非负时间；成功协商入口须为RcvrCfg，6.0不支持128GT/s。';return [`目标=${r.target===null?'待核':r.target+'GT/s'}；离开Speed后的changed=${r.changedNext?1:0}。${r.targetNote}`,r.canChange?'已输入EIOS已发与RX EI证据，满足所述切频前提。':'尚缺EIOS已发或RX EI证据，不能按本条改变频率。',`RX EI后的额外保持要求 ${r.minNs}～1000000ns；输入=${o.extraNs}ns，${r.windowOK?'满足这段窗口':r.windowOver?'已超过额外1ms上限':'尚未满足这段窗口'}。`,`${r.timerNote} 所选=${o.timeoutMs}ms，${r.selectedValid?'属于本条允许值':'本条未确认此选择'}。`,r.timeoutReached?'已到所选的适用超时观察点；Detect与其它同刻事件的完整仲裁未建模。':'未据当前输入给出已到适用超时的结论。','目标和时间条件独立显示，不执行切频。RX EI/共同速率须由外部正确解码；未模拟完整EQ、PLL、时钟、复位和容差。窗口满足不等于已经Link Up。'].join('\n');}
function recoverySpeedInput(){const o={version:$('#rspeed-version').value,rate:Number($('#rspeed-rate').value),entryRate:Number($('#rspeed-entryRate').value),common:Number($('#rspeed-common').value),source:$('#rspeed-source').value,extraNs:Number($('#rspeed-extraNs').value),elapsedMs:Number($('#rspeed-elapsedMs').value),timeoutMs:Number($('#rspeed-timeoutMs').value)};for(const k of ['success','changed','eios','rxEi','enhanced'])o[k]=$('#rspeed-'+k).value==='1';for(const k of ['extraNs','elapsedMs'])if(!$('#rspeed-'+k).value.trim())o[k]=NaN;return o;}
function recoverySpeedExplorer(){const o={version:'7.0',rate:64,entryRate:64,common:128,source:'cfg',success:true,changed:false,eios:true,rxEi:true,enhanced:true,extraNs:800,elapsedMs:1,timeoutMs:96};return `<div class="flit-explorer"><div class="flit-controls">${pwrSelect('rspeed-version','Base版本',[['6.0','6.0'],['7.0','7.0']],o.version)}${recoveryRateSelect('rspeed-rate','Speed入口速率',o.rate)}${recoveryRateSelect('rspeed-entryRate','原Recovery入口速率',o.entryRate)}${recoveryRateSelect('rspeed-common','已核双方共同最高',o.common)}${pwrSelect('rspeed-source','Speed来自',[['cfg','RcvrCfg'],['lock','RcvrLock'],['eq','Equalization']],o.source)}${[['success','成功协商'],['changed','本次已成功改速'],['eios','本次EIOSQ已发送'],['rxEi','已取得RX EI证据'],['enhanced','TS_Enhanced_Flit_Encode=1']].map(([k,t])=>pwrBool('rspeed-'+k,t,o[k])).join('')}<label>RX EI后额外ns<input id="rspeed-extraNs" type="number" min="0" value="800"></label><label>本态已等待ms<input id="rspeed-elapsedMs" type="number" min="0" value="1"></label>${pwrSelect('rspeed-timeoutMs','查询的超时选择',[['48','48ms'],['96','96ms']],'96')}</div><p id="rspeed-result" class="protocol-query-output" aria-live="polite">${esc(recoverySpeedText(o))}</p>${recoveryBranchDiagram('speed')}</div>`;}

function widthEntryInfo(o){
 if(!o||!recoveryRate(o.version,o.rate)||!['FM','NFM'].includes(o.mode)||o.rate>=64&&o.mode!=='FM'||!['nfm-mismatch','ts1-after-ts2','pad-ts1-no-ts2','pad-ts2','tx-pad-ts2'].includes(o.pattern)||!['ts1','ts2','pad-ts1','none'].includes(o.basis)||!Number.isInteger(o.run)||o.run<0||o.run>1000000||!Number.isInteger(o.tx)||o.tx<0||o.tx>1000000||!Number.isFinite(o.elapsedMs)||o.elapsedMs<0||o.elapsedMs>1000000||['sc','higherAbsent','eqReturn','initiating'].some(k=>typeof o[k]!=='boolean'))return null;
 const issues=[];let receive=false,txBasis=false;
 if(o.mode==='NFM'){
  receive=o.pattern==='nfm-mismatch'&&o.run>=8;txBasis=o.basis==='ts1'||o.basis==='pad-ts1';
  if(!receive)issues.push('NFM须任一Lane连续8个编号不匹配TS1');
  if(o.sc&&!(o.rate===2.5&&o.higherAbsent))issues.push('NFM需speed_change=0或规定2.5GT/s无更高广告例外');
 }else{
  receive=['ts1-after-ts2','pad-ts2','tx-pad-ts2'].includes(o.pattern)&&o.run>=8||o.version==='7.0'&&o.pattern==='pad-ts1-no-ts2'&&o.run>=8;
  txBasis=o.basis==='ts2'||o.version==='7.0'&&o.basis==='pad-ts1';
  if(!receive)issues.push('FM接收模式/连续8个条件不属于所选版本的已列路径');
  if(o.elapsedMs<1)issues.push('FM本态首份TS1/TS2后尚未满1ms');
  if(o.sc)issues.push('FM此弧要求收到的speed_change=0');
 }
 if(!txBasis)issues.push('发送计数起点不符合该版本/模式');
 if(o.tx<16)issues.push('规定起点后尚未发送16个TS2');
 if(o.version==='7.0'&&o.initiating&&(o.sc||o.eqReturn))issues.push('7.0发起改宽受到切速/EQ后入口历史禁止条件限制');
 return {eligible:issues.length===0,receive,txBasis,issues,next:issues.length===0?'Configuration':'未满足此条入口'};
}
function widthEntryText(o){const r=widthEntryInfo(o);if(!r)return '输入有效模式/版本/速率、已分类接收模式、计数起点及非负时间/整数计数。';return [`结果：${r.next}。`,...r.issues.map(x=>'• '+x),o.version==='6.0'&&o.pattern==='pad-ts1-no-ts2'?'6.0所引条文未列此独立PAD TS1路径；不偷用7.0条件。':'',r.eligible?'仅所列弧条件满足；清changed/directed变量，新宽度和Lane编号仍待Configuration协商。':'','pattern表示本次已核实的语义窗口，且包含其先后关系：tx-pad-ts2仍需连续TS2接收条件。1b/1b字段复用须预先正确解码。未自动判断所有其它LTSSM优先事件、支持宽度或L0p。'].filter(Boolean).join('\n');}
function widthEntryInput(){const o={version:$('#wentry-version').value,rate:Number($('#wentry-rate').value),mode:$('#wentry-mode').value,pattern:$('#wentry-pattern').value,basis:$('#wentry-basis').value,run:Number($('#wentry-run').value),tx:Number($('#wentry-tx').value),elapsedMs:Number($('#wentry-elapsedMs').value)};for(const k of ['sc','higherAbsent','eqReturn','initiating'])o[k]=$('#wentry-'+k).value==='1';for(const k of ['run','tx','elapsedMs'])if(!$('#wentry-'+k).value.trim())o[k]=NaN;return o;}
function widthEntryExplorer(){const o={version:'7.0',rate:32,mode:'FM',pattern:'pad-ts1-no-ts2',basis:'pad-ts1',run:8,tx:16,elapsedMs:1,sc:false,higherAbsent:false,eqReturn:false,initiating:false};return `<div class="flit-explorer"><div class="flit-controls">${pwrSelect('wentry-version','Base版本',[['6.0','6.0'],['7.0','7.0']],o.version)}${recoveryRateSelect('wentry-rate','当前速率',o.rate)}${pwrSelect('wentry-mode','模式',[['FM','FM'],['NFM','NFM']],o.mode)}${pwrSelect('wentry-pattern','已核接收模式',[['nfm-mismatch','NFM：TS1编号不匹配'],['ts1-after-ts2','FM：先TS2后连续TS1'],['pad-ts1-no-ts2','FM：未收TS2且PAD TS1'],['pad-ts2','FM：收到Link PAD TS2'],['tx-pad-ts2','FM：TS2接收模式且本端发PAD']],o.pattern)}${pwrSelect('wentry-basis','后续TX计数从接收哪份起',[['ts1','首TS1'],['ts2','首TS2'],['pad-ts1','首PAD TS1'],['none','未确认']],o.basis)}<label>连续接收数<input id="wentry-run" type="number" min="0" value="8"></label><label>该起点后发送TS2数<input id="wentry-tx" type="number" min="0" value="16"></label><label>本态首TS1/TS2后ms<input id="wentry-elapsedMs" type="number" min="0" step="0.1" value="1"></label>${[['sc','收到speed_change=1'],['higherAbsent','NFM至少一侧无≥5GT/s广告'],['eqReturn','刚经EQ→RcvrLock来到本态'],['initiating','本端正主动发起改宽']].map(([k,t])=>pwrBool('wentry-'+k,t,o[k])).join('')}</div><p id="wentry-result" class="protocol-query-output" aria-live="polite">${esc(widthEntryText(o))}</p>${recoveryBranchDiagram('width')}</div>`;}
for(const type of ['input','change'])document.addEventListener(type,e=>{const id=e.target.id||'';if(id.startsWith('rlock-'))$('#rlock-result').textContent=recoveryLockText(recoveryLockInput());if(id.startsWith('rspeed-'))$('#rspeed-result').textContent=recoverySpeedText(recoverySpeedInput());if(id.startsWith('wentry-'))$('#wentry-result').textContent=widthEntryText(widthEntryInput());});

// R33: fixed-timeout, single UIO ID learning model; no hardware access.
function uioTimeoutTraceInfo(o){
 if(!o||!['read','write'].includes(o.kind)||!Number.isFinite(o.timeoutMs)||o.timeoutMs<=0||o.timeoutMs>1e8||!Number.isFinite(o.nowMs)||o.nowMs<0||o.nowMs>1e8||typeof o.trace!=='string'||o.trace.length>24000)return null;
 let events;try{events=JSON.parse(o.trace);}catch{return null;}if(!Array.isArray(events)||!events.length||events.length>128)return null;
 let prev=-1;for(const e of events){if(!e||!['send','cpl'].includes(e.type)||!Number.isFinite(e.ms)||e.ms<0||e.ms>o.nowMs||e.ms<prev||!Number.isInteger(e.dw)||e.dw<1||e.dw>1024||e.type==='cpl'&&!['SC','RRS','CA','UR','reserved'].includes(e.status))return null;prev=e.ms;}
 let sent=0,completed=0,dataDW=0,deadline=null,status='SC',groups=0;const history=[];
 const result=state=>({state,sent,completed,pending:sent-completed,dataDW,deadline,status,groups,history});
 for(const e of events){
  if(sent>completed&&deadline!==null&&e.ms>=deadline){history.push(`事件 ${e.ms}ms 在旧deadline ${deadline}ms ${e.ms===deadline?'同刻；需硬件先后证据':'之后；不能抹掉旧超时'}。`);return result(e.ms===deadline?'same-time':'timeout');}
  if(e.type==='send'){
   if(sent===completed){sent=0;completed=0;dataDW=0;status='SC';groups++;}
   else if(o.kind==='read')return null;
   sent+=e.dw;deadline=e.ms+o.timeoutMs;history.push(`发出 ${e.dw}DW @${e.ms}ms；本组欠${sent-completed}DW；deadline→${deadline}ms。`);
  }else{
   if(sent<=completed||completed+e.dw>sent)return null;
   const s=e.status==='reserved'?'UR':e.status;completed+=e.dw;
   if(o.kind==='read'&&s==='SC')dataDW+=e.dw;
   if(['SC','RRS','CA','UR'].indexOf(s)>['SC','RRS','CA','UR'].indexOf(status))status=s;
   history.push(`完成代表 ${e.dw}DW / ${s} @${e.ms}ms；欠${sent-completed}DW；不是发送重启事件。`);
  }
 }
 if(sent===completed)return result('accounted');
 if(o.nowMs===deadline)return result('same-time');
 return result(o.nowMs>deadline?'timeout':'waiting');
}
function uioTimeoutTraceText(o){const r=uioTimeoutTraceInfo(o);if(!r)return '输入有效的单ID、顺序事件JSON。DW须1～1024，时间非负且不晚于当前；读不能同ID并行，完成不能超过欠账。';const names={accounted:'本组DW已结清',waiting:'本组仍欠完成，尚未到deadline',timeout:'计时窗口已越过：完成证据不足', 'same-time':'同刻边界：不推断硬件事件先后'};return [names[r.state],`本组已发${r.sent}DW；已完成${r.completed}DW；欠${r.pending}DW；归并状态${r.status}；成功带数据DW=${r.dataDW}（仅UIO读，不等同有效BE字节数）。`,...r.history,'DW结清不等于操作成功；Timeout不证明未执行。固定有效Timeout、单ID模型；不校验地址覆盖、CXL、计时重编程或真实收发。'].join('\n');}
function timeoutRecoveryInfo(o){
 if(!o||!['timeout','unexpected','urca'].includes(o.event)||!['nonfatal','fatal'].includes(o.severity)||!['none','unknown','present'].includes(o.sideEffects)||['aer','signal','recover','rootPio'].some(k=>typeof o[k]!=='boolean'))return null;
 if(o.rootPio)return {path:'RP PIO专用机制待核',message:'不由本工具判定',notes:['Root Port PIO须单独核RP Extensions for DPC、RP PIO控制与报告路径。']};
 if(o.event==='urca')return {path:'Requester专属机制',message:'不得据此另发PCIe ERR消息',notes:['Requester决定恢复/是否报告；Completer的原始错误报告独立。']};
 const anfe=o.severity==='nonfatal'&&(o.event==='unexpected'||o.recover),message=!o.signal?'本次信号资格未满足':anfe?(o.aer?'ERR_COR':'无AER：此ANFE不发错误消息'):(o.severity==='fatal'?'ERR_FATAL':'ERR_NONFATAL');
 const notes=[o.event==='unexpected'?'错收代理必须丢弃Unexpected；原Requester可能稍后Timeout。':'恢复次数必须有限；另发新请求不是链路Replay。'];
 if(o.event==='timeout'&&o.recover){if(o.severity==='fatal')notes.push('Fatal不是ANFE，规范强烈不建议继续恢复。');if(o.sideEffects!=='none')notes.push('未证明无副作用：没有自动安全重试的充分依据。');else notes.push('已给出无副作用前提；仍需系统恢复契约，不能保证成功。');}
 return {path:anfe?'ANFE':o.severity==='fatal'?'不可纠正Fatal':'不可纠正Non-Fatal',message,notes};
}
function timeoutRecoveryText(o){const r=timeoutRecoveryInfo(o);return r?[`处理路径：${r.path}；消息：${r.message}。`,...r.notes,'仅列本节责任；signal是外部已解码的本次消息资格，不等于单独某个Enable位。'].join('\n'):'输入有效现象、Severity、AER/信号资格、有限恢复选择和副作用前提。';}
function l12ExitTimingInfo(o){
 const keys=['sampleUs','powerOnUs','activeUs','tsStartUs','eiUs','tsStopUs','commonUs'];
 if(!o||keys.some(k=>!Number.isFinite(o[k])||o[k]<0||o[k]>1e9)||o.powerOnUs>3100||o.commonUs>255||o.tsStartUs<o.activeUs||o.tsStopUs<o.tsStartUs)return null;
 const activeEarliest=o.sampleUs+o.powerOnUs,commonStart=Math.max(o.tsStartUs,o.eiUs),tsEarliest=commonStart+o.commonUs;
 return {activeEarliest,commonStart,tsEarliest,powerWait:o.activeUs>=activeEarliest,commonWait:o.tsStopUs>=tsEarliest};
}
function l12ExitTimingText(o){const r=l12ExitTimingInfo(o);return r?[`主动驱动最早 ${r.activeEarliest}μs；观察 ${o.activeUs}μs：${r.powerWait?'满足本条下界':'早于本条下界'}。`,`DSP共模组合起点=max(${o.tsStartUs},${o.eiUs})=${r.commonStart}μs；TS1至少保持到 ${r.tsEarliest}μs；观察停止 ${o.tsStopUs}μs：${r.commonWait?'满足本条下界':'保持不足'}。`,'仅两个必要计时条件；不证明时钟/供电/共模真实有效或整个LTSSM可退出。输入为同一次退出、同一时间基准的观测。'].join('\n'):'输入非负有限μs时间；TPOWER_ON为0～3100，TCOMMONMODE为0～255；TS1不能早于本端首次主动驱动，停止不能早于开始。';}
function r33EventDiagram(kind){
 const u=kind==='uio';return `<figure class="product-dependency" style="overflow-x:auto"><figcaption>${u?'原创：同ID发送重启与完成核销':'原创：L1.2退出的两个独立计时窗口'}</figcaption><svg viewBox="0 0 920 250" role="img" aria-label="${u?'发送重启deadline，Completion仅核销DW':'采样到主动驱动，以及两个条件同时成立后的TS1保持'}" style="width:100%;min-width:560px;background:#f4f7fb;color:#142333"><defs><marker id="r33-${kind}-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3z" fill="#245a91"/></marker></defs><path d="M30 65H890 M30 145H890 M30 220H890" stroke="#245a91" stroke-width="2" marker-end="url(#r33-${kind}-arrow)"/><g fill="currentColor" font-size="17"><text x="35" y="30">${u?'SEND A → deadline A':'本端采样CLKREQ# asserted'}</text><text x="345" y="30">${u?'SEND B → deadline B（同ID重启）':'等待至少 TPOWER_ON'}</text><text x="635" y="30">${u?'关闭新发窗口，等DW结清':'之后才允许主动驱动'}</text><text x="35" y="115">${u?'Completion：按Length核销DW':'DSP开始发TS1'}</text><text x="345" y="115">${u?'成功数据与错误核销分别统计':'检测任一配置Lane出EI'}</text><text x="635" y="115">${u?'UR/CA无Payload也可核销':'两事件都发生 → 共模起点'}</text><text x="35" y="190">${u?'未收齐＋越过deadline':'组合起点 + TCOMMONMODE'}</text><text x="420" y="190">${u?'→ 超时，不能证明未执行':'→ 此前继续TS1；其它训练条件还需满足'}</text></g></svg><p>原创事件示意；横向顺序不代表比例或同一条全局时间线。${u?'不同ID独立；本图不定义硬件计时器数量。':'CLKREQ#保持/采样竞争、Refclk/LTR另见正文表。'}</p></figure>`;
}
function uioTimeoutTraceInput(){return {kind:$('#utime-kind').value,timeoutMs:$('#utime-timeoutMs').value.trim()?Number($('#utime-timeoutMs').value):NaN,nowMs:$('#utime-nowMs').value.trim()?Number($('#utime-nowMs').value):NaN,trace:$('#utime-trace').value};}
function uioTimeoutTraceExplorer(){const o={kind:'write',timeoutMs:50,nowMs:60,trace:JSON.stringify([{type:'send',ms:0,dw:64},{type:'cpl',ms:10,dw:32,status:'SC'},{type:'send',ms:40,dw:32},{type:'cpl',ms:55,dw:32,status:'UR'}],null,2)};return `<div class="flit-explorer"><div class="flit-controls">${pwrSelect('utime-kind','单个Transaction ID类别',[['write','UIO写'],['read','UIO读']],o.kind)}<label>固定有效超时ms<input id="utime-timeoutMs" type="number" value="50" min="0" step="any"></label><label>当前时刻ms<input id="utime-nowMs" type="number" value="60" min="0" step="any"></label><label class="power-trace-label">事件JSON：type=send/cpl，ms，dw；cpl另填status=SC/RRS/CA/UR/reserved<textarea id="utime-trace" rows="14" maxlength="24000">${esc(o.trace)}</textarea></label></div><p id="utime-result" class="protocol-query-output" aria-live="polite">${esc(uioTimeoutTraceText(o))}</p>${r33EventDiagram('uio')}</div>`;}
function timeoutRecoveryInput(){const o={event:$('#tpolicy-event').value,severity:$('#tpolicy-severity').value,sideEffects:$('#tpolicy-sideEffects').value};for(const k of ['aer','signal','recover','rootPio'])o[k]=$('#tpolicy-'+k).value==='1';return o;}
function timeoutRecoveryExplorer(){const o={event:'timeout',severity:'nonfatal',sideEffects:'unknown',aer:true,signal:true,recover:true,rootPio:false};return `<div class="flit-explorer"><div class="flit-controls">${pwrSelect('tpolicy-event','现象',[['timeout','Completion Timeout'],['unexpected','Unexpected Completion'],['urca','收到UR/CA Completion']],o.event)}${pwrSelect('tpolicy-severity','已配置Severity',[['nonfatal','Non-Fatal'],['fatal','Fatal']],o.severity)}${pwrSelect('tpolicy-sideEffects','副作用前提',[['unknown','尚未确认'],['none','已确认无副作用'],['present','存在副作用']],o.sideEffects)}${[['aer','实现AER'],['signal','本次消息信号资格已满足'],['recover','选择继续有限恢复'],['rootPio','属于Root Port PIO']].map(([k,t])=>pwrBool('tpolicy-'+k,t,o[k])).join('')}</div><p id="tpolicy-result" class="protocol-query-output" aria-live="polite">${esc(timeoutRecoveryText(o))}</p></div>`;}
function l12ExitTimingInput(){const o={};for(const k of ['sampleUs','powerOnUs','activeUs','tsStartUs','eiUs','tsStopUs','commonUs'])o[k]=$('#l12time-'+k).value.trim()?Number($('#l12time-'+k).value):NaN;return o;}
function l12ExitTimingExplorer(){const o={sampleUs:0,powerOnUs:20,activeUs:20,tsStartUs:22,eiUs:25,tsStopUs:35,commonUs:10},labels={sampleUs:'本端采样CLKREQ# asserted',powerOnUs:'已配置TPOWER_ON',activeUs:'本端首次主动驱动',tsStartUs:'DSP开始TS1',eiUs:'DSP检测任一配置Lane出EI',tsStopUs:'DSP停止TS1',commonUs:'已配置TCOMMONMODE'};return `<div class="flit-explorer"><div class="flit-controls">${Object.entries(labels).map(([k,t])=>`<label>${esc(t)} / μs<input id="l12time-${k}" type="number" min="0" step="any" value="${o[k]}"></label>`).join('')}</div><p>固定时间参数已按设计正确配置的前提下，核对两个必要窗口；时间是观测μs，不是寄存器编码。</p><p id="l12time-result" class="protocol-query-output" aria-live="polite">${esc(l12ExitTimingText(o))}</p>${r33EventDiagram('l12')}</div>`;}
for(const type of ['input','change'])document.addEventListener(type,e=>{const id=e.target.id||'';if(id.startsWith('utime-'))$('#utime-result').textContent=uioTimeoutTraceText(uioTimeoutTraceInput());if(id.startsWith('tpolicy-'))$('#tpolicy-result').textContent=timeoutRecoveryText(timeoutRecoveryInput());if(id.startsWith('l12time-'))$('#l12time-result').textContent=l12ExitTimingText(l12ExitTimingInput());});
