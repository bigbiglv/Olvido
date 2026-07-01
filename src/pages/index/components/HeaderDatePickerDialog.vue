<script setup lang="ts">
import { type DialogOptions } from '@/components/dialog'
import { useDialog } from '@/components/dialog/hooks/useDialog'
import DatePicker from '@/components/ui/datePicker/index.vue'

defineOptions({
  dialogOptions: {
    title: '日历',
    footer: false,
    width: '80%',
    height: '80%',
    draggable: true,
    closeOnEsc: true,
  } as DialogOptions,
})

const { cancel } = useDialog()
</script>

<template>
  <div class="flex justify-center items-center p-4 bg-white dark:bg-zinc-900 w-full h-full">
    <DatePicker size="large" :hide-confirm="true" :bordered="false" @confirm="cancel" />
  </div>
</template>
