# PCIe Study

逐项说明 PCIe 功能原理、使用前提、职责边界和检查方法，并定位到明确版本的规范章节。例子只放在功能块中辅助理解。

在线阅读：[PCIe Study](https://mgc455.github.io/pcie_study/)（公开访问，无需登录）。2026-10-22已确认仓库恢复公开、GitHub Pages启用，首页和站点数据可正常访问，本次内容版本为 `2026-10-26-r94`，线上版本以网站首页显示为准。后续内容更新继续通过GitHub Pages发布。Cloudflare Pages + Access暂缓，保留[备用部署说明](deployment/cloudflare-pages.md)。

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

## R70 PHY measurement and stage review

- [FBER控制查询](https://mgc455.github.io/pcie_study/#feature/179/detail/fber-control-query)
- [BERMON证据查询](https://mgc455.github.io/pcie_study/#feature/179/detail/bermon-evidence-query)
- [阶段优先级与总结](https://mgc455.github.io/pcie_study/#audit)

## R71 Completion lifetime and tags

- [Completion到达处置](https://mgc455.github.io/pcie_study/#feature/20/detail/completion-arrival-context-query)
- [Tag分区计算](https://mgc455.github.io/pcie_study/#feature/22/detail/tag-low8-partition-query)
- [FLR等待边界](https://mgc455.github.io/pcie_study/#feature/102/detail/timeout-flr-wait-three-clocks)

## R72 Poison and AER evidence

- [Poison角色与报告查询](https://mgc455.github.io/pcie_study/#feature/100/detail/poison-report-path-query)
- [AER Header快照查询](https://mgc455.github.io/pcie_study/#feature/103/detail/aer-header-snapshot-query)
- [同包错误优先级](https://mgc455.github.io/pcie_study/#feature/103/detail/aer-received-tlp-precedence-table)

## R73 PIPE clocks and reset

- [复位前提查询](https://mgc455.github.io/pcie_study/#feature/174/detail/reset-release-preflight-query)
- [MacCLK事件序列](https://mgc455.github.io/pcie_study/#feature/170/detail/macclk-event-trace-query)
- [RxCLK尾窗查询](https://mgc455.github.io/pcie_study/#feature/169/detail/rxguard-cycle-budget-query)

## R74 Polling and fourth-stage review

- [七版Polling.Active查询](https://mgc455.github.io/pcie_study/#feature/4/detail/polling-active-version-gate-query)
- [Polling.Configuration计数查询](https://mgc455.github.io/pcie_study/#feature/4/detail/polling-configuration-counter-query)
- [七版正文定位表](https://mgc455.github.io/pcie_study/#feature/4/detail/polling-seven-revision-locators)
- [R71～R74阶段回顾与当前优先级](https://mgc455.github.io/pcie_study/#updates)：配置身份/Header → 翻译失效 → PHY/Retimer轮换。

## R75 配置身份与访问门控

- [身份字段位图](https://mgc455.github.io/pcie_study/#feature/37/detail/identity-dword-map)
- [身份与VF视图解码](https://mgc455.github.io/pcie_study/#feature/37/detail/identity-snapshot-query)
- [Command角色/方向门控查询](https://mgc455.github.io/pcie_study/#feature/40/detail/command-gate-query)
- [两类配置头64B对照](https://mgc455.github.io/pcie_study/#feature/40/detail/header-64byte-layout-map)
- 当前四轮窗口1/4，下一轮ATS失效/同步，再PHY/Retimer；阶段回顾见更新记录与自查页。

## R76 ATS失效与隔离

- [失效64bit负载位图](https://mgc455.github.io/pcie_study/#feature/69/detail/invalidate-body-bit-layout)
- [7.0 FM失效完成基础头](https://mgc455.github.io/pcie_study/#feature/69/detail/invalidate-fm-completion-bit-layout)
- [ITag/CC完成账本](https://mgc455.github.io/pcie_study/#feature/69/detail/invalidate-completion-scoreboard-query)
- [在途翻译范围冲突查询](https://mgc455.github.io/pcie_study/#feature/68/detail/ats-overlap-query)
- [DMA隔离责任与证据](https://mgc455.github.io/pcie_study/#feature/130/detail/dma-isolation-responsibility-map)
- 当前窗口2/4，下一轮PHY/Retimer；早期ATS、Shadow/Segment和平台实现仍保留待核。

## R77 Retimer与PHY分段

- [Retimer检测快照](https://mgc455.github.io/pcie_study/#feature/11/detail/retimer-presence-snapshot-query)
- [普通电气Retimer拓扑图与版本检查](https://mgc455.github.io/pcie_study/#feature/11/detail/retimer-topology-query)
- [三/四Retimer SKP历史门槛](https://mgc455.github.io/pcie_study/#feature/11/detail/retimer-skp-history-query)
- [PHY关联入口](https://mgc455.github.io/pcie_study/#phy)
- 当前窗口3/4；R78优先早期代际训练差分并做四轮复盘。

## R78 早期Recovery与阶段复盘

- [Gen2/3/4均衡入口查询](https://mgc455.github.io/pcie_study/#feature/4/detail/r78-eq-entry-query)
- [RcvrCfg升速与32/128份计数](https://mgc455.github.io/pcie_study/#feature/3/detail/r78-rcfg-query)
- [Phase逐角色出口/超时表](https://mgc455.github.io/pcie_study/#feature/4/detail/r78-eq-phase-transition-table)
- [EI推断逐状态/速率表](https://mgc455.github.io/pcie_study/#feature/12/detail/r78-ei-inference-table)
- R75～R78四轮总结已记录；下一窗口优先早期NFM/InitFC、中断，穿插PIPE旧版和安全。

## R79 早期重放与初始化

- [早期Replay计数与推进NAK查询](https://mgc455.github.io/pcie_study/#feature/97/detail/r79-counter-query)
- [逐版InitFC轨迹查询](https://mgc455.github.io/pcie_study/#feature/111/detail/r79-init-trace-query)
- [FC_INIT2发送权限历史差异](https://mgc455.github.io/pcie_study/#feature/111/detail/r79-fi2-gate-version)
- [4.0 Feature交换与旧端兼容](https://mgc455.github.io/pcie_study/#feature/141/detail/r79-feature-four-handshake)
- 新阶段1/4；下一轮优先早期INTx/MSI/MSI-X角色与使能差分，保留PHY/安全轮换。

## R80 中断版本与状态

- [INTx逐端口汇聚查询](https://mgc455.github.io/pcie_study/#feature/52/detail/r80-intx-collapse-query)
- [MSI-X Pending/缓存更新轨迹](https://mgc455.github.io/pcie_study/#feature/55/detail/r80-msix-mask-trace-query)
- [4.0 MSI字段与位图](https://mgc455.github.io/pcie_study/#feature/53/detail/r80-msi4-control-fields)
- [4.0 MSI-X Control来源偏移冲突](https://mgc455.github.io/pcie_study/#feature/55/detail/r80-msix4-offset-conflict)
- 当前阶段2/4，下一轮PHY/PIPE旧修订；R82四轮总结。

## R81 PIPE revision and operation contracts

- [Original控制组合查询](https://mgc455.github.io/pcie_study/#feature/164/detail/r81-control-combination-query)
- [Receiver Detect事件轨迹](https://mgc455.github.io/pcie_study/#feature/174/detail/r81-detect-trace-query)
- [PHY静态参数与能力](https://mgc455.github.io/pcie_study/#feature/170/detail/r81-static-mode-support-fields)
- 阶段3/4；下一轮安全条款并做R79～R82总结。

## R82 DOE / TDI report and stage review

- [DOE状态下一步查询](https://mgc455.github.io/pcie_study/#feature/127/detail/r82-doe-service-query)
- [TDI报告分片接续](https://mgc455.github.io/pcie_study/#feature/129/detail/r82-report-fragment-query)
- [MMIO页号/属性换算](https://mgc455.github.io/pcie_study/#feature/129/detail/r82-report-range-query)
- R79～R82阶段总结已更新；下一窗口优先AXI/iATU/HDMA未解字段与异常，穿插CMA/SPDM和早期OS/PHY。

## R83 HDMA descriptor and prefetch contracts

- [六DWORD描述符解析](https://mgc455.github.io/pcie_study/#feature/147/detail/r83-descriptor-query)
- [预取容量与配置窗口](https://mgc455.github.io/pcie_study/#feature/147/detail/r83-prefetch-plan-query)
- [32bit长度与4GiB边界](https://mgc455.github.io/pcie_study/#feature/147/detail/r83-transfer-length-query)
- 新窗口1/4；下一轮CMA/SPDM，保留OS与PHY轮换，R86总结。

## R84 CMA / SPDM identity and measurements

- [证书请求字段与位图](https://mgc455.github.io/pcie_study/#feature/128/detail/r84-get-certificate-request)
- [测量请求字段与位图](https://mgc455.github.io/pcie_study/#feature/128/detail/r84-measurement-request-map)
- [测量签名覆盖范围](https://mgc455.github.io/pcie_study/#feature/128/detail/r84-measurement-signature-log)
- 当前窗口2/4；下轮早期Ordered Sets，再与PHY固件/内存轮换，R86总结。

## R85 early Ordered Sets and L0s restoration

- [按版本换算FTS收发预算](https://mgc455.github.io/pcie_study/#feature/4/detail/r85-early-fts-budget-query)
- [8/16GT/s EIEOS图样对照](https://mgc455.github.io/pcie_study/#feature/178/detail/r85-early-eieos-eight-sixteen)
- [低速FTS与高速FTS](https://mgc455.github.io/pcie_study/#feature/12/detail/r85-early-fts-high-pattern)
- 当前窗口3/4；下轮PHY固件/内存并完成R86阶段总结。

## R86 PHY CPU / CCM and stage review

- [CCM地址与物理宽度查询](https://mgc455.github.io/pcie_study/#feature/176/detail/r86-ccm-address-geometry-query)
- [CPU Run四相握手](https://mgc455.github.io/pcie_study/#feature/176/detail/r86-cpu-run-four-phase)
- [Boot输入与override时序边界](https://mgc455.github.io/pcie_study/#feature/176/detail/r86-boot-pin-override-order-conflict)
- [R83～R86阶段总结](https://mgc455.github.io/pcie_study/#updates)
- 下一窗口依次推进流控/VC、事务排序/原子性，再轮换PHY均衡与错误取证；R90复盘。

## R87 FC return and update context

- [释放信用后的更新事件查询](https://mgc455.github.io/pcie_study/#feature/111/detail/r87-update-trigger-query)
- [Optimized_Update_FC上下文解码](https://mgc455.github.io/pcie_study/#feature/13/detail/r87-optimized-context-query)
- [四种FC计时规则对照](https://mgc455.github.io/pcie_study/#feature/141/detail/r87-four-fc-timers)
- 本窗口1/4；下一轮事务排序/原子性，R90阶段复盘。

## R88 ordering revision and identity

- [1.0a/2.0五类事务排序查询](https://mgc455.github.io/pcie_study/#feature/27/detail/r88-early-pair-query)
- [Request IDO身份跨版查询](https://mgc455.github.io/pcie_study/#feature/29/detail/r88-ido-request-identity-query)
- [AtomicOp与后续依赖请求](https://mgc455.github.io/pcie_study/#feature/31/detail/r88-atomic-dependent-request-flow)
- 本窗口2/4；接着轮换PHY均衡/适应和错误取证，R90复盘。

## R89 product CDR evidence

- [CDR窗口与ADC时钟换算](https://mgc455.github.io/pcie_study/#feature/173/detail/r89-lock-window-query)
- [lock/评估/错误测量证据检查](https://mgc455.github.io/pcie_study/#feature/173/detail/r89-lock-evidence-query)
- [相位覆盖装载与使能](https://mgc455.github.io/pcie_study/#feature/174/detail/r89-phase-override-load-versus-enable)
- 产品3.02a限定；窗口3/4，R90错误取证与阶段汇总。

## R90 error evidence and stage review

- [AER本端报告门控查询](https://mgc455.github.io/pcie_study/#feature/103/detail/r90-local-report-query)
- [普通MFD通知合并](https://mgc455.github.io/pcie_study/#feature/103/detail/r90-mfd-message-query)
- [R87～R90阶段总结](https://mgc455.github.io/pcie_study/#updates)
- 下一窗口先L1SS/LTR/PME，再枚举/BAR，穿插PHY训练；R94复盘。

## 一期收尾计划

[查看固定验收清单与剩余轮次](https://mgc455.github.io/pcie_study/#completion)。R91～R138计划48轮，R91～R92完成规划与缺口归并，R93～R94开始正文验收、剩余44轮；每四轮总结，首次R94。183项依适用标准逐项验收，数量不代表覆盖率。

R92将117条历史记录归并为固定24项验收任务，并登记37项来源冲突。查看[任务与冲突](https://mgc455.github.io/pcie_study/#completion/work-v1-task-10)。归并不代表问题已经解决。

## R93 LTR验收

[LTR字段解码](https://mgc455.github.io/pcie_study/#feature/89/detail/r93-ltr-field-query) · [LTR预算聚合](https://mgc455.github.io/pcie_study/#feature/89/detail/r93-ltr-aggregate-query)。8个验收维度通过，功能整项仍待收口；计划剩余45轮，R94总结。

## R94收尾进展复盘

[字段改写条件查询](https://mgc455.github.io/pcie_study/#feature/87/detail/r94-config-write-guard-query) · [R91～R94四轮总结](https://mgc455.github.io/pcie_study/#updates)。本轮通过15个验收维度，累计23，整项0/183；剩余44轮为预算，目标R138在R98按批量验收实绩再校准。

## R95枚举与资源批验

[ECAM七版对照](https://mgc455.github.io/pcie_study/#feature/48/detail/r95-ecam-version-matrix) · [一期验收](https://mgc455.github.io/pcie_study/#completion/48)。本轮30维度、累计53；ECAM完整通过，1/183；来源问题14按正式版本上下文澄清。余43轮仍为预算，R96转PHY分层/TX，R98总结。

## R96 PHY分层与TX

[PHY三份契约](https://mgc455.github.io/pcie_study/#feature/163/detail/r96-three-boundary-contracts) · [TX表示边界](https://mgc455.github.io/pcie_study/#feature/168/detail/r96-tx-representation-boundaries)。本轮34维度、累计87；166/167分层职责验收通过，完整功能3/183。余42轮为预算，R97转中断、R98总结，自动任务保持暂停。

## R97 中断结构验收

[MSI-X七代来源地图](https://mgc455.github.io/pcie_study/#feature/55/detail/r97-msix-seven-version-map) · [B42正式勘误](https://mgc455.github.io/pcie_study/#feature/55/detail/r80-msix4-offset-conflict) · [中断各层门控](https://mgc455.github.io/pcie_study/#feature/56/detail/r97-interrupt-gates-not-one-enable)。34新维度累计121；55收口，完整功能4/183，余41轮预算。R98总结R95～R98进度，自动任务保持暂停。

## R98 四轮总结与中断验收

[四轮总结](https://mgc455.github.io/pcie_study/#updates) · [MSI与EMD版本地图](https://mgc455.github.io/pcie_study/#feature/53/detail/r98-msi-revision-and-emd-map) · [PVM角色矩阵](https://mgc455.github.io/pcie_study/#feature/54/detail/r98-pvm-role-and-version-matrix)。本轮52/53/54/56通过，累计完整功能8/183，验收维度129/1464；剩175项。R95～R98平均2项/轮，剩40轮需4.375项/轮，当前速度不支持R138完成保证；不自动延期。R99收消息分组，R102总结；每日任务暂停。

## R99 消息分组批验

[VDM包图与字段](https://mgc455.github.io/pcie_study/#feature/58/detail/r99-vdm-header-fields) · [错误消息/ECS](https://mgc455.github.io/pcie_study/#feature/60/detail/r99-err-message-fields) · [就绪通知字段](https://mgc455.github.io/pcie_study/#feature/61/detail/r99-drs-control-frs-queue)。57/58/60完整通过，累计11/183、157维度；61版本/RTR示例差异保留。R98队列60/61名称错位已在本轮纠正，余39轮为预算，R102总结；每日任务暂停。

## R100 功耗版本批验

[L1SS版本表](https://mgc455.github.io/pcie_study/#feature/87/detail/r100-l1ss-revision-contract) · [Clock PM版本表](https://mgc455.github.io/pcie_study/#feature/88/detail/r100-clockpm-revision-contract) · [RTR勘误边界](https://mgc455.github.io/pcie_study/#feature/61/detail/r100-rtr-errata-boundary)。87/88验收，累计13/183、163维度；61/89各剩一项来源一致性问题。余38轮仍为预算，R102总结，每日任务暂停。

## R101 功耗四项验收

[D-state恢复访问](https://mgc455.github.io/pcie_study/#feature/84/detail/r101-resume-access-decision) · [ASPM可选化来源链](https://mgc455.github.io/pcie_study/#feature/86/detail/r101-aspm-optionality-contract) · [OBFF版本契约](https://mgc455.github.io/pcie_study/#feature/90/detail/r101-obff-revision-contract)。84/85/86/90通过，累计17/183、193维度；61/89问题保留，功耗组尚未整体关闭。余37轮为预算，R102总结，每日仍暂停。

## R102 复位收口与四轮总结

[FLR能力/触发入口](https://mgc455.github.io/pcie_study/#feature/95/detail/r102-flr-capability-and-trigger) · [复位版本计时](https://mgc455.github.io/pcie_study/#feature/93/detail/r102-reset-version-timing) · [站内阶段总结](https://mgc455.github.io/pcie_study/#updates)。93/94/95通过，分组11关闭；四轮新增12完整功能、88维度，累计20/183和217维度。剩163功能、23分组/共享任务、36预算轮；窗口实绩3项/轮低于所需约4.53，R138仍有风险。R103先批验41/47/163/165/168；61/89来源问题保留，R106总结，每日仍暂停。

## R103 收尾进展

R103五项通过：累计25/183、227维度；新增10维度，剩158功能和35预算轮。产品版本/架构/链路代际分开，R104转NFM/FM重放与DPC，R106总结。

## R104 收尾进展

R104三项通过，新增24验收维度；两轮合计8项/34维度，累计28/183与251维度，剩155功能和34预算轮。Rule2按正式6.1/6.4核定版本条件，DPC补2012 ECN及RP PIO位表。下轮沿既定配置/事务队列，R106四轮总结。

## R105 收尾进展

R105三项验收，新增24维度；累计31/183和275维度，剩152项/33预算轮。补2024术语ECN、2008原始RBAR、2016扩展/VF ECN及正式4.0。R106处理DBI2/ROM并四轮总结。

## R106 收尾进展

R106验收43/46，新增12维度；累计33/183和287维度，剩150功能/32预算轮。R103～R106共关闭13功能、70维度；本窗3.25项/轮，余下需4.6875项/轮，R138仍有风险，不自动延期。下步批验枚举/配置链/头部，日常任务暂停。

R103～R106四轮复盘：13项/70维度；累计33/183，剩150项及32预算轮。窗口速度3.25项/轮，后续需4.6875项/轮，R138仍有风险；不扩大范围、不降低验收。R107先枚举/配置成熟条目，R110再总结。

## R107 收尾进展

R107新增5项完整验收、34维度；累计38/183和321维度，剩145项/31预算轮。补七版配置继承与链表来源、6.4 Immediate Readiness VF约束，复用成熟图表与查询。下步VPD/DSN、VSEC/DVSEC及EA，R110复盘。

## R108 收尾进展

R108验收49/50，新增16维度；累计40/183、337维度，剩143项/30预算轮。补VPD握手与内容、DSN字节映射和2004/2015厂商能力ECN，R109完成EA真实缺口；R110复盘。

## R109 收尾进展

R109验收EA，新增8维度；累计41/183和345维度，剩142项/29预算轮。配置资源分组05的16项全部通过，分组关闭；R107待发布并入本次补传。R110转ARI/SR-IOV/VF并四轮总结。

## R110 收尾进展

R110新增3项/24维度，累计44/183和369维度，剩139项/28预算轮。R107～R110关闭11项/82维度、配置分组05；窗口2.75项/轮，剩余需约4.964项/轮，R138仍有风险。R111转Multi-function/PF及Extensible IOV/SIOV；下次R114总结。

R107～R110四轮复盘：11功能/82维度，配置资源分组关闭；累计44/183、369维度，剩139项/28预算轮。窗口2.75项/轮，预算内需约4.964项/轮；R138仍有风险，不自动延期。下次R114复盘。

## R111 收尾进展

R111闭合62/66/67三项，新增普通Function/PF/VF/SDI资源职责、6.50a外置VF集成契约和SIOV版本/16字节能力表；与R110合并发布。

## R112 收尾进展

R112验收ATS及Translation/Invalidation两项，补独立规范/勘误到Base7.0版本表、AMA位修正及失效响应条件；复用现有范围和完成账本。

## R113 收尾进展

R113验收PRI和PASID两项，补独立ATS1.1/2011及2020 ECN版本边界、共享额度和PASID复用；修复大数据文件上传路径，与未发布R110/R111及R112合并。

R113发布链路调整：网站数据改为三个同步加载脚本，减少单文件上传体积；逐键数据一致性和VM加载检查通过。是否上线以发布记录为准，不因本地构建成功声称部署完成。

## R114 收尾进展

R114验收IOMMU/TA、SVA/SVM和P2P三项，翻译分组08闭合；补地址/缓存/停止职责和七版跨域P2P边界，R111～R114四轮总结单列。

R111～R114四轮总结：完成10功能、80验收维度，关闭IOV与翻译两组；累计54/183、449维度，剩129项/24预算轮。实绩2.5项/轮，预算内需5.375项/轮，R138仍有风险；不自动延期，下次R118总结。

## R115 收尾进展

R115验收ACS总览与Translation Blocking两项，Source Validation六维通过但2026澄清ECN正文缺失保留；新增向量/ARI映射与AT真值表。

## R116 收尾进展

R116取得所需四页ECN，完成75版本/来源补证，连同77/78完整验收；补Link-Local版本矩阵、Header版本变化与Request/Completion独立路径。

## R117 收尾进展

R117完整验收Upstream Forwarding、Egress Control、Direct Translated与Enhanced/Function Groups四项；补组合策略、ARI隔离粒度与混合路径顺序风险。

## R118 收尾进展

R118验收108/99/100，ACS分组09闭合；补Atomic独立ECN、七版ECRC/Poison差异及事务结局。R115～R118四轮总结单列。

R115～R118四轮总结：关闭12功能、96验收维度与ACS分组；累计66/183、545维度，剩117项/20预算轮。实绩3项/轮，预算内需5.85项/轮，目标仍有风险；不自动延期，下次R122总结。

## R119 收尾进展

R119验收101/102/103/104，补七版Completion、Timeout及AER日志字段地图；明确区间/在途修改、事务/记录/通知三层证据和FEP陈旧歧义。累计70/183，577维度，剩113项/19预算轮。

## R120 收尾进展

R120关闭107，新增14维度，累计71/183、591维度；106的FM长度在6.0/6.1/6.4/7.0仍有同一歧义，结构/一致性阻塞，不重复验收已完成105。

## R121 收尾进展

R121关闭109/110/135，新增24维度，累计74/183、615维度，剩109项/17预算轮；错误分组仅106保留FM跨度阻塞。R122转信用/VC及四轮总结。

## R122 收尾进展

R122关闭111/112/113，新增24维度，累计77/183、639维度；DW与Byte疑点经统一量纲解决，6.4中间修订桥接已补。R119～R122总结单列。

R122四轮总结：R119～R122关闭11功能、94维度；累计77/183、639维度，剩106项/16预算轮。19分组任务未闭合，38来源问题中6已解决/32保留；106阻塞保留。实绩2.75项/轮，预算内需6.625项/轮，机械39轮仅风险指标，不是延期。下次R126总结，日任务暂停。

## R123 收尾进展

R123关闭115/116，新增23维度，累计79/183、662维度；114保留SVC切换措辞一致性阻塞。新增2003 MFVC独立ECN定位；剩104项/15预算轮。
