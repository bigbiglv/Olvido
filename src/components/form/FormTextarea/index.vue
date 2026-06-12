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
import { Textarea, type TextareaProps } from '@/components/ui/textarea'
import { useFormFieldLabel } from '../useFormFieldLabel'
import {
  getFieldValidationProps,
  useResolvedFormValidationMode,
  type FormValidationMode,
} from '../validation'

interface FormTextareaProps
  extends Omit<TextareaProps, 'class' | 'defaultValue' | 'modelValue'> {
  class?: HTMLAttributes['class']
  description?: string
  label?: string
  name: string
  placeholder?: string
  rows?: number
  textareaClass?: HTMLAttributes['class']
  validationMode?: FormValidationMode
}

const props = withDefaults(
  defineProps<FormTextareaProps>(),
  {
    class: undefined,
    clearable: false,
    description: undefined,
    disabled: false,
    label: undefined,
    maxlength: undefined,
    placeholder: undefined,
    rows: 4,
    showCount: false,
    textareaClass: undefined,
    validationMode: undefined,
  },
)

const textareaProps = reactiveOmit(
  props,
  'class',
  'description',
  'label',
  'name',
  'placeholder',
  'textareaClass',
  'validationMode',
)
const validationMode = useResolvedFormValidationMode(() => props.validationMode)
const fieldValidationProps = computed(() => getFieldValidationProps(validationMode.value))

useFormFieldLabel(() => ({
  label: props.label,
  name: props.name,
}))

const resolvedPlaceholder = computed(() => {
  if (props.placeholder !== undefined) {
    return props.placeholder
  }

  return props.label ? `请输入${props.label}` : '请输入'
})
</script>

<template>
  <FormField v-slot="{ componentField }" :name="name" v-bind="fieldValidationProps">
    <FormItem :class="props.class">
      <FormLabel v-if="label">{{ label }}</FormLabel>
      <FormControl>
        <Textarea
          v-bind="{ ...textareaProps, ...componentField }"
          :class="textareaClass"
          :placeholder="resolvedPlaceholder"
        />
      </FormControl>
      <FormDescription v-if="description">{{ description }}</FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
