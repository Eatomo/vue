<template>
  <div class="login-page">
  <div class="login-container">
    <h1>登入</h1>

    <input v-model="username" type="text" placeholder="帳號"><br><br>
    <input v-model="password" type="password" placeholder="密碼"><br><br>

    <button @click="login">登入</button>

    <p>還沒有帳號嗎？<button @click="goRegister">去註冊</button></p>

    <hr>

    <h2>或使用社群帳號快速登入</h2>

    <button class="facebook-button" @click="socialLogin('Facebook')">🔵 使用 Facebook 登入</button><br><br>
    <button class="google-button" @click="socialLogin('Google')">🔴 使用 Google 登入</button>
  </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: '',
      password: ''
    }
  },
  methods: {
    login() {
      const savedPassword = localStorage.getItem('user_' + this.username);
      if (this.password === savedPassword) {
        localStorage.setItem('loggedInUser', this.username);
        alert('登入成功！');
        this.$router.push('/home');  // 跳轉首頁
      } else {
        alert('帳號或密碼錯誤');
      }
    },
    goRegister() {
      this.$router.push('/register');  // 跳轉註冊頁
    },
    socialLogin(provider) {
      const fakeUser = provider + "_user";
      localStorage.setItem('loggedInUser', fakeUser);
      alert(provider + '登入成功！');
      this.$router.push('/home');  // 跳轉首頁
    }
  }
}
</script>

<style scoped>
@import '../assets/css/login.css';
</style>
