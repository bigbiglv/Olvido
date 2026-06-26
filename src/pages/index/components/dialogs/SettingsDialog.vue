<script setup lang="ts">
import { type DialogOptions } from '@/components/dialog'
import ThemeSwitch from '@/components/common/ThemeSwitch/index.vue'
import { Info, Palette } from 'lucide-vue-next'

defineOptions({
  dialogOptions: {
    title: '系统设置',
    footer: false,
    width: 680,
    height: 520,
  } as DialogOptions,
})
</script>

<template>
  <div class="pt-2 px-1 pb-4">
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
          <div class="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-colors">
            <div>
              <div class="text-sm font-medium text-slate-900 dark:text-zinc-200">系统主题</div>
              <div class="text-[13px] text-slate-500 dark:text-zinc-450 mt-0.5">选择深色、浅色或跟随系统</div>
            </div>
            <ThemeSwitch />
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
            <div class="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-colors border-b border-slate-100 dark:border-white/5">
              <span class="text-sm text-slate-600 dark:text-zinc-400">软件版本</span>
              <span class="text-xs font-mono tabular-nums font-medium text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-700/50 px-2 py-1 rounded-md">v1.0.0 (Beta)</span>
            </div>
            <div class="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/80 transition-colors">
              <span class="text-sm text-slate-600 dark:text-zinc-400">底层技术</span>
              <span class="text-[13px] text-slate-800 dark:text-zinc-200 font-medium tracking-tight">Electron + Vue&nbsp;3 + Prisma + SQLite</span>
            </div>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>
