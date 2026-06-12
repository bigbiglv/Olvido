import type { LabelProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'

export { default as FormControl } from './components/Control.vue'
export { default as FormDescription } from './components/Description.vue'
export { default as FormItem } from './components/Item.vue'
export { default as FormLabel } from './components/Label.vue'
export { default as FormMessage } from './components/Message.vue'
export { FORM_ITEM_INJECTION_KEY } from './injectionKeys'
export { Field as FormField, FieldArray as FormFieldArray, Form } from 'vee-validate'

export interface FormDescriptionProps {
  class?: HTMLAttributes['class']
}

export interface FormItemProps {
  class?: HTMLAttributes['class']
}

export interface FormLabelProps extends LabelProps {
  class?: HTMLAttributes['class']
}
