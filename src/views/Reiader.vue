<template>
  <div class="reader-page">
    <!-- 左侧推荐列表 + 搜索框 -->
    <aside class="sidebar">
      <!-- 搜索框 -->
      <div class="search-box">
        <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            placeholder="请输入漫画名称或 ID..."
            class="search-input"
        />
      </div>

      <!-- 标题 -->
      <div class="sidebar-header">
        <h2 class="title">周榜推荐</h2>
      </div>

      <!-- 推荐/搜索结果列表 -->
      <ul class="recommend-list">
        <li
            v-for="item in displayedList"
            :key="item.album_id"
            class="recommend-item"
            @click="goToReader(item.album_id)"
        >
          <div class="info">
            <p class="title">{{ item.title }}</p>
            <p class="id">ID: {{ item.album_id }}</p>
          </div>
        </li>
      </ul>
    </aside>

    <!-- 右侧漫画阅读区域 -->
    <main class="reader-content">
      <jm :id="albumId" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import Jm from '@/components/jm.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const albumId = ref<string | null>(null)
const recommendedList = ref<any[]>([])
const searchQuery = ref('')
const searchResults = ref<any[]>([])

// 获取当前 URL 查询参数中的 id
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search)
  albumId.value = urlParams.get('id')
})

// 请求周榜数据
const fetchWeeklyRankings = async () => {
  try {
    const response = await axios.get('/jm/rankings/week', {
      params: {
        page: 5
      }
    })
    recommendedList.value = response.data
  } catch (error) {
    console.error('加载周榜失败', error)
  }
}

// 处理搜索逻辑
const handleSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) {
    searchResults.value = []
    return
  }

  // 判断是否是纯数字（即 album_id）
  if (/^\d+$/.test(query)) {
    router.push(`/reisader?id=${query}`)
    return
  }

  try {
    const response = await axios.get('/jm/search/', {
      params: {
        search_query: query,
        page: 1
      },
      maxRedirects: 0, // 禁止自动跳转
      validateStatus: (status) => status < 500
    })

    if (response.status === 307 || response.status === 302) {
      const newUrl = new URL(response.headers.location, response.config.url).href
      const finalResponse = await axios.get(newUrl)
      searchResults.value = finalResponse.data
    } else {
      searchResults.value = response.data
    }
  } catch (error) {
    console.error('搜索失败', error)
    searchResults.value = []
  }
}

// 显示搜索结果 or 周榜
const displayedList = computed(() => {
  return searchResults.value.length ? searchResults.value : recommendedList.value
})

const goToReader = (id: string) => {
  albumId.value = id
}


onMounted(() => {
  fetchWeeklyRankings()
})
</script>

<style scoped>
.reader-page {
  display: flex;
  height: 100vh;
  padding: 16px;
  box-sizing: border-box;
  background-color: #f9f9f9;
}

/* 左侧推荐列表 */
.sidebar {
  width: 300px;
  max-width: 300px;
  min-width: 260px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  margin-right: 16px;
  flex-shrink: 0;
}

/* 搜索框 */
.search-box {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;
}

.search-input:focus {
  border-color: #5c6ac4;
  box-shadow: 0 0 0 2px rgba(92, 106, 196, 0.2);
}

/* 标题栏 */
.sidebar-header {
  padding: 16px;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #eee;
}

/* 推荐列表 */
.recommend-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recommend-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #eee;
  transition: background-color 0.2s ease;
  cursor: pointer;
}

.recommend-item:hover {
  background-color: #f1f1f1;
}

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.title {
  font-size: 14px;
  font-weight: bold;
  margin: 0;
}

.id {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.recommend-item:last-child {
  border-bottom: none;
}

/* 右侧阅读器 */
.reader-content {
  flex: 1;
  overflow-y: auto;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
