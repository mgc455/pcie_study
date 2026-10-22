# Cloudflare Pages + Access 部署

这是部署准备说明，不表示 Cloudflare 项目或 Access 已创建。GitHub 仓库保持私有，不启用 GitHub Pages。

## 先部署占位目录

在 Cloudflare Workers & Pages 中新建 **Pages / Connect to Git**，仅授权所需的私有仓库 `mgc455/pcie_study`。

| 配置 | 首次占位部署 |
| --- | --- |
| 项目名 | `pcie-study-mgc455`，最终以 Cloudflare 实际可用名称为准 |
| Production branch | `main` |
| Framework preset | None |
| Root directory | 留空，使用仓库根目录 |
| Build command | `exit 0` |
| Build output directory | `deployment/cloudflare-bootstrap` |

占位目录只含不带知识库资料的 HTML 与响应头。不要在 Access 核验之前把输出目录切成 `docs`。不要使用仓库根目录作为输出目录。

## 配置 Access

使用 Cloudflare Zero Trust Free；若界面要求购买付费套餐或提交未授权费用，停止并由账户所有者处理。

登录方式使用 One-time PIN。Allow 策略的 Include 选择 **Emails**，只填账户所有者明确指定的邮箱；不使用 Everyone、整个邮箱域、Bypass 或公共 Service Token。真实邮箱只在 Cloudflare 策略与本地部署记录中保存，不写在此说明中。

Cloudflare Pages 的 **Enable access policy** 默认仅保护预览。按官方 Known issues 的说明，将生成的 Access 应用公共主机名中的 `*` 去掉并保存，以覆盖 `<project>.pages.dev`；再返回 Pages 重新启用预览 Access，确认同时存在覆盖 `*.<project>.pages.dev` 的应用。两者均设置为指定邮箱才能访问。检查所有路径，而非只保护 `/`。

实际项目若有自定义域名，还需为每个域名单独配置 Access。本次不购买或添加自定义域名。

## 保护核验后切换真实站点

1. 用未登录客户端检查生产主机及预览主机的 `/`、`/data.js`、`/app.js`、`/style.css`，应跳到 Access 登录；200、普通404或不明403不能算访问保护通过。
2. 切换 Build command 为 `python3 scripts/build.py && python3 scripts/check.py`。
3. 切换 Build output directory 为 `docs`，仓库根目录仍留空。
4. 重新部署 `main`。仅 `docs` 内的原创网站产物会上线；PDF、RTL、CDL、固件、`.local` 与本地分析记录不属于部署目录。
5. 对生产地址、本次部署唯一地址及分支别名再次核验未登录访问；所有可访问该内容的地址均需 Access 保护。
6. 账户所有者用指定邮箱验证码登录后，检查首页、搜索、详情深链接及版本。不能以“登录页存在”代替“授权账号能使用且未经授权拿不到数据”的完整核验。

后续 GitHub `main` 更新由 Pages 自动构建部署。Knowledge-base edition 不因托管配置修改而增加；实际项目名、部署地址、Access 应用状态及验证结果保存在本地部署记录。

## 未登录检查

```sh
python scripts/check_cloudflare_access.py https://ACTUAL_PROJECT.pages.dev https://ACTUAL_DEPLOYMENT.ACTUAL_PROJECT.pages.dev
```

只填 Cloudflare 实际返回的地址，不猜测部署ID。脚本不发送 Cookie、JWT、邮箱或验证码，不跟随重定向。它只核对显式的 Access 登录跳转；授权账号登录及策略允许名单仍需在 Cloudflare/浏览器检查。

来源：

- https://developers.cloudflare.com/pages/platform/known-issues/#enable-access-on-your-pagesdev-domain
- https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/
- https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
