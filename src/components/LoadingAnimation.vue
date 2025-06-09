<template>
  <div class="loading-container">
    <div class="loading-dots">
      <div
        v-for="(dot, index) in dots"
        :key="index"
        class="dot"
        :style="{
          animationDelay: `${index * 0.5}s`,
          '--dot-index': index,
        }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingAnimation',
  data() {
    return {
      dots: Array(5).fill(null),
    }
  },
}
</script>

<style scoped>
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 4px;
}

.loading-dots {
  position: relative;
  width: 100%;
  min-width: 200px;
  height: 20px;
  overflow: hidden;
}

.dot {
  position: absolute;
  top: 50%;
  left: -10px;
  width: 2px;
  height: 2px;
  background-color: #ac395d;
  border-radius: 50%;
  transform: translateY(-50%);
  animation: dotMove 8s infinite ease-in-out;
}

@keyframes dotMove {
  0% {
    left: -10px;
  }
  15.6% {
    left: calc(50% - (var(--dot-index) - 2) * 8px);
    transform: translateY(-50%) translateX(-50%);
  }
  31.25% {
    left: calc(50% - (var(--dot-index) - 2) * 8px);
    transform: translateY(-50%) translateX(-50%);
  }
  46.87% {
    left: calc(50% - (var(--dot-index) - 2) * 8px);
    transform: translateY(-50%) translateX(-50%);
  }
  62.5% {
    left: 110%;
    transform: translateY(-50%);
  }
  100% {
    left: 110%;
    transform: translateY(-50%);
  }
}
</style>
