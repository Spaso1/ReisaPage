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

        <!-- CPU 核心使用率 -->
        <h3>CPU 核心使用率</h3>
        <div v-if="mergedCoreUsages.length" class="cards-grid">
          <Card
            v-for="(usage, index) in mergedCoreUsages"
            :key="index"
            :label="`核心 ${index + 1}`"
            :value="formattedCoreUsage(usage)"
          />
        </div>

        <!-- 内存信息（每个服务器单独显示一行） -->
        <h3>内存信息</h3>
        <div v-for="(server, index) in serverInfos" :key="index">
          <p>服务器 {{ index + 1 }} - 总内存: {{ formattedTotalMemoryGB(server) }} GB</p>
          <p>服务器 {{ index + 1 }} - 可用内存: {{ formattedFreeMemoryGB(server) }} GB</p>
          <Card label="内存使用率" :value="formattedMemoryUsagePercentage(server)" />
        </div>

        <!-- 磁盘信息 -->
        <h3>磁盘信息</h3>
        <div class="cards-grid">
          <Card
            v-for="(disk, index) in allDisks"
            :key="index"
            :label="disk.name"
            :value="`${formattedDiskUsagePercentage(disk)}`"
          />
        </div>

        <!-- GPU -->
        <h3>GPU</h3>
        <p v-for="(gpu, index) in allGpus" :key="index">{{ gpu }}</p>

        <!-- 操作系统版本 -->
        <h3>操作系统版本</h3>
        <p v-for="(os, index) in allOsVersions" :key="index">{{ os }}</p>

        <!-- 网络适配器 -->
        <h3>网络适配器</h3>
        <p v-for="(adapter, index) in allNetworkAdapters" :key="index">{{ adapter }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import Card from '@/components/Card.vue';

export default {
  name: 'MaimaiView',
  components: { Card },
  data() {
    return {
      data: null,
      stats: { total: null, day_total: null },
      serverInfos: [],
      loading: true,
      error: null,
      pollingInterval: null
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
    // 合并所有 CPU 核心使用率
    mergedCoreUsages() {
      return this.serverInfos.flatMap(server => server.coreUsages || []);
    },

    // 所有磁盘（不做去重）
    allDisks() {
      return this.serverInfos.flatMap(server => server.disks || []);
    },

    // 所有 GPU（不做去重）
    allGpus() {
      return this.serverInfos.flatMap(server => server.gpus || []);
    },

    // 所有操作系统版本（不做去重）
    allOsVersions() {
      return this.serverInfos.map(server => server.osVersion).filter(Boolean);
    },

    // 所有网络适配器（不做去重）
    allNetworkAdapters() {
      return this.serverInfos.flatMap(server => server.networkAdapters || []);
    }
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get('/api/mai/v1/info');
        this.data = response.data;
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
        const [res1, res2] = await Promise.all([
          axios.get('/sys1/api/sys/v1/all').catch(() => null),
          axios.get('/sys2/api/sys/v1/all').catch(() => null)
        ]);
        this.serverInfos = [];
        if (res1) this.serverInfos.push(res1.data);
        if (res2) this.serverInfos.push(res2.data);
      } catch (error) {
        this.error = error.message;
        console.error(error);
      }
    },
    startPolling() {
      this.pollingInterval = setInterval(() => this.fetchServerInfo(), 10000);
    },
    stopPolling() {
      if (this.pollingInterval) clearInterval(this.pollingInterval);
    },
    formattedTotalMemoryGB(server) {
      return server?.totalMemoryGB ? server.totalMemoryGB.toFixed(2) : '';
    },
    formattedFreeMemoryGB(server) {
      return server?.freeMemoryGB ? server.freeMemoryGB.toFixed(2) : '';
    },
    formattedDiskUsagePercentage(disk) {
      if (!disk || !disk.totalSpaceGB) return '0.00';
      const usage = ((disk.totalSpaceGB - disk.freeSpaceGB) / disk.totalSpaceGB * 100).toFixed(2);
      return `${usage}`;s
    },

    // 内存使用率（保持原样）
    formattedMemoryUsagePercentage(server) {
      if (!server || !server.totalMemoryGB) return '0.00%';
      const usage = (((server.totalMemoryGB - server.freeMemoryGB) / server.totalMemoryGB) * 100).toFixed(2);
      return `${usage}`;
    },

    formattedCoreUsage(usage) {
      return usage.toFixed(2);
    }
  }
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
