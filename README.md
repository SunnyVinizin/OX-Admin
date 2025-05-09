# OX-Admin

## 项目介绍

OX-Admin 是一个基于 Vue3、Element Plus 和 TypeScript 开发的轻量级主题化后台管理系统框架。打包后的大小在全局引入 [Element Plus](https://element-plus.org) 的情况下仍然低于 `2.3MB`，并且会永久同步完整版的代码。开启 `brotli` 压缩和 `cdn` 替换本地库模式后，打包大小低于 `350kb`。

该项目集成了标准的RBAC权限系统、工作流审批系统、实时对话通信系统以及消息推送系统，为企业级应用提供完整解决方案。

## 项目预览

<p align="center">
  <img src="/public/docs/home.png" alt="首页看板" width="80%" style="border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
</p>

<div align="center">
  
  | 权限管理(RBAC) | 工作流设计器 |
  | :---: | :---: |
  | <img src="/public/docs/rbac.png" width="400" style="border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"> | <img src="/public/docs/workflow.png" width="400" style="border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"> |
  
  | 实时通信/WebSocket | 接口文档/Swagger |
  | :---: | :---: |
  | <img src="/public/docs/websocket.png" width="400" style="border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"> | <img src="/public/docs/swagger.png" width="400" style="border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"> |
  
  | 日志记录/审计 | 登录鉴权 |
  | :---: | :---: |
  | <img src="/public/docs/record.png" width="400" style="border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"> | <img src="/public/docs/login.png" width="400" style="border-radius: 5px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);"> |
  
</div>

### 在线预览

- [演示地址](https://your-demo-url.com)

## 技术栈

- **前端框架**：[Vue 3](https://cn.vuejs.org/) (使用组合式 API)
- **UI组件库**：[Element Plus](https://element-plus.org/zh-CN/)
- **类型系统**：[TypeScript](https://www.typescriptlang.org/zh/)
- **状态管理**：[Pinia](https://pinia.vuejs.org/zh/)
- **路由系统**：[Vue Router](https://router.vuejs.org/zh/)
- **HTTP请求**：[Axios](https://axios-http.com/zh/)
- **样式处理**：[SCSS](https://sass-lang.com/documentation/)、[TailwindCSS](https://tailwindcss.com/docs/)
- **图标库**：[@element-plus/icons-vue](https://element-plus.org/zh-CN/component/icon.html)
- **图表库**：[ECharts](https://echarts.apache.org/zh/index.html)
- **时间处理**：[Day.js](https://day.js.org/zh-CN/)
- **工作流引擎**：[Vue Flow](https://vueflow.dev/)
- **表格增强**：[Pure Admin Table](https://github.com/pure-admin/pure-admin-table)
- **实时通信+推送**: [WebSocket](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)

## 项目主模块

### 首页可视化看板

- 待办事项统计
- 审批流程状态统计（处理中、已完成、已驳回）
- 业务趋势图表
- 审批申请快捷入口

### 系统管理

1. 用户管理
2. 部门管理
3. 岗位管理
4. 菜单管理
5. 角色管理
6. 权限管理
7. 字典管理

### 审批管理

1. 工作流管理
2. 我的发起
3. 待办事项
4. 流程设计器（含自定义编排工作流）
5. 已办列表

### 日志管理

1. 操作日志管理（含参数的树形视图或JSON视图预览）
2. 登录日志管理

### 表单设计器(el-designer)

- 可视化拖拽组件制作动态表单
- 支持多种表单组件（输入框、下拉框、文本域等）
- 实时预览表单效果
- 导出JSON配置

### Swagger API文档

- Swagger外部链接嵌套视图
- 方便测试和查看接口文档

## 安装与使用

### 环境要求

- Node.js: ^18.18.0 || ^20.9.0 || >=21.1.0
- pnpm: >=9

### 开发环境

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 本地前端地址
http://localhost:8848/
```

通过配置 `.env.development` 文件中的 `VITE_API_URL` 来配置后端地址，然后在vite.config.ts中配置proxy代理。

### 生产环境

```bash
# 构建生产版本
pnpm build
```

构建完成后，生产版本文件将会输出到 `dist` 目录下。

### Docker部署

```bash
# 构建Docker镜像
docker build -t vue3-admin .

# 运行Docker容器
docker run -d -p 3000:80 vue3-admin
```

配置.env.production文件中的VITE_API_URL来配置后端地址，然后配置nginx.conf文件中的proxy_pass来配置后端地址。

## 核心功能特点

- **权限管理**：基于RBAC模型的精细化权限控制
- **审批流程**：完整的审批工作流系统，支持自定义流程设计
- **实时通信**：集成实时对话系统，支持即时消息交流
- **消息推送**：系统消息和通知推送功能
- **动态表单**：可视化表单设计器，零代码创建复杂表单
- **数据可视化**：集成ECharts图表展示数据洞察
- **响应式设计**：适配多种设备屏幕尺寸
- **主题定制**：支持多种主题色彩定制

## 构建性能

- 打包速度：约10秒
- 打包大小：<2.3MB (全局引入Element Plus)
- 优化后大小：<350KB (开启brotli压缩和CDN替换)

## 贡献指南

欢迎提交问题和功能请求。对于重大更改，请先提issue讨论您想要更改的内容。

## 许可证

[MIT](LICENSE)
