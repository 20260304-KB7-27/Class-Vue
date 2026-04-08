<template>
  <div class="not-found">
    <h1>404</h1>
    <h2>페이지를 찾을 수 없습니다</h2>
    <p>요청하신 페이지가 존재하지 않습니다.</p>
    <router-link to="/" class="home-link">메인 페이지로 이동</router-link>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 50px 0;
}

h1 {
  font-size: 80px;
  margin-bottom: 0;
  color: crimson;
}

h2 {
  margin-top: 10px;
  color: darkslategray;
}

p {
  margin: 20px 0;
  color: gray;
}

.home-link {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: mediumseagreen;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
}

.home-link:hover {
  background-color: seagreen;
}
</style>
