<template>
  <div>
    <h2>팀별 학생 목록</h2>
    <TeamList />
    <StudentSummary />
  </div>
</template>

<script setup>
import TeamList from "../components/TeamList.vue";
import StudentSummary from "../components/StudentSummary.vue";
</script>

<style scoped>
h2 {
  color: mediumseagreen;
  margin-bottom: 20px;
}
</style>
