<template>
  <div class="game-container" @click="handleClick">
    <canvas ref="canvasRef" :width="CANVAS_W" :height="CANVAS_H" class="game-canvas" />
    <p class="hint">↑ / SPACE: 점프 &nbsp;|&nbsp; 빨간 텍스트 장애물은 점프하지 말고 통과!</p>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

import run1Src    from '@/assets/image/run-1.png'
import run2Src    from '@/assets/image/run-2.png'
import readySrc   from '@/assets/image/ready.png'
import jumpSrc    from '@/assets/image/jump.png'
import highSrc    from '@/assets/image/high-building.png'
import middleSrc  from '@/assets/image/middle-building.png'
import lowSrc     from '@/assets/image/low-building.png'

// ─── props ───────────────────────────────────────────────────────────────────
// easterEggs: [{ id, score, text, color }]  — json-server에서 가져온 데이터
const props = defineProps({
  easterEggs: { type: Array, default: () => [] },
})

const emit = defineEmits(['gameover'])

// ─── 상수 ─────────────────────────────────────────────────────────────────────
const CANVAS_W  = 800
const CANVAS_H  = 300
const GROUND_Y  = 250   // 바닥 y
const DINO_X    = 80
const DINO_W    = 80
const DINO_H    = 80
const GRAVITY   = 0.7
const JUMP_FORCE = -15

// 가만히 있어야 통과하는 장애물 — 점프하면 맞는 높이
const STAY_OBS_Y = 60    // 장애물 상단 y (공중)
const STAY_OBS_H = 90    // 장애물 높이  → 하단 y = 150 (서있는 공룡 위로 pass)

// 서있는 공룡 y범위: 170~250 → STAY 장애물 하단(150) < 공룡 상단(170) → 충돌 없음 ✓
// 점프 정점 공룡 y범위: ~10~90  → STAY 장애물 60~150 와 겹침 → 충돌 ✓

// 일반 지상 장애물 크기
const OBS_SIZE = {
  low:    { w: 40, h: 50 },
  middle: { w: 50, h: 70 },
  high:   { w: 55, h: 90 },
}

// 가만히 있어야 통과하는 장애물 텍스트 (점프하면 충돌)
const STAY_LABELS = [
  { label: '코딩테스트', color: '#e74c3c' },
  { label: 'CS지식',    color: '#8e44ad' },
  { label: '어학성적',  color: '#2980b9' },
]

// ─── 난이도별 패턴 풀 ─────────────────────────────────────────────────────────
const PATTERNS_EASY = [
  ['low'],
  ['middle'],
  ['low', 'low'],
]
const PATTERNS_MID = [
  ['high'],
  ['low', 'middle'],
  ['middle', 'high'],
  ['low', 'low', 'low'],
]
const PATTERNS_HARD = [
  ['high', 'low'],
  ['middle', 'middle'],
  ['low', 'high'],
  ['high', 'high'],
  ['low', 'middle', 'low'],
  ['middle', 'high', 'low'],
]

// ─── 상태 ─────────────────────────────────────────────────────────────────────
const canvasRef  = ref(null)
const gameState  = ref('ready') // 'ready' | 'playing' | 'dead'

let ctx = null
let animId = null
let imgs  = {}

// 게임 변수
let dino, obstacles, gameSpeed, frameCount, nextObstacleIn
let runFrame, runFrameTimer, emittedGameover
// 이스터에그: 한 번씩만 등장 { id, text, color, x, opacity, fadeDir }
let shownEggIds, activeEggs

// ─── 이미지 로딩 ──────────────────────────────────────────────────────────────
function loadImages() {
  return new Promise((resolve) => {
    const srcs = {
      run1: run1Src, run2: run2Src, ready: readySrc, jump: jumpSrc,
      low: lowSrc, middle: middleSrc, high: highSrc,
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

// ─── 초기화 ───────────────────────────────────────────────────────────────────
function initGame() {
  dino          = { y: GROUND_Y - DINO_H, vy: 0, onGround: true }
  obstacles     = []
  gameSpeed     = 5
  frameCount    = 0
  nextObstacleIn = 90
  runFrame      = 0
  runFrameTimer = 0
  emittedGameover = false
  shownEggIds   = new Set()
  activeEggs    = []
}

// ─── 점프 ─────────────────────────────────────────────────────────────────────
function jump() {
  if (dino.onGround) {
    dino.vy = JUMP_FORCE
    dino.onGround = false
  }
}

// ─── 가만히 있어야 통과하는 장애물 생성 ─────────────────────────────────────────
function spawnStayObs(labelObj) {
  ctx.font = 'bold 15px sans-serif'
  const textW = ctx.measureText(labelObj.label).width
  const w = Math.ceil(textW + 28)
  obstacles.push({
    kind: 'stay',
    label: labelObj.label,
    color: labelObj.color,
    x: CANVAS_W + 10,
    y: STAY_OBS_Y,
    w,
    h: STAY_OBS_H,
  })
}

// ─── 지상 장애물 생성 ─────────────────────────────────────────────────────────
function spawnGroundObs(pattern) {
  let x = CANVAS_W + 20
  for (const type of pattern) {
    const s = OBS_SIZE[type]
    obstacles.push({ kind: 'ground', type, x, y: GROUND_Y - s.h, w: s.w, h: s.h })
    x += s.w + 8
  }
}

// ─── 점수 기반 장애물 스폰 ────────────────────────────────────────────────────
function spawnObstacle() {
  const score = Math.floor(frameCount / 6)

  // 가만히 있어야 통과하는 장애물 확률 (100점부터 등장)
  let stayChance = 0
  if (score >= 100) stayChance = 0.22
  if (score >= 200) stayChance = 0.38

  if (Math.random() < stayChance) {
    const pick = STAY_LABELS[Math.floor(Math.random() * STAY_LABELS.length)]
    spawnStayObs(pick)
    return
  }

  // 점수별 패턴 풀 선택
  let pool
  if (score < 50)       pool = PATTERNS_EASY
  else if (score < 150) pool = [...PATTERNS_EASY, ...PATTERNS_MID]
  else if (score < 300) pool = [...PATTERNS_MID, ...PATTERNS_HARD]
  else                  pool = PATTERNS_HARD

  const pattern = pool[Math.floor(Math.random() * pool.length)]
  spawnGroundObs(pattern)
}

// ─── 충돌 감지 ────────────────────────────────────────────────────────────────
function isColliding(obs) {
  const m = 10
  return (
    DINO_X + m < obs.x + obs.w - m &&
    DINO_X + DINO_W - m > obs.x + m &&
    dino.y + m < obs.y + obs.h - m &&
    dino.y + DINO_H - m > obs.y + m
  )
}

// ─── 이스터에그 그리기 ────────────────────────────────────────────────────────
function drawEasterEggs() {
  for (const egg of activeEggs) {
    ctx.save()
    ctx.globalAlpha = egg.opacity
    ctx.font = 'bold 22px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = egg.color
    ctx.shadowColor = egg.color
    ctx.shadowBlur = 18
    ctx.fillText(egg.text, egg.x, CANVAS_H / 2 - 60)
    ctx.restore()
  }
}

// ─── 가만히 있어야 통과하는 장애물 그리기 ───────────────────────────────────────
function drawStayObs(obs) {
  ctx.fillStyle = obs.color
  ctx.beginPath()
  if (ctx.roundRect) ctx.roundRect(obs.x, obs.y, obs.w, obs.h, 8)
  else               ctx.rect(obs.x, obs.y, obs.w, obs.h)
  ctx.fill()

  ctx.fillStyle = 'white'
  ctx.font = 'bold 15px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(obs.label, obs.x + obs.w / 2, obs.y + obs.h / 2)
  ctx.textBaseline = 'alphabetic'
}

// ─── 전체 화면 그리기 ─────────────────────────────────────────────────────────
function draw() {
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

  // 배경
  ctx.fillStyle = '#f5f5f5'
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

  // 이스터에그 (배경 레이어 — 장애물보다 뒤)
  drawEasterEggs()

  // 바닥선
  ctx.fillStyle = '#999'
  ctx.fillRect(0, GROUND_Y, CANVAS_W, 2)

  // 공룡
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
    if (obs.kind === 'stay') drawStayObs(obs)
    else ctx.drawImage(imgs[obs.type], obs.x, obs.y, obs.w, obs.h)
  }

  // 점수 (우상단)
  const score = Math.floor(frameCount / 6)
  ctx.fillStyle = '#333'
  ctx.font = 'bold 20px monospace'
  ctx.textAlign = 'right'
  ctx.fillText(String(score).padStart(5, '0'), CANVAS_W - 20, 34)

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

// ─── 메인 게임 루프 ───────────────────────────────────────────────────────────
function gameLoop() {
  if (gameState.value === 'playing') {
    frameCount++
    const score = Math.floor(frameCount / 6)

    // 속도 점진적 증가
    gameSpeed = Math.min(5 + Math.pow(frameCount / 200, 1.4), 30)

    // 공룡 물리
    dino.vy += GRAVITY
    dino.y  += dino.vy
    if (dino.y >= GROUND_Y - DINO_H) {
      dino.y = GROUND_Y - DINO_H
      dino.vy = 0
      dino.onGround = true
    }

    // 달리기 애니메이션
    if (dino.onGround) {
      runFrameTimer++
      if (runFrameTimer >= 8) { runFrame ^= 1; runFrameTimer = 0 }
    }

    // ── 이스터에그 트리거 (한 번씩만) ─────────────────────────────────────────
    for (const egg of props.easterEggs) {
      if (score >= egg.score && !shownEggIds.has(egg.id)) {
        shownEggIds.add(egg.id)
        activeEggs.push({ ...egg, x: CANVAS_W + 250, opacity: 0, fadeDir: 1 })
      }
    }

    // 이스터에그 이동 및 반짝임 업데이트
    for (const egg of activeEggs) {
      egg.x -= gameSpeed * 0.25   // 장애물의 1/4 속도로 천천히 이동

      // 등장: 우선 opacity 1까지 fade-in
      if (egg.fadeDir === 1) {
        egg.opacity = Math.min(egg.opacity + 0.02, 1.0)
        if (egg.opacity >= 1.0) egg.fadeDir = -1
      } else {
        // 반짝임: 0.35 ~ 1.0 진동
        egg.opacity += 0.025 * egg.fadeDir
        if (egg.opacity <= 0.35) { egg.opacity = 0.35; egg.fadeDir = 1 }
        if (egg.opacity >= 1.0)  { egg.opacity = 1.0;  egg.fadeDir = -1 }
      }
    }
    // 화면 완전히 벗어난 이스터에그 제거 (한 번 지나가면 끝)
    activeEggs = activeEggs.filter((e) => e.x + 400 > 0)

    // ── 장애물 생성 타이머 ────────────────────────────────────────────────────
    nextObstacleIn--
    if (nextObstacleIn <= 0) {
      spawnObstacle()
      const base = Math.floor(Math.random() * 60 + 70)
      nextObstacleIn = Math.max(base - Math.floor(gameSpeed * 2), 45)
    }

    // 장애물 이동 및 제거
    for (const obs of obstacles) obs.x -= gameSpeed
    obstacles = obstacles.filter((o) => o.x + o.w > 0)

    // 충돌 감지
    if (!emittedGameover && obstacles.some(isColliding)) {
      emittedGameover = true
      gameState.value = 'dead'
      emit('gameover', score)
    }
  }

  draw()
  animId = requestAnimationFrame(gameLoop)
}

// ─── 입력 처리 ────────────────────────────────────────────────────────────────
function startOrJump() {
  if (gameState.value === 'ready') {
    initGame()
    gameState.value = 'playing'
    jump()
  } else if (gameState.value === 'playing') {
    jump()
  }
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

// 부모에서 호출
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
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  gap: 8px;
}
.game-canvas {
  border: 2px solid #ccc;
  border-radius: 8px;
  display: block;
  max-width: 100%;
}
.hint {
  margin: 0;
  font-size: 13px;
  color: #aaa;
}
</style>
