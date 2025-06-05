# Tauri Desktop Application Template

这是一个基于 Tauri 2.0 的现代桌面应用程序模板，使用 Vue 3 + TypeScript 作为前端技术栈。

## 技术栈

### 前端

- Vue 3 - 渐进式 JavaScript 框架
- TypeScript - 类型安全的 JavaScript 超集
- Vite - 现代前端构建工具
- Pinia - Vue 的状态管理解决方案
- Alova - 轻量级请求策略库
- Vue Router - Vue.js 的官方路由

### 后端

- Tauri 2.0 - 使用 Rust 构建的跨平台桌面应用框架
- Rust - 系统编程语言，用于后端逻辑实现

## 项目结构

```
.
├── src/                    # 前端源代码
│   ├── assets/            # 静态资源
│   ├── pages/             # 页面组件
│   ├── router/            # 路由配置
│   ├── service/           # API 服务
│   ├── store/             # Pinia 状态管理
│   ├── types/             # TypeScript 类型定义
│   └── utils/             # 工具函数
├── src-tauri/             # Tauri/Rust 后端代码
│   ├── src/               # Rust 源代码
│   └── tauri.conf.json    # Tauri 配置文件
└── vite.config.ts         # Vite 配置
```

## 特性

- 🚀 基于 Tauri 2.0，构建轻量级、高性能的桌面应用
- 🔥 Vue 3 + TypeScript，提供类型安全和现代化的开发体验
- 📦 Vite 构建，快速的开发环境和构建过程
- 🔄 Alova 请求库，优雅的数据请求处理
- 📊 Pinia 状态管理，简单而强大
- 🛠 完整的开发工具链配置（ESLint, Prettier）

## 开发指南

### 环境要求

- Node.js 16+
- Rust 1.70+
- 系统要求参考 [Tauri 先决条件](https://tauri.app/v1/guides/getting-started/prerequisites)

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装 Rust 依赖（自动）
cd src-tauri && cargo build
```

### 开发命令

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码格式化
npm run format

# 代码检查
npm run lint
```

## 应用配置

### Tauri 配置

Tauri 的配置位于 `src-tauri/tauri.conf.json`，可以配置：

- 应用窗口大小和行为
- 安全策略
- 构建选项
- 权限设置

### 前端配置

- 路由配置：`src/router/index.ts`
- 状态管理：`src/store/`
- API 服务：`src/service/`
- 工具配置：`vite.config.ts`

## 部署

1. 确保已安装所有依赖
2. 运行构建命令：`npm run build`
3. 构建的应用程序将位于 `src-tauri/target/release`

## 贡献指南

1. Fork 本仓库
2. 创建特性分支：`git checkout -b my-new-feature`
3. 提交更改：`git commit -am 'Add some feature'`
4. 推送分支：`git push origin my-new-feature`
5. 提交 Pull Request

## 许可证

[MIT License](LICENSE)
