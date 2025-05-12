import { createRouter, createWebHistory } from 'vue-router';
import Welcome from '../views/Welcome.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Home from '../views/Home.vue';
import AiMenu from '../views/AiMenu.vue';

const routes = [
  { path: '/', component: Welcome },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/home', component: Home },
  { path: '/ai-menu', component: AiMenu },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
