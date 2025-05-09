<template>
  <div class="popup-overlay" @click.self="$emit('close')">
    <div class="popup-content">
      <button class="shangji-button" @click="$emit('shang-ji')">
        上机
      </button>
      <button class="close-button" @click="$emit('close')">
        关闭弹窗
      </button>
    </div>
  </div>
</template>

<script>
export default {
  emits: ['close', 'shang-ji']
}
</script>

<style scoped>
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.popup-content {
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  width: 75%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.shangji-button {
  font-size: 2rem;
  color: white;
  background-color: #2196f3; /* Blue */
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 20px;
  width: 100%;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.close-button {
  color: white;
  background-color: #f44336; /* Red */
  padding: 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
}
</style>
