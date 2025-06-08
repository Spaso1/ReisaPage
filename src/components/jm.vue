<script setup lang="ts">
import {ref, onMounted, watch, onBeforeUnmount} from 'vue'
import axios from 'axios'

const props = defineProps<{
  id: string
}>()

interface AlbumData {
  album_id: string
  name: string
  image_urls: string[]
  nums: number[]
}

const album = ref<AlbumData | null>(null)
const images = ref<HTMLImageElement[]>([])
const canvasImages = ref<string[]>([])

// 新增：用于控制取消加载的标志
const abortLoading = ref(false)

// 加载专辑数据
const fetchAlbum = async () => {
  if (!props.id) return

  try {
    const response = await axios.get(`/jm/album/${props.id}/`, {
      maxRedirects: 5,
      validateStatus: (status) => status < 500,
    })

    let data: AlbumData

    if (response.status === 307 || response.status === 302) {
      const newUrl = new URL(response.headers.location, response.config.url).href
      const redirectResponse = await axios.get(newUrl)
      data = redirectResponse.data
    } else {
      data = response.data
    }

    // 清除之前的加载任务（如果存在）
    abortLoading.value = true

    album.value = data
    loadImagesInBatches(data.image_urls, data.nums)
  } catch (error) {
    console.error('加载专辑失败', error)
  }
}

// 分批加载图片（每次加载4张）
const loadImagesInBatches = async (urls: string[], nums: number[]) => {
  const batchSize = 4 // 每批加载4张图片
  let currentIndex = 0
  abortLoading.value = false // 开始新加载任务前重置标志

  while (currentIndex < urls.length && !abortLoading.value) {
    const batchUrls = urls.slice(currentIndex, currentIndex + batchSize)
    const batchNums = nums.slice(currentIndex, currentIndex + batchSize)

    const loadPromises = batchUrls.map((url, index) => {
      return new Promise<void>((resolve) => {
        if (abortLoading.value) return resolve()

        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = url

        img.onload = () => {
          if (abortLoading.value) return resolve()

          images.value[currentIndex + index] = img
          if (batchNums[index] !== 0) {
            const decodedCanvas = decodeImage(img, batchNums[index])
            const base64 = decodedCanvas.toDataURL()
            canvasImages.value[currentIndex + index] = base64
          } else {
            canvasImages.value[currentIndex + index] = url
          }
          resolve()
        }

        img.onerror = () => {
          if (abortLoading.value) return resolve()
          console.error(`图片加载失败: ${url}`)
          resolve()
        }
      })
    })

    await Promise.all(loadPromises)
    currentIndex += batchSize
  }
}

// JS 版 decodeImage（等效 Java 方法）
const decodeImage = (imgSrc: HTMLImageElement, num: number): HTMLCanvasElement => {
  if (num === 0) {
    const canvas = document.createElement('canvas')
    canvas.width = imgSrc.width
    canvas.height = imgSrc.height
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(imgSrc, 0, 0)
    return canvas
  }

  const w = imgSrc.width
  const h = imgSrc.height
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  const over = h % num

  for (let i = 0; i < num; i++) {
    let move = Math.floor(h / num)
    let ySrc = h - move * (i + 1) - over
    let yDst = move * i

    if (i === 0) {
      move += over
    } else {
      yDst += over
    }

    const srcRect = { x: 0, y: ySrc, width: w, height: move }
    const dstRect = { x: 0, y: yDst, width: w, height: move }

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = w
    tempCanvas.height = move
    const tempCtx = tempCanvas.getContext('2d')!
    tempCtx.drawImage(
      imgSrc,
      srcRect.x,
      srcRect.y,
      srcRect.width,
      srcRect.height,
      0,
      0,
      srcRect.width,
      srcRect.height
    )

    ctx.drawImage(
      tempCanvas,
      0,
      0,
      tempCanvas.width,
      tempCanvas.height,
      dstRect.x,
      dstRect.y,
      dstRect.width,
      dstRect.height
    )
  }

  return canvas
}

// 监听 id 变化后立即加载数据
watch(
  () => props.id,
  (newId) => {
    if (newId) {
      abortLoading.value = true // 切换 ID 时取消之前的加载
      fetchAlbum()
    }
  },
  { immediate: true }
)

onMounted(() => {
  fetchAlbum()
})

// 组件卸载时取消加载
onBeforeUnmount(() => {
  abortLoading.value = true
})
</script>

<template>
  <div v-if="album" class="comic-container">
    <!-- 顶部信息 -->
    <div class="comic-header">
      <h1 class="comic-title">{{ album.name }}</h1>
      <div class="comic-meta">
        <div class="meta-item">
          <span class="label">作者：</span>
          <span class="value">{{ album.authors.join(' / ') }}</span>
        </div>
        <div class="meta-item">
          <span class="label">标签：</span>
          <span class="value tags">
            <span v-for="(tag, idx) in album.tags" :key="idx" class="tag">{{ tag }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- 漫画图片区域 -->
    <div class="comic-images">
      <img
          v-for="(src, index) in canvasImages"
          :key="index"
          :src="src"
          alt="Comic Page"
          class="comic-page"
      />
    </div>

    <!-- 底部高斯模糊层 -->
    <div class="blur-overlay"></div>
  </div>
  <div v-else class="loading">Loading...</div>
</template>

<style scoped>
.comic-container {
  margin: 0;
  position: relative;
  padding: 24px;
  background-color: #1e1e2f;
  color: white;
  min-height: 100vh;
  font-family: sans-serif;
}

.comic-images {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0; /* 去除图片之间的间距 */
  padding: 0;
  margin: 0;
}

.comic-page {
  display: block; /* 避免 inline 元素带来的空白间隙 */
  max-width: 100%;
  height: auto;
  margin: 0;
  padding: 0;
  border: none;
}
/* 顶部信息 */
.comic-header {
  margin-bottom: 24px;
  z-index: 2;
  position: relative;
}

.comic-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 16px;
  line-height: 1.2;
}

.comic-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
}

.label {
  font-weight: bold;
  color: #aaa;
  width: 50px;
  flex-shrink: 0;
}

.value {
  color: #ddd;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag {
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  color: #ccc;
}

/* 图片区域 */
.comic-images {
  position: relative;
  z-index: 1;
}

.comic-page {
  display: block; /* 避免 inline 元素带来的空白间隙 */
  width: 100%;
  height: auto;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* 底部高斯模糊层 */
.blur-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 50%;
  backdrop-filter: blur(10px);
  background: linear-gradient(to top, rgba(30, 30, 47, 0.9), transparent);
  z-index: 0;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #999;
}
</style>
