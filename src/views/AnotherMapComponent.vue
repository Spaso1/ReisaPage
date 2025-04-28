<template>
  <div class="map-wrapper">
    <div class="baidu-map-container">
      <div id="baidu-map" ref="mapContainer"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'AnotherMapComponent',
  props: {
    type: {
      type: String,
      default: null
    },
    lo: {
      type: Number,
      default: null
    },
    la: {
      type: Number,
      default: null
    },
    city: {
      type: String,
      default: null
    }
  },
  setup(props) {
    const route = useRoute()
    const type = ref(props.type || route.query.type || 'default')
    const longitude = ref(props.lo || parseFloat(route.query.lo) || 116.404)
    const latitude = ref(props.la || parseFloat(route.query.la) || 39.915)
    const city = ref(props.city || route.query.city || 'default')

    const map = ref(null)
    const searchKeyword = ref('')
    const localSearch = ref(null)
    const geolocation = ref(null)
    const currentCity = ref('') // 存储当前城市名称
    const geocoder = ref(null) // 地理编码器实例
    const previousCity = ref('') // 存储上一次的城市名称

    onMounted(() => {
      console.log('Type:', type.value)
      console.log('Longitude:', longitude.value)
      console.log('Latitude:', latitude.value)
      console.log('City:', city.value)

      initMap()
    })

    const initMap = () => {
      const AK = '736Dbcrz7DuFhlpRatwp7FnE60fIwp4L'
      const script = document.createElement('script')
      script.src = `https://api.map.baidu.com/api?v=3.0&ak=${AK}&callback=initBaiduMap`
      script.async = true

      window.initBaiduMap = () => {
        map.value = new BMap.Map(document.getElementById('baidu-map'))
        const point = new BMap.Point(longitude.value, latitude.value)
        map.value.centerAndZoom(point, 15)
        map.value.enableScrollWheelZoom()
        map.value.enableDragging()

        // 初始化地理编码器
        geocoder.value = new BMap.Geocoder()

        // 隐藏百度Logo
        hideBaiduLogo()

        geolocation.value = new BMap.Geolocation()

        // 监听地图中心点变化

        // 初始获取城市信息
        getCityFromCenter(point)

        // 添加自定义控件
        map.value.addControl(new BMap.NavigationControl({
          anchor: BMAP_ANCHOR_TOP_RIGHT,
          type: BMAP_NAVIGATION_CONTROL_SMALL
        }))

        localSearch.value = new BMap.LocalSearch(map.value, {
          renderOptions: { map: map.value, panel: null },
          onSearchComplete: handleSearchComplete
        })
      }

      document.head.appendChild(script)
    }

    // 隐藏百度Logo的方法
    const hideBaiduLogo = () => {
      setTimeout(() => {
        const logoDom = document.querySelector('.anchorBL')
        if (logoDom) {
          logoDom.style.display = 'none'
        }

        // 隐藏版权信息（可选）
        const copyrightDom = document.querySelector('.BMap_cpyCtrl')
        if (copyrightDom) {
          copyrightDom.style.display = 'none'
        }
      }, 300)
    }

    const handleSearch = () => {
      if (searchKeyword.value.trim() && localSearch.value) {
        localSearch.value.search(searchKeyword.value)
      }
    }

    const handleSearchComplete = (results) => {
      if (results && results.getNumPois() > 0) {
        const firstResult = results.getPoi(0)
        map.value.centerAndZoom(firstResult.point, 16)
      }
    }

    const zoomIn = () => {
      if (map.value) {
        map.value.setZoom(map.value.getZoom() + 1)
      }
    }

    const zoomOut = () => {
      if (map.value) {
        map.value.setZoom(map.value.getZoom() - 1)
      }
    }

    const locateMe = () => {
      if (geolocation.value) {
        geolocation.value.getCurrentPosition(position => {
          if (position) {
            const point = position.point
            map.value.centerAndZoom(point, 16)

            // 创建自定义图标
            const myIcon = new BMap.Icon('https://cdn.godserver.cn/resource/static/mai/pic/UI_MSS_Allclear_Icon_AP.png.png', new BMap.Size(32, 32), {
              anchor: new BMap.Size(16, 16), // 图标锚点
              imageSize: new BMap.Size(32, 32) // 图标实际大小
            })

            // 创建标记
            const marker = new BMap.Marker(point, { icon: myIcon })
            map.value.addOverlay(marker)
          }
        }, {
          enableHighAccuracy: true
        })
      }
    }

    // 地图移动结束事件处理
    const onMapMoveEnd = () => {
      const newCenter = map.value.getCenter()
      if (isCenterChanged(newCenter)) {
        currentCity.value = newCenter
        onCenterChanged(newCenter)
      }
    }

    // 判断中心点是否发生变化
    const isCenterChanged = (newCenter) => {
      if (!currentCity.value) return true
      return (
        Math.abs(newCenter.lng - currentCity.value.lng) > 1e-6 ||
        Math.abs(newCenter.lat - currentCity.value.lat) > 1e-6
      )
    }

    // 获取当前中心点的城市信息
    const getCityFromCenter = (point) => {
      if (!geocoder.value) return

      geocoder.value.getLocation(point, (result) => {
        if (result) {
          const cityComponent = result.addressComponents.city ||
            result.addressComponents.province
          const country = result.addressComponents.country
          const province = result.addressComponents.province
          if (isEnglish(province)) {
            currentCity.value = province
            // this.$emit('city-changed', this.currentCity);
          } else {
            currentCity.value = cityComponent.replace(/市$/, '') // 去掉"市"字
            // this.$emit('city-changed', this.currentCity);
            onCityChanged()
          }
        }
      })
    }

    const isEnglish = (text) => {
      return /^[A-Za-z]+$/.test(text)
    }

    const onCenterChanged = (newCenter) => {
      const centerLat = newCenter.lat
      const centerLng = newCenter.lng
      getCityFromCenter(newCenter)
      // 根据经纬度判断是否在中国大陆
      if (isInChina(centerLng, centerLat)) {
        // 不需要在这里调用 fetchPoints
      } else {
        showSnackBar('非大陆地区请使用软件查看')
      }
    }

    const onCityChanged = () => {
      if (currentCity.value !== previousCity.value) {
        previousCity.value = currentCity.value
        fetchPoints()
      }
    }

    const isInChina = (lng, lat) => {
      // 简单的经纬度范围判断，实际应用中可能需要更精确的判断
      return lng >= 73.66 && lng <= 135.05 && lat >= 3.86 && lat <= 53.55
    }

    const showSnackBar = (message) => {
      // 这里假设你使用的是 Element UI 或其他 UI 库
      // 如果你使用的是其他库，请根据实际情况调整
      console.log(message) // 示例中使用console.log代替UI库的提示
    }

    const fetchPoints = async () => {
      try {
        let status = '市'
        if (isEnglish(currentCity.value)) {
          status = '省'
        }
        const response = await fetch(`/api/mai/v1/search?prompt1=${currentCity.value}&status=${status}`)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        clearMarkers() // 清除旧的标记点
        addMarkers(data)
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error)
      }
    }

    const clearMarkers = () => {
      if (map.value) {
        map.value.clearOverlays()
      }
    }

    const addMarkers = (points) => {
      if (!map.value) return

      // 创建自定义图标
      const myIcon = new BMap.Icon('https://cdn.godserver.cn/resource/static/mai/pic/SD.png', new BMap.Size(70, 26), {
        anchor: new BMap.Size(70, 26), // 图标锚点
        imageSize: new BMap.Size(70, 26) // 图标实际大小
      })

      points.forEach(point => {
        const markerPoint = new BMap.Point(point.x, point.y)
        const marker = new BMap.Marker(markerPoint, { icon: myIcon })
        map.value.addOverlay(marker)

        // 构建信息窗口内容
        const infoWindowContent = `
          <div>
            <h3>${point.name}</h3>
            <p>省份: ${point.province}</p>
            <p>城市: ${point.city}</p>
            <p>区域: ${point.area}</p>
            <p>地址: ${point.address}</p>
            <p>使用状态: ${point.isUse === 1 ? '可用' : '不可用'}</p>
            <p>数量: ${point.num}</p>
            <p>数量J: ${point.numJ}</p>
            <p>总数: ${point.num + point.numJ}</p>
            <p>好评: ${point.good}</p>
            <p>差评: ${point.bad}</p>
          </div>
        `

        // 创建信息窗口
        const infoWindow = new BMap.InfoWindow(infoWindowContent)

        // 添加点击事件监听器
        marker.addEventListener('click', () => {
          map.value.openInfoWindow(infoWindow, markerPoint)
        })
      })
    }

    return {
      map,
      searchKeyword,
      localSearch,
      geolocation,
      currentCity,
      geocoder,
      previousCity,
      type,
      longitude,
      latitude,
      city,
      initMap,
      hideBaiduLogo,
      handleSearch,
      handleSearchComplete,
      zoomIn,
      zoomOut,
      locateMe,
      onMapMoveEnd,
      isCenterChanged,
      getCityFromCenter,
      isEnglish,
      onCenterChanged,
      onCityChanged,
      isInChina,
      showSnackBar,
      fetchPoints,
      clearMarkers,
      addMarkers
    }
  }
}
</script>

<style scoped>
.map-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh; /* 根据实际需要调整 */
}

.baidu-map-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

#baidu-map {
  width: 100%;
  height: 100%;
}

.map-search-box {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 8px;
}

.map-search-box input {
  padding: 8px 12px;
  width: 200px;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: none;
}

.map-search-box button {
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.map-search-box button:hover {
  background: #40a9ff;
}

.map-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.map-controls button {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.map-controls button:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
}
</style>
