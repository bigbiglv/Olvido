<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { Languages } from 'lucide-vue-next'

import type { Locale } from '@/i18n'
import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const { t } = useI18n()

const currentLocale = computed({
  get: () => appStore.locale,
  set: (value: Locale) => {
    appStore.setLocale(value)
  },
})

const localeOptions = computed(
  () =>
    [
      {
        value: 'zh-CN',
        label: t('components.languageSwitch.options.zh-CN'),
      },
      {
        value: 'zh-HK',
        label: t('components.languageSwitch.options.zh-HK'),
      },
      {
        value: 'en-US',
        label: t('components.languageSwitch.options.en-US'),
      },
    ] satisfies Array<{
      value: Locale
      label: string
    }>,
)
</script>

<template>
  <label
    class="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"
  >
    <Languages class="size-4 text-muted-foreground" />
    <select
      v-model="currentLocale"
      class="bg-transparent text-sm outline-none"
      :aria-label="t('components.languageSwitch.label')"
    >
      <option v-for="option in localeOptions" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </label>
</template>
