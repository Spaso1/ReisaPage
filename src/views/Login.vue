<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

import QRCode from "qrcode.vue";
import eventBus from "@/eventBus";
const __qrcode = QRCode;

const router = useRouter();

// 表单数据
const email = ref("");
const codeOrPassword = ref("");
const isLoading = ref(false);
const error = ref("");

// 登录状态相关
const isRegister = ref(false);
const qrCodeText = ref(""); // 存储 otpauth://totp 链接
const sessionId = ref("");

// 检查是否已登录
const checkLoginStatus = async () => {
  try {
    const response = await request("/cen/user/info");
    if (response.ok) {
      //router.push("/");
    }
  } catch (e) {
    // 未登录
  }
};

// 提交登录表单
const submitForm = async () => {
  isLoading.value = true;
  error.value = "";

  try {
    const response = await request("/cen/user/login", {
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

    if (data.type === "login") {
        if (data.code == 200) {
          localStorage.removeItem("sessionId");
          localStorage.setItem("sessionId", data.sessionId);
          // 触发刷新用户信息事件
          eventBus.emit('refresh-user-info');
          await router.push("/");
        }
    } else if (data.type === "reg") {
      isRegister.value = true;
      const decodedKey = atob(data.content); // Base64 解码
      const issuer = "ReisaPage";
      const totpUri = `otpauth://totp/${encodeURIComponent(issuer)}?secret=${encodeURIComponent(decodedKey)}&issuer=${encodeURIComponent(issuer)}`;
      qrCodeText.value = totpUri;
      localStorage.removeItem("sessionId");

      localStorage.setItem("sessionId", data.sessionId);

      // 触发刷新用户信息事件
      eventBus.emit('refresh-user-info');
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

// 封装统一请求函数
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
</script>

<template>

  <div class="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
    <div class="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 class="text-2xl font-bold text-center text-gray-800 dark:text-white">登录 / 注册</h2>

      <!-- 显示二维码 -->
      <div v-if="isRegister" class="text-center">
        <p class="mb-4 text-green-500">账号管理我们使用TOP无密码登录! 请一定要使用 2FA 应用扫描下方二维码进行绑定：</p>
        <div class="mx-auto w-48 h-48 flex items-center justify-center bg-white p-2 rounded-md">
          <QRCode :value="qrCodeText" size="200" />
        </div>
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
            6位验证码 / 或空
          </label>
          <input
              id="codeOrPassword"
              v-model="codeOrPassword"
              type="text"
              placeholder="密码或6位验证码"
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
