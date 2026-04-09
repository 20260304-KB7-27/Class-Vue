<template>
  <div class="container">
    <h1>KB 학생 관리 시스템</h1>

    <nav class="nav-menu">
      <router-link to="/students">학생 목록</router-link>
      <router-link to="/teams">팀별 학생 목록</router-link>
      <router-link to="/team-manager">팀 구성 관리</router-link>
      <router-link to="/dino">공룡 게임</router-link>
      <router-link to="/leaderboard">점수 전광판</router-link>
    </nav>

    <router-view></router-view>
  </div>
</template>

<script setup></script>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  color: darkslategray;
}
.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}
h1 {
  color: mediumseagreen;
  text-align: center;
  margin-bottom: 20px;
}

.nav-menu {
  display: flex;
  justify-content: center;
  margin-bottom: 30px;
  background-color: whitesmoke;
  border-radius: 4px;
  padding: 10px;
}

.nav-menu a {
  color: darkslategray;
  text-decoration: none;
  margin: 0 15px;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  transition: all 0.3s;
}

.nav-menu a:hover {
  background-color: gainsboro;
}

.nav-menu a.router-link-active {
  background-color: mediumseagreen;
  color: white;
}
</style>
