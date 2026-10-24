# PCIe Study

逐项说明 PCIe 功能原理、使用前提、职责边界和检查方法，并定位到明确版本的规范章节。例子只放在功能块中辅助理解。

在线阅读：[PCIe Study](https://mgc455.github.io/pcie_study/)（公开访问，无需登录）。2026-10-22已确认仓库恢复公开、GitHub Pages启用，首页和站点数据可正常访问，本次内容版本为 `2026-10-24-r69`，线上版本以网站首页显示为准。后续内容更新继续通过GitHub Pages发布。Cloudflare Pages + Access暂缓，保留[备用部署说明](deployment/cloudflare-pages.md)。

## 内容

- 183 项功能与学习主题，13 类主题；可搜索、收藏和标记已读。
- [按协议章序查](https://mgc455.github.io/pcie_study/#coverage)：Gen1～Gen7的117个主章/附录起始定位，分别显示目录定位和选定正文规则的整理情况；不将引用数量当成整章覆盖率。
- [协议细节查询](https://mgc455.github.io/pcie_study/#lookup)：状态条件、Credit、PIPE、回环、Compliance逐档表、Retimer与接收/误码专题，支持稳定小节链接与版本明确的PDF定位。
- [PHY／SerDes](https://mgc455.github.io/pcie_study/#phy)：20项分层、数据流、时钟复位、PLL/CDR、均衡、固件启动及验证边界主题。
- [Gen1～Gen7 演进](https://mgc455.github.io/pcie_study/#generations)：各代速率、编码/调制、主要架构变化、带宽口径和学习路线；完整逐版差异持续核读。
- [每日自查](https://mgc455.github.io/pcie_study/#audit)：记录实际检查、内容缺口和未解决问题。
- 131 项原始功能已定位到用户提供的 PCI Express Base Specification Revision 6.0 目录；PHY新增条目按PIPE规范或产品手册分别记录版本和核读页。完整章节会逐项核读、精化，不能把目录定位当作全部原文已验证。
- 文档目录只保存名称/格式/初筛主题。文件名中的版本、草案状态和主题仍待核对。
- 支持选择本地对应 PDF 并按物理页定位。文件只在浏览器使用，不上传。刷新后需要重新选择，阅读器对 `#page=` 的支持可能不同。
- 原始 RTL、PDF、商业手册正文、本地路径和工程专属配置不随网站发布。

## PHY细节查询入口

- [动态校准Bank分支](https://mgc455.github.io/pcie_study/#feature/176/detail/dynamic-bank-learning-query)：配置匹配、保持证据、首次/同Bank/跨Bank与Force/Skip。
- [6µs对齐观察窗口](https://mgc455.github.io/pcie_study/#feature/174/detail/recal-window-learning-query)：PHY有效到MAC RxReady，明确未知边界。
- [评估中止的两层职责](https://mgc455.github.io/pcie_study/#feature/173/detail/adapt-abort-two-boundaries)：内部继续计算与MAC忽略迟到反馈。

- [PAM4 TX四抽头](https://mgc455.github.io/pcie_study/#feature/172/detail/pam4-four-tap-query)：Base6.0/7.0数字约束、Q类Preset与理想电压/FIR演示。
- [RX评估反馈](https://mgc455.github.io/pcie_study/#feature/173/detail/rx-eval-query)：反馈提交、中止重叠、无效候选与方向解码。
- [PHY重新校准](https://mgc455.github.io/pcie_study/#feature/174/detail/recal-sequence-query)：通知、Recovery、IORecal与本次Done的流程图和查询。

查询通过仅表示已检查的必要条件，不替代电气、BER或硬件验证。各块可选择本地对应版本PDF对照。

## UIO查询入口

- [UIO机制与端到端条件](https://mgc455.github.io/pcie_study/#feature/33)：全路径FM、独立ID命名空间及顺序责任。
- [UIO完成DW账本](https://mgc455.github.io/pcie_study/#feature/20/detail/uio-completion-ledger-query)：无序/聚合完成、错误状态归并、原创字段图。
- [UIO流控与接受依赖](https://mgc455.github.io/pcie_study/#feature/21/detail/uio-fc-class-versus-completion)：写用Posted FC仍需事务完成。

## 本地构建

仅需 Python 3 标准库；浏览器端没有外部 CDN/框架依赖：

```sh
python scripts/build.py
python scripts/check.py
python -m http.server 8000 --directory docs --bind 127.0.0.1
```

打开 http://127.0.0.1:8000 。也可直接打开 `docs/index.html` 阅读；浏览器本地存储/PDF预览能力因环境而异。

## GitHub Pages 发布配置

在仓库 Settings → Pages → Build and deployment 中选 **Deploy from a branch**，分支 **main**，目录 **/docs**，保存。之后公开 `docs/` 的提交可触发 Pages 发布。见 [GitHub 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

`.github/workflows/check.yml` 验证规范元数据与站点构建。每日智能完善由单独设置的 Codex 任务负责；这个 Actions 工作流不生成学习内容。

## 维护

以 `content/features.json` 为公开内容主数据，保持功能 ID 稳定。北京时间每天 09:00 的 Codex 任务先自查，再新增或深化少量知识块，轮流推进 Gen1～Gen7 演进及协议各主题。核读来源、修正/深化后运行检查，更新 `content/changelog.json` 和 `content/self-audit.json`。本地任务需电脑与 Codex 保持开启。参考 `AGENTS.md` 和 `content/maintenance.json`。

规范、实现选项和平台机制分开标注。协议位置绑定版本；尚未核实的项目明确保留待核实状态。学习笔记不替代标准，不作硬件符合性或实现完成的保证。

### 时钟与深睡恢复查询

- [REFCLK移除与P-state条件](https://mgc455.github.io/pcie_study/#feature/170/detail/refclk-removal-query)
- [RX待机、EI检测和valid证据](https://mgc455.github.io/pcie_study/#feature/169/detail/rx-wake-evidence-query)
- [DeepPM/Restore事件顺序与32周期](https://mgc455.github.io/pcie_study/#feature/174/detail/deep-pm-trace-query)

接口规则绑定PIPE7.1，产品接收行为分别绑定2.02a/3.02a；工具为只读学习模型，保留规范内部差异及尚未核读范围。

### UIO与SVC配置查询

- [UIO请求位图与Type](https://mgc455.github.io/pcie_study/#feature/33/detail/uio-request-header-maps)
- [256B/4KB边界与请求拆分](https://mgc455.github.io/pcie_study/#feature/33/detail/uio-boundary-split-query)
- [SVC寄存器解码](https://mgc455.github.io/pcie_study/#feature/114/detail/svc-register-decoder)
- [双端TC/VC映射和协商检查](https://mgc455.github.io/pcie_study/#feature/114/detail/svc-link-configuration-query)

本组细规则绑定Base7.0，区分Supported/Selected、资源序号/VC ID及Pending有效范围；工具只检查输入，不操作设备。

### PME唤醒、关机与Root通知

- [PM消息逐bit包结构](https://mgc455.github.io/pcie_study/#feature/57/detail/pm-message-fm-bit-layouts)
- [PME四态图与转移查询](https://mgc455.github.io/pcie_study/#feature/59/detail/pme-delivery-state-query)
- [Switch聚合、Ready和100ns/超时检查](https://mgc455.github.io/pcie_study/#feature/85/detail/turnoff-gather-query)
- [来源与Root状态及中断条件](https://mgc455.github.io/pcie_study/#feature/59/detail/pme-native-register-query)

本组独立对照Base6.0/7.0；只读工具区分消息应答、Link就绪、软件服务和平台掉电条件，不操作设备。

### PHY产品低功耗与恢复查询

- [共享PLL：谁还在用、何时能撤Force/改配置](https://mgc455.github.io/pcie_study/#feature/175/detail/product-shared-pll-query)
- [Gen5外部Power Gating：逐事件检查准备与恢复](https://mgc455.github.io/pcie_study/#feature/174/detail/pg5-event-query)
- [静态Context ID与固件前调试交接](https://mgc455.github.io/pcie_study/#feature/176/detail/context-selection-query)

以上为Gen5/Gen6指定产品版本的原创解释和有限依赖查询，区分协议、PIPE、PMD和物理供电；已标出PCS/PMA上电复位时间的资料差异。

### R32在线与离线查阅

仓库和GitHub Pages现已恢复公开，可通过上方在线地址阅读。也可下载本仓库，在本地打开 `docs/index.html`，使用站内搜索、详情深链接和本地PDF对照。

R32新增Recovery复杂出口、速率切换和NFM/FM改宽条件，分别见功能4、5、6。三个查询块的稳定ID为 `recovery-lock-branch-query`、`speed-window-target-query`、`width-entry-version-query`；在本地网页的“协议细节查询”中可检索。正文分列Base6.0/7.0、接收/发送计数起点、EI窗口、48/96ms超时与未核交互。

### UIO超时、错误恢复与L1.2时序

- [同ID UIO时间线](https://mgc455.github.io/pcie_study/#feature/33/detail/uio-timeout-trace-query)：发新请求重启计时、完成DW记账与错误状态。
- [错误处理责任查询](https://mgc455.github.io/pcie_study/#feature/102/detail/timeout-report-policy-query)：Timeout、Unexpected和UR/CA的责任及ANFE边界。
- [L1.2退出计时](https://mgc455.github.io/pcie_study/#feature/87/detail/l1ss-exit-timing-query)：本端唤醒采样、主动驱动下界与DSP共模TS1保持。

UIO细规则绑定Base7.0；恢复与L1SS相关规则分别核对Base6.0/7.0。查询是必要条件学习模型，不操作设备，不证明整章或七代已全部覆盖。

## R35细节入口

- [动态SharedFC有效上限](https://mgc455.github.io/pcie_study/#feature/114/detail/svc-ecn-effective-limit-query)
- [FCParameters包图与解码](https://mgc455.github.io/pcie_study/#feature/21/detail/fcparameters-byte-decoder)
- [Configuration候选Lane组](https://mgc455.github.io/pcie_study/#feature/4/detail/cfg-upstream-group-query)

ECN本地9/18变更副本与官网10/7发布目录分别标注；未证明与会员下载版逐字一致或后续Base合入。

## R36细节入口

- [接收错误处置](https://mgc455.github.io/pcie_study/#feature/33/detail/uio-receive-disposition-query)：Malformed、UIO无法服务与流控记账。
- [UIO读地址覆盖](https://mgc455.github.io/pcie_study/#feature/20/detail/uio-read-range-ledger-query)：DW总量、成功区间、重复和未知错误地址。
- [EB恢复窗口](https://mgc455.github.io/pcie_study/#feature/169/detail/pipe-eb-reset-window-query)：Original PIPE弹性缓冲恢复与16PCLK窗口。

## R37细节入口

- [Receiver Detect](https://mgc455.github.io/pcie_study/#feature/178/detail/detect-qualified-result-query)：完成有效窗口、编码与产品边界。
- [切速时钟架构](https://mgc455.github.io/pcie_study/#feature/175/detail/rate-clock-architecture-table)：Fixed PCLK、停钟、PHY最大频率。
- [Complete出口查询](https://mgc455.github.io/pcie_study/#feature/4/detail/complete-gate-query)：逐Lane收8、首收后发16和2ms回退。

## R38细节入口

- [ACS/Atomic/IDE错误处置](https://mgc455.github.io/pcie_study/#feature/108/detail/blocked-error-disposition-query)：完成状态、本地根因与负责组件。
- [AER快照与位图](https://mgc455.github.io/pcie_study/#feature/108/detail/blocked-aer-snapshot-query)：ACS bit21与Atomic bit24。
- [UIO矩阵查询](https://mgc455.github.io/pcie_study/#feature/33/detail/uio-matrix-explorer)：越过顺序、角色接收依赖与Flow-Through IDE。

## R39细节入口

- [RX产品评估快照](https://mgc455.github.io/pcie_study/#feature/173/detail/product-rx-evaluation-snapshot-query)：FOM/方向能力、DFE/PPM与有效前提。
- [AFE/CDR校准对照](https://mgc455.github.io/pcie_study/#feature/171/detail/rx-calibration-layer-comparison-table)：校准、适配、锁定分别观察。
- [Configuration.Idle出口](https://mgc455.github.io/pcie_study/#feature/4/detail/cfgidle-exit-query)：Symbol/Flit计数、超时入口、有限Recovery回退。

## R40 IDE查阅入口

- [Stream状态与Ready](https://mgc455.github.io/pcie_study/#feature/124/detail/ide-stream-conceptual-state-table)
- [Stream控制与状态字段](https://mgc455.github.io/pcie_study/#feature/125/detail/ide-control-status-fields)
- [IDE_KM对象与职责](https://mgc455.github.io/pcie_study/#feature/126/detail/ide-km-command-catalog)

## R41中断查询入口

- [MSI控制与向量编码](https://mgc455.github.io/pcie_study/#feature/53/detail/msi-control-vector-encoding)
- [Mask与Pending](https://mgc455.github.io/pcie_study/#feature/54/detail/msi-mask-pending-lifecycle)
- [MSI-X Table/PBA布局](https://mgc455.github.io/pcie_study/#feature/55/detail/msix-entry-pba-layout)

## R42 PHY集成查阅入口

- [参考供钟与Lane复位](https://mgc455.github.io/pcie_study/#feature/170/detail/g6-all-lanes-reset-clock-dependency)
- [APB完成与错误窗口](https://mgc455.github.io/pcie_study/#feature/176/detail/g6-apb-read-error-valid-window)
- [外部校准码等待](https://mgc455.github.io/pcie_study/#feature/174/detail/g6-rescal-follower-valid-startup-wait)

## R43能力发现入口

- [双能力链与入口](https://mgc455.github.io/pcie_study/#feature/39/detail/cap-two-list-entry-points)
- [扩展Header与Next](https://mgc455.github.io/pcie_study/#feature/39/detail/cap-extended-header-bit-fields)
- [DVSEC字段与厂商身份](https://mgc455.github.io/pcie_study/#feature/50/detail/dvsec-header-layout-and-identity)
- [能力Version与代际](https://mgc455.github.io/pcie_study/#feature/38/detail/pcie-capability-version-is-not-generation)

## R44 IDE时序与对象图

- [KEY_PROG与确认](https://mgc455.github.io/pcie_study/#feature/126/detail/ide-key-prog-serialization-ifv)
- [Go的三种状态分支](https://mgc455.github.io/pcie_study/#feature/126/detail/ide-go-enable-state-branches)
- [Go/Stop/ACK逐bit图](https://mgc455.github.io/pcie_study/#feature/126/detail/ide-km-go-stop-ack-bitmaps)

## R45 ARI与VF资源查询

- [VF RID与Bus查询](https://mgc455.github.io/pcie_study/#feature/65/detail/sriov-rid-window-query)
- [VF BAR窗口查询](https://mgc455.github.io/pcie_study/#feature/65/detail/sriov-bar-window-query)
- [VF销毁与版本差异](https://mgc455.github.io/pcie_study/#feature/64/detail/sriov-disable-recreate-version)

## R46 PHY配置与时钟依赖

- [Lane握手序列查询](https://mgc455.github.io/pcie_study/#feature/174/detail/g6-lane-sequence-query)
- [进入P0的时钟资格](https://mgc455.github.io/pcie_study/#feature/170/detail/g6-tx-clock-before-req-release)
- [PMD管理中断与PCIe中断边界](https://mgc455.github.io/pcie_study/#feature/176/detail/g6-pmd-interrupt-versus-msix)

## R47 SIOV与外置VF

- [SIOV能力读取快照](https://mgc455.github.io/pcie_study/#feature/67/detail/siov-capability-snapshot-query)
- [SDI Reset完成条件](https://mgc455.github.io/pcie_study/#feature/67/detail/siov-sdi-reset-completion)
- [Extensible IOV产品边界](https://mgc455.github.io/pcie_study/#feature/66/detail/extiov-external-vf-product-scope)

## R48 配置路由与就绪观察

- [逐级配置路由查询](https://mgc455.github.io/pcie_study/#feature/18/detail/cfg-route-hop-query)
- [何时捕获Bus/Device](https://mgc455.github.io/pcie_study/#feature/36/detail/enum-capture-write-not-probe)
- [RRS主机观察查询](https://mgc455.github.io/pcie_study/#feature/101/detail/rrs-rp-observation-query)

## R49 RcvrCfg细节

- [成功协商到Speed的门槛](https://mgc455.github.io/pcie_study/#feature/4/detail/rcfg-speed-gates-query)
- [FM重配版本表](https://mgc455.github.io/pcie_study/#feature/4/detail/rcfg-fm-configuration-version-table)
- [FM重配门槛查询](https://mgc455.github.io/pcie_study/#feature/4/detail/rcfg-fm-configuration-gate-query)

## R50 Byte Enable与有效范围

- [Byte Enable字节图与规则检查](https://mgc455.github.io/pcie_study/#feature/17/detail/memory-be-byte-map-query)
- [连续byte范围转TLP](https://mgc455.github.io/pcie_study/#feature/17/detail/memory-contiguous-span-planner)
- [零长度读与flush范围](https://mgc455.github.io/pcie_study/#feature/20/detail/completion-zero-read-flush-scope)

## PIPE逐信号专项

- [信号速查与详细字段](https://mgc455.github.io/pcie_study/#feature/164/detail/pipe-signal-directory)
- [Rate、Width与时钟编码](https://mgc455.github.io/pcie_study/#feature/164/detail/pipe-signal-rate-width)
- [PIPE修订差异](https://mgc455.github.io/pcie_study/#feature/164/detail/pipe-signal-revisions)

## R51 参考时钟与Lower SKP

- [Lower SKP逐方向字段查询](https://mgc455.github.io/pcie_study/#feature/10/detail/lower-skp-snapshot-query)
- [SKP调度分支与计数边界](https://mgc455.github.io/pcie_study/#feature/10/detail/skp-schedule-query)
- [SSC能力分档](https://mgc455.github.io/pcie_study/#feature/170/detail/refclk-ssc-capability-bands)

## R52 Recovery.Idle与L0出口

- [Idle控制请求与流收尾](https://mgc455.github.io/pcie_study/#feature/4/detail/ridle-control-request-query)
- [L0事件的候选出口](https://mgc455.github.io/pcie_study/#feature/4/detail/l0-exit-evidence-query)
- [NFM改宽上限与权限](https://mgc455.github.io/pcie_study/#feature/6/detail/l0-upconfigure-original-ceiling)

## R53 枚举、ARI与能力链

- [ARI逐位解码](https://mgc455.github.io/pcie_study/#feature/63/detail/ari-register-query)
- [Capability离线遍历](https://mgc455.github.io/pcie_study/#feature/39/detail/cap-chain-snapshot-query)
- [Function探测许可](https://mgc455.github.io/pcie_study/#feature/36/detail/enum-mf-permission-not-count)

## R54 I/O与配置请求

- [I/O字段与完成查询](https://mgc455.github.io/pcie_study/#feature/19/detail/io-field-formation-query)
- [配置偏移编码查询](https://mgc455.github.io/pcie_study/#feature/18/detail/cfg-single-dw-encoding-query)
- [Posted接收10µs的含义](https://mgc455.github.io/pcie_study/#feature/17/detail/memory-posted-acceptance-not-operation-time)

## R55 PIPE时钟补偿与接收错误

- [RxDataValid节奏查询](https://mgc455.github.io/pcie_study/#feature/170/detail/clock-empty-cadence-query)
- [单拍错误优先级查询](https://mgc455.github.io/pcie_study/#feature/169/detail/pipe-rxerror-event-query)
- [RxPolarity的20PCLK响应](https://mgc455.github.io/pcie_study/#feature/8/detail/pipe-polarity-twenty-pclk)

## R56 Hot Reset与Disabled七版规则

- [Hot Reset角色与计时查询](https://mgc455.github.io/pcie_study/#feature/4/detail/hotreset-role-timer-query)
- [Disabled退出条件查询](https://mgc455.github.io/pcie_study/#feature/4/detail/disabled-exit-role-query)
- [SBR字段与最短保持时间](https://mgc455.github.io/pcie_study/#feature/94/detail/sbr-fixed-bit-minimum-duration)

## R57 Resizable BAR与VF资源

- [普通RBAR字段解码](https://mgc455.github.io/pcie_study/#feature/44/detail/rbar-register-snapshot-query)
- [VF窗口和页面查询](https://mgc455.github.io/pcie_study/#feature/45/detail/vf-rbar-aperture-query)
- [完整尺寸支持位表](https://mgc455.github.io/pcie_study/#feature/44/detail/rbar-supported-size-bit-map)

## R58 Prefix与OHC-E

- [Prefix顺序查询](https://mgc455.github.io/pcie_study/#feature/34/detail/prefix-sequence-query)
- [PASID逐bit图](https://mgc455.github.io/pcie_study/#feature/34/detail/pasid-prefix-bit-layout)
- [OHC-E打包查询](https://mgc455.github.io/pcie_study/#feature/35/detail/ohce-packing-query)

## R59 NFM可靠性与维护优先级

- [接收序号查询](https://mgc455.github.io/pcie_study/#feature/97/detail/nfm-rx-sequence-query)
- [发送确认窗口查询](https://mgc455.github.io/pcie_study/#feature/97/detail/nfm-tx-ack-window-query)
- [当前优先级与阶段进度](https://mgc455.github.io/pcie_study/#audit)

## R60 DL_Feature与InitFC

- [Feature寄存器查询](https://mgc455.github.io/pcie_study/#feature/141/detail/dl-feature-register-query)
- [InitFC轨迹查询](https://mgc455.github.io/pcie_study/#feature/111/detail/fc-init-trace-query)
- [阶段进度2/4](https://mgc455.github.io/pcie_study/#audit)

## R61 中断查询

- [MSI生成与门控](https://mgc455.github.io/pcie_study/#feature/53/detail/msi-message-query)
- [MSI-X定位与屏蔽](https://mgc455.github.io/pcie_study/#feature/55/detail/msix-location-and-gate-query)
- [INTx桥接映射](https://mgc455.github.io/pcie_study/#feature/52/detail/intx-bridge-swizzle)

## R62 数据通路与阶段复盘

- [四条AXI路径](https://mgc455.github.io/pcie_study/#feature/143/detail/axi-controller-roles-and-four-paths)
- [iATU地址查询](https://mgc455.github.io/pcie_study/#feature/146/detail/iatu-window-query)
- [HDMA候选包规划](https://mgc455.github.io/pcie_study/#feature/147/detail/hdma-remote-packet-plan-query)
- [R59～R62阶段总结](https://mgc455.github.io/pcie_study/#audit)

## R63 HDMA停止与所有权

- [状态与错误查询](https://mgc455.github.io/pcie_study/#feature/148/detail/hdma-status-error-query)
- [数据元素所有权查询](https://mgc455.github.io/pcie_study/#feature/147/detail/hdma-data-element-ownership-query)
- [产品文档差异](https://mgc455.github.io/pcie_study/#feature/148/detail/hdma-source-discrepancies)

## R64 PIPE切速与恢复

- [切速门控与握手需求](https://mgc455.github.io/pcie_study/#feature/170/detail/pipe-rate-plan-query)
- [切速逐事件查询](https://mgc455.github.io/pcie_study/#feature/170/detail/pipe-rate-trace-query)
- [RX待机与训练中止](https://mgc455.github.io/pcie_study/#feature/174/detail/rxstandby-during-training-abort)

## R65 早期Recovery与L0p

- [L0p包结构](https://mgc455.github.io/pcie_study/#feature/15/detail/l0p-link-management-bit-map)
- [版本化仲裁查询](https://mgc455.github.io/pcie_study/#feature/15/detail/l0p-arbitration-query)
- [版本化计时预算](https://mgc455.github.io/pcie_study/#feature/15/detail/l0p-timing-budget-query)

## R66 DOE / TDISP与阶段总结

- [DOE对象头](https://mgc455.github.io/pcie_study/#feature/127/detail/doe-object-header-bit-map)
- [TDISP状态与命令](https://mgc455.github.io/pcie_study/#feature/129/detail/tdisp-command-state-query)
- [阶段总结](https://mgc455.github.io/pcie_study/#updates)

## R67 FM Flow Control / SVC

- [初始分配矩阵](https://mgc455.github.io/pcie_study/#feature/111/detail/fc-fm-allocation-matrix-query)
- [有限广告基线](https://mgc455.github.io/pcie_study/#feature/111/detail/fc-minimum-advertisement-query)
- [SVC启停边界](https://mgc455.github.io/pcie_study/#feature/114/detail/svc-fm-disable-preserve-and-reenable-conflict)

## R68 Ordered Set / TS / Electrical Idle

- [TS字段图](https://mgc455.github.io/pcie_study/#feature/12/detail/ts-classic-symbol-bit-map)
- [Training Control解码](https://mgc455.github.io/pcie_study/#feature/12/detail/ts-training-control-byte-query)
- [OS上下文查询](https://mgc455.github.io/pcie_study/#feature/12/detail/ordered-set-shape-context-query)

## R69 TDISP / IDE data plane

- [XT/T访问门控](https://mgc455.github.io/pcie_study/#feature/129/detail/tdisp-state-versus-packet-gate-query)
- [请求标记规划](https://mgc455.github.io/pcie_study/#feature/129/detail/tdisp-request-tag-plan-query)
- [MMIO更新字段](https://mgc455.github.io/pcie_study/#feature/129/detail/tdisp-mmio-attribute-field-map)
