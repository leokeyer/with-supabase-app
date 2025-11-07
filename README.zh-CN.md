<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js 和 Supabase  starter kit - 使用 Next.js 和 Supabase 构建应用的最快方式" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js 和 Supabase Starter Kit</h1>
</a>

<p align="center">
 使用 Next.js 和 Supabase 构建应用的最快方式
</p>

<p align="center">
  <a href="#功能特性"><strong>功能特性</strong></a> ·
  <a href="#演示"><strong>演示</strong></a> ·
  <a href="#部署到-vercel"><strong>部署到 Vercel</strong></a> ·
  <a href="#克隆并在本地运行"><strong>克隆并在本地运行</strong></a> ·
  <a href="#反馈和问题"><strong>反馈和问题</strong></a>
  <a href="#更多-supabase-示例"><strong>更多示例</strong></a>
</p>
<br/>

## 功能特性

- 适用于整个 [Next.js](https://nextjs.org) 技术栈
  - App Router
  - Pages Router
  - Middleware
  - Client
  - Server
  - 开箱即用！
- supabase-ssr. 一个用于配置 Supabase Auth 使用 cookies 的包
- 使用 [Tailwind CSS](https://tailwindcss.com) 进行样式设计
- 使用 [shadcn/ui](https://ui.shadcn.com/) 组件
- 可选择使用 [Supabase Vercel 集成和 Vercel 部署](#部署您自己的项目)
  - 环境变量自动分配到 Vercel 项目

## 演示

您可以在 [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/) 查看完整的工作演示。

## 部署到 Vercel

Vercel 部署将引导您创建 Supabase 账户和项目。

安装 Supabase 集成后，所有相关的环境变量将自动分配到项目中，因此部署是完全功能的。

[![使用 Vercel 部署](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

上述操作还会将 Starter kit 克隆到您的 GitHub，您可以本地克隆并在本地开发。

如果您只想在本地开发而不部署到 Vercel，[请按照以下步骤操作](#克隆并在本地运行)。

## 克隆并在本地运行

1. 您首先需要一个 Supabase 项目，可以通过 [Supabase 仪表板](https://database.new) 创建

2. 使用 Supabase Starter 模板的 npx 命令创建 Next.js 应用

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. 使用 `cd` 命令进入应用目录

   ```bash
   cd with-supabase-app
   ```

4. 将 `.env.example` 重命名为 `.env.local` 并更新以下内容：

   ```
   NEXT_PUBLIC_SUPABASE_URL=[插入 SUPABASE 项目 URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[插入 SUPABASE 项目 API ANON KEY]
   ```

   `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 都可以在 [您的 Supabase 项目的 API 设置](https://app.supabase.com/project/_/settings/api) 中找到

5. 现在您可以运行 Next.js 本地开发服务器：

   ```bash
   npm run dev
   ```

   Starter kit 现在应该在 [localhost:3000](http://localhost:3000/) 上运行。

6. 此模板附带默认的 shadcn/ui 样式初始化。如果您想要其他 ui.shadcn 样式，请删除 `components.json` 并[重新安装 shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> 查看 [本地开发文档](https://supabase.com/docs/guides/getting-started/local-development) 以在本地运行 Supabase。

## 反馈和问题

请在 [Supabase GitHub 组织](https://github.com/supabase/supabase/issues/new/choose) 提交反馈和问题。

## 更多 Supabase 示例

- [Next.js 订阅支付 Starter](https://github.com/vercel/nextjs-subscription-payments)
- [基于 Cookie 的认证和 Next.js 13 App Router（免费课程）](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth 和 Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)

