<script setup lang="ts">
import { computed } from 'vue'

import { Confirm } from '../manager'
import Wrapper from './Wrapper.vue'

const topInstanceId = computed(() => {
  const instances = Confirm.stack.filter((instance) => instance.open)
  return instances.at(-1)?.id
})
</script>

<template>
  <Wrapper
    v-for="(instance, index) in Confirm.stack"
    :key="instance.id"
    :instance="instance"
    :index="index"
    :is-topmost="instance.id === topInstanceId"
  />
</template>
