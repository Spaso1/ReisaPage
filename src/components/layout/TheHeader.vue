<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import ThemeToggle from "@/components/ThemeToggle.vue";
import eventBus from "@/eventBus";

const route = useRoute();
const isMenuOpen = ref(false);

// 用户信息
const userInfo = ref<{ name: string; avatar: string } | null>(null);

// 获取用户信息
const fetchUserInfo = async () => {

  try {
    const response = await request("/cen/user/info");
    if (response.ok) {
      const data = await response.json();
      userInfo.value = data;
    } else {
      userInfo.value = null;
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);

    userInfo.value = null;

    const data = "{\n" +
      "  \"name\": \"Reisa\",\n" +
      "  \"avatar\": \"http://cdns.godserver.cn/resource/static/Image_1916058994254974.jpg\"\n" +
      "}\n";
    const data2 = JSON.parse(data); // ✅ 转换为对象
    userInfo.value = data2;
    console.log("实例数据", userInfo.value.avatar); // ✅ 可以正确输出 URL

  }

};
const request = async (url: string, options: RequestInit = {}) => {
  const sessionId = localStorage.getItem("sessionId");

  const headers = new Headers(options.headers);

  if (sessionId) {
    headers.set("X-Session-ID", sessionId);
  }

  return fetch(url, {
    ...options,
    headers,
  });
};
const closeMenu = () => {
  isMenuOpen.value = false;
};

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    closeMenu();
  }
};

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest(".mobile-menu") && !target.closest(".menu-button")) {
    closeMenu();
  }
};

// 在组件挂载时添加事件监听
onMounted(() => {
  fetchUserInfo(); // 页面加载时获取用户信息
  window.addEventListener("click", handleClickOutside);
  window.addEventListener("keydown", handleKeydown);
  eventBus.on('refresh-user-info', fetchUserInfo);});

// 在组件卸载时移除事件监听，防止内存泄漏
onUnmounted(() => {
  window.removeEventListener("click", handleClickOutside);
  window.removeEventListener("keydown", handleKeydown);
  eventBus.off('refresh-user-info', fetchUserInfo);});

const navItems = [
  { name: "首页", path: "/" },
  {
    name: "项目",
    path: "/projects",
    children: [
      { name: "实用工具", path: "/projects#tools" },
      { name: "个人导航", path: "/projects#bookmarks" },
      { name: "个人站点", path: "/projects#sites" },
    ],
  },
  { name: "技能", path: "/skills" },
  { name: "博客", path: "/blog" },
  { name: "联系", path: "/contact" },
  { name: "服务状态", path: "/maimai" },
  { name: "舞萌机厅", path: "/mapmaimai" },
];

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
</script>

<template>
  <header class="fixed w-full top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
    <nav class="container mx-auto px-4 py-3 md:py-4">
      <div class="flex items-center justify-between">
        <router-link to="/" class="logo-link group relative overflow-hidden">
          <span
            class="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent bg-[length:200%_auto] hover:animate-gradient"
          >
            Reisa
          </span>
        </router-link>

        <!-- 桌面端导航 -->
        <div class="hidden md:flex items-center space-x-6">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="nav-link"
            :class="{ 'text-primary': route.path === item.path }"
          >
            {{ item.name }}
          </router-link>
          <div v-if="userInfo">
            <div class="flex items-center space-x-2 cursor-pointer"  @click="$router.push('/user')">
              <img
                :src="userInfo.avatar"
                alt="头像"
                class="w-8 h-8 rounded-full object-cover"
              />
              <span class="text-gray-600 dark:text-gray-300">{{ userInfo.name }}</span>
            </div>
          </div>
          <div v-else>
            <div class="flex space-x-2">
              <button
                @click="$router.push('/login')"
                class="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                登录 / 注册
              </button>
            </div>
          </div>
          <ThemeToggle />
        </div>
        <!-- 移动端菜单按钮 -->
        <div class="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button
            class="menu-button p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            @click.stop="toggleMenu"
            aria-label="Toggle menu"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                v-if="!isMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- 移动端导航菜单 -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 -translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-2"
      >
        <div v-show="isMenuOpen" class="mobile-menu md:hidden">
          <div class="py-2 space-y-1">
            <router-link
              v-for="item in navItems"
              :key="item.path"
              :to="item.path"
              class="block px-4 py-2 text-base hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              :class="{
                'bg-primary/10 text-primary': route.path === item.path,
              }"
              @click="closeMenu"
            >
              {{ item.name }}
            </router-link>

            <!-- 移动端用户信息 -->
            <div v-if="userInfo" class="flex items-center px-4 py-2 space-x-2">
              <img
                :src="userInfo.avatar"
                alt="头像"
                class="w-8 h-8 rounded-full object-cover"
              />
              <span>{{ userInfo.name }}</span>
            </div>
            <div v-else class="flex flex-col space-y-1 px-4 py-2">
              <button
                @click="$router.push('/login')"
              >
                登录 / 注册
              </button>
            </div>
          </div>
        </div>
      </transition>
    </nav>
  </header>
</template>

<style scoped>
.nav-link {
  @apply text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors;
}

.mobile-menu {
  @apply absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm
  border-t border-gray-200 dark:border-gray-700 shadow-lg;
}

/* 移动端导航链接悬停效果 */
@media (hover: hover) {
  .mobile-menu .router-link-active {
    @apply bg-primary-10 text-primary;
  }
}

/* Logo 悬停动画 */
.logo-link {
  @apply inline-block py-1;
}

.logo-link:hover span:first-child {
  @apply transform scale-105 transition-transform duration-300;
}

@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.hover\:animate-gradient:hover {
  animation: gradient 3s linear infinite;
}
</style>

