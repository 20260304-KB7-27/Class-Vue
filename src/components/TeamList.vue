<template>
  <div class="team-container">
    <h3>팀별 학생 목록</h3>
    <div v-if="studentStore.isLoading" class="loading">데이터 로딩 중...</div>
    <div v-else-if="studentStore.error" class="error">
      {{ studentStore.error }}
    </div>
    <div v-else>
      <div
        v-if="Object.keys(studentStore.studentsByTeam).length === 0"
        class="empty"
      >
        팀 정보가 없습니다.
      </div>
      <div v-else>
        <div v-for="team in sortedTeams" :key="team.name" class="team-section">
          <h4>{{ team.name }} ({{ team.students.length }}명)</h4>
          <ul>
            <li v-for="student in team.students" :key="student.id">
              {{ student.name }}
              <a :href="student.githubURL" target="_blank" class="github-link">
                <small>GitHub</small>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStudentStore } from "../stores/studentStore";
import { onMounted, computed } from "vue";

const studentStore = useStudentStore();

// 팀을 숫자 기준으로 정렬해서 반환하는 계산된 속성
const sortedTeams = computed(() => {
  // studentsByTeam 객체를 배열로 변환
  const teamsArray = Object.entries(studentStore.studentsByTeam).map(
    ([teamName, students]) => ({
      name: teamName,
      students: students,
      // 팀 이름에서 숫자만 추출 (예: "1팀" -> 1)
      number: parseInt(teamName.replace(/\D/g, "")),
    })
  );

  // 팀 번호로 정렬
  return teamsArray.sort((a, b) => a.number - b.number);
});

onMounted(() => {
  if (studentStore.students.length === 0) {
    studentStore.fetchStudents();
  }
});
</script>

<style scoped>
.team-container {
  margin-top: 20px;
}

.team-section {
  margin-bottom: 20px;
  padding: 10px;
  border: 1px solid gainsboro;
  border-radius: 4px;
}

h4 {
  margin-top: 0;
  margin-bottom: 10px;
  color: mediumseagreen;
}

ul {
  margin: 0;
  padding-left: 20px;
}

li {
  margin-bottom: 5px;
}

.github-link {
  margin-left: 5px;
  color: mediumseagreen;
  text-decoration: none;
}

.github-link:hover {
  text-decoration: underline;
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
