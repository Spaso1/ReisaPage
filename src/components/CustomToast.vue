<template>
  <div v-if="visible" class="custom-toast">
    {{ message }}
  </div>
</template>

<script>
export default {
  name: "CustomToast",
  data() {
    return {
      visible: false,
      message: "",
    };
  },
  methods: {
    show(message, duration = 1000) {
      this.message = message;
      this.visible = true;
      setTimeout(() => {
        this.visible = false;
      }, duration);
    },
  },
};
</script>

<style>
.custom-toast {
  position: fixed;
  top: 80px; /* 设置距离顶部 50px */
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  z-index: 1000;
  animation: fade-in 0.3s ease-in-out, fade-out 0.3s ease-in-out 0.7s; /* 淡入淡出动画 */
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(-10px); /* 从上方滑入 */
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px); /* 向上滑出 */
  }
}
</style>
