import { siteConfig } from "./site";

// 导出所有配置
export { siteConfig };

// 合并基础配置
export const config = {
  ...siteConfig,
  siteUrl: "https://www.godserver.cn", // 默认值
};

// 生成 sitemap.xml 内容
export const generateSitemap = (
  siteUrl: string,
) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>2024-03-21</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/blog</loc>
    <lastmod>2024-03-21</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/skills</loc>
    <lastmod>2024-03-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/contact</loc>
    <lastmod>2024-03-21</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

// 生成 robots.txt 内容
export const generateRobots = (siteUrl: string) => `User-agent: *
Allow: /
Sitemap: ${siteUrl}/sitemap.xml`;
