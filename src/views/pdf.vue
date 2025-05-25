// PdfMenuGenerator.vue
<template>
  <div class="ai-menu-page">
    <button class="home-button" @click="playClickSoundAndNavigate">
      <img src="../assets/images/home-avocado.jpg" alt="回首頁" class="home-icon" />
    </button>
    <audio ref="bgMusic" :src="bgMusicSrc" autoplay loop preload="auto"></audio>
    <audio ref="clickSound" :src="clickSoundSrc" preload="auto"></audio>
    <div class="volume-control">
      🔊 <input type="range" v-model="volume" min="0" max="1" step="0.01" />
      <span>{{ Math.round(volume * 100) }}%</span>
    </div>

    <div class="ai-menu-container">
      <h1>AI PDF 體脂報告分析</h1>

      <form @submit.prevent="handleUpload" class="user-form">
        <div class="form-row">
          <label class="form-label">上傳 TANITA PDF：</label>
          <input type="file" accept="application/pdf" @change="handleFileChange" required />
        </div>
        <div class="form-row">
          <button type="submit" class="big-submit-btn" :disabled="!pdfFile || isLoading">上傳並分析</button>
        </div>
      </form>

<div class="user-summary-block" v-if="showAdvanced && userInfo">
  <h2 class="section-title">根據您的資料</h2>
  <ul class="user-summary-list">
    <li v-if="userInfo.測量日期">測量日期：{{ userInfo.測量日期 }}</li>
    <li v-if="userInfo.性別">性別：{{ userInfo.性別 }}</li>
    <li v-if="userInfo.年齡">年齡：{{ userInfo.年齡 }}</li>
    <li v-if="userInfo.身高">身高：{{ userInfo.身高 }}</li>
    <li v-if="userInfo.體重">體重：{{ userInfo.體重 }}</li>
    <li v-if="userInfo.體脂肪率">體脂肪率：{{ userInfo.體脂肪率 }}</li>
    <li v-if="userInfo['骨骼肌量（SMM）']">骨骼肌量（SMM）：{{ userInfo['骨骼肌量（SMM）'] }}</li>
    <li v-if="userInfo['身體總水分（TBW）']">身體總水分（TBW）：{{ userInfo['身體總水分（TBW）'] }}</li>
    <li v-if="userInfo.內臟脂肪等級">內臟脂肪等級：{{ userInfo.內臟脂肪等級 }}</li>
    <li v-if="userInfo.BMI">BMI：{{ userInfo.BMI }}</li>
    <li v-if="userInfo['基礎代謝率（BMR）']">BMR：{{ userInfo['基礎代謝率（BMR）'] }}</li>
  </ul>
  <div v-if="Array.isArray(userInfo.綜合評估)">
    <p class="strong-hint">綜合評估：</p>
    <ul class="user-summary-list">
      <li v-for="(item, idx) in userInfo.綜合評估" :key="idx">{{ item }}</li>
    </ul>
  </div>
</div>


      <div v-if="showAdvanced">
        <div class="form-row">
          <label class="form-label">天數：</label>
          <input type="number" v-model.number="days" min="1" max="3" required class="form-input" style="width: 40%;" />
        </div>

        <div class="advanced-menu">
          <h2 class="section-title">進階選項</h2>

          <div>
            <h3 class="sub-title">過敏食材</h3>
           <p class="input-hint strong-hint">請選擇或手動輸入您的過敏食材：</p>
            <div class="tags">
              <span v-for="item in allergensList" :key="item" :class="['tag-item', { selected: selectedAllergens.includes(item) }]" @click="toggleSelection('allergens', item)">{{ item }}</span>
            </div>
            <input type="text" class="extra-input" placeholder="其他過敏食材" v-model="customAllergen" />
          </div>

          <div>
            <h3 class="sub-title">健康目標</h3>
             <p class="input-hint strong-hint">選擇您的健康目標，讓菜單符合您的需求：</p>
            <div class="tags">
              <span v-for="item in healthGoalsList" :key="item" :class="['tag-item', { selected: selectedHealthGoals.includes(item) }]" @click="toggleSelection('healthGoals', item)">{{ item }}</span>
            </div>
            <input type="text" class="extra-input" placeholder="其他健康目標" v-model="customGoal" />
          </div>

          <div>
            <h3 class="sub-title">飲食習慣</h3>
               <p class="input-hint strong-hint">請選擇或填寫您的飲食習慣：</p>
            <div class="tags">
              <span v-for="item in dietPreferencesList" :key="item" :class="['tag-item', { selected: selectedDietPreferences.includes(item) }]" @click="toggleSelection('dietPreferences', item)">{{ item }}</span>
            </div>
            <input type="text" class="extra-input" placeholder="其他飲食習慣" v-model="customDiet" />
          </div>
        </div>

        <button @click="submitAdvancedData" class="submit-button big-submit-btn">🚀 提交進階資料</button>
      </div>

      <div v-if="menuResult">
        <h2>AI 產生的菜單</h2>
        <div v-for="(day, date) in menuResult" :key="date" class="menu-day-block">
          <h3 class="menu-date">{{ date }}</h3>
          <table class="menu-table">
            <thead><tr><th>餐別</th><th>內容</th></tr></thead>
            <tbody>
              <tr v-for="(meal, mealName) in day.meals" :key="mealName">
                <td>{{ mealName }}</td>
                <td>
                  <div v-if="Array.isArray(meal.dishes)">
                    <div v-for="(dish, idx) in meal.dishes" :key="idx">
                      <div><strong>{{ dish.name }}</strong>（{{ dish.calories }}）</div>
                      <div>食材：{{ dish.ingredients.join('、') }}</div>
                      <div>做法：{{ dish.instructions.join('，') }}</div>
                    </div>
                  </div>
                  <div v-else>-</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p v-if="isLoading" class="loading-text">🍳 正在生成菜單中，請稍後...</p>
    </div>
  </div>
</template>

<script>
import backgroundMusicFile from '@/assets/audio/background-music.mp3';
import clickSoundFile from '@/assets/audio/click-sound.mp3';

export default {
  data() {
    return {
      pdfFile: null,
      pdfText: '',
      days: 3,
      isLoading: false,
      showAdvanced: false,
      userInfo: null,
      menuResult: null,
      allergensList: [ "海鮮", "堅果", "乳製品", "蛋類", "麩質",
        "花生", "芝麻", "大豆", "芒果", "奇異果",
        "蜂蜜", "蕎麥", "蘑菇", "芹菜", "魚類"],
      healthGoalsList: ["減脂", "增肌", "維持健康", "提升耐力",
        "控制血糖", "降膽固醇", "增強免疫力", "改善腸胃", "提升專注力",
        "改善睡眠", "減壓", "增強骨骼", "促進代謝", "提升心肺功能"],
      dietPreferencesList: ["全素", "蛋奶素", "五辛素", "普通飲食",
        "低碳飲食", "高蛋白飲食", "地中海飲食", "生酮飲食", "間歇性斷食",
        "高纖飲食", "低脂飲食", "原型食物", "無麩質飲食", "高鈣飲食"],
      selectedAllergens: [],
      selectedHealthGoals: [],
      selectedDietPreferences: [],
      customAllergen: '',
      customGoal: '',
      customDiet: '',
      volume: 0.5,
      bgMusicSrc: backgroundMusicFile,
      clickSoundSrc: clickSoundFile,
    };
  },
  methods: {
    handleFileChange(event) {
      this.pdfFile = event.target.files[0];
    },
async handleUpload() {
  if (!this.pdfFile) return;
  this.isLoading = true;
  const formData = new FormData();
  formData.append('pdf', this.pdfFile);
  try {
    const res = await fetch('https://backage-2dtn.onrender.com/extract-pdf-text', {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    
    // ✨ PDF原文 & userInfo 一定要設
    this.pdfText = result.text || '';
    this.userInfo = result.user_info || {};

    this.showAdvanced = true; // 無論成功與否都顯示進階選項
  } catch (err) {
    alert('PDF 分析失敗');
    this.userInfo = {};       // ✨ 即使錯誤也要初始化
    this.showAdvanced = true;
  }
  this.isLoading = false;
},
    async submitAdvancedData() {
      this.isLoading = true;
      try {
        const payload = {
          pdfText: this.pdfText,
          days: this.days,
          allergens: [...this.selectedAllergens, this.customAllergen].filter(Boolean),
          healthGoals: [...this.selectedHealthGoals, this.customGoal].filter(Boolean),
          dietPreferences: [...this.selectedDietPreferences, this.customDiet].filter(Boolean),
        };
        const res = await fetch('https://backage-2dtn.onrender.com/generate-menu-from-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        this.menuResult = data.result;
        this.userInfo = data.user_info;
      } catch (err) {
        alert('進階菜單產生失敗');
      }
      this.isLoading = false;
    },
    toggleSelection(type, item) {
      const list = this[`selected${type.charAt(0).toUpperCase() + type.slice(1)}`];
      const index = list.indexOf(item);
      if (index >= 0) list.splice(index, 1);
      else list.push(item);
    },
    playClickSoundAndNavigate(event) {
      event?.preventDefault();
      this.$refs.bgMusic?.pause();
      this.$refs.clickSound?.play();
      setTimeout(() => this.$router.push('/home'), 300);
    },
    setupVolume() {
      const saved = localStorage.getItem('backgroundMusicVolume');
      this.volume = saved ? parseFloat(saved) : 0.5;
      if (this.$refs.bgMusic) this.$refs.bgMusic.volume = this.volume;
    },
  },
  watch: {
    volume(val) {
      if (this.$refs.bgMusic) {
        this.$refs.bgMusic.volume = val;
        localStorage.setItem('backgroundMusicVolume', val);
      }
    },
  },
  mounted() {
    this.setupVolume();
    const homeBg = document.querySelector('.home-page audio');
    if (homeBg && !homeBg.paused) {
      homeBg.pause();
      homeBg.currentTime = 0;
    }
  },
  beforeRouteLeave(to, from, next) {
    this.$refs.bgMusic?.pause();
    this.$refs.bgMusic.currentTime = 0;
    next();
  },
};
</script>

<style scoped>
@import '../assets/css/styles.css';
@import '../assets/css/ai-menu.css';
.user-summary-block {
  background: #f5f9ff;
  border: 2px solid #aee571;
  border-radius: 10px;
  padding: 18px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px #e2f5d6;
}
.user-summary-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.user-summary-list li {
  font-size: 1.15rem;
  color: #2d3a4b;
  margin-bottom: 6px;
  font-weight: 500;
}

.user-form .form-row {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  justify-content: flex-start;
}
.user-form .form-label {
  width: 110px;
  text-align: left;
  font-size: 1.25rem;
  color: #2d3a4b;
  font-weight: 600;
  letter-spacing: 1px;
}
.form-input {
  font-size: 1.25rem;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #b0b0b0;
  background: #f9f9f9;
  color: #2d3a4b;
}
.big-submit-btn {
  font-size: 1.3rem;
  padding: 12px 36px;
  border-radius: 8px;
  background: linear-gradient(90deg, #ff662e 60%, #ff762d 100%);
  color: #000000;
  border: none;
  font-weight: bold;
  margin-top: 10px;
  box-shadow: 0 2px 8px #e2f5d6;
  transition: background 0.2s, color 0.2s;
}
.big-submit-btn:active {
  background: #7bc043;
  color: #fff;
}

.section-title {
  color: #4e7c2f;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 12px;
  letter-spacing: 2px;
}
.sub-title {
  color: #ff00d0;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 4px;
}
.input-hint {
  color: #5a5a5a00;
  font-size: 1.05rem;
  margin-bottom: 6px;
}
.strong-hint {
  color: #7c2d63;
  font-weight: bold;
  background: #e6ebf9;
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
}

.tags .tag-item {
  font-size: 1.1rem;
  padding: 8px 18px;
  margin: 6px 10px 6px 0;
  border-radius: 18px;
  border: 2px solid #71d7e5;
  cursor: pointer;
  display: inline-block;
  transition: background 0.2s, color 0.2s, border 0.2s;
  background: #f6fff2;
  color: #3a5d1d;
  font-weight: 500;
}
.tags .tag-item.selected {
  background: linear-gradient(90deg, #aee571 60%, #7bc043 100%);
  color: #222;
  border-color: #000000;
  font-weight: bold;
  box-shadow: 0 2px 8px #e2f5d6;
}
.extra-input {
  margin-top: 8px;
  font-size: 1.1rem;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #b0b0b0;
  background: #f9f9f9;
  color: #2d3a4b;
  width: 60%;
  display: block;
}




.menu-day-block {
  margin-bottom: 32px;
  text-align: left;
}
.menu-date {
  font-size: 1.3rem;
  color: #4e7c2f;
  margin: 12px 0 8px 0;
  font-weight: bold;
}
.menu-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 12px;
  background: #fff;
}
.menu-table th, .menu-table td {
  border: 1px solid #b0d8a4;
  padding: 8px 12px;
  text-align: left;
  font-size: 1.05rem;
}
.menu-table th {
  background: #e6f9e6;
  color: #2d7c4b;
  font-weight: bold;
}
.menu-table tr:nth-child(even) td {
  background: #f7fbf7;
}
.ai-menu-page {
  min-height: 100vh;
  background: url('/src/assets/images/ai-menu-background.avif') no-repeat center center fixed;
  background-size: cover;
}

.input-hint {
  color: #5a5a5a00;
  font-size: 1.05rem;
  margin-bottom: 6px;
}
.strong-hint {
  color: #7c2d63;
  font-weight: bold;
  background: #e6ebf9;
  padding: 4px 10px;
  border-radius: 6px;
  display: inline-block;
}
</style>