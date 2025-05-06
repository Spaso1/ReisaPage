<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// 表单数据
const email = ref("");
const codeOrPassword = ref("");
const isLoading = ref(false);
const error = ref("");

// 登录状态相关
const isRegister = ref(false);
const qrCodeUrl = ref("");

// 检查是否已登录
const checkLoginStatus = async () => {
  try {
    const response = await fetch("/cen/user/info");
    if (response.ok) {
      // 已登录，跳转首页
      router.push("/");
    }
  } catch (e) {
    // 未登录，继续显示登录页
  }
};

// 提交登录表单
const submitForm = async () => {
  isLoading.value = true;
  error.value = "";

  try {
    const response = await fetch("/cen/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        codeOrPassword: codeOrPassword.value,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "登录失败");
    }

    if (data.status === "login") {
      alert("登录成功！");
      router.push("/");
    } else if (data.status === "register") {
      isRegister.value = true;
      qrCodeUrl.value = data.qrCodeUrl;
    }
  } catch (err: any) {
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  checkLoginStatus();
});
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-center text-gray-800 dark:text-white">登录 / 注册</h2>

      <!-- 二维码展示 -->
      <div v-if="isRegister" class="text-center">
        <p class="mb-4 text-green-500">请使用 2FA 应用扫描下方二维码进行绑定：</p>
        <img :src="qrCodeUrl" alt="2FA QR Code" class="mx-auto w-48 h-48" />
        <button @click="router.push('/')" class="mt-4 underline text-blue-500">
          返回首页
        </button>
      </div>

      <!-- 登录表单 -->
      <form v-else @submit.prevent="submitForm" class="space-y-4">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">邮箱地址</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="请输入邮箱"
            class="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <div>
          <label for="codeOrPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
            密码 / 6位验证码
          </label>
          <input
            id="codeOrPassword"
            v-model="codeOrPassword"
            type="text"
            required
            placeholder="密码或6位验证码"
            minlength="6"
            maxlength="6"
            class="w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition disabled:opacity-50"
        >
          {{ isLoading ? "处理中..." : "登录" }}
        </button>

        <div v-if="error" class="text-red-500 text-sm text-center">{{ error }}</div>
      </form>
    </div>
  </div>
</template>
