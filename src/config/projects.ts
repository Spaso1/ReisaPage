export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  image: string;
  link?: string;
  status: "completed" | "developing" | "planning";
}

export const projects: Project[] = [
  {
    id: 2,
    title: "FindMaimaiUltra",
    description:
      "全新重构版本 Powered By Reisa",
    tags: ["技术分享", "Blog", "Markdown","舞萌DX","中二节奏","B50","查分器","旅行"],
    image: "https://picsum.photos/800/600?random=3",
    link: "https://github.com/Spaso1/FindMaimaiDX_Phone",
    status: "completed",
  },
  {
    id: 3,
    title: "EasyTop",
    description: "服务状态监控页面，实时监控各项服务的运行状态。",
    tags: ["监控", "服务状态", "实时数据"],
    image: "https://picsum.photos/800/600?random=4",
    link: "https://github.com/Spaso1/EasyTop",
    status: "completed",
  },
  {
    id: 4,
    title: "AsTrip",
    description:
      "旅行规划软件",
    tags: ["数据分析", "统计", "开源","旅行"],
    image: "https://picsum.photos/800/600?random=5",
    link: "https://github.com/Spaso1/Astrip",
    status: "completed",
  },
];
