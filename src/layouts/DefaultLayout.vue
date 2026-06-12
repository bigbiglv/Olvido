<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'

import { Clapperboard, Sparkles } from 'lucide-vue-next'

import LanguageSwitch from '@/components/common/LanguageSwitch/index.vue'
import ThemeSwitch from '@/components/common/ThemeSwitch/index.vue'
</script>

<template>
  <div class="min-h-svh bg-background text-foreground">
    <header class="border-b border-border/70 bg-background/80 backdrop-blur">
      <div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <RouterLink
          to="/"
          class="flex items-center gap-2 text-sm font-semibold text-foreground"
          :aria-label="$t('layout.default.brandHome')"
        >
          <span
            class="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
          >
            <Clapperboard class="size-5" />
          </span>
          <span>{{ $t('app.name') }}</span>
        </RouterLink>

        <div class="flex items-center gap-3">
          <div class="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <Sparkles class="size-4 text-primary" />
            <span>{{ $t('app.slogan') }}</span>
          </div>
          <ThemeSwitch />
          <LanguageSwitch />
        </div>
      </div>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>
