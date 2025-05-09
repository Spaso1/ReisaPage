<template>
  <div id="app" >
    <!-- 新增的队列容器div，仅队列区域使用半透明背景 -->
    <div class="queue-container">
      <div class="container">
        <h1>排卡系统</h1>

        <!-- 显示当前队列信息 -->
        <div v-if="party">
          <p>当前队列: {{ party }}</p>
        </div>
        <div v-else>
          <p>当前没有队列</p>
        </div>

        <!-- 前两位玩家Card展示 -->
        <div v-if="players.length > 0" class="top-players">
          <div v-for="(player, index) in players.slice(0, 2)" :key="player.name" class="player-card">
            <div class="card-content">
              <img :src="player.avatarURL" alt="Avatar" class="avatar" />
              <p class="player-name">{{ player.name }}</p>
              <p v-if="index === 0" class="player-position">一号位</p>
              <p v-if="index === 1" class="player-position">二号位</p>
            </div>
          </div>
        </div>

        <!-- 其余玩家列表 -->
        <div v-if="players.length > 2" class="other-players">
          <h2>其他玩家</h2>
          <ul>
            <li v-for="player in players.slice(2)" :key="player.name">
              <img :src="player.avatarURL" alt="Avatar" width="40" height="40" />
              {{ player.name }}
            </li>
          </ul>
        </div>

        <!-- 操作按钮 -->
        <div class="button-group">
          <button @click="joinQueue" :class="{ 'dark-button': isDarkMode }">排卡</button>
          <button @click="leaveQueue" :class="{ 'dark-button': isDarkMode }">退卡</button>
          <button @click="startGame" :class="{ 'dark-button': isDarkMode }">上机</button>
          <button @click="scanToJoin" :class="{ 'dark-button': isDarkMode }">扫码加入队列</button>
        </div>
      </div>
    </div>

    <!-- 手动输入弹窗 - 保持原有位置不变 -->
    <div v-if="showInputModal" class="modal">
      <div class="modal-content">
        <h3>请输入队列信息</h3>
        <label for="partyName">队列名称:</label>
        <input type="text" id="partyName" v-model="inputParty" class="beautified-input" :class="{ 'beautified-input-dark': isDarkMode }" />
        <label for="username">用户名:</label>
        <input type="text" id="username" v-model="username" class="beautified-input" :class="{ 'beautified-input-dark': isDarkMode }" />
        <div class="modal-actions">
          <button @click="confirmJoin" :class="{ 'dark-button': isDarkMode }">确认</button>
          <button @click="cancelJoin" :class="{ 'dark-button': isDarkMode }">取消</button>
        </div>
      </div>
    </div>

    <!-- Toast 消息 - 保持原有位置不变 -->
    <div v-if="toastMessage" :class="['toast', { 'toast-dark': isDarkMode }]">
      {{ toastMessage }}
    </div>
  </div>
</template>

<script>
import jsQR from "jsqr";
import { ref, onMounted } from "vue";
const userInfo = ref(null);
const username = ref(""); // 用户名
const userAvatar = ref("0"); // 默认头像编号
const fetchUserInfo = async () => {
  try {
    const sessionId = localStorage.getItem("sessionId");

    const headers = new Headers({
      "Content-Type": "application/json",
    });

    if (sessionId) {
      headers.set("X-Session-ID", sessionId);
    }
    const response = await fetch("/cen/user/info" , {
      method: "GET", // 或 "POST"
      headers: headers,
    });
    if (response.ok) {
      const data = await response.json();
      userInfo.value = { ...data };

      // 如果存在 mai_userName 和 mai_avatarId，则优先使用
      username.value = data.mai_userName || data.name;
      userAvatar.value = data.mai_avatarId || "0";
      localStorage.removeItem("savedUsername");
      localStorage.setItem("savedUsername", data.mai_userName);

      console.log(data.mai_userName)
    } else {
      userInfo.value = null;
      router.push("/login");
    }
  } catch (error) {
    console.error("获取用户信息失败:", error);
    router.push("/login");
  }
};

export default {
  data() {
    // 从localStorage中读取保存的数据
    const savedUsername = localStorage.getItem('savedUsername') || "";
    const savedParty = localStorage.getItem('savedParty') || "";

    return {
      party: savedParty, // 当前队列名称（从localStorage读取）
      players: [], // 玩家列表
      username: savedUsername, // 用户名（从localStorage读取）
      inputParty: "", // 输入的队列名称
      showInputModal: false, // 是否显示输入弹窗
      toastMessage: "", // Toast 消息
      refreshInterval: null, // 定时器引用
      isDarkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches, // 检测系统是否为暗色模式
      isFetching: false // 是否正在获取队列数据
    };
  },
  mounted() {
    fetchUserInfo();
    // 监听系统暗色模式变化
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.checkDarkMode);
    }

    // 页面加载时如果已有队列信息，则自动获取队列数据
    if (this.party) {
      this.refreshInterval = setInterval(() => {
        this.fetchPartyData();
      }, 2000);
      this.fetchPartyData();
    }
  },
  methods: {
    // 检查暗色模式
    checkDarkMode(e) {
      this.isDarkMode = e.matches;
    },

    // 显示 Toast 消息
    showToast(message) {
      this.toastMessage = message;
      setTimeout(() => {
        this.toastMessage = "";
      }, 2000);
    },

    // 保存用户数据到localStorage
    saveUserData() {
      localStorage.setItem('savedUsername', this.username);
      localStorage.setItem('savedParty', this.party);
    },

    // 清除用户数据
    clearUserData() {
      localStorage.removeItem('savedUsername');
      localStorage.removeItem('savedParty');
    },

    async scanToJoin() {
      try {
        const video = document.createElement("video");
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          console.error("当前浏览器不支持摄像头访问");
        } else {
          console.log("浏览器支持摄像头访问");
        }
        // 请求摄像头权限
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.srcObject = stream;
        video.setAttribute("playsinline", true); // 防止在某些设备上全屏
        await video.play();

        // 创建扫描弹窗
        const scanModal = document.createElement("div");
        scanModal.style.position = "fixed";
        scanModal.style.top = "0";
        scanModal.style.left = "0";
        scanModal.style.width = "100%";
        scanModal.style.height = "100%";
        scanModal.style.background = "rgba(0, 0, 0, 0.8)";
        scanModal.style.display = "flex";
        scanModal.style.justifyContent = "center";
        scanModal.style.alignItems = "center";
        scanModal.style.zIndex = "9999";
        scanModal.appendChild(video);
        document.body.appendChild(scanModal);

        const scanQRCode = () => {
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // 使用 jsQR 解析二维码
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

            if (qrCode) {
              // 停止摄像头
              stream.getTracks().forEach((track) => track.stop());
              document.body.removeChild(scanModal);

              // 解析二维码内容
              this.inputParty = qrCode.data;
              this.saveUserData(); // 保存扫码信息
              this.showInputModal = true; // 没有队列时弹出输入框
            } else {
              requestAnimationFrame(scanQRCode);
            }
          } else {
            requestAnimationFrame(scanQRCode);
          }
        };

        scanQRCode();
      } catch (error) {
        console.log(error)
        this.showToast("扫码失败");
      }
    },

    // 获取队列数据
    async fetchPartyData() {
      if (!this.party) {
        this.showToast("当前没有队列");
        return;
      }

      this.isFetching = true;
      try {
        const response = await fetch(`/api/mai/v1/party?party=${this.party}`);
        const data = await response.text();
        this.players = this.parsePlayerData(data);

        // 检查当前用户是否已经加入队列
        this.isCurrentUserInQueue = this.players.some(player => player.name === this.username.value);

        this.isFetching = false;
      } catch (error) {
        this.showToast("获取队列数据失败");
        this.isFetching = false;
      }
    },

    // 解析玩家数据
    parsePlayerData(data) {
      const playerStrings = data.split(",");
      return playerStrings.map((playerString) => {
        // 修改解析逻辑以处理新格式
        const match = playerString.trim().match(/(.+?)$(\d+)$/);
        if (match && match[1] && match[2]) {
          const name = match[1].trim().replace(/["\[\]]/g, '');
          const avatarId = match[2].trim().replace(/["\[\]]/g, '');
          return {
            name: name,
            avatar: avatarId,
            avatarURL: `https://assets2.lxns.net/maimai/icon/${avatarId}.png`,
          };
        } else {
          // 处理旧格式或错误格式

          let [name, avatar] = playerString.split("()");
          name = name.trim().replace(/["\[\]]/g, '');
          avatar =avatar.trim().replace(/["\[\]]/g, '');
          return {
            name: name.trim(),
            avatar: avatar.trim(),
            avatarURL: `https://assets2.lxns.net/maimai/icon/${avatar.trim()}.png`,
          };
        }
      });
    },

    // 检查当前用户是否已在队列中
    isUserInQueue() {
      return this.players.some(player => player.name === this.username);
    },

    // 打开输入弹窗
    joinQueue() {
      if (!this.party) {
        this.showInputModal = true; // 没有队列时弹出输入框
      } else {
        this.addPlayerToQueue();
      }
    },

    // 确认加入队列
    async confirmJoin() {
      if (!this.inputParty || !this.username) {
        this.showToast("请输入完整信息");
        return;
      }

      this.party = this.inputParty; // 设置队列名称
      this.inputParty = ""; // 清空输入框
      this.showInputModal = false; // 关闭弹窗

      // 保存用户数据到localStorage
      this.saveUserData();

      // 加入队列
      await this.addPlayerToQueue();
    },

    // 取消加入队列
    cancelJoin() {
      this.inputParty = ""; // 清空输入框
      this.showInputModal = false; // 关闭弹窗
    },

    // 添加玩家到队列
    async addPlayerToQueue() {
      try {
        // 先获取最新队列数据
        await this.fetchPartyData();

        // 检查用户是否已经在队列中
        if (this.isUserInQueue()) {
          this.showToast("您已在此队列中");
          return;
        }

        // 构造玩家标识符
        const playerIdentifier = `${username.value}()${userAvatar.value}`; // 使用最新的用户名和头像ID
        // 发送加入队列请求
        const response = await fetch(
          `/api/mai/v1/party?party=${this.party}&people=${playerIdentifier}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" }
          }
        );

        if (response.ok) {
          this.showToast("加入队列成功");
          // 更新本地存储的用户名和队列信息
          this.saveUserData();
          // 刷新队列数据
          await this.fetchPartyData();
        } else {
          this.showToast("加入队列失败");
        }
        this.refreshInterval = setInterval(() => {
          this.fetchPartyData();
        }, 2000);
      } catch (error) {
        this.showToast("网络请求失败");
      }
    },

    // 退出队列
    async leaveQueue() {
      if (!this.party) {
        this.showToast("当前没有队列");
        return;
      }

      try {
        // 构造玩家标识符
        const playerIdentifier = `${this.username}(${this.userAvatar})`;

        const response = await fetch(
          `/api/mai/v1/party?party=${this.party}&people=${playerIdentifier}`,
          { method: "DELETE", headers: { "Content-Type": "application/json" } }
        );

        if (response.ok) {
          this.showToast("退出队列成功");
          this.party = ""; // 清空队列名称
          this.players = []; // 清空玩家列表
          // 清除本地存储的队列信息
          localStorage.removeItem('savedParty');
        } else {
          this.showToast("退出队列失败");
        }
      } catch (error) {
        this.showToast("网络请求失败");
      }
    },

    // 开始游戏
    async startGame() {
      if (!this.party) {
        this.showToast("当前没有队列");
        return;
      }

      try {
        const response = await fetch(
          `/api/mai/v1/partyPlay?party=${this.party}`,
          { method: "POST", headers: { "Content-Type": "application/json" } }
        );

        if (response.ok) {
          this.showToast("上机成功");
        } else {
          this.showToast("上机失败");
        }
      } catch (error) {
        this.showToast("网络请求失败");
      }
    }
  },
  beforeDestroy() {
    // 移除事件监听器
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.checkDarkMode);
    }
  }
};
</script>

<style>
/* 基础样式 */
#app {
  font-family: Arial, sans-serif;
  margin: 0 auto;
  text-align: center;
}

/* 队列容器样式 - 仅队列区域使用半透明背景 */
.queue-container {
  background-color: rgba(255, 255, 255, 0.5); /* 白色背景，80%不透明度 */
  backdrop-filter: blur(10px); /* 添加背景模糊效果 */
  padding: 20px;
  border-radius: 10px;
  margin: 20px auto;
  max-width: 70%;
  transition: all 0.3s ease;
}

/* 在移动设备上调整容器宽度 */
@media (max-width: 768px) {
  .queue-container {
    max-width: 90%;
    margin: 10px;
    padding: 15px;
  }

  /* 移动设备上的卡片布局调整 */
  .top-players {
    flex-direction: column;
    align-items: center;
  }

  .player-card {
    margin: 10px 0;
    width: 80%;
  }
}

.container {
  transition: all 0.3s ease;
}

.button-group button {
  margin: 10px;
  padding: 10px 20px;
  font-size: 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 998;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 10px;
  text-align: left;
  min-width: 300px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

/* 按钮暗色模式样式 */
.dark-button {
  background-color: #555;
  color: white;
  border: 1px solid #444;
}

/* 暗色模式样式 */
.dark {
  background-color: #1a1a1a;
  color: white;
}

.dark .queue-container {
  background-color: rgba(30, 30, 30, 0.4); /* 深灰色背景，80%不透明度 */
  backdrop-filter: blur(10px);
}

.dark .container {
  color: white;
}

.dark .button-group .dark-button {
  background-color: #444;
  color: white;
}

.dark .modal-content {
  background-color: #444;
  color: white;
}

.dark .modal-actions .dark-button {
  background-color: #666;
}

.dark .toast-dark {
  background: rgba(75, 85, 99, 0.45);
  color: white;
}

/* 美化输入框样式 */
.beautified-input {
  width: 100%;
  padding: 10px 15px;
  margin: 8px 0 16px 0;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  outline: none;
}

.beautified-input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
}

/* 暗色模式下的美化输入框样式 */
.beautified-input-dark {
  background-color: #444;
  border-color: #666;
  color: white;
}
/* 前两位玩家Card样式 */
.top-players {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.player-card {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 200px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 2px solid #eee;
}

.player-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.card-content {
  padding: 15px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin: 0 auto 10px;
  display: block;
  border: 2px solid #ddd;
}

.player-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin: 10px 0 5px;
}

.player-position {
  font-size: 14px;
  color: #666;
  margin: 5px 0;
}

/* 暗色模式下的Card样式 */
.dark .player-card {
  background-color: rgba(50, 50, 50, 0.9);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border: 2px solid #444;
}

.dark .player-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.5);
}

.dark .player-name {
  color: #eee;
}

.dark .player-position {
  color: #aaa;
}

.dark .avatar {
  border-color: #555;
}

/* 其他玩家列表样式 */
.other-players ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.other-players li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.other-players li:last-child {
  border-bottom: none;
}

.other-players img {
  vertical-align: middle;
  border-radius: 50%;
  border: 1px solid #ccc;
}
/* 暗色模式下的输入框样式 */
.dark .beautified-input {
  background-color: #333; /* 深色背景 */
  color: #fff; /* 白色文本 */
  border-color: #555; /* 深色边框 */
}
/* 移动设备上的卡片布局调整 */
@media (max-width: 768px) {
  .top-players {
    display: flex;
    justify-content: space-between; /* 卡片之间均匀分布 */
    gap: 10px; /* 卡片间距 */
  }

  .player-card {
    flex: 1 1 calc(50% - 10px); /* 每个卡片占50%的宽度，减去间距 */
    max-width: calc(50% - 10px); /* 确保最大宽度为50% */
  }
}
</style>
