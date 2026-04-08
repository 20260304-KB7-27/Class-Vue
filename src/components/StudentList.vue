<template>
  <div>
    <h3>학생 목록</h3>
    <div v-if="studentStore.isLoading" class="loading">데이터 로딩 중...</div>
    <div v-else-if="studentStore.error" class="error">
      {{ studentStore.error }}
    </div>
    <div v-else>
      <div v-if="studentStore.students.length === 0" class="empty">
        학생 정보가 없습니다.
      </div>
      <div v-else>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>이름</th>
              <th>이메일</th>
              <th>팀</th>
              <th>GitHub</th>
            </tr>
          </thead>
          <tbody>
            <StudentItem
              v-for="student in studentStore.students"
              :key="student.id"
              :student="student"
            />
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useStudentStore } from "../stores/studentStore";
import StudentItem from "./StudentItem.vue";

const studentStore = useStudentStore();

onMounted(() => {
  studentStore.fetchStudents();
});
</script>

<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th,
td {
  border: 1px solid gainsboro;
  padding: 8px;
  text-align: left;
}

th {
  background-color: whitesmoke;
}

.loading,
.error,
.empty {
  padding: 20px;
  text-align: center;
}

.error {
  color: crimson;
}
</style>
