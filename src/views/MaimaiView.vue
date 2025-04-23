<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

// 定义数据结构
interface MaimaiData {
  id: number;
  name: string;
  description: string;
}

interface PartyMember {
  username: string;
  avatar: string;
}

// 响应式变量
const data = ref<MaimaiData | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const roomName = ref<string | null>(null);
const partyMembers = ref<PartyMember[]>([]);
const partyId = ref<string>(""); // 用于存储用户输入的房间编号

// 从 localStorage 加载数据
const loadDataFromLocalStorage = () => {
  const storedData = localStorage.getItem("maimaiData");
  if (storedData) {
    data.value = JSON.parse(storedData);
  }

  const storedRoomName = localStorage.getItem("roomName");
  if (storedRoomName) {
    roomName.value = storedRoomName;
  }

  const storedPartyId = localStorage.getItem("partyId");
  if (storedPartyId) {
    partyId.value = storedPartyId;
    fetchPartyMembers(storedPartyId); // 加载 party 成员数据
  }
};

// 保存数据到 localStorage
const saveDataToLocalStorage = (newData: MaimaiData) => {
  localStorage.setItem("maimaiData", JSON.stringify(newData));
};

// 保存房间名称到 localStorage
const saveRoomNameToLocalStorage = (newRoomName: string) => {
  localStorage.setItem("roomName", newRoomName);
};

// 保存房间编号到 localStorage
const savePartyIdToLocalStorage = (newPartyId: string) => {
  localStorage.setItem("partyId", newPartyId);
};

// 发起网络请求获取 party 成员数据
const fetchPartyMembers = async (partyId: string) => {
  try {
    const url = `https://mais.godserver.cn/api/mai/v1/party?party=${partyId}`;
    console.log("Fetching data from:", url); // 添加调试信息
    const response = await axios.get(url);
    console.log("Response data:", response.data); // 添加调试信息
    const members = response.data as string[];
    partyMembers.value = members.map(member => {
      const [username, avatar] = member.split("()");
      return { username, avatar };
    });
  } catch (e) {
    error.value = e instanceof Error ? e.message : "获取 party 成员失败";
    console.error("Error fetching data:", e); // 添加调试信息
  } finally {
    loading.value = false;
  }
};

// 挂载时加载数据
onMounted(() => {
  loadDataFromLocalStorage();
  if (!data.value) {
    // fetchData(); // 如果需要从其他 API 获取数据，可以取消注释
  }
});

// 处理用户输入的房间名称
const handleRoomNameSubmit = () => {
  if (roomName.value) {
    saveRoomNameToLocalStorage(roomName.value);
    alert(`房间名称已保存: ${roomName.value}`);
  } else {
    alert("请输入房间名称");
  }
};

// 处理用户输入的房间编号并发送请求
const handlePartyIdSubmit = () => {
  if (partyId.value) {
    savePartyIdToLocalStorage(partyId.value);
    fetchPartyMembers(partyId.value);
  } else {
    alert("请输入房间编号");
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center flex-col">
    <div v-if="loading" class="text-center">
      <p class="text-gray-600 dark:text-gray-400">加载中...</p>
    </div>
    <div v-else-if="error" class="text-center">
      <p class="text-red-500 text-lg mb-4">{{ error }}</p>
    </div>
    <div v-else-if="data" class="text-center">
      <h1 class="text-3xl font-bold mb-4">{{ data.name }}</h1>
      <p class="text-gray-600 dark:text-gray-400">{{ data.description }}</p>
    </div>
    <div v-else class="text-center">
      <p class="text-gray-600 dark:text-gray-400">EditView</p>
      <p class="text-gray-600 dark:text-gray-400">正在加载数据...</p>
      <button
        @click="fetchData"
        class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all transform hover:scale-105"
      >
        加载数据
      </button>
    </div>
    <div class="mt-4">
      <input
        v-model="partyId"
        type="text"
        placeholder="输入房间编号"
        class="px-4 py-2 border rounded-lg"
      />
      <button
        @click="handlePartyIdSubmit"
        class="ml-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all transform hover:scale-105"
      >
        获取 Party 成员
      </button>
    </div>
    <div v-if="partyMembers.length" class="mt-8">
      <h2 class="text-2xl font-bold mb-4">Party Members</h2>
      <ul>
        <li v-for="(member, index) in partyMembers" :key="index" class="mb-2">
          <span class="font-bold">{{ member.username }}</span>
          <span>({{ member.avatar }})</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.min-h-screen {
  background-color: #f9fafb;
  color: #1f2937;
}

.dark-mode .min-h-screen {
  background-color: #1a1a1a;
  color: #e5e5e5;
}

.text-center {
  text-align: center;
}

.text-gray-600 {
  color: #4b5563;
}

.dark-mode .text-gray-600 {
  color: #9ca3af;
}

.text-gray-400 {
  color: #6b7280;
}

.dark-mode .text-gray-400 {
  color: #9ca3af;
}

.text-red-500 {
  color: #ef4444;
}

.bg-primary {
  background-color: #12c2e9;
}

.hover\:bg-primary-dark:hover {
  background-color: #0fa5c0;
}

.text-white {
  color: #ffffff;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

.transition-all {
  transition: all 0.3s ease;
}

.transform {
  transform: translate(0);
}

button {
  cursor: pointer;
}
</style>
