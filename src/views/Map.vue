<template>
  <div class="map-container">
    <component :is="currentComponent" v-bind="componentProps" />
  </div>
</template>

<script>
import BaiduMap from '@/views/BaiduMap.vue'
import AnotherMapComponent from '@/views/AnotherMapComponent.vue' // 假设这是另一个组件

export default {
  components: {
    BaiduMap,
    AnotherMapComponent
  },
  data() {
    return {
      currentComponent: 'BaiduMap',
      componentProps: {}
    }
  },
  created() {
    this.determineComponent()
  },
  methods: {
    determineComponent() {
      const type = this.$route.query.type
      const lo = this.$route.query.lo
      const la = this.$route.query.la
      const city = this.$route.query.city
      if (type === 'phone') {
        this.currentComponent = 'AnotherMapComponent'
        this.componentProps = { type: 'phone' ,
                                lo :  lo,
                                la :  la,
                                city : city
        } // 传递参数给组件
      } else {
        this.currentComponent = 'BaiduMap'
      }
    }
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

/* 如果 AnotherMapComponent 也有样式需求，可以在这里添加 */
.another-map-container {
  width: 100%;
  height: 100%;
}
</style>
