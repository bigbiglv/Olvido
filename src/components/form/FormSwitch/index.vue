<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core'
import { computed } from 'vue'
import type { HTMLAttributes } from 'vue'

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch, type SwitchProps } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useFormFieldLabel } from '../useFormFieldLabel'
import {
  getFieldValidationProps,
  useResolvedFormValidationMode,
  type FormValidationMode,
} from '../validation'

interface FormSwitchProps extends Omit<SwitchProps, 'defaultValue' | 'modelValue'> {
  class?: HTMLAttributes['class']
  description?: string
  label?: string
  name: string
  switchClass?: HTMLAttributes['class']
  validationMode?: FormValidationMode
}

const props = withDefaults(
  defineProps<FormSwitchProps>(),
  {
    class: undefined,
    description: undefined,
    disabled: false,
    label: undefined,
    switchClass: undefined,
    validationMode: undefined,
  },
)

const switchProps = reactiveOmit(
  props,
  'class',
  'description',
  'label',
  'name',
  'switchClass',
  'validationMode',
)
const validationMode = useResolvedFormValidationMode(() => props.validationMode)
const fieldValidationProps = computed(() => getFieldValidationProps(validationMode.value))

useFormFieldLabel(() => ({
  label: props.label,
  name: props.name,
}))
</script>

<template>
  <FormField
    v-slot="{ errorMessage, handleChange, value }"
    :name="name"
    v-bind="fieldValidationProps"
  >
    <FormItem class="gap-3" :class="props.class">
      <div
        :class="
          cn(
            'flex items-center justify-between gap-4 rounded-md border border-border bg-background p-4',
            errorMessage && 'border-destructive',
          )
        "
      >
        <div class="flex flex-col gap-1.5">
          <FormLabel v-if="label">{{ label }}</FormLabel>
          <FormDescription v-if="description">{{ description }}</FormDescription>
        </div>
        <FormControl>
          <Switch
            v-bind="switchProps"
            :class="switchClass"
            :model-value="Boolean(value)"
            @update:model-value="handleChange"
          />
        </FormControl>
      </div>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
