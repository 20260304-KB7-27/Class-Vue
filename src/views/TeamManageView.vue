<template>
  <div>
    <h2>팀 구성 관리</h2>

    <!-- 로딩 표시 -->
    <div
      v-if="studentStore.isLoading || studentStore.isSaving"
      class="loading-box"
    >
      <p>
        {{
          studentStore.isSaving
            ? "팀 구성 저장 중..."
            : "학생 데이터 로딩 중..."
        }}
      </p>
    </div>

    <!-- 에러 메시지 -->
    <div v-if="studentStore.error" class="error-box">
      <p>{{ studentStore.error }}</p>
    </div>

    <!-- 성공 메시지 -->
    <div v-if="studentStore.saveSuccess" class="success-box">
      <p>팀 구성이 성공적으로 저장되었습니다!</p>
    </div>

    <!-- 팀 구성 설정 폼 -->
    <div
      class="team-config"
      v-if="!studentStore.isLoading && !studentStore.isSaving"
    >
      <div class="team-controls">
        <div class="form-group">
          <label for="teamCount">팀 개수:</label>
          <input
            type="number"
            id="teamCount"
            v-model="teamCount"
            min="1"
            :max="studentStore.studentCount"
            class="form-control"
          />
        </div>

        <div class="button-group">
          <button @click="assignRandomTeams" class="btn primary">
            랜덤 팀 구성
          </button>
          <button
            @click="saveTeams"
            :disabled="!hasChanges"
            class="btn success"
          >
            저장
          </button>
          <button
            @click="cancelChanges"
            :disabled="!hasChanges"
            class="btn danger"
          >
            취소
          </button>
        </div>
      </div>

      <!-- 팀 구성 미리보기 -->
      <div v-if="hasChanges" class="preview-section">
        <h3>새로운 팀 구성 미리보기</h3>
        <div
          v-if="Object.keys(studentStore.tempStudentsByTeam).length === 0"
          class="empty-message"
        >
          팀 구성 정보가 없습니다.
        </div>
        <div v-else class="team-preview">
          <div v-for="team in sortedTeams" :key="team.name" class="team-card">
            <h4>{{ team.name }} ({{ team.students.length }}명)</h4>
            <ul>
              <li v-for="student in team.students" :key="student.id">
                {{ student.name }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStudentStore } from "../stores/studentStore";

const studentStore = useStudentStore();
const teamCount = ref(5); // 기본 팀 개수

// 변경사항이 있는지 확인
const hasChanges = computed(() => {
  if (studentStore.tempStudents.length === 0) return false;

  // 원본과 임시 데이터의 팀 구성이 다른지 비교
  return studentStore.tempStudents.some((temp, index) => {
    return (
      index < studentStore.students.length &&
      temp.team !== studentStore.students[index].team
    );
  });
});

// 팀을 숫자 기준으로 정렬해서 반환하는 계산된 속성
const sortedTeams = computed(() => {
  // tempStudentsByTeam 객체를 배열로 변환
  const teamsArray = Object.entries(studentStore.tempStudentsByTeam).map(
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

// 랜덤 팀 구성 함수
const assignRandomTeams = () => {
  if (teamCount.value < 1) {
    alert("팀 개수는 최소 1개 이상이어야 합니다.");
    return;
  }

  if (teamCount.value > studentStore.studentCount) {
    alert("팀 개수는 학생 수보다 많을 수 없습니다.");
    return;
  }

  studentStore.assignRandomTeams(teamCount.value);
};

// 팀 구성 저장 함수
const saveTeams = () => {
  studentStore.saveTeamAssignments();
};

// 변경사항 취소 함수
const cancelChanges = () => {
  studentStore.cancelTeamChanges();
};

// 컴포넌트 마운트 시 학생 데이터 로드
onMounted(() => {
  if (studentStore.students.length === 0) {
    studentStore.fetchStudents();
  }
});
</script>

<style scoped>
.loading-box,
.error-box,
.success-box {
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 4px;
  text-align: center;
}

.loading-box {
  background-color: lightblue;
  color: darkblue;
}

.error-box {
  background-color: mistyrose;
  color: crimson;
}

.success-box {
  background-color: palegreen;
  color: darkgreen;
}

.team-config {
  margin-top: 20px;
}

.team-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  background-color: whitesmoke;
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.form-group {
  margin-right: 20px;
}

label {
  margin-right: 10px;
  font-weight: bold;
}

.form-control {
  padding: 8px;
  border: 1px solid gainsboro;
  border-radius: 4px;
  width: 80px;
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primary {
  background-color: mediumseagreen;
}

.success {
  background-color: royalblue;
}

.danger {
  background-color: crimson;
}

.primary:hover:not(:disabled) {
  background-color: seagreen;
}

.success:hover:not(:disabled) {
  background-color: darkblue;
}

.danger:hover:not(:disabled) {
  background-color: darkred;
}

.preview-section {
  margin-top: 20px;
}

.team-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.team-card {
  border: 1px solid gainsboro;
  border-radius: 4px;
  padding: 15px;
  background-color: ghostwhite;
}

.team-card h4 {
  margin-top: 0;
  color: mediumseagreen;
  border-bottom: 1px solid gainsboro;
  padding-bottom: 10px;
}

.team-card ul {
  margin: 0;
  padding-left: 20px;
}

.team-card li {
  margin-bottom: 5px;
}

.empty-message {
  text-align: center;
  padding: 20px;
  color: gray;
  background-color: whitesmoke;
  border-radius: 4px;
}
</style>
