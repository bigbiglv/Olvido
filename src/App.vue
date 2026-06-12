<script setup lang="ts">
import { Container as ConfirmContainer } from '@/components/confirm'
import { Container as DialogContainer } from '@/components/dialog'
</script>

<template>
  <RouterView />
  <DialogContainer />
  <ConfirmContainer />
</template>
