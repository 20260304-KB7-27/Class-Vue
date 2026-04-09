<template>
  <div class="backdrop">
    <div class="modal">
      <h2>GAME OVER</h2>
      <p class="score-display">최종 점수: <strong>{{ score }}</strong></p>

      <div class="form-group">
        <label>이름</label>
        <input
          ref="inputRef"
          v-model="name"
          type="text"
          placeholder="이름을 입력하세요"
          maxlength="10"
          @keyup.enter="handleSave"
        />
      </div>

      <div class="btn-group">
        <button class="btn-primary" :disabled="!name.trim() || saving" @click="handleSave">
          {{ saving ? '저장 중...' : '저장 후 다시 시작' }}
        </button>
        <button class="btn-secondary" @click="emit('restart')">그냥 다시 시작</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'

const props = defineProps({
  score: { type: Number, required: true },
})
const emit = defineEmits(['restart'])

const gameStore = useGameStore()
const name = ref('')
const saving = ref(false)
const inputRef = ref(null)

onMounted(() => inputRef.value?.focus())

async function handleSave() {
  if (!name.value.trim() || saving.value) return
  saving.value = true
  await gameStore.saveScore(name.value.trim(), props.score)
  saving.value = false
  emit('restart')
}
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal {
  background: white;
  border-radius: 14px;
  padding: 40px 52px;
  text-align: center;
  min-width: 340px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.25);
}

h2 {
  margin: 0 0 10px;
  color: #cc3333;
  font-size: 30px;
  letter-spacing: 2px;
}

.score-display {
  font-size: 18px;
  color: #333;
  margin-bottom: 24px;
}

.score-display strong {
  font-size: 30px;
  color: mediumseagreen;
  font-family: monospace;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 22px;
  text-align: left;
}

.form-group label {
  font-weight: bold;
  color: #555;
  font-size: 14px;
}

.form-group input {
  padding: 10px 14px;
  border: 2px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  outline: none;
  transition: border-color 0.2s;
}

.form-group input:focus {
  border-color: mediumseagreen;
}

.btn-group {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.btn-primary {
  padding: 10px 22px;
  background: mediumseagreen;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #2e8b57;
}

.btn-primary:disabled {
  background: #aaa;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 22px;
  background: #eee;
  color: #333;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-secondary:hover {
  background: #ddd;
}
</style>
