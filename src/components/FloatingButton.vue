<template>
  <button class="floating-button" :style="{ backgroundColor: color }" @click="$emit('click')">
    <span class="material-icons">{{ icon }}</span>
    <span class="button-label">{{ label }}</span>
  </button>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: 'blue'
    },
    label: {
      type: String,
      required: true
    }
  },
  emits: ['click']
}
</script>

<style scoped>
.floating-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.material-icons {
  font-size: 24px;
}

.button-label {
  font-size: 12px;
  margin-top: 4px;
}
</style>
