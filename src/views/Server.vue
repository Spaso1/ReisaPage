<template>
  <div class="maimai-view">
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">加载失败: {{ error }}</div>
    <div v-else class="server-info-wrapper">
      <div class="stats-container">
        <p>总调用量: {{ stats.total }}</p>
        <p>今日调用量: {{ stats.day_total }}</p>
      </div>

      <div class="server-info-container">
        <h2 class="server-info-title">服务器监控信息</h2>
        <div v-if="serverInfo">
          <p>CPU 核心数: {{ serverInfo.cpuCores }}</p>
          <p>CPU 名称: {{ serverInfo.cpuName }}</p>
          <h3>CPU 核心使用率</h3>

          <div v-if="serverInfo.coreUsages.length" class="cards-grid">
            <Card
              v-for="(usage, index) in serverInfo.coreUsages"
              :key="index"
              :label="`核心 ${index + 1}`"
              :value="formattedCoreUsage(usage)"
            />
          </div>
          <p>总内存: {{ formattedTotalMemoryGB }} GB</p>
          <p>可用内存: {{ formattedFreeMemoryGB }} GB</p>
          <Card
            label="内存使用率"
            :value="formattedMemoryUsagePercentage"
          />
          <p>总磁盘空间: {{ formattedTotalDiskSpaceGB }} GB</p>
          <p>可用磁盘空间: {{ formattedFreeDiskSpaceGB }} GB</p>
          <h3>磁盘信息</h3>

          <div v-if="serverInfo.disks.length" class="cards-grid">
            <Card
              v-for="(disk, index) in serverInfo.disks"
              :key="index"
              :label="disk.name"
              :value="formattedDiskUsagePercentage(disk)"
            />
          </div>
          <p>操作系统名称: {{ serverInfo.osName }}</p>
          <p>操作系统版本: {{ serverInfo.osVersion }}</p>
          <p>网络适配器: {{ serverInfo.networkAdapters.join(', ') }}</p>
          <p v-if="serverInfo.gpus.length">GPU: {{ serverInfo.gpus.join(', ') }}</p>
          <p v-else>GPU: 无</p>
        </div>
        <div v-else>
          <p>加载服务器信息中...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Card from '@/components/Card.vue';

export default {
  name: 'MaimaiView',
  components: {
    Card,
  },
  data() {
    return {
      data: null,
      stats: {
        total: null,
        day_total: null,
      },
      serverInfo: null,
      loading: true,
      error: null,
    };
  },
  mounted() {
    this.fetchData();
    this.fetchServerInfo();
    this.startPolling();
  },
  beforeUnmount() {
    this.stopPolling();
  },
  computed: {
    formattedCoreUsages() {
      if (!this.serverInfo || !this.serverInfo.coreUsages) return '';
      return this.serverInfo.coreUsages.map(usage => usage.toFixed(2)).join(', ');
    },
    formattedTotalMemoryGB() {
      return this.serverInfo ? this.serverInfo.totalMemoryGB.toFixed(2) : '';
    },
    formattedFreeMemoryGB() {
      return this.serverInfo ? this.serverInfo.freeMemoryGB.toFixed(2) : '';
    },
    formattedTotalDiskSpaceGB() {
      return this.serverInfo ? this.serverInfo.totalDiskSpaceGB.toFixed(2) : '';
    },
    formattedFreeDiskSpaceGB() {
      return this.serverInfo ? this.serverInfo.freeDiskSpaceGB.toFixed(2) : '';
    },
    formattedMemoryUsagePercentage() {
      if (!this.serverInfo) return 0;
      return ((this.serverInfo.totalMemoryGB - this.serverInfo.freeMemoryGB) / this.serverInfo.totalMemoryGB * 100).toFixed(2);
    },
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get('/api/mai/v1/info');
        this.data = response.data;
        console.log(response.data);
        this.stats.total = response.data.total;
        this.stats.day_total = response.data.day_total;
      } catch (error) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },
    async fetchServerInfo() {
      try {
        const response = await axios.get('/sys/api/sys/v1/all');
        console.log(response.data); // 输出真实数据
        this.serverInfo = response.data;
      } catch (error) {
        this.error = error.message;
        console.error(error); // 输出错误信息
      }
    },
    startPolling() {
      this.pollingInterval = setInterval(() => {
        this.fetchServerInfo();
      }, 10000);
    },
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
      }
    },
    formattedDiskUsagePercentage(disk) {
      return ((disk.totalSpaceGB - disk.freeSpaceGB) / disk.totalSpaceGB * 100).toFixed(2);
    },
    formattedCoreUsage(usage) {
      return usage.toFixed(2);
    },
  },
};
</script>

<style scoped>
.maimai-view {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 修改为 flex-start 以支持滚动 */
  height: 100vh; /* 使内容垂直居中 */
  flex-direction: column;
  overflow-y: auto; /* 添加垂直滚动 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.maimai-view::-webkit-scrollbar {
  display: none; /* Chrome, Safari, and Opera */
}

.stats-container {
  width: 1000px;
  background-color: rgba(255, 255, 255, 0.5); /* 白色透明背景 */
  color: black; /* 文本颜色为黑色 */
  padding: 32px; /* 内边距 32dp */
  text-align: left; /* 文本靠左对齐 */
  border-radius: 16px; /* 圆润边框 */
  margin-bottom: 32px; /* 下边距 */
}

.server-info-container {
  width: 1000px;
  background-color: rgba(255, 255, 255, 0.5); /* 白色透明背景 */
  color: black; /* 文本颜色为黑色 */
  padding: 32px; /* 内边距 32dp */
  text-align: left; /* 文本靠左对齐 */
  border-radius: 16px; /* 圆润边框 */
}

.server-info-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.server-info-wrapper {
  width: 100%;
  max-width: 1000px; /* 设置最大宽度 */
  margin: 0 auto; /* 水平居中 */
  overflow-y: auto; /* 添加垂直滚动 */
  height: 100%; /* 设置高度为100% */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.server-info-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari, and Opera */
}

/* 夜间模式样式 */
@media (prefers-color-scheme: dark) {
  .stats-container,
  .server-info-container {
    background-color: rgba(31, 41, 55, 0.5); /* 暗色背景 */
    color: white; /* 文本颜色为白色 */
  }

  .server-info-title {
    color: white; /* 文本颜色为白色 */
  }

  .cards-grid .card {
    background-color: rgba(55, 65, 81, 0.5); /* 暗色卡片背景 */
    color: white; /* 卡片文本颜色为白色 */
  }

  .cards-grid .card .card-label {
    color: white; /* 卡片标签文本颜色为白色 */
  }

  .cards-grid .card .card-value {
    color: white; /* 卡片值文本颜色为白色 */
  }

  .cards-grid .card .progress-bar-fill {
    background: linear-gradient(to right, #6366f1, #8b5cf6, #ec4899); /* 暗色进度条渐变 */
  }
}

</style>
