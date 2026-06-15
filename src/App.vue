<script setup lang="ts">
import HomePage from '@/pages/index/index.vue'
import { Container as ConfirmContainer } from '@/components/confirm'
import { Container as DialogContainer } from '@/components/dialog'

// 全局右键菜单渲染层
import { ContextMenu } from '@/context-menu'
</script>

<template>
  <HomePage />
  <DialogContainer />
  <ConfirmContainer />
  <ContextMenu />
</template>
