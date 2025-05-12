<template>
<div class="login-page">
  <div class="login-container">
    <h1>註冊新帳號</h1>

    <input v-model="username" type="text" placeholder="輸入帳號"><br><br>
    <input v-model="password" type="password" placeholder="輸入密碼"><br><br>
    <input v-model="confirmPassword" type="password" placeholder="再次確認密碼"><br><br>

    <button class="register-button" @click="register">註冊</button>

    <p>已經有帳號？<button @click="goLogin">回登入</button></p>
  </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: '',
      confirmPassword: ''
    }
  },
  methods: {
    register() {
      if (!this.username || !this.password || !this.confirmPassword) {
        alert('請完整填寫帳號與密碼');
        return;
      }

      if (this.password !== this.confirmPassword) {
        alert('兩次密碼不一致，請重新輸入');
        return;
      }

      localStorage.setItem('user_' + this.username, this.password);
      alert('註冊成功！請登入');
      this.$router.push('/login');  // 轉回登入頁
    },
    goLogin() {
      this.$router.push('/login');  // 轉回登入頁
    }
  }
}
</script>

<style scoped>
@import '../assets/css/login.css';
</style>
