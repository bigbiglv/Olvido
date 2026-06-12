# Frontend Foundation Project Context

本项目是：“**前端基础工程脚手架项目**”。

本目录 (`AGENTS/`) 包含 AI Agent 在开发此项目时必须遵循的所有规范与上下文约定。

## 1. Agent 入口
本项目是前端基础工程脚手架项目。AI 在执行任何代码修改之前，必须优先了解本 `AGENTS/` 目录中的规范，建立对核心业务运行机制的清晰认知。

## 2. 规则优先级
当规则冲突时，按以下优先级执行：
- **P0**：运行安全与稳定性
- **P1**：本 `AGENTS/` 目录下的项目级规范
- **P2**：历史代码兼容性
- **P3**：最小侵入式修改
- **P4**：根因修复优先
- **P5**：工程可维护性
- **P6**：代码风格一致性

低优先级规则不得破坏高优先级规则。

## 3. 任务检索说明
在分析和实施新需求或重构时，请优先阅读并复用：
- [system-architecture.md](./system-architecture.md)：查阅应用链路是否允许修改。
- [dependencies.md](./dependencies.md)：检索是否有现有模块可复用，禁止重复造轮子。
- [coding-standards.md](./coding-standards.md)：查阅 TS/JS 规范、防御性编程与异常处理。
- [framework-vue.md](./framework-vue.md)：查阅 Vue3/Vite 相关代码规范。
- [ui-design-system.md](./ui-design-system.md)：查阅 Tailwind CSS v4 与交互设计规范。
- [testing-qa.md](./testing-qa.md)：查阅性能约束与常见问题。
