import { onBeforeUnmount, watch } from 'vue'

import { registerZodFieldLabel } from '@/lib/zod-validation'

interface FormFieldLabelSource {
  label?: string
  name: string
}

export function useFormFieldLabel(getSource: () => FormFieldLabelSource) {
  let unregister: (() => void) | undefined

  watch(
    getSource,
    ({ label, name }) => {
      unregister?.()
      unregister = label ? registerZodFieldLabel(name, label) : undefined
    },
    {
      immediate: true,
    },
  )

  onBeforeUnmount(() => {
    unregister?.()
  })
}
