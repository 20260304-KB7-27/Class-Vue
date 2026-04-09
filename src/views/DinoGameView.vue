<template>
  <div class="dino-view">
    <h2>공룡 게임</h2>
    <DinoGame ref="dinoGameRef" :easter-eggs="gameStore.easterEggs" @gameover="handleGameOver" />
    <ScoreModal v-if="showModal" :score="lastScore" @restart="handleRestart" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DinoGame from '@/components/DinoGame.vue'
import ScoreModal from '@/components/ScoreModal.vue'
import { useGameStore } from '@/stores/gameStore'

const gameStore = useGameStore()
const dinoGameRef = ref(null)
const showModal = ref(false)
const lastScore = ref(0)

onMounted(() => {
  gameStore.fetchEasterEggs()
})

function handleGameOver(score) {
  lastScore.value = score
  showModal.value = true
}

function handleRestart() {
  showModal.value = false
  dinoGameRef.value?.resetToReady()
}
</script>

<style scoped>
.dino-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

h2 {
  color: mediumseagreen;
  margin: 0;
  font-size: 24px;
}
</style>
