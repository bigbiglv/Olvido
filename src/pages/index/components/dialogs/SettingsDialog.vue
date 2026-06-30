import { ref, onMounted } from 'vue'
import { type DialogOptions } from '@/components/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import ThemeSwitch from '@/components/common/ThemeSwitch/index.vue'
import { Info, Palette, Calendar, RefreshCw, Download, Zap } from 'lucide-vue-next'
import dayjs from 'dayjs'
import { useAutoUpdater } from '@/composables/useAutoUpdater'

defineOptions({
  dialogOptions: {
    title: '系统设置',
    footer: false,
    width: 680,
    height: 520,
  } as DialogOptions,
})

const version = __APP_VERSION__
const releaseTime = ref<string>('')

const { 
  autoUpdateEnabled, 
  isCheckingUpdate, 
  downloadProgress, 
  isDownloading, 
  checkUpdate 
} = useAutoUpdater()

const handleCheckUpdate = () => {
  checkUpdate(true)
}

onMounted(async () => {
  if (version === '0.0.0') return
  try {
    const res = await fetch(`https://api.github.com/repos/bigbiglv/Olvido/releases/tags/v${version}`)
    if (res.ok) {
      const data = await res.json()
      if (data.published_at) {
        releaseTime.value = dayjs(data.published_at).format('YYYY-MM-DD HH:mm')
      }
    }
  } catch (error) {
    console.error('Failed to fetch release info:', error)
  }
})
</script>

<template>
  <div class="px-5 py-4">
    <div class="space-y-8">

      <!-- 界面与主题 -->
      <section>
        <div class="flex items-center gap-2.5 px-1 mb-3">
          <div class="flex items-center justify-center size-7 rounded-lg bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
            <Palette class="size-4" aria-hidden="true" />
          </div>
          <h2 class="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">界面与主题</h2>
        </div>
        <div class="bg-white dark:bg-zinc-800/60 rounded-2xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-colors duration-200">
            <div>
              <div class="text-sm font-medium text-slate-900 dark:text-zinc-200">系统主题</div>
              <div class="text-[13px] text-slate-500 dark:text-zinc-450 mt-0.5">选择深色、浅色或跟随系统</div>
            </div>
            <ThemeSwitch />
          </div>
        </div>
      </section>

      <!-- 高级设置 -->
      <section>
        <div class="flex items-center gap-2.5 px-1 mb-3">
          <div class="flex items-center justify-center size-7 rounded-lg bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
            <Zap class="size-4" aria-hidden="true" />
          </div>
          <h2 class="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">高级设置</h2>
        </div>
        <div class="bg-white dark:bg-zinc-800/60 rounded-2xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm overflow-hidden">
          <div class="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-colors duration-200">
            <div>
              <div class="text-sm font-medium text-slate-900 dark:text-zinc-200">自动检查更新</div>
              <div class="text-[13px] text-slate-500 dark:text-zinc-450 mt-0.5">每次启动应用时自动检查并提示新版本</div>
            </div>
            <Switch v-model:checked="autoUpdateEnabled" />
          </div>
        </div>
      </section>

      <!-- 关于应用 -->
      <section>
        <div class="flex items-center gap-2.5 px-1 mb-3">
          <div class="flex items-center justify-center size-7 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
            <Info class="size-4" aria-hidden="true" />
          </div>
          <h2 class="text-sm font-semibold text-slate-900 dark:text-zinc-100 tracking-tight">关于应用</h2>
        </div>
        <div class="bg-white dark:bg-zinc-800/60 rounded-2xl ring-1 ring-slate-200 dark:ring-white/10 shadow-sm overflow-hidden">
          <div class="flex flex-col">
            <div class="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/5">
              <span class="text-sm text-slate-600 dark:text-zinc-400">软件版本</span>
              <div class="flex items-center gap-3">
                <div v-if="isDownloading" class="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
                  <Download class="size-3.5 animate-bounce" />
                  <span>下载中 {{ downloadProgress }}%</span>
                </div>
                <Button 
                  v-else
                  variant="outline" 
                  size="sm" 
                  class="h-7 px-2.5 text-xs bg-white dark:bg-zinc-800" 
                  :disabled="isCheckingUpdate || isDownloading" 
                  @click="handleCheckUpdate"
                >
                  <RefreshCw class="size-3 mr-1.5" :class="{ 'animate-spin': isCheckingUpdate }" />
                  {{ isCheckingUpdate ? '正在检查...' : '检查更新' }}
                </Button>
                <span class="text-xs font-mono tabular-nums font-medium text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-700/50 px-2 py-1 rounded-md">v{{ version }}</span>
              </div>
            </div>
            <div class="flex items-center justify-between p-4" v-if="releaseTime">
              <span class="text-sm text-slate-600 dark:text-zinc-400">更新时间</span>
              <div class="flex items-center gap-1.5 text-xs font-mono tabular-nums text-slate-500 dark:text-zinc-400">
                <Calendar class="size-3.5" />
                <span>{{ releaseTime }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>
