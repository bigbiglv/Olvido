<script setup lang="ts">
import { computed, type Component } from 'vue'
import { Monitor, Moon, Sun } from 'lucide-vue-next'

import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app'
import { themeOptions } from '@/theme'
import type { ThemeMode, ThemeName } from '@/theme'

const appStore = useAppStore()

const themeModeOptions: Array<{
  value: ThemeMode
  icon: Component
}> = [
  {
    value: 'light',
    icon: Sun,
  },
  {
    value: 'dark',
    icon: Moon,
  },
  {
    value: 'system',
    icon: Monitor,
  },
]

const themeModeLabels = computed<Record<ThemeMode, string>>(() => ({
  light: '浅色',
  dark: '深色',
  system: '跟随系统',
}))

const themeLabels = computed<Record<ThemeName, string>>(() => ({
  violet: '远山紫',
  blue: '景泰蓝',
  emerald: '竹绿',
  carmine: '胭脂红',
  amber: '琥珀黄',
  slate: '水墨灰',
}))

const localizedThemeModeOptions = computed(() =>
  themeModeOptions.map((option) => ({
    ...option,
    label: themeModeLabels.value[option.value],
  })),
)

const localizedThemeOptions = computed(() =>
  themeOptions.map((option) => ({
    ...option,
    label: themeLabels.value[option.name],
  })),
)
</script>

<template>
  <div class="flex flex-col gap-2.5 items-end">
    <div class="flex rounded-lg border border-border bg-card p-1">
      <button
        v-for="option in localizedThemeModeOptions"
        :key="option.value"
        type="button"
        :aria-label="`切换到 ${option.label}`"
        :aria-pressed="appStore.themeMode === option.value"
        :class="
          cn(
            'inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors',
            appStore.themeMode === option.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )
        "
        @click.stop.prevent="appStore.setThemeMode(option.value)"
        @pointerdown.stop
      >
        <component :is="option.icon" class="size-4 pointer-events-none" />
        <span class="pointer-events-none">{{ option.label }}</span>
      </button>
    </div>

    <div class="flex flex-wrap justify-end gap-1 rounded-lg border border-border bg-card p-1 max-w-[200px]">
      <button
        v-for="option in localizedThemeOptions"
        :key="option.name"
        type="button"
        :aria-label="`切换到 ${option.label}`"
        :aria-pressed="appStore.themeName === option.name"
        :title="option.label"
        :class="
          cn(
            'inline-flex size-8 items-center justify-center rounded-md transition-colors',
            appStore.themeName === option.name
              ? 'bg-primary shadow-sm'
              : 'hover:bg-accent',
          )
        "
        @click.stop.prevent="appStore.setThemeName(option.name)"
        @pointerdown.stop
      >
        <span
          class="size-4 rounded-full border border-border/50 pointer-events-none shadow-sm"
          :style="{ backgroundColor: option.previewPrimary }"
        />
      </button>
    </div>
  </div>
</template>
