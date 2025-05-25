<template>
  <div class="ai-menu-page">
    <!-- 回首頁按鈕 -->
    <button class="home-button" @click="playClickSoundAndNavigate">
      <img src="../assets/images/home-avocado.jpg" alt="回首頁" class="home-icon" />
    </button>

    <!-- 背景音樂 -->
    <audio ref="bgMusic" :src="bgMusicSrc" autoplay loop preload="auto"></audio>
    <audio ref="clickSound" :src="clickSoundSrc" preload="auto"></audio>

    <!-- 音量控制 -->
    <div class="volume-control">
      🔊 
      <input type="range" v-model="volume" min="0" max="1" step="0.01" />
      <span>{{ Math.round(volume * 100) }}%</span>
    </div>

    <div class="ai-menu-container">
      <h1>AI 個人化菜單產生器</h1>

      <!-- 使用者基本資料 -->
      <form @submit.prevent="submitForm" class="user-form">
        <div class="form-row">
          <label class="form-label">性別：</label>
          <select v-model="form.gender" required class="form-input" style="width: 40%;">
            <option value="male">男性</option>
            <option value="female">女性</option>
          </select>
        </div>
        <div class="form-row">
          <label class="form-label">年齡：</label>
          <input type="number" v-model.number="form.age" required class="form-input" style="width: 40%;" />
        </div>
        <div class="form-row">
          <label class="form-label">身高(cm)：</label>
          <input type="number" v-model.number="form.height" required class="form-input" style="width: 40%;" />
        </div>
        <div class="form-row">
          <label class="form-label">體重(kg)：</label>
          <input type="number" v-model.number="form.weight" required class="form-input" style="width: 40%;" />
        </div>
        <div class="form-row">
          <label class="form-label">天數：</label>
          <input type="number" v-model.number="form.days" min="1" max="3" required class="form-input" style="width: 40%;" />
        </div>
        <div class="form-row">
          <button type="submit" :disabled="isLoading" class="big-submit-btn">產生菜單</button>
        </div>
      </form>

      <hr />

<!-- ...前略... -->
<div v-if="showAdvanced">
  <div class="user-summary-block">
    <h2 class="section-title">根據您的資料</h2>
    <ul class="user-summary-list">
      <li v-if="menu.user_summary && menu.user_summary.性別">性別：{{ menu.user_summary.性別 }}</li>
      <li v-if="menu.user_summary && menu.user_summary.年齡">年齡：{{ menu.user_summary.年齡 }}</li>
      <li v-if="menu.user_summary && menu.user_summary.身高">身高：{{ menu.user_summary.身高 }}</li>
      <li v-if="menu.user_summary && menu.user_summary.體重">體重：{{ menu.user_summary.體重 }}</li>
      <li v-if="menu.user_summary && menu.user_summary.天數">天數：{{ menu.user_summary.天數 }}</li>
    </ul>
  </div>
  <div v-if="menu.result">
    <h2>AI 產生的菜單</h2>
    <div v-for="(day, date) in menu.result" :key="date" class="menu-day-block">
      <h3 class="menu-date">{{ date }}</h3>
      <table class="menu-table">
        <thead>
          <tr>
            <th colspan="2">每日摘要</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, key) in day.摘要" :key="key">
            <td>{{ key }}</td>
            <td>{{ value }}</td>
          </tr>
        </tbody>
      </table>
      <table class="menu-table">
        <thead>
          <tr>
            <th colspan="2">食物代換份數</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(value, key) in day.exchange_summary" :key="key">
            <td>{{ key }}</td>
            <td>{{ value }}</td>
          </tr>
        </tbody>
      </table>
      <table class="menu-table">
        <thead>
          <tr>
            <th>餐別</th>
            <th>內容</th>
          </tr>
        </thead>
<tbody>
  <tr v-for="(meal, mealName) in day.meals" :key="mealName">
    <td>{{ mealName }}</td>
    <td>
      <div v-if="Object.keys(meal).length === 0">-</div>
      <div v-else>
        <div v-if="meal.total_calories !== undefined">
          <div>總卡路里：{{ meal.total_calories }}</div>
          <div v-if="Array.isArray(meal.dishes)">
    <div v-for="(dish, idx) in meal.dishes" :key="idx" style="margin-bottom: 8px; border-bottom: 1px dashed #eee;">
     <div>{{ ['第一','第二','第三','第四','第五'][idx] || `第${idx+1}` }}道菜：{{ dish.name }}</div>
      <div>食材：{{ Array.isArray(dish.ingredients) ? dish.ingredients.join('、') : dish.ingredients }}</div>
      <div>熱量：{{ dish.calories }}</div>
     <div>
        做法：
        <span v-if="Array.isArray(dish.instructions)">
          {{ dish.instructions.join('，') }}
       </span>
        <span v-else>
         {{ dish.instructions }}
    </span>
  </div>
</div>
          </div>
        </div>
        <div v-else>
          <div
            v-for="(mealValue, mealKey) in meal"
            :key="mealKey"
            style="margin-bottom: 4px;"
          >
            <span v-if="mealKey === 'name'">第二道菜：{{ mealValue }}</span>
            <span v-else-if="mealKey === 'ingredients'">食材：{{ Array.isArray(mealValue) ? mealValue.join('、') : mealValue }}</span>
            <span v-else-if="mealKey === 'calories'">熱量：{{ mealValue }}</span>
            <span v-else-if="mealKey === 'instructions'">做法：{{ mealValue }}</span>
            <span v-else>{{ mealKey }}：{{ mealValue }}</span>
          </div>
        </div>
      </div>
    </td>
  </tr>
</tbody>
      </table>
    </div>
  </div>
</div>

      <!-- 進階選項 -->
      <div class="advanced-menu" v-if="showAdvanced">
        <h2 class="section-title">進階選項</h2>

        <!-- 過敏食材 -->
        <div>
          <h3 class="sub-title">過敏食材</h3>
          <p class="input-hint strong-hint">請選擇或手動輸入您的過敏食材：</p>
          <div class="tags">
            <span
              v-for="item in allergensList"
              :key="item"
              :class="['tag-item', { selected: selectedAllergens.includes(item) }]"
              @click="toggleSelection('allergens', item)"
            >
              {{ item }}
            </span>
          </div>
          <input type="text" class="extra-input" placeholder="其他過敏食材 (例：蘑菇)" v-model="customAllergen" />
        </div>

        <!-- 健康目標 -->
        <div>
          <h3 class="sub-title">健康目標</h3>
          <p class="input-hint strong-hint">選擇您的健康目標，讓菜單符合您的需求：</p>
          <div class="tags">
            <span
              v-for="item in healthGoalsList"
              :key="item"
              :class="['tag-item', { selected: selectedHealthGoals.includes(item) }]"
              @click="toggleSelection('healthGoals', item)"
            >
              {{ item }}
            </span>
          </div>
          <input type="text" class="extra-input" placeholder="其他健康目標 (例：控制血糖)" v-model="customGoal" />
        </div>

        <!-- 飲食習慣 -->
        <div>
          <h3 class="sub-title">飲食習慣</h3>
          <p class="input-hint strong-hint">請選擇或填寫您的飲食習慣：</p>
          <div class="tags">
            <span
              v-for="item in dietPreferencesList"
              :key="item"
              :class="['tag-item', { selected: selectedDietPreferences.includes(item) }]"
              @click="toggleSelection('dietPreferences', item)"
            >
              {{ item }}
            </span>
          </div>
          <input type="text" class="extra-input" placeholder="其他飲食習慣 (例：低碳飲食)" v-model="customDiet" />
        </div>
      </div>

      <button
        v-if="showAdvanced"
        @click="submitAdvancedData"
        class="submit-button big-submit-btn"
      >🚀 提交進階資料</button>
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
      form: {
        gender: '',
        age: null,
        height: null,
        weight: null,
        days: 3,
        checkedMeals: {}, // { '2024-05-23_Breakfast': true, ... }
      },
      allergensList: [
        "海鮮", "堅果", "乳製品", "蛋類", "麩質",
        "花生", "芝麻", "大豆", "芒果", "奇異果",
        "蜂蜜", "蕎麥", "蘑菇", "芹菜", "魚類"
      ],
      healthGoalsList: [
        "減脂", "增肌", "維持健康", "提升耐力",
        "控制血糖", "降膽固醇", "增強免疫力", "改善腸胃", "提升專注力",
        "改善睡眠", "減壓", "增強骨骼", "促進代謝", "提升心肺功能"
      ],
      dietPreferencesList: [
        "全素", "蛋奶素", "五辛素", "普通飲食",
        "低碳飲食", "高蛋白飲食", "地中海飲食", "生酮飲食", "間歇性斷食",
        "高纖飲食", "低脂飲食", "原型食物", "無麩質飲食", "高鈣飲食"
      ],
      selectedAllergens: [],
      selectedHealthGoals: [],
      selectedDietPreferences: [],
      customAllergen: '',
      customGoal: '',
      customDiet: '',
      isLoading: false,
      menu: {},
      showAdvanced: false,
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
    playClickSoundAndNavigate(event) {
      event && event.preventDefault();
      const clickSound = this.$refs.clickSound;
      const bgMusic = this.$refs.bgMusic;

      if (bgMusic) bgMusic.pause();

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
    toggleSelection(type, item) {
      const selectedList = this[`selected${type.charAt(0).toUpperCase() + type.slice(1)}`];
      const index = selectedList.indexOf(item);
      if (index >= 0) {
        selectedList.splice(index, 1);
      } else {
        selectedList.push(item);
      }
    },
  // 產生預設空菜單，並帶入 user_summary
  generateEmptyMenu(days, form) {
    const today = new Date();
    const result = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const key = d.toISOString().slice(5, 10);
      result[key] = {
        "摘要": {
          "總熱量": 0,
          "蛋白質_克": 0,
          "醣類_克": 0,
          "脂肪_克": 0,
          "膳食纖維_克": 0
        },
        "exchange_summary": {
          "grain": 0,
          "protein": 0,
          "vegetable": 0,
          "fat": 0,
          "fruit": 0,
          "dairy": 0
        },
        "meals": {
          "Breakfast": {},
          "Lunch": {},
          "Dinner": {},
          "Snack": {}
        }
      };
    }
    // 新增 user_summary
    const user_summary = {
      性別: form.gender === 'male' ? '男性' : form.gender === 'female' ? '女性' : form.gender,
      年齡: form.age,
      身高: form.height ? `${form.height} cm` : '',
      體重: form.weight ? `${form.weight} kg` : '',
      天數: form.days
    };
    return { user_summary, result };
  },

  async submitForm() {
    this.isLoading = true;
    try {
      const response = await fetch('https://backage-2dtn.onrender.com/generate-menu/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.form),
      });
      const data = await response.json();
      // 若沒有 result，則產生預設空菜單，並帶入 user_summary
      if (!data.result || Object.keys(data.result).length === 0) {
        this.menu = this.generateEmptyMenu(this.form.days, this.form);
      } else {
        this.menu = data;
      }
      this.showAdvanced = true; // 顯示進階選單
    } catch (err) {
      // 若後端失敗也產生預設空菜單
      this.menu = this.generateEmptyMenu(this.form.days, this.form);
      this.showAdvanced = true;
      alert('產生菜單失敗，已顯示預設空菜單');
    }
    this.isLoading = false;
  },
    async submitAdvancedData() {
      const formattedData = {
        allergens: [...this.selectedAllergens, this.customAllergen].filter(Boolean),
        healthGoals: [...this.selectedHealthGoals, this.customGoal].filter(Boolean),
        dietPreferences: [...this.selectedDietPreferences, this.customDiet].filter(Boolean),
      };

      this.isLoading = true;
      try {
        const response = await fetch('https://backage-2dtn.onrender.com/generate-menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData),
        });
        const data = await response.json();
        this.menu = data;
      } catch (err) {
        alert('提交進階資料失敗');
      }
      this.isLoading = false;
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
    // 離開本頁時，暫停本頁背景音樂
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


</style>