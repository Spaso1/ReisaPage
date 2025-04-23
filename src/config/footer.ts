interface FooterLink {
  text: string;
  to?: string; // 内部路由
  href?: string; // 外部链接
  target?: string;
}

interface FooterConfig {
  links: FooterLink[];
  provider: {
    name: string;
    link: string;
    logo: string;
    text: string;
  };
}

export const footerConfig: FooterConfig = {
  links: [
    {
      text: "联系",
      to: "/contact",
    },

    {
      text: "博客",
      href: "https://www.godserver.cn",
      target: "_blank",
    },
    {
      text: "GitHub",
      href: "https://github.com/Spaso1",
      target: "_blank",
    },
  ],
  provider: {
    name: "Aliyun",
    link: "https://www.aliyun.com/",
    logo: "https://avatars.githubusercontent.com/u/172407636?v=4",
    text: "提供 CDN 加速 / 云存储服务",
  },
};
