<template>
  <div class="ai-menu-page">
    <!-- 回首頁 -->
    <router-link to="/home" class="home-button" @click.native.prevent="playClickSoundAndNavigate">
      <img src="../assets/images/home-avocado.jpg" alt="回首頁" class="home-icon" />
    </router-link>

    <!-- 背景音樂 -->
    <audio ref="bgMusic" :src="bgMusicSrc" autoplay loop preload="auto"></audio>

    <!-- 點擊音效 -->
    <audio ref="clickSound" :src="clickSoundSrc" preload="auto"></audio>

    <!-- 音量控制器 -->
    <div class="volume-control">
      🔊 音量：
      <input type="range" v-model="volume" min="0" max="1" step="0.01" />
      <span>{{ Math.round(volume * 100) }}%</span>
    </div>

    <div class="ai-menu-container">
      <h1 class="main-title">🍴 AI 菜單生成器</h1>
      <p class="subtitle">請選擇一種方式提供您的資料：</p>

      <!-- 方法一：手動填表 -->
      <div class="form-section">
        <h2>🔹 手動填寫資料</h2>
        <form id="manualForm">
          <input type="text" placeholder="身高 (cm)" name="height" required />
          <input type="text" placeholder="體重 (kg)" name="weight" required />
          <input type="text" placeholder="年齡 (歲)" name="age" required />
          <input type="text" placeholder="體脂 (%)" name="bodyfat" required />
          <input type="text" placeholder="過敏食材 / 禁忌食物" name="allergy" />
          <input type="text" placeholder="健康目標 (例：減脂、增肌、維持)" name="goal" required />
          <input type="text" placeholder="飲食習慣 (例：三餐正常、素食)" name="habit" required />
        </form>
      </div>

      <p class="or-separator">或</p>

      <!-- 方法二：上傳檔案 -->
      <div class="upload-section">
        <h2>🔹 上傳健康檔案</h2>
        <input type="file" @change="handleFileChange" />
        <p>{{ fileName || '未選擇檔案' }}</p>
      </div>

      <button @click="submitData" class="submit-button">🚀 提交資料並生成菜單</button>
      <p v-if="isLoading" class="loading-text">🍳 正在生成菜單中，請稍後...</p>
      <div v-html="menuResult" class="menu-result"></div>
      <button v-if="menuResult" @click="regenMenu" class="regen-button">🔄 重新生成</button>
    </div>
  </div>
</template>

<script>
import backgroundMusicFile from '@/assets/audio/background-music.mp3';
import clickSoundFile from '@/assets/audio/click-sound.mp3';

export default {
  data() {
    return {
      fileName: '',
      isLoading: false,
      menuResult: '',
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
        if (bgMusic) {
          bgMusic.play();
        }
        this.$router.push('/home');
      }, 700);
    },

    handleFileChange(event) {
      const file = event.target.files[0];
      this.fileName = file ? `已選擇檔案：${file.name}` : '未選擇檔案';
    },

    async submitData() {
      this.isLoading = true;
      this.menuResult = '';

      const form = document.getElementById('manualForm');
      const formData = new FormData(form);
      const food_allergy = formData.get('allergy');
      const health_goal = formData.get('goal');
      const diet_preference = formData.get('habit');
      const age = parseInt(formData.get('age'));
      const height = parseFloat(formData.get('height'));
      const weight = parseFloat(formData.get('weight'));

      try {
        const response = await fetch('https://backage-2dtn.onrender.com/generate-menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ food_allergy, health_goal, diet_preference, age, height, weight })
        });

        const data = await response.json();
        console.log('後端回傳：', data);

        this.isLoading = false;
        this.menuResult = this.generateMenuHTML(data.result);
      } catch (err) {
        console.error('提交錯誤', err);
        this.isLoading = false;
        this.menuResult = '<p>❌ 無法生成菜單，請稍後再試</p>';
      }
    },

    generateMenuHTML(result) {
      if (!result) return '<p>找不到資料</p>';

      const createSection = (title, items) => `
        <div class="meal-section">
          <h4>${title}</h4>
          <ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
      `;

      return `
        <div class="day-card">
          <h3>第1天</h3>
          ${createSection('早餐 (Breakfast)', result["Day 1"].Breakfast)}
          ${createSection('午餐 (Lunch)', result["Day 1"].Lunch)}
          ${createSection('晚餐 (Dinner)', result["Day 1"].Dinner)}
          ${createSection('飲料點心 (Snack)', result["Day 1"].Snack)}
        </div>
        <div class="day-card">
          <h3>第2天</h3>
          ${createSection('早餐 (Breakfast)', result["Day 2"].Breakfast)}
          ${createSection('午餐 (Lunch)', result["Day 2"].Lunch)}
          ${createSection('晚餐 (Dinner)', result["Day 2"].Dinner)}
          ${createSection('飲料點心 (Snack)', result["Day 2"].Snack)}
        </div>
      `;
    },

    regenMenu() {
      this.submitData();
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
</style>
