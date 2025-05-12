<template>
  <div class="welcome-container">
    <div class="welcome-box">
      <h1 class="welcome-text">歡迎來到 吃光光Eatomo APP！</h1>
      <p class="sub-text">進入智能飲食的世界吧~</p>
      <button @click="goToLogin">進入登入頁</button>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    goToLogin() {
      this.$router.push('/login'); // 透過 Vue Router 轉頁
    }
  }
}
</script>

<style scoped>
@import '../assets/css/welcome.css';
</style>
