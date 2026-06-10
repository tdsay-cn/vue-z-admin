# vue-z-admin

基于 Vue 2 + Element UI 的后台管理系统前端模板。

## 简介

vue-z-admin 是一个开箱即用的中后台前端解决方案，基于 vue-element-admin 模板构建，内置了登录鉴权、动态路由、权限控制等常见管理系统功能。

## 功能特性

- **登录鉴权**：Token 存储、路由守卫、登录态管理
- **权限控制**：基于权限标识（permission key）的动态路由与按钮级指令权限，相比传统角色鉴权更灵活，便于细粒度管理
- **多环境构建**：development / staging / production
- **Mock 数据**：开发环境内置 Mock 服务，便于前端独立开发
- **通用组件**：SvgIcon / Breadcrumb / Hamburger 等
- **规范工具**：ESLint + Prettier 风格检查

## 技术栈

- Vue 2.6 + Vue Router 3 + Vuex 3
- Element UI 2.13
- Axios 0.18
- Sass + svg-sprite-loader
- Jest 单元测试

## 目录结构

```
├── build/              # 构建脚本
├── mock/               # Mock 接口数据
├── public/             # 静态资源
├── src/
│   ├── api/            # 接口请求
│   ├── assets/         # 图片资源
│   ├── components/     # 通用组件
│   ├── directives/     # 自定义指令
│   ├── icons/          # SVG 图标
│   ├── layout/         # 整体布局
│   ├── router/         # 路由配置
│   ├── store/          # Vuex 状态
│   ├── styles/         # 全局样式
│   ├── utils/          # 工具方法
│   └── views/          # 业务页面
├── tests/              # 单元测试
└── ... 配置文件
```

## 环境要求

- Node.js >= 8.9
- npm >= 3.0.0

## 安装与运行

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 生产构建
npm run build:prod

# 预发布环境构建
npm run build:stage

# 本地预览构建产物
npm run preview

# 代码风格检查
npm run lint

# 单元测试
npm run test:unit
```

> 注意：由于依赖的旧版 OpenSSL，构建命令前已自动注入 `NODE_OPTIONS=--openssl-legacy-provider`。如使用较新版本 Node.js 仍出现错误，请确认 NODE_OPTIONS 生效。

## 默认账号

- 用户名：`admin` / `editor`
- 密码：`123456`

## 配套后端项目

本项目可配合后端项目 [z-admin](https://github.com/tdsay-cn/z-admin) 使用，对接真实接口时需：

1. 启动 `z-admin` 后端服务
2. 在 `.env.development` / `.env.production` 中修改 `VUE_APP_BASE_API` 为后端接口地址
3. 关闭 `vue.config.js` 中的 Mock 代理（如需），即可调用真实登录、权限、业务接口

## 相关文档

- Vue 2：https://v2.vuejs.org/
- Element UI：https://element.eleme.io/
- vue-element-admin：https://panjiachen.github.io/vue-element-admin-site/

## License

Apache License 2.0
