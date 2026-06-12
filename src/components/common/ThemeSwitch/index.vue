<script setup lang="ts">
import { computed, type Component } from 'vue'
import { useI18n } from 'vue-i18n'

import { Monitor, Moon, Sun } from 'lucide-vue-next'

import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app'
import { themeOptions } from '@/theme'
import type { ThemeMode, ThemeName } from '@/theme'

const appStore = useAppStore()
const { t } = useI18n()

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
  light: t('components.themeSwitch.modes.light'),
  dark: t('components.themeSwitch.modes.dark'),
  system: t('components.themeSwitch.modes.system'),
}))

const themeLabels = computed<Record<ThemeName, string>>(() => ({
  violet: t('components.themeSwitch.themes.violet'),
  blue: t('components.themeSwitch.themes.blue'),
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
  <div class="flex items-center gap-2">
    <div class="flex rounded-lg border border-border bg-card p-1">
      <button
        v-for="option in localizedThemeModeOptions"
        :key="option.value"
        type="button"
        :aria-label="t('components.themeSwitch.aria.switchMode', { mode: option.label })"
        :aria-pressed="appStore.themeMode === option.value"
        :class="
          cn(
            'inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors',
            appStore.themeMode === option.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )
        "
        @click="appStore.setThemeMode(option.value)"
      >
        <component :is="option.icon" class="size-4" />
        <span class="hidden md:inline">{{ option.label }}</span>
      </button>
    </div>

    <div class="flex rounded-lg border border-border bg-card p-1">
      <button
        v-for="option in localizedThemeOptions"
        :key="option.name"
        type="button"
        :aria-label="t('components.themeSwitch.aria.switchTheme', { theme: option.label })"
        :aria-pressed="appStore.themeName === option.name"
        :class="
          cn(
            'inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium transition-colors',
            appStore.themeName === option.name
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )
        "
        @click="appStore.setThemeName(option.name)"
      >
        <span
          class="size-3 rounded-full border border-border"
          :style="{ backgroundColor: option.previewPrimary }"
        />
        <span class="hidden lg:inline">{{ option.label }}</span>
      </button>
    </div>
  </div>
</template>
