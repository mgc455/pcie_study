# PCIe Study

逐项说明 PCIe 功能原理、使用前提、职责边界和检查方法，并定位到明确版本的规范章节。例子只放在功能块中辅助理解。

历史GitHub Pages地址：[PCIe Study](https://mgc455.github.io/pcie_study/)（当前已关闭）。仓库保持私有，Cloudflare Pages + Access正在准备，尚无已验证的新线上地址。部署步骤见 [Cloudflare部署说明](deployment/cloudflare-pages.md)。

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

## GitHub Pages 历史配置（本次不启用）

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

### 私有仓库与R32离线查阅

仓库已设为私有，GitHub Pages当前关闭。下载本仓库后，在本地打开 `docs/index.html`，可继续使用站内搜索、详情深链接和本地PDF对照；本轮不恢复公开Pages。

R32新增Recovery复杂出口、速率切换和NFM/FM改宽条件，分别见功能4、5、6。三个查询块的稳定ID为 `recovery-lock-branch-query`、`speed-window-target-query`、`width-entry-version-query`；在本地网页的“协议细节查询”中可检索。正文分列Base6.0/7.0、接收/发送计数起点、EI窗口、48/96ms超时与未核交互。
