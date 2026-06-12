<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { LoaderCircle } from 'lucide-vue-next'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '../ui'
import type { DialogInstance } from '../types'
import { renderSlotValue } from '../utils'

defineProps<{
  instance: DialogInstance
}>()

const emit = defineEmits<{
  cancel: []
  submit: []
}>()

const { t } = useI18n()
</script>

<template>
  <DialogFooter v-if="instance.settings.footer" class="shrink-0 border-t border-border px-6 py-4">
    <component
      :is="{ render: () => renderSlotValue(instance.slots.footer) }"
      v-if="instance.slots.footer"
    />
    <template v-else>
      <Button
        variant="outline"
        v-bind="instance.settings.cancelButtonProps"
        @click="emit('cancel')"
      >
        {{ instance.settings.cancelText || t('components.dialog.cancel') }}
      </Button>
      <Button
        v-bind="instance.settings.okButtonProps"
        :disabled="instance.confirmLoading"
        @click="emit('submit')"
      >
        <LoaderCircle v-if="instance.confirmLoading" class="size-4 animate-spin" />
        {{ instance.settings.okText || t('components.dialog.ok') }}
      </Button>
    </template>
  </DialogFooter>
</template>
