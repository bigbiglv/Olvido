<script setup lang="ts">
import { ref } from 'vue'
import { useDialog, type DialogOptions } from '@/components/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

defineOptions({
  dialogOptions: {
    title: '重命名项目',
    width: 400,
    height: 200,
    resizable: false,
    draggable: true,
  } as DialogOptions,
})

const props = defineProps<{
  initialName: string
}>()

const dialog = useDialog<string>()
const name = ref(props.initialName)

dialog.onConfirm(() => {
  const trimmed = name.value.trim()
  if (!trimmed) return false
  return trimmed
})
</script>

<template>
  <div class="space-y-4 py-4">
    <div class="space-y-2">
      <Label for="projectName">项目名称</Label>
      <Input
        id="projectName"
        v-model="name"
        placeholder="请输入新的项目名称"
        class="w-full"
        autofocus
        @keyup.enter="dialog.submit(name.trim())"
      />
    </div>
  </div>
</template>
