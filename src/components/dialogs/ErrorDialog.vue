<script setup lang="ts">
import { useDialog, type DialogOptions } from '@/components/dialog'

defineOptions({
  dialogOptions: {
    title: '系统错误',
    width: 480,
    height: 'fit',
    resizable: false,
    draggable: true,
  } as DialogOptions,
})

const props = defineProps<{
  error: Error | string | unknown
}>()

const dialog = useDialog()

const getErrorMessage = (err: unknown) => {
  if (typeof err === 'string') return err
  if (err instanceof Error) return err.message
  if (err && typeof err === 'object' && 'message' in err) return String(err.message)
  return String(err)
}

const errorMessage = getErrorMessage(props.error)
const errorStack = props.error instanceof Error ? props.error.stack : ''

dialog.onConfirm(() => {
  return true
})
</script>

<template>
  <div class="space-y-4 py-4 max-w-full">
    <div class="text-sm text-foreground whitespace-pre-wrap break-words">
      发生了一个未预期的错误，请检查您的操作或联系开发者。
    </div>
    
    <div class="p-3 bg-muted rounded-md text-sm text-destructive font-mono overflow-auto max-h-[200px] break-words">
      {{ errorMessage }}
    </div>

    <div v-if="errorStack" class="text-xs text-muted-foreground whitespace-pre-wrap font-mono overflow-auto max-h-[150px]">
      {{ errorStack }}
    </div>
  </div>
</template>
