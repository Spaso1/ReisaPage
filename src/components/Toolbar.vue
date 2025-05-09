<template>
  <div class="toolbar">
    <span class="toolbar-title">{{ title }}</span>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.toolbar {
  padding: 8px 16px;
  margin-bottom: 8px;
}

.toolbar-title {
  font-size: 1.2rem;
  font-weight: 500;
  color: #ff4081; /* Pink color */
}
</style>
