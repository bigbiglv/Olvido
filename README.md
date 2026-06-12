# Olvido

基于 Electron + Vue 3 + Prisma + SQLite 的本地桌面端应用。

## 技术栈

- Electron
- Vue 3、TypeScript、Vite
- Vue Router、Pinia
- Tailwind CSS、shadcn-vue、lucide-vue-next
- Prisma、SQLite
- pnpm、ESLint、Prettier

## 开发命令

```bash
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm format:check
```

## 目录说明

```text
Olvido/
  .env / .env.*       环境变量配置
  AGENTS/             AI Agent 规则与配置目录
  electron/           Electron 主进程 (main) 与预加载 (preload) 脚本源码
  prisma/             Prisma ORM schema 定义与数据库迁移文件
  public/             公共静态资源目录
  scripts/            项目构建与检查脚本
  src/                前端页面源码目录
    app/              应用初始化与全局插件注册
    components/       通用组件和 shadcn-vue 组件
    composables/      组合式函数 (Hooks)
    layouts/          页面布局组件
    lib/              通用工具函数
    pages/            路由页面
    router/           路由配置
    stores/           Pinia 全局状态管理
    styles/           全局样式和主题变量
    types/            全局 TypeScript 类型定义
  .prettierrc.json    Prettier 代码格式化配置
  components.json     shadcn-vue 组件配置文件
  eslint.config.ts    ESLint 配置文件
  index.html          前端入口 HTML
  package.json        项目依赖与脚本配置
  pnpm-lock.yaml      pnpm 依赖锁定文件
  tsconfig.*.json     TypeScript 配置文件
  vite.config.ts      Vite 构建配置
```
