<script setup lang="ts">
import dayjs from 'dayjs'
import { ref } from 'vue'

const year = ref(dayjs().year())
const month = ref(dayjs().month() + 1)
const day = ref(dayjs().date())
</script>

<template>
  <div class="flex gap-1">
    <button class="hover:bg-amber-50">{{ year }}</button>
    <button>{{ month }}</button>
    <button>{{ day }}</button>
  </div>
</template>

<style scoped></style>
