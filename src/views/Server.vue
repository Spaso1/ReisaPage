<template>
  <div class="maimai-view">
    <div v-if="loading">加载中...</div>
    <div v-else-if="error">加载失败: {{ error }}</div>
    <div v-else>
      <div class="stats-container">
        <p>总调用量: {{ stats.total }}</p>
        <p>今日调用量: {{ stats.day_total }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'MaimaiView',
  data() {
    return {
      data: null,
      stats: {
        total: null,
        day_total: null,
      },
      loading: true,
      error: null,
    };
  },
  mounted() {
    this.fetchData();
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
  },
};
</script>

<style scoped>
.maimai-view {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* 使内容垂直居中 */
}

.stats-container {
  width: 1000pt;
  height: 400pt;
  background-color: rgba(255, 255, 255, 0.5); /* 白色透明背景 */
  color: black; /* 文本颜色为黑色 */
  padding: 32px; /* 内边距 32dp */
  text-align: left; /* 文本靠左对齐 */
  border-radius: 16px; /* 圆润边框 */
}

.center-iframe {
  width: 80%; /* 根据需要调整宽度 */
  height: 80%; /* 根据需要调整高度 */
  border: 16px solid rgba(255, 255, 255, 0.5); /* 16dp白色半透明边框 */
  border-radius: 16px; /* 圆润边框 */
}
</style>
