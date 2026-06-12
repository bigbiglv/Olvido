<script setup lang="ts">
import { computed } from 'vue'

import { Dialog } from '../manager'
import Wrapper from './Wrapper.vue'

const topInstanceId = computed(() => {
  const instances = Dialog.stack.filter((instance) => instance.open)
  return instances.at(-1)?.id
})
</script>

<template>
  <Wrapper
    v-for="instance in Dialog.stack"
    :key="instance.id"
    :instance="instance"
    :is-topmost="instance.id === topInstanceId"
  />
</template>
