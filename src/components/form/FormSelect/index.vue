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
import {
  Select,
  SelectContent,
  SelectItem,
  type SelectProps,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFormFieldLabel } from '../useFormFieldLabel'
import {
  getFieldValidationProps,
  useResolvedFormValidationMode,
  type FormValidationMode,
} from '../validation'

export interface FormSelectOption {
  disabled?: boolean
  label: string
  value: string
}

interface FormSelectProps extends Omit<SelectProps, 'defaultValue' | 'modelValue' | 'name'> {
  class?: HTMLAttributes['class']
  clearable?: boolean
  description?: string
  label?: string
  name: string
  options: FormSelectOption[]
  placeholder?: string
  triggerClass?: HTMLAttributes['class']
  validationMode?: FormValidationMode
}

const props = withDefaults(
  defineProps<FormSelectProps>(),
  {
    class: undefined,
    clearable: true,
    description: undefined,
    disabled: false,
    label: undefined,
    placeholder: undefined,
    triggerClass: undefined,
    validationMode: undefined,
  },
)

const selectProps = reactiveOmit(
  props,
  'class',
  'clearable',
  'description',
  'label',
  'name',
  'options',
  'placeholder',
  'triggerClass',
  'validationMode',
  'open',
  'defaultOpen',
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

  return props.label
    ? `请选择${props.label}`
    : '请选择'
})
</script>

<template>
  <FormField v-slot="{ componentField }" :name="name" v-bind="fieldValidationProps">
    <FormItem :class="props.class">
      <FormLabel v-if="label">{{ label }}</FormLabel>
      <Select v-bind="{ ...selectProps, ...componentField }">
        <FormControl>
          <SelectTrigger
            :clearable="clearable"
            :class="triggerClass"
            :disabled="props.disabled"
          >
            <SelectValue :placeholder="resolvedPlaceholder" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem
            v-for="option in options"
            :key="option.value"
            :disabled="option.disabled"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
      <FormDescription v-if="description">{{ description }}</FormDescription>
      <FormMessage />
    </FormItem>
  </FormField>
</template>
