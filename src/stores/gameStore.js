import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const BASE_URL = 'https://class-db-production.up.railway.app'

export const useGameStore = defineStore('game', () => {
  const scores = ref([])

  async function fetchScores() {
    const { data } = await axios.get(`${BASE_URL}/scores`)
    scores.value = data.sort((a, b) => b.score - a.score)
  }

  async function saveScore(name, score) {
    const entry = {
      name,
      score,
      playedAt: new Date().toISOString(),
    }
    const { data } = await axios.post(`${BASE_URL}/scores`, entry)
    return data
  }

  return { scores, fetchScores, saveScore }
})
