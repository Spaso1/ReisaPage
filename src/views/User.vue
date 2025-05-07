<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 用户信息类型定义
interface UserInfo {
  name: string;
  avatar: string;
}

// 本地临时值用于编辑
const tempName = ref("");
const tempAvatar = ref("");
const isEditingName = ref(false);
const showAvatarDialog = ref(false);

// 用户信息状态
const userInfo = ref<UserInfo | null>(null);

// 模拟从本地获取用户信息（根据实际情况替换为真实请求）
const fetchUserInfo = async () => {
  try {
    // 示例：假设从 localStorage 获取用户信息
    const response = await request("/cen/user/info");
    if (response.ok) {
      const data = await response.json();
      userInfo.value = { ...data };
      tempName.value = data.name;
      tempAvatar.value = data.avatar;
    } else {
      userInfo.value = null;
      // 如果没有用户信息，跳转到登录页
      router.push("/login");
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
    router.push("/login");
  }
};

// 登出处理函数
const handleLogout = () => {
  localStorage.removeItem("userInfo"); // 清除用户信息
  localStorage.removeItem("sessionId"); // 清除 session ID

  const response = request("/cen/user/logout");
  console.log("登出成功");
  router.push("/login"); // 跳转到登录页
};

const saveUserInfo = async () => {
  if (!userInfo.value) return;

  userInfo.value.name = tempName.value;
  userInfo.value.avatar = tempAvatar.value;

  // 示例：发送到服务器更新数据（根据实际 API 调整）
  try {
    const response = await request("/cen/user/info", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userInfo.value),
    });

    if (response.ok) {
      //alert("保存成功！");
      isEditingName.value = false;
      showAvatarDialog.value = false;
    } else {
      alert("保存失败，请重试。");
    }
  } catch (error) {
    console.error("保存失败:", error);
    alert("网络错误，请检查连接。");
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

const startEditingName = () => {
  isEditingName.value = true;
};

const openAvatarDialog = () => {
  showAvatarDialog.value = true;
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<template>
  <div class="container mx-auto px-4 py-8 h-[90vh] w-[90vw]">
    <div v-if="userInfo" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 h-full flex">
      <!-- 左侧30% - 头像和用户名 -->
      <div class="w-1/3 flex flex-col items-center justify-center border-r border-gray-200 dark:border-gray-700 pr-6">
        <!-- 头像 -->
        <div class="mb-4">
          <img
            :src="userInfo.avatar"
            alt="用户头像"
            class="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
            @click="openAvatarDialog"
          />
        </div>

        <!-- 用户名 -->
        <div class="text-center">
          <h2
            v-if="!isEditingName"
            @click="startEditingName"
            class="text-xl font-semibold cursor-pointer hover:underline"
          >
            {{ userInfo.name }}
          </h2>
          <input
            v-else
            v-model="tempName"
            class="text-xl font-semibold text-center bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500"
            @keyup.enter="saveUserInfo"
            @blur="saveUserInfo"
            autofocus
          />
        </div>
      </div>

      <!-- 右侧70% - 功能区域 -->
      <div class="w-2/3 pl-6 flex flex-col">
        <h2 class="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">常用功能</h2>
        <!-- 卡片容器 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <!-- 保存卡片 -->
          <div
            @click="saveUserInfo"
            class="card-gradient rounded-lg p-6 hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1 transition-transform"
          >
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="font-medium text-white">保存信息</span>
            </div>
          </div>

          <!-- 登出卡片 -->
          <div
            @click="handleLogout"
            class="card-gradient rounded-lg p-6 hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1 transition-transform"
          >
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span class="font-medium text-white">退出登录</span>
            </div>
          </div>
        </div>

        <!-- 分割线 -->
        <div class="border-t border-gray-800 dark:border-gray-700 mt-6"></div>
      </div>
    </div>

    <!-- 无用户信息提示 -->
    <div v-else class="text-center text-gray-600 dark:text-gray-400 h-full flex flex-col justify-center">
      <p>未找到用户信息，请先登录。</p>
      <button
        @click="$router.push('/login')"
        class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors self-center"
      >
        前往登录
      </button>
    </div>

    <!-- 头像编辑对话框 -->
    <div v-if="showAvatarDialog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">修改头像</h3>
        <input
          v-model="tempAvatar"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded mb-4 dark:bg-gray-700"
          placeholder="输入头像URL"
        />
        <div class="flex justify-end space-x-3">
          <button
            @click="showAvatarDialog = false"
            class="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            取消
          </button>
          <button
            @click="saveUserInfo"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  max-width: none !important;
  width: 90vw;
  height: 80vh;
}
@media (prefers-color-scheme: dark) {
  .container {
    max-width: none !important;
    width: 90vw;
    height: 80vh;
  }
}

.card-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
