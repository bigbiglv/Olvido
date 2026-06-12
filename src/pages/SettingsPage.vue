<script setup lang="ts">
import ThemeSwitch from '@/components/common/ThemeSwitch/index.vue'
import LanguageSwitch from '@/components/common/LanguageSwitch/index.vue'
import { useDocumentsStore } from '@/stores/documents'
import { Database, HardDrive, Info, Languages, Palette } from 'lucide-vue-next'

const store = useDocumentsStore()
</script>

<template>
  <div class="h-full flex-1 bg-slate-50/50 dark:bg-zinc-900/50 p-8 overflow-y-auto">
    <div class="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50">
          {{ $t('taskly.systemSettings') }}
        </h1>
        <p class="text-sm text-slate-500 dark:text-zinc-400 mt-2">
          {{ $t('taskly.settingsDescription') }}
        </p>
      </div>

      <div class="grid gap-6">
        <!-- 界面与主题 -->
        <div class="bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700/60 shadow-sm p-6 space-y-6">
          <div class="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-700 pb-3">
            <Palette class="size-5 text-violet-500" />
            <h2 class="text-lg font-semibold text-slate-800 dark:text-zinc-100">
              {{ $t('taskly.appearanceTitle') }}
            </h2>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-slate-700 dark:text-zinc-200">
                {{ $t('taskly.systemThemeLabel') }}
              </div>
              <div class="text-xs text-slate-400 dark:text-zinc-450 mt-0.5">
                {{ $t('taskly.systemThemeDesc') }}
              </div>
            </div>
            <ThemeSwitch />
          </div>
        </div>

        <!-- 语言设置 -->
        <div class="bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700/60 shadow-sm p-6 space-y-6">
          <div class="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-700 pb-3">
            <Languages class="size-5 text-indigo-500" />
            <h2 class="text-lg font-semibold text-slate-800 dark:text-zinc-100">
              {{ $t('taskly.languageTitle') }}
            </h2>
          </div>
          <div class="flex items-center justify-between">
            <div>
              <div class="font-medium text-slate-700 dark:text-zinc-200">
                {{ $t('taskly.languageLabel') }}
              </div>
              <div class="text-xs text-slate-400 dark:text-zinc-450 mt-0.5">
                {{ $t('taskly.languageDesc') }}
              </div>
            </div>
            <LanguageSwitch />
          </div>
        </div>

        <!-- 数据库状态 -->
        <div class="bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700/60 shadow-sm p-6 space-y-6">
          <div class="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-700 pb-3">
            <Database class="size-5 text-emerald-500" />
            <h2 class="text-lg font-semibold text-slate-800 dark:text-zinc-100">
              {{ $t('taskly.storageTitle') }}
            </h2>
          </div>
          <div class="space-y-4">
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-500 dark:text-zinc-400">
                {{ $t('taskly.dbStatusLabel') }}
              </span>
              <span class="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <span class="h-2 size-2 rounded-full bg-emerald-500"></span>
                {{ store.dbStatus }}
              </span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-500 dark:text-zinc-400">
                {{ $t('taskly.dbRecordCountLabel') }}
              </span>
              <span class="font-medium text-slate-700 dark:text-zinc-200 font-mono">
                {{ $t('taskly.docsCountLabel', { count: store.documents.length }) }}
              </span>
            </div>
            <div class="flex justify-between items-center text-sm">
              <span class="text-slate-500 dark:text-zinc-400">
                {{ $t('taskly.localPersistenceLabel') }}
              </span>
              <span class="text-slate-700 dark:text-zinc-200 flex items-center gap-1">
                <HardDrive class="size-4 text-slate-400" />
                <span>{{ $t('taskly.autoEnabledLabel') }}</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 关于应用 -->
        <div class="bg-white dark:bg-zinc-800 rounded-xl border border-slate-200 dark:border-zinc-700/60 shadow-sm p-6 space-y-4">
          <div class="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-700 pb-3">
            <Info class="size-5 text-blue-500" />
            <h2 class="text-lg font-semibold text-slate-800 dark:text-zinc-100">
              {{ $t('taskly.aboutTitle') }}
            </h2>
          </div>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-slate-500 dark:text-zinc-400">
                {{ $t('taskly.softwareVersionLabel') }}
              </span>
              <span class="font-mono text-slate-700 dark:text-zinc-200">
                {{ $t('taskly.versionValue') }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500 dark:text-zinc-400">
                {{ $t('taskly.underlyingTechLabel') }}
              </span>
              <span class="text-slate-700 dark:text-zinc-200 text-right">
                {{ $t('taskly.techValue') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
