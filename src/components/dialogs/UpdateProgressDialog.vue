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
    <div
      class="flex items-center justify-center size-12 rounded-full bg-primary/20 dark:bg-primary text-primary dark:text-primary"
    >
      <Download class="size-6 animate-bounce" />
    </div>
    <div class="text-sm text-foreground font-medium">正在下载新版本... {{ downloadProgress }}%</div>
    <div class="w-full h-2 bg-muted dark:bg-card rounded-full overflow-hidden mt-2">
      <div
        class="h-full bg-primary transition-all duration-300"
        :style="{ width: `${downloadProgress}%` }"
      ></div>
    </div>
    <div class="w-full flex justify-end mt-4">
      <Button variant="outline" size="sm" @click="handleCancel">取消下载</Button>
    </div>
  </div>
</template>
