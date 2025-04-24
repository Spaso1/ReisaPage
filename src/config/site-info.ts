interface SiteInfo {
  enabled: boolean;
  text: string;
  link: string;
  position?: "top" | "bottom";
  theme?: "dark" | "light";
  style?: string;
  linkStyle?: string;
  version?: string;
}

export const siteInfo: SiteInfo = {
  enabled: true,
  text: "一个使用 Vue 3 + TypeScript + Vite 构建的现代化个人主页，具有博客文章展示、项目展示、联系表单等功能。",
  version: "V.2.3",
  link: "https://github.com/Spaso1/ReisaPage",
  position: "bottom",
  theme: "dark",
  style: "position: fixed; bottom: 0; left: 0; width: 100%; z-index: 1000;",
};
