<template>
  <div class="map-wrapper">
    <div class="baidu-map-container">
      <div id="baidu-map" ref="mapContainer"></div>

      <div class="map-search-box">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="输入地点进行搜索"
          @keyup.enter="handleSearch"
        />
        <button @click="handleSearch">搜索</button>
      </div>

      <div class="map-controls">
        <button @click="zoomIn">放大</button>
        <button @click="zoomOut">缩小</button>
        <button @click="locateMe">定位</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BaiduMap',
  props: {
    center: {
      type: Array,
      default: () => [116.404, 39.915]
    },
    zoom: {
      type: Number,
      default: 15
    }
  },
  data() {
    return {
      map: null,
      searchKeyword: '',
      localSearch: null,
      geolocation: null,
      currentCity: '', // 存储当前城市名称
      geocoder: null, // 地理编码器实例
      previousCity: '' // 存储上一次的城市名称
    }
  },
  mounted() {
    this.initMap()
  },
  methods: {
    initMap() {
      const AK = '736Dbcrz7DuFhlpRatwp7FnE60fIwp4L';
      const script = document.createElement('script');
      script.src = `https://api.map.baidu.com/api?v=3.0&ak=${AK}&callback=initBaiduMap`;
      script.async = true;

      window.initBaiduMap = () => {
        this.$nextTick(() => {
          this.map = new BMap.Map(this.$refs.mapContainer);
          const point = new BMap.Point(...this.center);
          this.map.centerAndZoom(point, this.zoom);
          this.map.enableScrollWheelZoom();
          this.map.enableDragging();

          // 初始化地理编码器
          this.geocoder = new BMap.Geocoder();

          // 隐藏百度Logo
          this.hideBaiduLogo();
          this.geolocation = new BMap.Geolocation();

          // 监听地图中心点变化
          this.map.addEventListener('moveend', this.onMapMoveEnd);

          // 初始获取城市信息
          this.getCityFromCenter(point);
          // 添加自定义控件
          this.map.addControl(new BMap.NavigationControl({
            anchor: BMAP_ANCHOR_TOP_RIGHT,
            type: BMAP_NAVIGATION_CONTROL_SMALL
          }));

          this.localSearch = new BMap.LocalSearch(this.map, {
            renderOptions: { map: this.map, panel: null },
            onSearchComplete: this.handleSearchComplete
          });
        });
      };

      document.head.appendChild(script);
    },

    // 隐藏百度Logo的方法
    hideBaiduLogo() {
      setTimeout(() => {
        const logoDom = document.querySelector('.anchorBL');
        if (logoDom) {
          logoDom.style.display = 'none';
        }

        // 隐藏版权信息（可选）
        const copyrightDom = document.querySelector('.BMap_cpyCtrl');
        if (copyrightDom) {
          copyrightDom.style.display = 'none';
        }
      }, 300);
    },

    handleSearch() {
      if (this.searchKeyword.trim() && this.localSearch) {
        this.localSearch.search(this.searchKeyword);
      }
    },

    handleSearchComplete(results) {
      if (results && results.getNumPois() > 0) {
        const firstResult = results.getPoi(0);
        this.map.centerAndZoom(firstResult.point, 16);
      }
    },

    zoomIn() {
      if (this.map) {
        this.map.setZoom(this.map.getZoom() + 1);
      }
    },

    zoomOut() {
      if (this.map) {
        this.map.setZoom(this.map.getZoom() - 1);
      }
    },

    locateMe() {
      if (this.geolocation) {
        this.geolocation.getCurrentPosition(position => {
          if (position) {
            const point = position.point;
            this.map.centerAndZoom(point, 16);

            // 创建自定义图标
            const myIcon = new BMap.Icon('http://cdns.godserver.cn/resource/static/mai/pic/UI_MSS_Allclear_Icon_AP.png.png', new BMap.Size(32, 32), {
              anchor: new BMap.Size(16, 16), // 图标锚点
              imageSize: new BMap.Size(32, 32) // 图标实际大小
            });

            // 创建标记
            const marker = new BMap.Marker(point, {icon: myIcon});
            this.map.addOverlay(marker);
          }
        }, {
          enableHighAccuracy: true
        });
      }
    },
    // 地图移动结束事件处理
    onMapMoveEnd() {
      const newCenter = this.map.getCenter();
      if (this.isCenterChanged(newCenter)) {
        this.currentCenter = newCenter;
        this.onCenterChanged(newCenter);
      }
    },

    // 判断中心点是否发生变化
    isCenterChanged(newCenter) {
      if (!this.currentCenter) return true;
      return (
        Math.abs(newCenter.lng - this.currentCenter.lng) > 1e-6 ||
        Math.abs(newCenter.lat - this.currentCenter.lat) > 1e-6
      );
    },
    // 获取当前中心点的城市信息
    getCityFromCenter(point) {
      if (!this.geocoder) return;

      this.geocoder.getLocation(point, (result) => {
        if (result) {
          const cityComponent = result.addressComponents.city ||
            result.addressComponents.province;
          const country = result.addressComponents.country;
          const province = result.addressComponents.province;
          if(this.isEnglish(province)) {
            this.currentCity = province;
            this.$emit('city-changed', this.currentCity);
          }else {
            this.currentCity = cityComponent.replace(/市$/, ''); // 去掉"市"字
            this.$emit('city-changed', this.currentCity);
            this.onCityChanged();
          }
        }
      });
    },
    isEnglish(text) {
      return /^[A-Za-z]+$/.test(text);
    },
    onCenterChanged(newCenter) {
      const centerLat = newCenter.lat;
      const centerLng = newCenter.lng;
      this.getCityFromCenter(newCenter);
      // 根据经纬度判断是否在中国大陆
      if (this.isInChina(centerLng, centerLat)) {
        // 不需要在这里调用 fetchPoints
      } else {
        this.showSnackBar('非大陆地区请使用软件查看');
      }
    },

    onCityChanged() {
      if (this.currentCity !== this.previousCity) {
        this.previousCity = this.currentCity;
        this.fetchPoints();
      }
    },

    isInChina(lng, lat) {
      // 简单的经纬度范围判断，实际应用中可能需要更精确的判断
      return lng >= 73.66 && lng <= 135.05 && lat >= 3.86 && lat <= 53.55;
    },

    showSnackBar(message) {
      // 这里假设你使用的是 Element UI 或其他 UI 库
      // 如果你使用的是其他库，请根据实际情况调整
      this.$message({
        message: message,
        type: 'warning',
        duration: 3000
      });
    },

    async fetchPoints() {
      try {
        let status = "市";
        if (this.isEnglish(this.currentCity)) {
          status = "省";
        }
        const response = await fetch(`/api/mai/v1/search?prompt1=${this.currentCity}&status=` +status);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        this.clearMarkers(); // 清除旧的标记点
        this.addMarkers(data);
      } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
      }
    },

    clearMarkers() {
      if (this.map) {
        this.map.clearOverlays();
      }
    },

    addMarkers(points) {
      if (!this.map) return;

      // 创建自定义图标
      const myIcon = new BMap.Icon('http://cdns.godserver.cn/resource/static/mai/pic/SD.png', new BMap.Size(70, 26), {
        anchor: new BMap.Size(70, 26), // 图标锚点
        imageSize: new BMap.Size(70, 26) // 图标实际大小
      });

      points.forEach(point => {
        const markerPoint = new BMap.Point(point.x, point.y);
        const marker = new BMap.Marker(markerPoint, {icon: myIcon});
        this.map.addOverlay(marker);

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
        `;

        // 创建信息窗口
        const infoWindow = new BMap.InfoWindow(infoWindowContent);

        // 添加点击事件监听器
        marker.addEventListener('click', () => {
          this.map.openInfoWindow(infoWindow, markerPoint);
        });
      });
    }
  }
}
</script>

<style scoped>
.map-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 95%;
  height: 100vh; /* 根据实际需要调整 */
}

.baidu-map-container {
  position: relative;
  width: 100%;
  height: 80%;
  border: 16px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
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
