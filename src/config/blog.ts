

export interface BlogPost {
  title: string;
  category: string;
  date: Date;
  link: string;
  data: string;
  summary: string; // 添加简介字段
}

export const blogPosts: BlogPost[] = [
  {
    title: "FindMaimaiDX",
    data: `
      # FindMaimai
    `,
    summary: "FindMaimai是一个基于Java开发全平台客户端",
    link: "https://example.com/vue3-features",
    date: new Date("2023-10-01"),
    category: "Maimai",
  },
  {
    title: "TypeScript 在大型项目中的应用",
    data: `## TypeScript 在大型项目中的应用

探讨如何在大型项目中使用 TypeScript 提高代码质量和开发效率。

### 类型检查

TypeScript 提供了强大的类型检查功能，帮助开发者减少运行时错误。

### 代码重构

使用 TypeScript 可以更容易地进行代码重构，提高代码的可维护性。`,
    link: "https://example.com/typescript-large-projects",
    summary: "TypeScript 在大型项目中的应用",
    date: new Date("2023-09-15"),
    category: "TypeScript",
  },
  // 添加更多博客文章...
];
