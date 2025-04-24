<template>
  <div class="card">
    <div class="card-label">
      <span>{{ label }}</span>
      <span class="card-value">{{ value }}%</span>
    </div>
    <div class="progress-bar">
      <div
        class="progress-bar-fill"
        :style="{ width: `${value}%` }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CardProps {
  label: string;
  value: number;
}

const props = defineProps<CardProps>();
</script>

<style scoped>
.card {
  @apply bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 p-4;
}

.card-label {
  @apply flex justify-between items-center mb-1;
}

.card-value {
  @apply font-medium text-blue-500 dark:text-blue-400; /* 暗色模式下调整文本颜色 */
}

.progress-bar {
  @apply h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative;
}

.progress-bar-fill {
  @apply h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out;
}

/* 夜间模式样式 */
@media (prefers-color-scheme: dark) {
  .card-label {
    color: white; /* 文本颜色为白色 */
  }

  .card-value {
    color: white; /* 文本颜色为白色 */
  }
}
</style>
