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
      alert("保存成功！");
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
    <!-- 用户信息卡片 -->
    <div v-if="userInfo" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 h-full flex flex-col">
      <!-- 头像 -->
      <div class="flex justify-center mb-4">
        <img
          :src="userInfo.avatar"
          alt="用户头像"
          class="w-24 h-24 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
          @click="openAvatarDialog"
        />
      </div>

      <!-- 用户名 -->
      <div class="text-center mb-6">
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

      <!-- 操作按钮 -->
      <div class="flex flex-col space-y-3 mt-auto">
        <button
          @click="saveUserInfo"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          保存
        </button>
        <button
          @click="handleLogout"
          class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          登出
        </button>
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
</style>
