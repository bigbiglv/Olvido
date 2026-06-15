import { computed, inject, provide, type ComputedRef } from 'vue'
import type { InjectionKey } from 'vue'

export type FormValidationMode = 'input' | 'submit'

const FORM_VALIDATION_MODE_KEY: InjectionKey<ComputedRef<FormValidationMode>> =
  Symbol('FORM_VALIDATION_MODE')

export function provideFormValidationMode(getMode: () => FormValidationMode | undefined) {
  provide(
    FORM_VALIDATION_MODE_KEY,
    computed(() => getMode() ?? 'input'),
  )
}

export function useResolvedFormValidationMode(getMode: () => FormValidationMode | undefined) {
  const injectedMode = inject(FORM_VALIDATION_MODE_KEY, undefined)

  return computed(() => getMode() ?? injectedMode?.value ?? 'input')
}

export function getFieldValidationProps(mode: FormValidationMode) {
  const shouldValidateOnUpdate = mode === 'input'

  // submit 模式关闭字段级触发，保留 handleSubmit 时的整表校验。
  return {
    validateOnBlur: shouldValidateOnUpdate,
    validateOnChange: shouldValidateOnUpdate,
    validateOnInput: shouldValidateOnUpdate,
    validateOnModelUpdate: shouldValidateOnUpdate,
  }
}
