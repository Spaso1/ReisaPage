# Home For Vue

一个使用 Vue 3 + TypeScript + Vite 构建的现代化个人主页，具有博客文章展示、项目展示、联系表单等功能。
- Reisa 改编

## 特性

- 🚀 使用 Vue 3 + TypeScript + Vite 构建
- 🎨 支持深色模式
- 📱 响应式设计，支持移动端
- ⚡️ 快速加载和页面切换
- 🔍 SEO 友好
- 🌐 支持多语言
- 📝 Markdown 博客支持
- 📦 组件自动导入
- 🎯 TypeScript 类型安全
- 🔧 可配置的主题

## 技术栈

- Vue 3
- TypeScript
- Vite
- Vue Router
- TailwindCSS
- PostCSS
- ESLint + Prettier
- Husky + lint-staged

## 开发

```bash
# 克隆项目
git clone https://github.com/Spaso1/ReisaPage.git

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview

# 代码格式化
pnpm format

# 代码检查
pnpm lint
```

## 项目结构

```
├── public/              # 静态资源
├── src/
│   ├── assets/         # 项目资源
│   ├── components/     # 组件
│   ├── config/         # 配置文件
│   ├── layouts/        # 布局组件
│   ├── pages/          # 页面
│   ├── router/         # 路由配置
│   ├── styles/         # 样式文件
│   ├── types/          # TypeScript 类型
│   ├── utils/          # 工具函数
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
├── .env                # 环境变量
├── index.html          # HTML 模板
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript 配置
├── vite.config.ts      # Vite 配置
└── README.md           # 项目说明
```

## 配置

### 站点配置

在 `src/config/site.ts` 中配置站点基本信息：

```typescript
export const siteConfig = {
  name: "Your Site Name",
  description: "Your site description",
  // ...其他配置
};
```

### 主题配置

在 `src/config/theme.ts` 中配置主题相关选项：

```typescript
export const themeConfig = {
  colors: {
    primary: "#2196f3",
    // ...其他颜色
  },
  // ...其他主题配置
};
```

## 部署

项目可以部署到任何静态网站托管服务：

```bash
# 构建项目
pnpm build

# 部署 dist 目录
```

## 许可证

[MIT](./LICENSE)
