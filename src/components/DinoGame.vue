<template>
  <div class="game-container" @click="handleClick">
    <canvas ref="canvasRef" :width="CANVAS_W" :height="CANVAS_H" class="game-canvas" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

import run1Src from '@/assets/image/run-1.png'
import run2Src from '@/assets/image/run-2.png'
import readySrc from '@/assets/image/ready.png'
import jumpSrc from '@/assets/image/jump.png'
import highBuildingSrc from '@/assets/image/high-building.png'
import middleBuildingSrc from '@/assets/image/middle-building.png'
import lowBuildingSrc from '@/assets/image/low-building.png'

const emit = defineEmits(['gameover'])

// --- 상수 ---
const CANVAS_W = 800
const CANVAS_H = 300
const GROUND_Y = 250   // 발이 닿는 y
const DINO_X = 80
const DINO_W = 80
const DINO_H = 80
const GRAVITY = 0.7
const JUMP_FORCE = -15

const OBS_SIZE = {
  low:    { w: 40, h: 50 },
  middle: { w: 50, h: 70 },
  high:   { w: 55, h: 90 },
}

// 장애물 패턴 (다양한 조합)
const PATTERNS = [
  ['low'],
  ['middle'],
  ['high'],
  ['low', 'low'],
  ['low', 'middle'],
  ['middle', 'high'],
  ['low', 'low', 'low'],
  ['high', 'low'],
  ['middle', 'middle'],
  ['low', 'high'],
]

// --- refs ---
const canvasRef = ref(null)
const gameState = ref('ready') // 'ready' | 'playing' | 'dead'

let ctx = null
let animId = null
let imgs = {}

// 게임 변수 (ref 없이 일반 변수로 - 매 프레임 변경)
let dino, obstacles, gameSpeed, frameCount, nextObstacleIn
let runFrame, runFrameTimer, emittedGameover

// --- 이미지 로딩 ---
function loadImages() {
  return new Promise((resolve) => {
    const srcs = {
      run1: run1Src,
      run2: run2Src,
      ready: readySrc,
      jump: jumpSrc,
      low: lowBuildingSrc,
      middle: middleBuildingSrc,
      high: highBuildingSrc,
    }
    let done = 0
    const total = Object.keys(srcs).length
    for (const [k, src] of Object.entries(srcs)) {
      const img = new Image()
      img.onload = () => { if (++done === total) resolve() }
      img.onerror = () => { if (++done === total) resolve() }
      img.src = src
      imgs[k] = img
    }
  })
}

// --- 게임 초기화 ---
function initGame() {
  dino = { y: GROUND_Y - DINO_H, vy: 0, onGround: true }
  obstacles = []
  gameSpeed = 5
  frameCount = 0
  nextObstacleIn = 90
  runFrame = 0
  runFrameTimer = 0
  emittedGameover = false
}

// --- 점프 ---
function jump() {
  if (dino.onGround) {
    dino.vy = JUMP_FORCE
    dino.onGround = false
  }
}

// --- 장애물 생성 ---
function spawnObstacle() {
  const pattern = PATTERNS[Math.floor(Math.random() * PATTERNS.length)]
  let x = CANVAS_W + 20
  for (const type of pattern) {
    const s = OBS_SIZE[type]
    obstacles.push({ type, x, y: GROUND_Y - s.h, w: s.w, h: s.h })
    x += s.w + 8  // 그룹 내 간격
  }
}

// --- 충돌 감지 (margin으로 판정 여유 부여) ---
function isColliding(obs) {
  const m = 10
  return (
    DINO_X + m < obs.x + obs.w - m &&
    DINO_X + DINO_W - m > obs.x + m &&
    dino.y + m < obs.y + obs.h - m &&
    dino.y + DINO_H - m > obs.y + m
  )
}

// --- 화면 그리기 ---
function draw() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

  // 배경
  ctx.fillStyle = '#f5f5f5'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  // 바닥선
  ctx.fillStyle = '#999'
  ctx.fillRect(0, GROUND_Y, CANVAS_W, 2)

  // 공룡 이미지 선택
  let dinoImg
  if (gameState.value === 'ready') {
    dinoImg = imgs.ready
  } else if (!dino.onGround) {
    dinoImg = imgs.jump
  } else {
    dinoImg = runFrame === 0 ? imgs.run1 : imgs.run2
  }
  ctx.drawImage(dinoImg, DINO_X, dino.y, DINO_W, DINO_H)

  // 장애물
  for (const obs of obstacles) {
    ctx.drawImage(imgs[obs.type], obs.x, obs.y, obs.w, obs.h)
  }

  // 점수 (우상단)
  ctx.fillStyle = '#333'
  ctx.font = 'bold 20px monospace'
  ctx.textAlign = 'right'
  ctx.fillText(String(Math.floor(frameCount / 6)).padStart(5, '0'), CANVAS_W - 20, 34)

  // 안내 문구
  ctx.textAlign = 'center'
  if (gameState.value === 'ready') {
    ctx.fillStyle = '#555'
    ctx.font = 'bold 18px sans-serif'
    ctx.fillText('SPACE 또는 클릭으로 시작', CANVAS_W / 2, CANVAS_H / 2 + 6)
  } else if (gameState.value === 'dead') {
    ctx.fillStyle = '#cc3333'
    ctx.font = 'bold 24px sans-serif'
    ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 + 6)
  }
}

// --- 메인 게임 루프 ---
function gameLoop() {
  if (gameState.value === 'playing') {
    frameCount++

    // 속도 점진적 증가 (초반엔 완만하게, 시간이 지날수록 급격히 빨라짐)
    gameSpeed = Math.min(5 + Math.pow(frameCount / 200, 1.4), 30)

    // 공룡 물리 (중력 + 착지)
    dino.vy += GRAVITY
    dino.y += dino.vy
    if (dino.y >= GROUND_Y - DINO_H) {
      dino.y = GROUND_Y - DINO_H
      dino.vy = 0
      dino.onGround = true
    }

    // 달리기 애니메이션 (착지 상태만)
    if (dino.onGround) {
      runFrameTimer++
      if (runFrameTimer >= 8) {
        runFrame ^= 1
        runFrameTimer = 0
      }
    }

    // 장애물 생성 타이머
    nextObstacleIn--
    if (nextObstacleIn <= 0) {
      spawnObstacle()
      const base = Math.floor(Math.random() * 60 + 70)
      nextObstacleIn = Math.max(base - Math.floor(gameSpeed * 2), 45)
    }

    // 장애물 이동 및 화면 밖 제거
    for (const obs of obstacles) obs.x -= gameSpeed
    obstacles = obstacles.filter((o) => o.x + o.w > 0)

    // 충돌 감지
    if (!emittedGameover && obstacles.some(isColliding)) {
      emittedGameover = true
      gameState.value = 'dead'
      emit('gameover', Math.floor(frameCount / 6))
    }
  }

  draw()
  animId = requestAnimationFrame(gameLoop)
}

// --- 입력 처리 ---
function startOrJump() {
  if (gameState.value === 'ready') {
    initGame()
    gameState.value = 'playing'
    jump() // 시작과 동시에 점프
  } else if (gameState.value === 'playing') {
    jump()
  }
  // dead 상태는 모달에서 처리
}

function handleKey(e) {
  if (e.code === 'Space' || e.code === 'ArrowUp') {
    e.preventDefault()
    startOrJump()
  }
}

function handleClick() {
  startOrJump()
}

// 부모(DinoGameView)에서 호출: 모달 닫힌 후 ready 상태로 리셋
function resetToReady() {
  initGame()
  gameState.value = 'ready'
}

defineExpose({ resetToReady })

onMounted(async () => {
  ctx = canvasRef.value.getContext('2d')
  await loadImages()
  initGame()
  draw()
  animId = requestAnimationFrame(gameLoop)
  window.addEventListener('keydown', handleKey)
})

onUnmounted(() => {
  cancelAnimationFrame(animId)
  window.removeEventListener('keydown', handleKey)
})
</script>

<style scoped>
.game-container {
  display: flex;
  justify-content: center;
  cursor: pointer;
}
.game-canvas {
  border: 2px solid #ccc;
  border-radius: 8px;
  display: block;
  max-width: 100%;
}
</style>
