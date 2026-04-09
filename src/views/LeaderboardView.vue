<template>
  <div class="leaderboard-view">
    <div class="header">
      <h2>점수 전광판</h2>
      <button @click="load" :disabled="loading">
        {{ loading ? '로딩 중...' : '새로고침' }}
      </button>
    </div>

    <p v-if="!loading && scores.length === 0" class="empty">
      아직 기록이 없습니다. 게임을 플레이하고 기록을 남겨보세요!
    </p>

    <LeaderboardTable v-else :scores="scores" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useGameStore } from '@/stores/gameStore'
import LeaderboardTable from '@/components/LeaderboardTable.vue'

const gameStore = useGameStore()
const { scores } = storeToRefs(gameStore)
const loading = ref(false)

async function load() {
  loading.value = true
  await gameStore.fetchScores()
  loading.value = false
}

onMounted(load)
</script>

<style scoped>
.leaderboard-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

h2 {
  color: mediumseagreen;
  margin: 0;
  font-size: 24px;
}

button {
  padding: 8px 18px;
  background: mediumseagreen;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #2e8b57;
}

button:disabled {
  background: #aaa;
  cursor: not-allowed;
}

.empty {
  text-align: center;
  color: #999;
  padding: 60px 0;
  font-size: 16px;
}
</style>
