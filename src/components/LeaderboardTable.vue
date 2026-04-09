<template>
  <table class="leaderboard-table">
    <thead>
      <tr>
        <th>순위</th>
        <th>이름</th>
        <th>점수</th>
        <th>날짜</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(entry, index) in scores"
        :key="entry.id"
        :class="rankClass(index)"
      >
        <td class="rank">{{ rankLabel(index) }}</td>
        <td class="name">{{ entry.name }}</td>
        <td class="score">{{ entry.score.toLocaleString() }}</td>
        <td class="date">{{ formatDate(entry.playedAt) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
defineProps({
  scores: { type: Array, required: true },
})

function rankClass(index) {
  if (index === 0) return 'rank-gold'
  if (index === 1) return 'rank-silver'
  if (index === 2) return 'rank-bronze'
  return ''
}

function rankLabel(index) {
  return `${index + 1}위`
}

function formatDate(iso) {
  const d = new Date(iso)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}.${mm}.${dd} ${hh}:${min}`
}
</script>

<style scoped>
.leaderboard-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
}

th,
td {
  padding: 14px 18px;
  border-bottom: 1px solid #eee;
  text-align: center;
}

th {
  background: mediumseagreen;
  color: white;
  font-weight: bold;
  font-size: 15px;
}

.rank {
  font-weight: bold;
  color: #555;
}

.name {
  font-weight: bold;
}

.score {
  font-family: monospace;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.date {
  color: #999;
  font-size: 14px;
}

tr.rank-gold {
  background: #fffbea;
}
tr.rank-gold .rank {
  color: #b8860b;
}

tr.rank-silver {
  background: #f7f7f7;
}
tr.rank-silver .rank {
  color: #777;
}

tr.rank-bronze {
  background: #fff5ef;
}
tr.rank-bronze .rank {
  color: #b5651d;
}

tbody tr:hover {
  background: #f0faf5;
}
</style>
