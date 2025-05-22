
<template>
  <div class="feedback-page">
    <!-- 回首頁按鈕 -->
    <button class="home-button" @click="playClickSoundAndNavigate">
      <img src="../assets/images/home-avocado.jpg" alt="回首頁" class="home-icon" />
    </button>

    <!-- 背景音樂 -->
    <audio ref="bgMusic" :src="bgMusicSrc" autoplay loop preload="auto"></audio>

    <!-- 點擊音效 -->
    <audio ref="clickSound" :src="clickSoundSrc" preload="auto"></audio>

    <!-- 音量控制器 -->
    <div class="volume-control">
      🔊 
      <input type="range" v-model="volume" min="0" max="1" step="0.01" />
      <span>{{ Math.round(volume * 100) }}%</span>
    </div>

    <!-- 頁面內容 -->
<div class="feedback-container">
  <h1>執行度&滿意度專區</h1>
  <p>這是執行度&滿意度建議頁面。</p>
  <!-- 嵌入 Google 表單 -->
  <iframe 
    src="https://docs.google.com/forms/d/e/1FAIpQLSdCsKPNRv2PhawCZqJ02GGwqEnRf7TVmGSY2cs-n7dskPZG3Q/viewform?embedded=true" 
    width="100%" 
    height="900" 
    frameborder="0" 
    marginheight="0" 
    marginwidth="0"
    style="background: white; border-radius: 12px;"
    >載入中…</iframe>
</div>
  </div>
</template>

<script>
import backgroundMusicFile from '@/assets/audio/background-music.mp3';
import clickSoundFile from '@/assets/audio/click-sound.mp3';

export default {
  name: 'ThreeHigh',
  data() {
    return {
      volume: 0.5,
      bgMusicSrc: backgroundMusicFile,
      clickSoundSrc: clickSoundFile,
    };
  },
  watch: {
    volume(newVolume) {
      if (this.$refs.bgMusic) {
        this.$refs.bgMusic.volume = newVolume;
        localStorage.setItem('backgroundMusicVolume', newVolume);
      }
    },
  },
  methods: {
    playClickSoundAndNavigate() {
      const clickSound = this.$refs.clickSound;
      const bgMusic = this.$refs.bgMusic;

      if (bgMusic) {
        bgMusic.pause();
      }

      if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.volume = 1.0;
        clickSound.play().catch((error) => {
          console.error('點擊音效播放失敗', error);
        });
      }

      setTimeout(() => {
        this.$router.push('/home');
      }, 300); // 音效長度可調整
    },
    setupVolume() {
      const savedVolume = localStorage.getItem('backgroundMusicVolume');
      this.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
      if (this.$refs.bgMusic) {
        this.$refs.bgMusic.volume = this.volume;
      }
    },
  },
  mounted() {
    this.setupVolume();
    // 進入本頁時，暫停首頁背景音樂
    const homeBgMusic = document.querySelector('.home-page audio');
    if (homeBgMusic && !homeBgMusic.paused) {
      homeBgMusic.pause();
      homeBgMusic.currentTime = 0;
    }
  },
  beforeRouteLeave(to, from, next) {
    if (this.$refs.bgMusic) {
      this.$refs.bgMusic.pause();
      this.$refs.bgMusic.currentTime = 0;
    }
    next();
  }
};
</script>

<style scoped>
@import '../assets/css/styles.css';
@import '../assets/css/ai-menu.css';

html, body, #app {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}
/* 歡迎介面背景 */
.feedback-page {
  min-height: 100vh;
  background: url('/src/assets/images/happy.jpg') no-repeat center center fixed;
  background-size: cover;
}
.feedback-container {
    max-width: 1000px;
    margin: 50px auto;
    padding: 30px;
    background: #ffffffcc;
    border-radius: 20px;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    text-align: center;
  }
</style>
