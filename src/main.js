import { createApp } from 'vue';  // ✅ 補上 vue 匯入
import App from './App.vue';
import router from './router';    // ✅ 補上 router 匯入

createApp(App).use(router).mount('#app');
