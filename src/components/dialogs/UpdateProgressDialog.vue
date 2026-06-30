<script setup lang="ts">
import { type DialogOptions } from '@/components/dialog'
import { useDialog } from '@/components/dialog/hooks/useDialog'
import { Button } from '@/components/ui/button'
import { useAutoUpdater } from '@/composables/useAutoUpdater'
import { Download } from 'lucide-vue-next'
import { watch } from 'vue'

defineOptions({
  dialogOptions: {
    title: '更新下载中',
    footer: false,
    width: 400,
    height: 200,
    maskClosable: false,
    closeOnEsc: false,
  } as DialogOptions,
})

const { cancel } = useDialog()
const { downloadProgress, isDownloading, cancelDownload } = useAutoUpdater()

const handleCancel = () => {
  cancelDownload()
  cancel()
}

watch(isDownloading, (val) => {
  if (!val) {
    cancel()
  }
})
</script>

<template>
  <div class="px-5 py-6 flex flex-col items-center justify-center space-y-4">
    <div class="flex items-center justify-center size-12 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
      <Download class="size-6 animate-bounce" />
    </div>
    <div class="text-sm text-slate-700 dark:text-zinc-300 font-medium">
      正在下载新版本... {{ downloadProgress }}%
    </div>
    <div class="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-2">
      <div 
        class="h-full bg-blue-500 transition-all duration-300" 
        :style="{ width: `${downloadProgress}%` }"
      ></div>
    </div>
    <div class="w-full flex justify-end mt-4">
      <Button variant="outline" size="sm" @click="handleCancel">取消下载</Button>
    </div>
  </div>
</template>
