<template>
  <tr>
    <td>{{ student.id }}</td>
    <td>{{ student.name }}</td>
    <td>{{ student.email }}</td>
    <td>{{ student.team }}</td>
    <td>
      <a :href="student.githubURL" target="_blank">GitHub</a>
    </td>
  </tr>
</template>

<script setup>
defineProps({
  student: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
tr:hover {
  background-color: whitesmoke;
}

a {
  color: mediumseagreen;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
