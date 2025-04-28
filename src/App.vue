<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRoute, useRouter, type RouteMeta } from "vue-router";
import { RouterView } from "vue-router";
import TheHeader from "./components/layout/TheHeader.vue";
import TheFooter from "./components/layout/TheFooter.vue";
import PageTransition from "./components/PageTransition.vue";
import Toast from "./components/ui/Toast.vue";
import Modal from "./components/ui/Modal.vue";
import type { NoticeButton } from "./types/notice";
import { siteConfig } from "@/config";
import { siteInfo } from "./config/site-info";
import { printConsoleInfo } from "@/utils/console";

const route = useRoute();
const router = useRouter();

// 是否为开发环境
const isDev = import.meta.env.DEV;

document.documentElement.classList.add("dark-mode");

// 监听路由变化更新页面标题和描述
watch(
  () => route.meta,
  (meta: RouteMeta) => {
    if (meta.title) {
      document.title = `${meta.title} | ${siteConfig.name}`;
    }
    if (meta.description) {
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", meta.description as string);
    }
    if (meta.keywords) {
      document
        .querySelector('meta[name="keywords"]')
        ?.setAttribute("content", meta.keywords as string);
    }
    // 更新 Open Graph 标签
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", meta.title as string);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", meta.description as string);
  },
);

const showNotice = ref(false);

// 处理按钮点击
const handleNoticeAction = (button: NoticeButton) => {
  const now = Date.now();

  // 处理按钮动作
  switch (button.action) {
    case "close":
      showNotice.value = false;
      break;
    case "navigate":
      showNotice.value = false;
      if (button.to) {
        router.push(button.to);
      }
      break;
    case "link":
      if (button.href) {
        window.open(button.href, "_blank");
      }
      showNotice.value = false;
      break;
    case "custom":
      if (button.handler) {
        button.handler();
      }
      showNotice.value = false;
      break;
  }
};


onMounted(() => {
  // 打印控制台信息
  printConsoleInfo({
    text: siteInfo.text,
    version: siteInfo.version,
    link: siteInfo.link,
  });
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <TheHeader />
    <main class="flex-grow pt-16 md:pt-20">
      <router-view v-slot="{ Component }">
        <PageTransition :name="(route.meta.transition as string) || 'fade'">
          <component :is="Component" />
        </PageTransition>
      </router-view>
    </main>
    <TheFooter />
    <Toast />
  </div>
</template>

<style scoped>
.min-h-screen {
  position: relative; /* 添加相对定位 */
  background-image: url('https://cdn.godserver.cn/resource/static/1C6F3506CAFAE1443024752BFC4B5302.jpg');
  background-size: cover; /* 背景图片覆盖整个元素 */
  background-position: center; /* 背景图片居中 */
  background-repeat: no-repeat; /* 防止背景图片重复 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.min-h-screen::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: inherit; /* 继承背景图片 */
  background-size: cover; /* 背景图片覆盖整个元素 */
  background-position: center; /* 背景图片居中 */
  background-repeat: no-repeat; /* 防止背景图片重复 */
  opacity: 0.3; /* 调整透明度 */
  z-index: -1; /* 确保伪元素在内容下方 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
</style>
