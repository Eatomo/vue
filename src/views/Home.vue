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
          <router-link v-for="category in categories" :key="category.name" :to="category.path" class="category-button">
            {{ category.name }}
          </router-link>
        </div>
      </div>

      <!-- 熱門推薦 -->
      <div class="hot-topics-card">
        <h2 class="hot-topics-title">🔥 今日熱門菜單 / 食譜推薦</h2>
        <div class="hot-topic-item" @click="openLink('https://icook.tw/recipes/474701')">
          <img src="https://imageproxy.icook.network/resize?type=auto&url=http://tokyo-kitchen.icook.tw.s3.amazonaws.com/uploads/recipe/cover/474701/38bf975dd10047d8.jpg&stripmeta=true&background=255,255,255&width=600&nocrop=true" alt="無生蛋提拉米蘇食譜">
          <div class="hot-topic-text">
            <h3>超夯無生蛋提拉米蘇自製食譜</h3>
            <p>3分鐘快速學無生蛋提拉米蘇，春季必吃！</p>
          </div>
        </div>
        <div class="hot-topic-item" @click="openLink('https://icook.tw/recipes/245864')">
          <img src="https://imageproxy.icook.network/resize?background=255%2C255%2C255&height=150&nocrop=false&stripmeta=true&type=auto&url=http%3A%2F%2Ftokyo-kitchen.icook.tw.s3.amazonaws.com%2Fuploads%2Frecipe%2Fcover%2F245864%2F0528273464edef2c.jpg&width=200" alt="蘋果塔">
          <div class="hot-topic-text">
            <h3>影片手把手教你做蘋果塔</h3>
            <p>簡單5分鐘上桌，清爽又低負擔！</p>
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
        { name: 'AI菜單生成', path: '/Ai-menu' },
        { name: '3高', path: '/ThreeHigh' },
        { name: '健身', path: '/Fitness' },
        { name: '素食', path: '/Vegetarian' },
        { name: '兒童', path: '/Children' },
        { name: '上班族', path: '/Office' },
        { name: '銀髮族', path: '/Elderly' },
        { name: '歷史菜單', path: '/History' },
        { name: '執行度&滿意度', path: '/Feedback' }
      ]
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
    // 先暫停所有首頁的背景音樂（避免重複播放）
    const allHomeBgMusics = document.querySelectorAll('.home-page audio');
    allHomeBgMusics.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });

    // 下面是你原本的內容
    const savedVolume = localStorage.getItem('backgroundMusicVolume');
    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume);
    }
    if (this.$refs.bgMusic) {
      this.$refs.bgMusic.volume = this.volume;
      // 確保只播放一次
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
  font-size: 1.5em; /* 字體大兩倍 */
  width: 100%;    /* 填滿父容器 */
  box-sizing: border-box;
}


.icook-search-btn {
  margin-left: 8px;
  padding: 7px 20px;      /* 原本 6px 16px，放大兩倍 */
  font-size: 2em;          /* 新增，字體放大兩倍 */
  background: #0066ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.icook-search-btn:hover {
  background: #b800e6;
}
</style>