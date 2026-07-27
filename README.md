# EchoFlow AI 内容运营台

一个根据用户标签批量生成小红书、朋友圈、公众号、抖音、视频号和微博宣传文案的内容运营工具。

[在线体验 EchoFlow](https://echoflow-ai-content-studio.zhengyb2839144.chatgpt.site)

> 在线站点目前采用私有访问策略，可能需要使用已获授权的 ChatGPT 账号登录。仓库公开不代表站点数据公开。

![EchoFlow 产品预览](public/og.png)

## 能做什么

- 上传 CSV 用户标签表，并读取用户数量
- 按相似标签自动展示人群分组
- 为小红书、朋友圈、公众号、抖音、视频号和微博生成差异化文案
- 提供精简、标准、深度三种文案模式
- 展开、编辑、重写和审核单条内容
- 批量通过并导出 CSV
- 保存内容、人群策略、自动化任务和知识库状态
- 展示数据连接与运营洞察页面

## 当前状态

这是可交互的产品原型，页面操作、审核、导出和云端状态保存已经可用。

文案生成目前采用内置演示逻辑，尚未接入真实大模型 API；上传的标签用于演示数据读取流程，不会触发真实的个性化模型生成。后续可接入 OpenAI API、CRM 和各社交平台发布接口。

## 本地运行

环境要求：Node.js `>=22.13.0`

```bash
npm install
npm run dev
```

打开终端提示的本地地址即可使用。

生产构建与测试：

```bash
npm run build
npm test
```

## 技术栈

- React 19
- Next.js 16
- vinext / Vite
- Cloudflare D1
- Drizzle ORM
- OpenAI Sites

## 数据结构

应用使用 D1 的 `workspace_state` 表保存各模块的 JSON 状态。表结构位于 `db/schema.ts`，迁移文件位于 `drizzle/`。

## 主要目录

```text
app/                 页面、样式和状态 API
db/                  D1 数据库访问与表结构
drizzle/             数据库迁移
public/              图标和预览图
tests/               构建结果测试
.openai/hosting.json Sites 项目绑定
```

## 安全说明

- `.env*`、构建目录、缓存和依赖目录已通过 `.gitignore` 排除
- 请勿把模型 API Key 或平台密钥直接写入源码
- 生产密钥应配置在部署平台的环境变量中
