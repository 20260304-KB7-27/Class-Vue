<template>
  <div class="summary">
    <p>전체 학생 수: {{ studentStore.studentCount }}명</p>
    <p>팀 수: {{ Object.keys(studentStore.studentsByTeam).length }}개</p>
  </div>
</template>

<script setup>
import { useStudentStore } from "../stores/studentStore";

const studentStore = useStudentStore();
</script>

<style scoped>
.summary {
  margin-top: 20px;
  padding: 10px;
  background-color: ghostwhite;
  border: 1px solid gainsboro;
  border-radius: 4px;
}

.summary p {
  margin: 5px 0;
}
</style>
