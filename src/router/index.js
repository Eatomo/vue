import { createRouter, createWebHistory } from 'vue-router';
import Welcome from '../views/Welcome.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Home from '../views/Home.vue';
import AiMenu from '../views/AiMenu.vue';
import pdf from '../views/pdf.vue';
import ThreeHigh from '../views/ThreeHigh.vue';
import Fitness from '../views/Fitness.vue';
import Vegetarian from '../views/Vegetarian.vue';
import Children from '../views/Children.vue';
import Office from '../views/Office.vue';
import Elderly from '../views/Elderly.vue';
import History from '../views/History.vue';
import Feedback from '../views/Feedback.vue';

const routes = [
  { path: '/', component: Welcome },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/home', component: Home },
  { path: '/Ai-menu', component: AiMenu },
  { path: '/pdf-menu', component:  pdf },
  { path: '/ThreeHigh', component: ThreeHigh },
  { path: '/Fitness', component: Fitness },
  { path: '/Vegetarian', component: Vegetarian },
  { path: '/Children', component: Children },
  { path: '/Office', component: Office },
  { path: '/Elderly', component: Elderly },
  { path: '/History', component: History },
  { path: '/Feedback', component: Feedback },
];

const router = createRouter({
  history: createWebHistory('/vue/'), // 如果你部署在 /vue/ 子目錄
  routes
});

export default router;
