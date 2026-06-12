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
import { Input, type InputProps } from '@/components/ui/input'
import { useFormFieldLabel } from '../useFormFieldLabel'
import {
  getFieldValidationProps,
  useResolvedFormValidationMode,
  type FormValidationMode,
} from '../validation'

interface FormInputProps extends Omit<InputProps, 'class' | 'defaultValue' | 'modelValue'> {
  autocomplete?: string
  class?: HTMLAttributes['class']
  description?: string
  inputClass?: HTMLAttributes['class']
  label?: string
  name: string
  placeholder?: string
  validationMode?: FormValidationMode
}

const props = withDefaults(
  defineProps<FormInputProps>(),
  {
    autocomplete: undefined,
    class: undefined,
    clearable: false,
    description: undefined,
    disabled: false,
    inputClass: undefined,
    label: undefined,
    placeholder: undefined,
    showPasswordToggle: false,
    type: 'text',
    validationMode: undefined,
  },
)

const inputProps = reactiveOmit(
  props,
  'class',
  'description',
  'inputClass',
  'label',
  'name',
  'placeholder',
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
        <Input
          v-bind="{ ...inputProps, ...componentField }"
          :class="inputClass"
          :placeholder="resolvedPlaceholder"
        />
      </FormControl>
      <FormDescription v-if="description">{{ description }}</FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
