<!-- src/components/MarkdownModal.vue -->

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl relative">
      <button @click="closeModal" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>
      <div class="markdown-content" v-html="parsedMarkdown"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { marked } from 'marked';

const props = defineProps<{
  isOpen: boolean;
  markdownContent: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const closeModal = () => {
  emit('close');
};

const parsedMarkdown = computed(() => marked(props.markdownContent));
</script>

<style scoped>
.markdown-content {
  max-height: 70vh;
  overflow-y: auto;
}

.markdown-content h1 {
  font-size: 2xl;
  font-weight: bold;
  margin-bottom: 2rem;
}

.markdown-content h2 {
  font-size: xl;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.markdown-content p {
  margin-bottom: 1rem;
}

.markdown-content a {
  color: #1e40af;
  text-decoration: underline;
}

.markdown-content a:hover {
  text-decoration: none;
}

.markdown-content ul,
.markdown-content ol {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
}

.markdown-content li {
  margin-bottom: 0.5rem;
}
</style>
