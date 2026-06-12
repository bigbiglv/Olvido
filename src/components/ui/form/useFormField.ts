import { FieldContextKey } from 'vee-validate'
import { computed, inject } from 'vue'

import { FORM_ITEM_INJECTION_KEY } from './injectionKeys'

export function useFormField() {
  const fieldContext = inject(FieldContextKey)
  const fieldItemContext = inject(FORM_ITEM_INJECTION_KEY)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  if (!fieldItemContext) {
    throw new Error('useFormField should be used within <FormItem>')
  }

  const { errorMessage: error, meta, name } = fieldContext

  return {
    error,
    formDescriptionId: `${fieldItemContext}-form-item-description`,
    formItemId: `${fieldItemContext}-form-item`,
    formMessageId: `${fieldItemContext}-form-item-message`,
    id: fieldItemContext,
    isDirty: computed(() => meta.dirty),
    isTouched: computed(() => meta.touched),
    name,
    valid: computed(() => meta.valid),
  }
}
