<template>
  <div class="map-container">
    <CustomToast ref="toast" />
    <div id="cesiumContainer" class="cesium-container"></div>
    <div v-if="selectedFlight" class="popup">
      <h3>Flight: {{ selectedFlight.callsign || selectedFlight.icao24 }}</h3>
      <p>Country: {{ selectedFlight.origin_country }}</p>
      <p>Latitude: {{ selectedFlight.latitude }}</p>
      <p>Longitude: {{ selectedFlight.longitude }}</p>
      <p>Altitude: {{ selectedFlight.altitude }} m</p>
      <p>Heading: {{ selectedFlight.heading }}°</p>
      <p>Time Position: {{ selectedFlight.time_position }}</p>
      <p>Last Contact: {{ selectedFlight.last_contact }}</p>
      <p>On Ground: {{ selectedFlight.on_ground }}</p>
      <p>Velocity: {{ selectedFlight.velocity }} m/s</p>
      <p>Vertical Rate: {{ selectedFlight.vertical_rate }} m/s</p>
      <p>Barometric Altitude: {{ selectedFlight.baro_altitude }} m</p>
      <button @click="closePopup">Close</button>
    </div>
    <div v-show="shouldShowBlockedWarning" class="blocked-warning">
      <div class="warning-icon">⚠️</div>
      <div class="warning-text">系统正在处理大量数据，请稍候...</div>
    </div>
  </div>
</template>

<script>
import * as Cesium from "cesium";
import { Ion } from "cesium";
import CustomToast from "@/components/CustomToast.vue";

export default {
  name: 'Cesium',
  components: { CustomToast },
  data() {
    return {
      viewer: null,
      selectedFlight: null,
      flightUpdateInterval: null,
      flightPositions: new Map(),
      accessToken: null,
      loaded: true,
      isProcessing: false,
      lastViewport: null,
      visibleFlights: new Set(),
      updateInterval: 30000 ,// 30秒更新间隔
      flightEntities: new Map(), // 用于缓存实体
    }
  },
  methods: {
    shouldShowBlockedWarning() {
      // 使用document.hidden检测页面是否可见
      if (document.hidden) return false;
      return this.isUiBlocked;
    },
    async fetchFlightData() {
      try {
        const apiResponse = await fetch(
            "https://opensky-network.org/api/states/all",
            {
              headers: {
                Authorization: `Bearer ${this.accessToken}`,
              },
            }
        );
        this.loaded = true;
        const data = await apiResponse.json();
        return data.states || [];
      } catch (error) {
        console.error("Error fetching flight data:", error);
        return [];
      }
    },

    // 检查点是否在视口内
    isInViewport(longitude, latitude) {
      if (!this.viewer) return false;

      try {
        const cartesian = Cesium.Cartesian3.fromDegrees(longitude, latitude);
        const screenPosition = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
            this.viewer.scene,
            cartesian
        );

        return screenPosition &&
            screenPosition.x >= 0 &&
            screenPosition.x <= this.viewer.canvas.clientWidth &&
            screenPosition.y >= 0 &&
            screenPosition.y <= this.viewer.canvas.clientHeight;
      } catch (e) {
        return false;
      }
    },

    // 获取当前视口的边界
    getViewportBounds() {
      if (!this.viewer) return null;

      const camera = this.viewer.camera;
      const rectangle = camera.computeViewRectangle();

      if (!rectangle) return null;

      return {
        west: Cesium.Math.toDegrees(rectangle.west),
        south: Cesium.Math.toDegrees(rectangle.south),
        east: Cesium.Math.toDegrees(rectangle.east),
        north: Cesium.Math.toDegrees(rectangle.north)
      };
    },

    updateEntities(flights) {
      const nowVisible = new Set();

      // 用 flightEntities 缓存管理
      flights.forEach(flight => {
        if (!flight || flight.length < 7) return;
        const icao24 = flight[0];
        nowVisible.add(icao24);

        if (this.flightEntities.has(icao24)) {
          // 只更新位置
          this.updateFlightEntity(this.flightEntities.get(icao24), flight);
        } else {
          // 新增实体
          const entity = this.addFlightToMap(flight);
          this.flightEntities.set(icao24, entity);
        }
      });

      // 删除不再可见的实体
      for (const [icao24, entity] of this.flightEntities.entries()) {
        if (!nowVisible.has(icao24)) {
          this.viewer.entities.remove(entity);
          this.flightEntities.delete(icao24);
        }
      }
    },
    updateFlightEntity(entity, flight) {
      // 只更新必要属性
      const [icao24, callsign, origin_country, time_position, last_contact, longitude, latitude, altitude, on_ground, velocity, heading, vertical_rate, baro_altitude] = flight;
      if (longitude && latitude) {
        entity.position = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);
        entity.billboard.rotation = Cesium.Math.toRadians((360 - heading) || 0);
        entity.properties = {
          icao24,
          callsign,
          origin_country,
          time_position,
          last_contact,
          on_ground,
          latitude,
          longitude,
          velocity,
          vertical_rate,
          baro_altitude,
          altitude,
          heading
        };
      }
    },
    // 优化后的添加航班方法
    addFlightToMap(flight) {
      if (!flight || flight.length < 7) return;

      const icao24 = flight[0];
      const callsign = flight[1]?.trim();
      const origin_country = flight[2];
      const time_position = flight[3];
      const last_contact = flight[4];
      const longitude = flight[5];
      const latitude = flight[6];
      const altitude = flight[7];
      const on_ground = flight[8];
      const velocity = flight[9];
      const heading = flight[10];
      const vertical_rate = flight[11];
      const baro_altitude = flight[12];


      if (!latitude || !longitude) return;

      const entityId = `flight-${icao24}`;
      const currentPosition = Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude);

      let flightEntity = this.viewer.entities.getById(entityId);

      if (!flightEntity) {
        // 创建新实体
        flightEntity = this.viewer.entities.add({
          id: entityId,
          position: currentPosition,
          billboard: {
            image: this.getFlightIcon(origin_country),
            width: 50,
            height: 50,
            rotation: Cesium.Math.toRadians((360 - heading) || 0),
          },
          properties: {
            icao24,
            callsign,
            origin_country,
            time_position,
            last_contact,
            on_ground,
            latitude,
            longitude,
            velocity,
            vertical_rate,
            baro_altitude,
            altitude,
            heading,
          },
        });
      } else {
        // Calculate the heading based on the previous and current positions
        const prevPosition = this.flightPositions.get(icao24);
        if (prevPosition) {
          const prevLongitude = Cesium.Math.toDegrees(prevPosition.longitude);
          const prevLatitude = Cesium.Math.toDegrees(prevPosition.latitude);

          const deltaLongitude = Cesium.Math.toRadians(longitude - prevLongitude);
          const currentLatitudeRad = Cesium.Math.toRadians(latitude);
          const prevLatitudeRad = Cesium.Math.toRadians(prevLatitude);

          const y = Math.sin(deltaLongitude) * Math.cos(currentLatitudeRad);
          const x =
              Math.cos(prevLatitudeRad) * Math.sin(currentLatitudeRad) -
              Math.sin(prevLatitudeRad) * Math.cos(currentLatitudeRad) * Math.cos(deltaLongitude);

          const calculatedHeading = (Cesium.Math.toDegrees(Math.atan2(y, x)) + 360) % 360;

          // Update the entity's rotation based on the calculated heading
          flightEntity.billboard.rotation = Cesium.Math.toRadians(calculatedHeading);
        }

        // Update the existing entity's position
        flightEntity.position = currentPosition;
      }

      // 更新存储的位置
      this.flightPositions.set(icao24, {
        icao24,
        callsign,
        origin_country,
        time_position,
        last_contact,
        on_ground,
        latitude,
        longitude,
        velocity,
        vertical_rate,
        baro_altitude,
        altitude,
        heading,

      });
    },
    initUiBlockDetection() {
      let lastCheck = performance.now();
      let blockedCount = 0;

      const checkBlock = () => {
        const now = performance.now();
        const delta = now - lastCheck;

        // 如果检测间隔超过预期50%，认为可能卡顿
        if (delta > 150) { // 预期是100ms检测一次
          blockedCount++;

          // 连续3次检测到卡顿才显示警告
          if (blockedCount >= 3) {
            this.showBlockWarning();
          }
        } else {
          blockedCount = 0;
          this.hideBlockWarning();
        }

        lastCheck = now;
        requestAnimationFrame(checkBlock);
      };

      requestAnimationFrame(checkBlock);
    },

    showBlockWarning() {
      // 使用直接DOM操作确保显示
      const warningEl = document.querySelector('.blocked-warning');
      if (warningEl) {
        warningEl.style.display = 'flex';
      }
    },

    hideBlockWarning() {
      const warningEl = document.querySelector('.blocked-warning');
      if (warningEl) {
        warningEl.style.display = 'none';
      }
    },
    getFlightIcon(country) {
      return country === 'United States' ? '/src/assets/flight.png' :
          country === 'China' ? '/src/assets/flight3.png' :
              '/src/assets/flight2.png';
    },

    setupClickHandler() {
      const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
      handler.setInputAction((click) => {
        const pickedObject = this.viewer.scene.pick(click.position);
        if (Cesium.defined(pickedObject) && pickedObject.id) {
          const entity = pickedObject.id;
          this.selectedFlight = {
            icao24: entity.properties.icao24.getValue(),
            callsign: entity.properties.callsign.getValue(),
            origin_country: entity.properties.origin_country.getValue(),
            latitude: entity.properties.latitude.getValue(),
            longitude: entity.properties.longitude.getValue(),
            altitude: entity.properties.altitude.getValue(),
            heading: entity.properties.heading.getValue(),
          };
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },

    closePopup() {
      this.selectedFlight = null;
    },

    async updateFlights() {
      if (this.isProcessing) return;
      this.isProcessing = true;

      try {
        const flightData = await this.fetchFlightData();
        if (flightData && flightData.length > 0) {
          this.updateEntities(flightData);
        }
      } catch (error) {
        console.error("Flight update error:", error);
      } finally {
        this.isProcessing = false;
      }
    },

    setupViewportListener() {
      this.viewer.camera.changed.addEventListener(() => {
        // 防抖处理，避免频繁更新
        if (this.viewportUpdateTimeout) {
          clearTimeout(this.viewportUpdateTimeout);
        }

        this.viewportUpdateTimeout = setTimeout(() => {
          this.updateFlights();
        }, 500);
      });
    },
    initWorker() {
      this.flightWorker = new Worker(
          new URL('@/workers/flightProcessor.worker.js', import.meta.url)
      );

      this.flightWorker.onmessage = (e) => {
        if (e.data.type === 'UPDATE_ENTITIES') {
          this.updateEntities(e.data.data);
          this.isProcessing = false;
        }
      };
    },
    endLoading() {
      this.isUiBlocked = false;
    },
  },
  async mounted() {
    const tokenResponse = await fetch(
        "/openskyauth/auth/realms/opensky-network/protocol/openid-connect/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: "astralpath@163.com-api-client",
            client_secret: "PzRpopiUlz3LdfI5zrBZbSLpdQ4FMMps",
          }),
        }
    );
    this.initUiBlockDetection();
    this.initWorker(); // 初始化Worker
    const tokenData = await tokenResponse.json();
    this.accessToken = tokenData.access_token;

    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyODRiOTk0YS1kODNkLTQyN2QtODNhMy1lOGYwNjEzYjVjM2EiLCJpZCI6MzA1ODc5LCJpYXQiOjE3NDgwODg2NDZ9.wTDELeQuRhSCe52QfOUXRMxBkBW3Hq0Dzgeje_za07s';

    this.viewer = new Cesium.Viewer("cesiumContainer", {
      terrainProvider: await Cesium.createWorldTerrainAsync(),
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      creditContainer: document.createElement("div"),
      sceneMode: Cesium.SceneMode.SCENE3D,
      // 性能优化选项
      scene3DOnly: true, // 只使用3D场景
      orderIndependentTranslucency: false, // 禁用半透明独立排序
      shadows: false, // 禁用阴影
      shouldAnimate: false, // 禁用自动动画
      requestRenderMode: true, // 启用按需渲染
    });

    // 设置相机变化监听
    this.setupViewportListener();

    // 初始加载
    await this.updateFlights();
    this.setupClickHandler();

    // 设置定时更新
    this.flightUpdateInterval = setInterval(() => {
      if (this.loaded) {
        this.loaded = false;
        this.updateFlights();
      }
    }, this.updateInterval);
  },

// 在beforeUnmount中添加更彻底的清理
  beforeUnmount() {
    // 清理所有实体
    this.viewer.entities.removeAll();

    // 释放地形资源
    this.viewer.terrainProvider = new Cesium.EllipsoidTerrainProvider();

    // 清理Web Worker
    if (this.flightWorker) {
      this.flightWorker.terminate();
    }

    // 强制垃圾回收(非标准API，仅Chrome有效)
    if (window.gc) {
      window.gc();
    }

    // 销毁Viewer
    this.viewer.destroy();
    this.viewer = null;
  }
}
</script>

<style>
.cesium-container {
  width: 100%;
  height: 100vh;
  position: relative;
  z-index: 1;
}

.popup {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 16px;
  width: 300px;
  z-index: 1000;
  transition: all 0.3s ease-in-out;
}

.popup h3 {
  margin: 0 0 10px;
}

.popup p {
  margin: 5px 0;
}

.popup button {
  margin-top: 10px;
  padding: 8px 16px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.3s;
}

.popup button:hover {
  background: #40a9ff;
}

/* 定义弹出动画 */
@keyframes slide-in {
  from {
    transform: translateX(100%); /* 从右侧滑入 */
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
/* 加载覆盖层 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* 加载旋转动画 */
.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: white;
  font-size: 18px;
}

/* 卡顿警告样式 */
.blocked-warning {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(255, 165, 0, 0.9);
  padding: 10px 20px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  z-index: 10000;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

.warning-icon {
  font-size: 24px;
  margin-right: 10px;
}

.warning-text {
  color: #333;
  font-size: 16px;
}
</style>
