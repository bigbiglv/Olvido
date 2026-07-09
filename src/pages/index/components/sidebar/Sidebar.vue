<script setup lang="ts">
import { Dialog } from '@/components/dialog'
import SettingsDialog from '@/pages/index/components/dialogs/SettingsDialog.vue'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-vue-next'
import SidebarNav from './SidebarNav.vue'

/**
 * 打开系统设置对话框
 */
function handleOpenSettings() {
  Dialog.show(SettingsDialog)
}
</script>

<template>
  <aside class="bg-muted/70 dark:bg-background flex flex-col h-full select-none">
    <!-- Brand Logo -->
    <div
      class="h-16 flex items-center px-6 gap-2 border-b border-border bg-card/40 dark:bg-transparent"
    >
      <img
        src="/logo.png"
        alt="Logo"
        class="size-9 rounded-xl object-contain shadow-sm border border-border"
      />
      <span class="text-xl font-bold tracking-tight text-foreground">Olvido</span>
    </div>

    <!-- Sidebar Navigation (Global Notebook & Projects) -->
    <SidebarNav />

    <!-- Bottom Settings Link -->
    <div class="p-4 border-t border-border bg-card/10 dark:bg-transparent">
      <Button
        variant="ghost"
        class="w-full justify-start gap-3 px-3 py-2 text-sm font-semibold rounded-xl transition-all text-left text-muted-foreground hover:bg-muted dark:hover:bg-muted hover:text-foreground dark:hover:text-foreground border-0 bg-transparent"
        @click="handleOpenSettings"
      >
        <Settings class="size-4.5" />
        <span>设置</span>
      </Button>
    </div>
  </aside>
</template>
