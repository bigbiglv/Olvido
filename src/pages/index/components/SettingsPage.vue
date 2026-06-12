<script setup lang="ts">
import ThemeSwitch from '@/components/common/ThemeSwitch/index.vue'
import { useDocumentsStore } from '@/stores/documents'
import { Database, HardDrive, Info, Palette } from 'lucide-vue-next'

const store = useDocumentsStore()
</script>

<template>
  <div class="space-y-6">
    <div class="grid gap-6">
      <!-- 界面与主题 -->
      <div class="bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700/60 shadow-sm p-6 space-y-6">
        <div class="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-700 pb-3">
          <Palette class="size-5 text-violet-500" />
          <h2 class="text-lg font-semibold text-slate-800 dark:text-zinc-100">
            界面与主题
          </h2>
        </div>
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-slate-700 dark:text-zinc-200">
              系统主题
            </div>
            <div class="text-xs text-slate-400 dark:text-zinc-450 mt-0.5">
              选择深色、浅色或跟随系统
            </div>
          </div>
          <ThemeSwitch />
        </div>
      </div>

      <!-- 数据库状态 -->
      <div class="bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700/60 shadow-sm p-6 space-y-6">
        <div class="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-700 pb-3">
          <Database class="size-5 text-emerald-500" />
          <h2 class="text-lg font-semibold text-slate-800 dark:text-zinc-100">
            数据与存储
          </h2>
        </div>
        <div class="space-y-4">
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-500 dark:text-zinc-400">
              数据库状态
            </span>
            <span class="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <span class="h-2 size-2 rounded-full bg-emerald-500"></span>
              {{ store.dbStatus }}
            </span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-500 dark:text-zinc-400">
              文档数量
            </span>
            <span class="font-medium text-slate-700 dark:text-zinc-200 font-mono">
              {{ store.documents.length }} 篇
            </span>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="text-slate-500 dark:text-zinc-400">
              本地持久化
            </span>
            <span class="text-slate-700 dark:text-zinc-200 flex items-center gap-1">
              <HardDrive class="size-4 text-slate-400" />
              <span>自动启用</span>
            </span>
          </div>
        </div>
      </div>

      <!-- 关于应用 -->
      <div class="bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700/60 shadow-sm p-6 space-y-4">
        <div class="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-700 pb-3">
          <Info class="size-5 text-blue-500" />
          <h2 class="text-lg font-semibold text-slate-800 dark:text-zinc-100">
            关于应用
          </h2>
        </div>
        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-zinc-400">
              软件版本
            </span>
            <span class="font-mono text-slate-700 dark:text-zinc-200">
              v1.0.0 (Beta)
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 dark:text-zinc-400">
              底层技术
            </span>
            <span class="text-slate-700 dark:text-zinc-200 text-right">
              Electron + Vue 3 + Prisma + SQLite
            </span>
          </div>
        </div>
      </div>
    </div>
  </div></template>
