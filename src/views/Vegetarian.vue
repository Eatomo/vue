<template>
  <div class="vegetarian-page">
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
      🔊 音量：
      <input type="range" v-model="volume" min="0" max="1" step="0.01" />
      <span>{{ Math.round(volume * 100) }}%</span>
    </div>

    <!-- 顯眼提示 -->
    <div class="recipe-type-tip">
      請選擇您想查詢的素食類型👇
    </div>
    <!-- 三個素食類型按鈕 -->
    <div class="recipe-type-selector">
      <button @click="fetchRecipes('five-pungent')">五辛素</button>
      <button @click="fetchRecipes('ovo-lacto')">蛋奶素</button>
      <button @click="fetchRecipes('vegan')">全素</button>
    </div>

    <!-- 頁面內容 -->
    <div class="vegetarian-container">
      <h1>素食專區</h1>
      <p>這是素食飲食建議頁面。</p>
    </div>

    <!-- 素食食譜推薦區塊 -->
    <div class="vegetarian-recipes-section">
      <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
        <h2 style="margin: 0;">素食飲食推薦食譜</h2>
        <button
          class="refresh-btn"
          @click="refreshRecipes"
          :disabled="!currentType || loadingRecipes"
          title="重新生成推薦"
        >🔄 重新生成</button>
      </div>
      <div v-if="loadingRecipes" class="loading">載入中...</div>
      <div v-else-if="recipesError" class="error">{{ recipesError }}</div>
      <div v-else class="recipes-list">
        <div v-for="recipe in recipes" :key="recipe.link" class="recipe-card">
          <a :href="recipe.link" target="_blank" rel="noopener">
            <img :src="recipe.image" :alt="recipe.title" class="recipe-img" />
          </a>
          <div class="recipe-info">
            <h3 class="recipe-title">
              <a :href="recipe.link" target="_blank" rel="noopener">{{ recipe.title }}</a>
            </h3>
            <div class="cook-time">⏱️ 時間：{{ recipe.cookTime }}</div>
            <div class="recipe-desc">{{ recipe.description }}</div>
            <details>
              <summary>食材明細</summary>
              <pre class="ingredients">{{ recipe.ingredients }}</pre>
            </details>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import backgroundMusicFile from '@/assets/audio/background-music.mp3';
import clickSoundFile from '@/assets/audio/click-sound.mp3';

export default {
  name: 'Vegetarian',
  data() {
    return {
      volume: 0.5,
      bgMusicSrc: backgroundMusicFile,
      clickSoundSrc: clickSoundFile,
      recipes: [],
      loadingRecipes: false,
      recipesError: '',
      currentType: '', // 新增：記錄目前選擇的類型
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
      }, 300);
    },
    setupVolume() {
      const savedVolume = localStorage.getItem('backgroundMusicVolume');
      this.volume = savedVolume !== null ? parseFloat(savedVolume) : 0.5;
      if (this.$refs.bgMusic) {
        this.$refs.bgMusic.volume = this.volume;
      }
    },
    async fetchRecipes(recipeType) {
      this.currentType = recipeType; // 新增：記錄目前選擇
      this.loadingRecipes = true;
      this.recipesError = '';
      let url = '';
      if (recipeType === 'five-pungent') {
        url = 'https://backage-2dtn.onrender.com/five-spice-recipes';
      } else if (recipeType === 'ovo-lacto') {
        url = 'https://backage-2dtn.onrender.com/ovo-lacto-recipes';
      } else if (recipeType === 'vegan') {
        url = 'https://backage-2dtn.onrender.com/vegan-recipes';
      }
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          this.recipes = data.recipes;
        } else {
          this.recipesError = '取得食譜失敗';
        }
      } catch (err) {
        this.recipesError = '無法連線到食譜伺服器';
      } finally {
        this.loadingRecipes = false;
      }
    },
    refreshRecipes() {
      if (this.currentType) {
        this.fetchRecipes(this.currentType);
      }
    }
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
.vegetarian-page {
  min-height: 100vh;
  background: url('/src/assets/images/pexels-veganliftz-2383060.jpg') no-repeat center center fixed;
  background-size: cover;
}
.vegetarian-container {
  max-width: 800px;
  margin: 50px auto;
  padding: 30px;
  background: #ffffffcc;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}
.recipe-type-tip {
  text-align: center;
  font-size: 2em;
  color: #2d7a5f;
  font-weight: bold;
  margin: 32px 0 10px 0;
  letter-spacing: 1px;
  text-shadow: 0 2px 8px #fff8;
}
.recipe-type-selector {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin: 18px 0 24px 0;
}
.recipe-type-selector button {
  background: linear-gradient(90deg, #43e97b 0%, #38f9d7 100%);
  color: #2d7a5f;
  border: none;
  border-radius: 16px;
  padding: 20px 38px;
  font-size: 1.35em;
  font-weight: bold;
  box-shadow: 0 4px 16px #0002;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  outline: none;
  letter-spacing: 2px;
}
.recipe-type-selector button:hover {
  background: linear-gradient(90deg, #38f9d7 0%, #43e97b 100%);
  color: #fff;
  transform: scale(1.08);
}
.vegetarian-recipes-section {
  margin: 40px auto 0;
  max-width: 1100px;
  background: #fff8;
  border-radius: 18px;
  box-shadow: 0 4px 16px #0001;
  padding: 32px 24px;
}
.vegetarian-recipes-section h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #2d7a5f;
  letter-spacing: 2px;
}
.refresh-btn {
  background: #ffb300;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 1em;
  font-weight: bold;
  cursor: pointer;
  margin-left: 8px;
  transition: background 0.2s, transform 0.1s;
}
.refresh-btn:disabled {
  background: #ccc;
  color: #888;
  cursor: not-allowed;
}
.refresh-btn:hover:enabled {
  background: #ff9800;
  transform: scale(1.08);
}
.loading, .error {
  text-align: center;
  font-size: 1.2em;
  color: #b94a48;
  margin: 20px 0;
}
.recipes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
}
.recipe-card {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px #0002;
  width: 300px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: transform 0.15s;
}
.recipe-card:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 6px 20px #0003;
}
.recipe-img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  background: #eee;
}
.recipe-info {
  padding: 16px 14px 12px 14px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.recipe-title {
  font-size: 1.1em;
  margin: 0 0 4px 0;
  color: #2d7a5f;
  font-weight: bold;
}
.cook-time {
  font-size: 0.95em;
  color: #888;
}
.recipe-desc {
  font-size: 0.98em;
  color: #444;
  margin-bottom: 6px;
  white-space: pre-line;
}
.ingredients {
  font-size: 0.95em;
  color: #333;
  background: #f7f7f7;
  border-radius: 6px;
  padding: 8px;
  margin: 6px 0 0 0;
  white-space: pre-wrap;
}
details summary {
  cursor: pointer;
  color: #2d7a5f;
  font-weight: 500;
  margin-top: 6px;
  outline: none;
}
@media (max-width: 900px) {
  .recipes-list {
    flex-direction: column;
    align-items: center;
  }
  .recipe-card {
    width: 95%;
    max-width: 400px;
  }
}
</style>