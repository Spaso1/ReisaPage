<template>
  <div class="progress-bar-container">
    <div class="progress-bar-label">
      <span>{{ label }}</span>
      <span class="progress-bar-value">{{ value }}%</span>
    </div>
    <div class="progress-bar">
      <div
        class="progress-bar-fill"
        :style="{ width: `${value}%`, opacity: isVisible ? 1 : 0 }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

interface ProgressBarProps {
  label: string;
  value: number;
}

const props = defineProps<ProgressBarProps>();

const isVisible = ref(false);

onMounted(() => {
  setTimeout(() => {
    isVisible.value = true;
  }, 500);
});
</script>

<style scoped>
.progress-bar-container {
  @apply mb-4;
}

.progress-bar-label {
  @apply flex justify-between items-center mb-1;
}

.progress-bar-value {
  @apply font-medium text-blue-500;
}

.progress-bar {
  @apply h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative;
}

.progress-bar-fill {
  @apply h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out;
}
</style>
