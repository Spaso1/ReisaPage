import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "home",
    component: HomeView,
    meta: {
      title: "个人作品集 | 首页",
    },
  },
  {
    path: "/skills",
    name: "skills",
    component: () => import("@/views/SkillsView.vue"),
    meta: {
      title: "技能",
      transition: "slide-right",
    },
  },
  {
    path: "/projects",
    name: "projects",
    component: () => import("@/views/ProjectsView.vue"),
    meta: {
      title: "项目",
      transition: "slide-left",
    },
  },
  {
    path: "/tools",
    name: "tools",
    component: () => import("@/views/ToolsView.vue"),
    meta: {
      title: "工具箱",
      transition: "fade",
    },
    children: [
      {
        path: "json",
        name: "json-formatter",
        component: () => import("@/views/tools/JsonFormatterView.vue"),
        meta: {
          title: "JSON 格式化",
          transition: "fade",
        },
      },
      {
        path: "bookmarks",
        name: "bookmarks",
        component: () => import("@/views/tools/BookmarksView.vue"),
        meta: {
          title: "网址导航",
          transition: "fade",
        },
      },
      {
        path: "timestamp",
        name: "timestamp",
        component: () => import("@/views/tools/TimestampView.vue"),
        meta: {
          title: "时间戳转换",
          transition: "fade",
        },
      },
    ],
  },
  {
    path: "/blog",
    name: "blog",
    component: () => import("@/views/BlogView.vue"),
    meta: {
      title: "技术博客",
    },
  },
  {
    path: "/maimai",
    name: "服务状态",
    component: () => import("@/views/Server.vue"),
    meta: {
      title: "服务状态",
      transition: "scale",
    },
  },
  {
    path: "/mapmaimai",
    name: "舞萌机厅",
    component: () => import("@/views/Map.vue"),
    meta: {
      title: "舞萌机厅",
      transition: "scale",
    },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import("@/views/Login.vue"),
    meta: {
      title: "登录",
      transition: "scale",
    },
  },
  {
    path: '/user',
    name: 'user',
    component: () => import("@/views/User.vue"),
    meta: {
      title: "用户",
      transition: "scale",
    },
  },
  {
    path: '/paika' ,
    name: '排卡',
    component: () => import("@/views/Paika.vue"),
    meta: {
      title: "排卡",
      transition: "scale",
    },
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0 };
  },
});

// 路由标题
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || "首页"} | Reisa`;
  next();
});

export default router;
