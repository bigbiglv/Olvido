<script setup lang="ts">
import { computed } from 'vue'
import { LoaderCircle } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { Confirm } from '../manager'
import type { ConfirmInstance } from '../types'

const props = defineProps<{
  instance: ConfirmInstance
  index: number
  isTopmost: boolean
}>()

const confirmInstance = props.instance
const baseZIndex = computed(() => 2000 + props.index * 2)
const overlayStyle = computed(() => ({ zIndex: baseZIndex.value }))
const contentStyle = computed(() => ({ zIndex: baseZIndex.value + 1 }))
const confirmVariant = computed(() =>
  confirmInstance.options.destructive ? 'destructive' : 'default',
)

function preventClose(event: Event) {
  event.preventDefault()
}

async function cancel() {
  if (!props.isTopmost || confirmInstance.confirmLoading) return

  const canceled = await confirmInstance.options.onCancel?.()
  if (canceled === false) return

  confirmInstance.resolve(false)
  Confirm.close(confirmInstance.id)
}

async function submit() {
  if (!props.isTopmost || confirmInstance.confirmLoading) return

  confirmInstance.confirmLoading = true
  try {
    const confirmed = await confirmInstance.options.onConfirm?.()
    if (confirmed === false) return

    confirmInstance.resolve(true)
    Confirm.close(confirmInstance.id)
  } catch (error) {
    confirmInstance.reject(error)
    Confirm.close(confirmInstance.id)
  } finally {
    confirmInstance.confirmLoading = false
  }
}

function handleOpenChange(open: boolean) {
  if (open || !props.isTopmost) return
  void cancel()
}

function handlePointerDownOutside(event: Event) {
  if (!props.isTopmost || !confirmInstance.options.maskClosable) {
    preventClose(event)
  }
}
</script>

<template>
  <AlertDialog :open="instance.open" @update:open="handleOpenChange">
    <AlertDialogContent
      :style="contentStyle"
      :overlay-style="overlayStyle"
      @escape-key-down="!instance.options.closeOnEsc && preventClose($event)"
      @pointer-down-outside="handlePointerDownOutside"
      @interact-outside="handlePointerDownOutside"
    >
      <AlertDialogHeader>
        <AlertDialogTitle>
          {{ instance.options.title || '确认' }}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {{ instance.options.description || '确定要执行此操作吗？' }}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <Button
          variant="outline"
          v-bind="instance.options.cancelButtonProps"
          :disabled="instance.confirmLoading"
          @click="cancel"
        >
          {{ instance.options.cancelText || '取消' }}
        </Button>
        <Button
          :variant="confirmVariant"
          v-bind="instance.options.okButtonProps"
          :disabled="instance.confirmLoading"
          @click="submit"
        >
          <LoaderCircle v-if="instance.confirmLoading" class="size-4 animate-spin" />
          {{ instance.options.okText || '确定' }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
