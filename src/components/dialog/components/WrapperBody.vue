<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'

import type { DialogInstance } from '../types'

defineProps<{
  instance: DialogInstance
}>()
</script>

<template>
  <div class="relative min-h-0 flex-1 overflow-auto px-6 py-4">
    <div
      v-if="instance.loading"
      class="absolute inset-0 flex items-center justify-center bg-background/80"
    >
      <LoaderCircle class="size-5 animate-spin text-muted-foreground" />
    </div>
    <component :is="instance.component" v-bind="instance.componentProps" />
  </div>
</template>
