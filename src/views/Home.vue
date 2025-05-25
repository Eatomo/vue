<template>
  <div class="home-page">
    <!-- 酪梨回首頁按鈕 -->
    <router-link to="/home" class="home-button" @click.native="playClickSound">
      <img src="../assets/images/home-avocado.jpg" alt="回首頁" class="home-icon">
    </router-link>

    <!-- 登出按鈕 -->
    <button class="logout-button" @click="logout">帳號登出</button>

    <!-- 音量控制器 -->
    <div class="volume-control">
      🔊 
      <input type="range" v-model="volume" min="0" max="1" step="0.01">
      <span>{{ Math.round(volume * 100) }}%</span>
    </div>

    <!-- 背景音樂 -->
    <audio
      v-if="$route.path === '/home'"
      ref="bgMusic"
      :src="bgMusicSrc"
      autoplay
      loop
      preload="auto"
    ></audio>
    <!-- 點擊音效 -->
    <audio ref="clickSound" :src="clickSoundSrc" preload="auto"></audio>

    <div class="page-container">
      <!-- 今日資訊 -->
      <div class="today-info-card">
        <div>{{ todayDate }}</div>
        <div>{{ todayWeather }}</div>
      </div>

      <!-- 愛料理搜尋 -->
      <div class="icook-search-bar">
        <input
          v-model="icookKeyword"
          @keyup.enter="searchIcook"
          type="text"
          placeholder="請輸入菜名或食材再點搜尋"
          class="icook-input"
        />
        <button @click="searchIcook" class="icook-search-btn">搜尋</button>
      </div>

      <!-- 分類按鈕 -->
      <div class="category-card">
        <h1 class="main-title">🍽️ 我的食譜菜單APP</h1>
        <p class="subtitle">選擇一個分類，開始探索美味生活！</p>
        <div class="category-bar">
          <router-link
            v-for="category in categories"
            :key="category.name"
            :to="category.path"
            :class="['category-button', getCategoryClass(category.name)]"
          >
            {{ category.name }}
          </router-link>
        </div>
      </div>

<!-- 熱門推薦（加上重新生成按鈕） -->
<div class="hot-topics-card">
  <div style="display: flex; align-items: center; justify-content: center; gap: 16px;">
    <h2 class="hot-topics-title" style="margin: 0;">🔥 今日熱門菜單 / 食譜推薦</h2>
    <button
      class="refresh-btn"
      @click="fetchPopularRecipes"
      :disabled="loadingPopular"
      title="重新生成推薦"
    >🔄 重新生成</button>
  </div>
  <div v-if="loadingPopular" class="loading">載入中...</div>
  <div v-else-if="popularError" class="error">{{ popularError }}</div>
  <div v-else class="hot-topics-list">
    <div
      v-for="item in popularRecipes"
      :key="item.link"
      class="hot-topic-item"
      @click="openLink(item.link)"
    >
      <img :src="item.image" :alt="item.title" />
      <div class="hot-topic-text">
        <h3>{{ item.title }}</h3>
        <p>{{ item.description || '（無描述）' }}</p>
      </div>
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
  data() {
    return {
      bgMusicSrc: backgroundMusicFile,
      clickSoundSrc: clickSoundFile,
      volume: 0.5,
      todayDate: '',
      todayWeather: '',
      icookKeyword: '',
      categories: [
        { name: '手動輸入數據-AI菜單生成', path: '/Ai-menu' },
        { name: '上傳PDF--菜單生成', path: '/pdf-menu' },
        { name: '3高', path: '/ThreeHigh' },
        { name: '健身', path: '/Fitness' },
        { name: '素食', path: '/Vegetarian' },
        { name: '兒童', path: '/Children' },
        { name: '上班族', path: '/Office' },
        { name: '銀髮族', path: '/Elderly' },
        { name: '歷史菜單', path: '/History' },
        { name: '執行度&滿意度', path: '/Feedback' }
      ],
      popularRecipes: [],
      loadingPopular: false,
      popularError: ''
    };
  },
  watch: {
    volume(newVolume) {
      if (this.$refs.bgMusic) {
        this.$refs.bgMusic.volume = newVolume;
        localStorage.setItem('backgroundMusicVolume', newVolume);
      }
    }
  },
  methods: {
    getCategoryClass(name) {
     return ['手動輸入數據-AI菜單生成', '上傳PDF--菜單生成'].includes(name)
       ? 'category-ai'
       : 'category-other';
    },
    async fetchPopularRecipes() {
      this.loadingPopular = true;
      this.popularError = '';
      try {
        const res = await fetch('https://backage-2dtn.onrender.com/popular-recipes');
        const data = await res.json();
        if (data.success) {
          this.popularRecipes = data.recipes;
        } else {
          this.popularError = '熱門食譜取得失敗';
        }
      } catch (err) {
        this.popularError = '無法連線到熱門食譜伺服器';
      } finally {
        this.loadingPopular = false;
      }
    },
    logout() {
      localStorage.removeItem('loggedInUser');
      this.$router.push('/login');
    },
    playClickSound() {
      const sound = this.$refs.clickSound;
      if (sound) {
        sound.currentTime = 0;
        sound.volume = 0.5;
        sound.play();
      }
    },
    openLink(url) {
      window.open(url, '_blank');
    },
    searchIcook() {
      if (this.icookKeyword.trim()) {
        const keyword = encodeURIComponent(this.icookKeyword.trim());
        window.open(`https://icook.tw/search/${keyword}`, '_blank');
      }
    },
    fetchWeather() {
      const apiKey = 'd1c8fa0e63745ae8af24bf7c8ebe5dcf';
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&lang=zh_tw`)
            .then(res => res.json())
            .then(data => {
              const temp = Math.round(data.main.temp);
              const description = data.weather[0].description;
              const city = data.name;
              this.todayWeather = `🌦️ ${city}：${description}，${temp}°C`;
            })
            .catch(() => {
              this.todayWeather = '🌦️ 天氣讀取失敗';
            });
        },
        () => {
          this.todayWeather = '🌦️ 無法取得天氣資訊';
        }
      );
    }
  },
  mounted() {
    const allHomeBgMusics = document.querySelectorAll('.home-page audio');
    allHomeBgMusics.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    const savedVolume = localStorage.getItem('backgroundMusicVolume');
    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume);
    }
    if (this.$refs.bgMusic) {
      this.$refs.bgMusic.volume = this.volume;
      this.$refs.bgMusic.currentTime = 0;
      this.$refs.bgMusic.play();
    }
    if (!localStorage.getItem('loggedInUser')) {
      alert('請先登入');
      this.$router.push('/login');
    }
    const today = new Date();
    this.todayDate = `📅 今日日期：${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;
    this.fetchWeather();
    this.fetchPopularRecipes();
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

.icook-search-bar {
  display: flex;
  align-items: center;
  margin: 20px 0;
}
.icook-input {
  flex: 2;
  padding: 20px 300px;
  border: 1px solid #f0ff6c;
  border-radius: 4px;
  font-size: 1.5em;
  width: 100%;
  box-sizing: border-box;
}
.icook-search-btn {
  margin-left: 8px;
  padding: 7px 20px;
  font-size: 2em;
  background: #0066ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.icook-search-btn:hover {
  background: #b800e6;
}

/* 熱門推薦區塊樣式 */
.hot-topics-card {
  margin: 32px auto 0;
  max-width: 900px;
  background: #fff8;
  border-radius: 18px;
  box-shadow: 0 4px 16px #0001;
  padding: 32px 24px;
}
.hot-topics-title {
  text-align: center;
  margin-bottom: 24px;
  color: #e65c00;
  letter-spacing: 2px;
}
.hot-topics-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
}
.hot-topic-item {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 2px 8px #0002;
  width: 260px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.hot-topic-item:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 6px 20px #0003;
}
.hot-topic-item img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  background: #eee;
}
.hot-topic-text {
  padding: 14px 12px 10px 12px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hot-topic-text h3 {
  font-size: 1.1em;
  margin: 0 0 4px 0;
  color: #e65c00;
  font-weight: bold;
}
.hot-topic-text p {
  font-size: 0.98em;
  color: #444;
  margin-bottom: 0;
  white-space: pre-line;
}
.loading, .error {
  text-align: center;
  font-size: 1.2em;
  color: #b94a48;
  margin: 20px 0;
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
.category-button {
  border-radius: 20px;
  padding: 12px 20px;
  margin: 8px;
  display: inline-block;
  font-size: 1.2rem;
  font-weight: bold;
  box-shadow: 0 2px 8px #0001;
  text-align: center;
  color: white;
  cursor: pointer;
  transition: transform 0.2s;
}
.category-ai:hover {
  background: linear-gradient(90deg, #00bcd4, #009688); /* 固定藍綠背景 */
  filter: brightness(1.1);
  transform: scale(1.05);
}

.category-other:hover {
  background: linear-gradient(90deg, #fe6944, #fb852b); /* 固定橘紅背景 */
  filter: brightness(1.1);
  transform: scale(1.05);
}



.category-ai {
  background: linear-gradient(90deg, #00bcd4, #009688); /* 藍綠 */
}

.category-other {
  background: linear-gradient(90deg, #fe6944, #fb852b); /* 原橘紅 */
}


</style>
