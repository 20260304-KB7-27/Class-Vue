import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";

export const useStudentStore = defineStore("studentStore", () => {
  // 상태
  const students = ref([]);
  const tempStudents = ref([]); // 임시 저장용 상태 추가

  // Stduent의 통신 상태에 대해 관리를 함께하기 위해 상태 추가
  const isLoading = ref(false);
  const isSaving = ref(false); // 저장 중 상태 추가
  const error = ref(null);
  const saveSuccess = ref(false); // 저장 성공 상태 추가

  // 액션
  const fetchStudents = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await axios.get("https://class-db-production.up.railway.app/students");
      students.value = response.data;
      // 원본 데이터 초기화 시 tempStudents도 초기화
      resetTempStudents();
    } catch (err) {
      error.value = err.message || "학생 정보를 불러오는데 실패했습니다.";
      console.error("학생 정보 로딩 에러:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // 팀 랜덤 배정 기능 (팀 개수 기준으로 변경)
  const assignRandomTeams = (teamCount) => {
    // 학생 복사본 만들기
    let shuffledStudents = [...students.value];

    // 학생 목록 섞기
    for (let i = shuffledStudents.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledStudents[i], shuffledStudents[j]] = [
        shuffledStudents[j],
        shuffledStudents[i],
      ];
    }

    // 팀 당 학생 수 계산 (소수점 이하 올림)
    const totalStudents = shuffledStudents.length;

    // 각 팀에 학생 배정
    shuffledStudents = shuffledStudents.map((student, index) => {
      // 팀 번호는 0부터 teamCount-1까지 균등하게 분배
      const teamNumber = (index % teamCount) + 1;
      return {
        ...student,
        team: `${teamNumber}팀`,
      };
    });

    // 임시 상태에 저장
    tempStudents.value = shuffledStudents;
    saveSuccess.value = false; // 저장 상태 초기화
  };

  // 팀 구성 저장 기능
  const saveTeamAssignments = async () => {
    if (tempStudents.value.length === 0) {
      error.value = "저장할 팀 구성이 없습니다.";
      return;
    }

    isSaving.value = true;
    error.value = null;
    saveSuccess.value = false;

    try {
      // 모든 학생 데이터에 대한 업데이트 요청을 병렬로 처리
      const updatePromises = tempStudents.value.map((student) =>
        axios.put(`https://class-db-production.up.railway.app/students/${student.id}`, student),
      );

      await Promise.all(updatePromises);

      // 성공적으로 업데이트되면 students 상태를 업데이트된 데이터로 설정
      students.value = [...tempStudents.value];
      saveSuccess.value = true;
    } catch (err) {
      error.value = err.message || "팀 구성 저장에 실패했습니다.";
      console.error("팀 구성 저장 에러:", err);
    } finally {
      isSaving.value = false;
    }
  };

  // 임시 변경사항 취소 기능
  const cancelTeamChanges = () => {
    resetTempStudents();
  };

  // 임시 학생 데이터 초기화
  const resetTempStudents = () => {
    tempStudents.value = JSON.parse(JSON.stringify(students.value));
  };

  // 학생 정보 팀별로 분류
  // 학생들을 팀별로 그룹화하는 계산된 속성
  const studentsByTeam = computed(() => {
    // 팀을 키로 하는 빈 객체 생성
    const teams = {};

    // 모든 학생을 순회하면서 팀별로 분류
    students.value.forEach((student) => {
      // 해당 팀이 아직 객체에 없으면 빈 배열로 초기화
      if (!teams[student.team]) {
        teams[student.team] = [];
      }
      // 학생을 해당 팀 배열에 추가
      teams[student.team].push(student);
    });
    // 팀별로 분류된 학생 객체 반환
    return teams;
  });

  // 임시 팀 분류 계산 속성
  const tempStudentsByTeam = computed(() => {
    const teams = {};
    tempStudents.value.forEach((student) => {
      if (!teams[student.team]) {
        teams[student.team] = [];
      }
      teams[student.team].push(student);
    });
    return teams;
  });

  // 컴퓨티드 속성
  const studentCount = computed(() => students.value.length);
  const teamCount = computed(() => Object.keys(studentsByTeam.value).length);

  return {
    students,
    tempStudents,
    isLoading,
    isSaving,
    error,
    saveSuccess,
    fetchStudents,
    assignRandomTeams,
    saveTeamAssignments,
    cancelTeamChanges,
    studentCount,
    teamCount,
    studentsByTeam,
    tempStudentsByTeam,
  };
});
