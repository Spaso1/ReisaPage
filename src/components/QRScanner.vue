<template>
  <div class="scanner-container">
    <video ref="video" class="scanner-video"></video>
    <div class="scanner-overlay"></div>
    <button class="close-button" @click="$emit('close')">关闭</button>
  </div>
</template>

<script>
import { onMounted, ref } from 'vue'

export default {
  emits: ['scan', 'close'],

  setup(props, { emit }) {
    const video = ref(null)
    let scanner = null

    onMounted(() => {
      startScanner()
    })

    const startScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment'
          }
        })

        video.value.srcObject = stream
        video.value.play()

        // In a real app, you would use a QR scanning library here
        // This is just a placeholder for the concept
        const detectQR = () => {
          // Simulate QR detection
          // In a real app, this would use actual QR decoding
          setTimeout(() => {
            emit('scan', 'paika12345') // Simulated QR code
          }, 2000)
        }

        detectQR()
      } catch (error) {
        console.error('Error accessing camera:', error)
        emit('close')
      }
    }

    return {
      video
    }
  }
}
</script>

<style scoped>
.scanner-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.scanner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.scanner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 2px solid rgba(0, 255, 0, 0.5);
  pointer-events: none;
}

.close-button {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
