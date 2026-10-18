# PCIe Study

逐项说明 PCIe 功能原理、使用前提、职责边界和检查方法，并定位到明确版本的规范章节。例子只放在功能块中辅助理解。

预期站点地址：**https://mgc455.github.io/pcie_study/**。只有 GitHub Pages 发布成功后该地址才可用。

## 内容

- 162 项功能，12 类主题；可搜索、收藏和标记已读。
- 131 项已定位到用户提供的 PCI Express Base Specification Revision 6.0 目录；完整章节会逐项核读、精化，不能把目录定位当作全部原文已验证。
- 文档目录只保存名称/格式/初筛主题。文件名中的版本、草案状态和主题仍待核对。
- 支持选择本地对应 PDF 并按物理页定位。文件只在浏览器使用，不上传。刷新后需要重新选择，阅读器对 `#page=` 的支持可能不同。
- 原始 RTL、PDF、商业手册正文、本地路径和工程专属配置不随网站发布。

## 本地构建

仅需 Python 3 标准库；浏览器端没有外部 CDN/框架依赖：

```sh
python scripts/build.py
python scripts/check.py
python -m http.server 8000 --directory docs --bind 127.0.0.1
```

打开 http://127.0.0.1:8000 。也可直接打开 `docs/index.html` 阅读；浏览器本地存储/PDF预览能力因环境而异。

## GitHub Pages 首次配置

在仓库 Settings → Pages → Build and deployment 中选 **Deploy from a branch**，分支 **main**，目录 **/docs**，保存。之后公开 `docs/` 的提交可触发 Pages 发布。见 [GitHub 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

`.github/workflows/check.yml` 验证规范元数据与站点构建。每日智能完善由单独设置的 Codex 任务负责；这个 Actions 工作流不生成学习内容。

## 维护

以 `content/features.json` 为公开内容主数据，保持功能 ID 稳定。每轮选少量功能，核读来源、修正/深化后运行检查，更新 `content/changelog.json`。参考 `AGENTS.md` 和 `content/maintenance.json`。

规范、实现选项和平台机制分开标注。协议位置绑定版本；尚未核实的项目明确保留待核实状态。学习笔记不替代标准，不作硬件符合性或实现完成的保证。
