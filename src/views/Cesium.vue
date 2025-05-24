<template>
    <div class="map-container">
        <CustomToast ref="toast" />
        <div id="cesiumContainer" class="cesium-container"></div>
        <div v-if="selectedPoint" class="popup">
            <h3>{{ selectedPoint.name }}</h3>
            <p>Province: {{ selectedPoint.province }}</p>
            <p>City: {{ selectedPoint.city }}</p>
            <p>Area: {{ selectedPoint.area }}</p>
            <p>Address: {{ selectedPoint.address }}</p>
            <p>Good Reviews: {{ selectedPoint.good }}</p>
            <p>Bad Reviews: {{ selectedPoint.bad }}</p>
            <button @click="closePopup">Close</button>
        </div>
    </div>
</template>

<script>
import * as Cesium from "cesium";
import {Ion} from "cesium";
import CustomToast from "@/components/CustomToast.vue";

export default {
    name: 'Cesium',
    components: {CustomToast},
    data() {
        return {
            lastLatitude: null,
            lastLongitude: null,
            threshold: 0.1,
            city: "BeiJing",
            province: "BeiJing",
            country: "China",
            citys: [],
            provinces: [],
            countrys: [],
            searchResults: [],
            viewer: null,
            selectedPoint: null, // Stores the currently selected point
            baiduMap: null, // To store Baidu Map instance
        }
    },
    methods: {
        addPointToMap(viewer, latitude, longitude, height = 0, imageUrl, pointData) {
            const entityId = `point-${latitude}-${longitude}`;

            // Check if an entity with the same id already exists
            const existingEntity = viewer.entities.getById(entityId);
            if (existingEntity) {
                console.warn(`Entity with id ${entityId} already exists. Skipping addition.`);
                return; // Skip adding the entity
            }

            // Add the new entity
            viewer.entities.add({
                id: entityId,
                position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
                billboard: {
                    image: imageUrl,
                    width: 140,
                    height: 52,
                },
                properties: {
                    pointData: pointData,
                },
            });
        },
        // 在mounted中初始化时设置一次全局点击事件
        setupClickHandler() {
            const handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            handler.setInputAction((click) => {
                const pickedObject = this.viewer.scene.pick(click.position);
                if (Cesium.defined(pickedObject)) {
                    // 通过properties获取附加的数据
                    if (pickedObject.id && pickedObject.id.properties) {
                        this.selectedPoint = pickedObject.id.properties.pointData.getValue();
                        console.log("选中的点数据:", this.selectedPoint);
                    }
                }
            }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        },
        closePopup() {
            this.selectedPoint = null; // Close the popup
        },
        hasLoad(query,type) {
            if (this.citys.includes(query) && type === "city") {
                return false;
            } else if (this.provinces.includes(query) && type === "province") {
                return false;
            } else if (this.countrys.includes(query) && type === "country") {
                return false;
            }
            if (type === "city") {
                this.citys.push(query);
            } else if (type === "province") {
                this.provinces.push(query);
            } else if (type === "country") {
                this.countrys.push(query);
            }
            return true;
        },
        handleDetailSearch() {
            const query = this.city;
            if (!query) return;
            if (!this.hasLoad(query,"city")) {
                return;
            }
            this.showLoadingMessage();
            fetch(`/api/mai/v1/searchAll?query=${encodeURIComponent(query.replace("市",""))}`)
                .then(response => response.json())
                .then(data => {
                    this.searchResults = data;
                    this.addSearchResultsToMap();
                    console.log(data)
                    //if is empty
                    if (data.length === 0) {
                        this.handleDetailSearchIntProvince();
                    }
                })
                .catch(error => {
                    console.error('请求失败:', error);
                });
        },
        handleDetailSearchCountry() {
            const query = this.country;
            if (!query) return;

            if (!this.hasLoad(query,"country")) {
                return;
            }
            fetch(`/api/mai/v1/searchAll?query=${encodeURIComponent(query)}`)
                .then(response => response.json())
                .then(data => {
                    this.searchResults = data;
                    this.addSearchResultsToMap();
                    console.log(data)
                })
                .catch(error => {
                    console.error('请求失败:', error);
                });
        },
        handleDetailSearchIntProvince() {
            const query = this.province;
            if (!query) return;

            if (!this.hasLoad(query,"province")) {
                return;
            }
            fetch(`/api/mai/v1/searchAll?query=${encodeURIComponent(query.replace("省",""))}`)
                .then(response => response.json())
                .then(data => {
                    this.searchResults = data;
                    this.addSearchResultsToMap();
                    if (data.length === 0) {
                        this.handleDetailSearchCountry();
                    }
                    console.log(data)
                })
                .catch(error => {
                    console.error('请求失败:', error);
                });
        },
        onCameraViewChanged(camera) {
            const position = camera.positionCartographic;
            const latitude = Cesium.Math.toDegrees(position.latitude);
            const longitude = Cesium.Math.toDegrees(position.longitude);

            // Check if the change is within the threshold
            if (
                this.lastLatitude !== null &&
                this.lastLongitude !== null &&
                Math.abs(latitude - this.lastLatitude) < this.threshold &&
                Math.abs(longitude - this.lastLongitude) < this.threshold
            ) {
                console.log("Change is too small, skipping API request.");
                this.lastLatitude = latitude;
                this.lastLongitude = longitude;
                return;
            }

            // Update the last latitude and longitude
            this.lastLatitude = latitude;
            this.lastLongitude = longitude;

            console.log(`Camera moved to Latitude: ${latitude}, Longitude: ${longitude}`);

            // Initialize Baidu Map if not already done
            if (!this.baiduMap) {
                this.initializeBaiduMap();
            }

            // Use Baidu Maps JS API for reverse geocoding
            const point = new BMap.Point(longitude, latitude);
            const geoc = new BMap.Geocoder();

            geoc.getLocation(point, (rs) => {
                const addComp = rs.addressComponents;
                //输出addComp
                console.log(rs);
                this.city = addComp.city || addComp.province;
                this.country = rs.address.split(',').pop().trim();
                this.province = addComp.province;

                if (this.province.includes("台湾")) {
                    this.province = "Taiwan";
                }

                this.handleDetailSearch();
                console.log(`Current city: ${this.city}, Province: ${this.province}, Country: ${this.country}`);
            });
        },
        loadBaiduMapAPI() {
            return new Promise((resolve, reject) => {
                if (window.BMap) {
                    resolve(); // 如果已经加载，直接返回
                    return;
                }

                const script = document.createElement('script');
                script.src = `https://api.map.baidu.com/api?v=3.0&ak=736Dbcrz7DuFhlpRatwp7FnE60fIwp4L&callback=initBaiduMap`;
                script.onerror = reject;

                // 全局回调函数，百度地图加载完成后会调用
                window.initBaiduMap = () => {
                    resolve();
                };

                document.head.appendChild(script);
            });
        },
        initializeBaiduMap() {
            // This creates a hidden map instance we'll use just for geocoding
            const mapContainer = document.createElement('div');
            mapContainer.style.display = 'none';
            document.body.appendChild(mapContainer);
            this.baiduMap = new BMap.Map(mapContainer);
        },

        addSearchResultsToMap() {
            if (!this.searchResults || !this.searchResults.length) return;

            const viewer = this.viewer; // Ensure you have a reference to the Cesium viewer
            this.searchResults.forEach(result => {
                let latitude = result.x;
                let longitude = result.y;

// Validate latitude and longitude
                if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
                    console.warn("Invalid latitude or longitude detected. Swapping values.");
                    const temp = latitude;
                    latitude = longitude;
                    longitude = temp;
                }
                this.addPointToMap(viewer, latitude, longitude, 0, "/cdn/resource/static/mai/pic/SD.png", {
                    name: result.name,
                    province: result.province,
                    city: result.city,
                    area: result.area,
                    address: result.address,
                    good: result.good,
                    bad: result.bad
                });
            });
        },
        showLoadingMessage() {
            this.$refs.toast.show("加载中...", 2000);
        },
    },

    async mounted() {
        const latitude = parseFloat(this.$route.query.la) || 40.7128; // Default latitude
        const longitude = parseFloat(this.$route.query.lo) || -74.0060; // Default longitude
        const height = 1000; // Height in meters
        Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyODRiOTk0YS1kODNkLTQyN2QtODNhMy1lOGYwNjEzYjVjM2EiLCJpZCI6MzA1ODc5LCJpYXQiOjE3NDgwODg2NDZ9.wTDELeQuRhSCe52QfOUXRMxBkBW3Hq0Dzgeje_za07s';
        this.loadBaiduMapAPI();

        // Initialize Cesium Viewer
        const viewer = new Cesium.Viewer("cesiumContainer", {
            terrainProvider: await Cesium.createWorldTerrainAsync(),
            animation: false,
            timeline: false,
            baseLayerPicker: false,
            creditContainer: document.createElement("div"), // 隐藏水印
        });

        // Wait for the globe to finish loading
        const globe = viewer.scene.globe;
        const onTileLoadProgress = () => {
            if (globe.tilesLoaded) {
                console.log("Globe tiles fully loaded.");
                globe.tileLoadProgressEvent.removeEventListener(onTileLoadProgress);

                // Move the camera after the globe is fully loaded
                viewer.camera.flyTo({
                    destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
                    duration: 2, // Flight time in seconds
                    complete: () => {
                        this.handleDetailSearch();
                        viewer.camera.changed.addEventListener(() => {
                            const cameraHeight = viewer.camera.positionCartographic.height;
                            const minHeightThreshold = 1060776; // Set your minimum height threshold
                            console.log(cameraHeight);

                            if (cameraHeight < minHeightThreshold) {
                                this.onCameraViewChanged(viewer.camera);
                            }
                        });
                    },
                    cancel: () => {
                        console.log("Flight interrupted.");
                    },
                });

                // Show current position
                this.addPointToMap(viewer, latitude, longitude, height, "/cdn/resource/static/mai/pic/DX.png");

                this.setupClickHandler(); // Initialize click event listener
            }
        };

        globe.tileLoadProgressEvent.addEventListener(onTileLoadProgress);
        this.viewer = viewer;
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
</style>
