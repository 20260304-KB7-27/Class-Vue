<template>
  <div>
    <h2>학생 목록</h2>
    <StudentList />
    <StudentSummary />
  </div>
</template>

<script setup>
import StudentList from "../components/StudentList.vue";
import StudentSummary from "../components/StudentSummary.vue";
</script>

<style scoped>
h2 {
  color: mediumseagreen;
  margin-bottom: 20px;
}
</style>
