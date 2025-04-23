<template>
  <div class="maimai-view">
    <iframe src="http://wekan.godserver.cn/b/eu5nNL7GzF9SLYc6i/findmaimaidx" class="center-iframe"></iframe>
  </div>
</template>

<script>
export default {
  name: 'MaimaiView'
}
</script>

<style scoped>
.maimai-view {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* 使内容垂直居中 */
}

.center-iframe {
  width: 80%; /* 根据需要调整宽度 */
  height: 80%; /* 根据需要调整高度 */
  border: 16px solid rgba(255, 255, 255, 0.5); /* 16dp白色半透明边框 */
  border-radius: 16px; /* 圆润边框 */
}
</style>
