<template>
  <div class="map-container">
    <BaiduMap
      :center="[121.48, 31.22]"
      :zoom="14"
    />
  </div>
</template>

<script>
import BaiduMap from '@/views/BaiduMap.vue'

export default {
  components: {
    BaiduMap
  }
}
</script>

<style scoped>
.map-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 80vh; /* 使容器占满整个视口高度 */
}

/* 确保 BaiduMap 组件占满容器 */
.baidu-map-container {
  width: 100%;
  height: 100%;
}
</style>
