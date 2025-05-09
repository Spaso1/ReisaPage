<template>
  <div class="player-card">
    <div class="player-image">
      <img
        v-if="imageUrl"
        :src="imageUrl"
        alt="Player avatar"
        class="avatar-image"
      />
      <span v-else class="material-icons">{{ imageName }}</span>
    </div>
    <span class="player-name">{{ playerName }}</span>
  </div>
</template>

<script>
export default {
  props: {
    imageUrl: {
      type: String,
      default: ''
    },
    imageName: {
      type: String,
      default: 'person'
    },
    playerName: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
.player-card {
  flex: 1;
  background-color: white;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.player-image {
  width: 48px;
  height: 48px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.material-icons {
  font-size: 48px;
  color: #2196f3; /* Blue color */
}

.player-name {
  font-size: 1rem;
  color: #212121; /* Dark gray */
}
</style>
