# Frontend Template

前端基础工程脚手架。

## 技术栈

- Vue 3、TypeScript、Vite
- Vue Router、Pinia、vue-i18n
- Tailwind CSS、shadcn-vue、lucide-vue-next
- Axios
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
src/
  app/          应用初始化与全局插件注册
  components/   通用组件和 shadcn-vue 组件目录
  composables/  组合式函数
  i18n/         国际化配置和语言包
  layouts/      页面布局
  lib/          通用工具函数
  pages/        路由页面
  router/       路由配置
  services/     HTTP 与外部服务封装
  stores/       Pinia 状态
  styles/       全局样式和主题变量
  types/        全局类型
```
