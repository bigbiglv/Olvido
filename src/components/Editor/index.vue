<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { Crepe } from '@milkdown/crepe'
import { replaceAll } from '@milkdown/kit/utils'
import { $prose } from '@milkdown/kit/utils'
import { Plugin } from '@milkdown/kit/prose/state'
import '@milkdown/crepe/theme/common/style.css'
import '@milkdown/crepe/theme/frame.css'

interface Props {
  modelValue?: string
  onlyOrderedList?: boolean
  autoFocus?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const { modelValue = '', onlyOrderedList = false, autoFocus = false } = defineProps<Props>()
const emit = defineEmits<Emits>()

const editorRef = ref<HTMLDivElement | null>(null)
let crepe: Crepe | null = null
const isUpdatingFromProp = ref(false)

function focus() {
  // Use a slight delay to ensure dialog transition or focus trap is complete
  setTimeout(() => {
    if (editorRef.value) {
      const prosemirror = editorRef.value.querySelector('.ProseMirror') as HTMLElement | null
      if (prosemirror) {
        prosemirror.focus()
        
        // Because Crepe uses custom list_item_block nodes, ProseMirror's Selection API
        // can sometimes mistakenly create a NodeSelection on the whole block instead of a TextSelection.
        // To guarantee the cursor is placed exactly where a user would click (inside the text),
        // we use native DOM selection to target the first paragraph. ProseMirror will sync this automatically.
        const paragraphs = prosemirror.querySelectorAll('p')
        if (paragraphs.length > 0) {
          const p = paragraphs[0]
          const range = document.createRange()
          
          // If the paragraph ends with a BR (ProseMirror's trailing break for empty paragraphs),
          // placing the cursor after it causes layout/size issues. We must place it before the BR.
          if (p.lastChild && p.lastChild.nodeName === 'BR') {
            range.setStartBefore(p.lastChild)
            range.collapse(true)
          } else {
            range.selectNodeContents(p)
            range.collapse(false)
          }
          
          const sel = window.getSelection()
          if (sel) {
            sel.removeAllRanges()
            sel.addRange(range)
          }
        }
      }
    }
  }, 100)
}

defineExpose({ focus })

onMounted(async () => {
  if (!editorRef.value) return

  crepe = new Crepe({
    root: editorRef.value,
    defaultValue: modelValue,
    features: onlyOrderedList
      ? {
          [Crepe.Feature.Toolbar]: false,
          [Crepe.Feature.ImageBlock]: false,
          [Crepe.Feature.Table]: false,
          [Crepe.Feature.Latex]: false,
          [Crepe.Feature.CodeMirror]: false,
          [Crepe.Feature.TopBar]: false,
          [Crepe.Feature.LinkTooltip]: false,
          [Crepe.Feature.BlockEdit]: false,
        }
      : undefined,
    featureConfigs: {
      [Crepe.Feature.ImageBlock]: {
        onUpload: async (file: File) => {
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = (err) => reject(err)
            reader.readAsDataURL(file)
          })
        },
      },
    },
  })

  if (onlyOrderedList) {
    crepe.editor.use($prose(() => new Plugin({
      props: {
        handleKeyDown(view, event) {
          if (event.key === 'Enter') {
            const { state } = view
            const { selection } = state
            const { $from, empty } = selection
            if (!empty) return false
            const parent = $from.parent
            if (parent.type.name === 'paragraph' && parent.content.size === 0) {
              const grandparent = $from.node(-1)
              if (grandparent && grandparent.type.name.includes('list_item')) {
                return true // Prevent Enter from escaping an empty list item
              }
            }
          }
          if (event.key === 'Backspace') {
            const { state } = view
            const { selection } = state
            const { $from, empty } = selection
            if (!empty) return false
            if ($from.parentOffset === 0) {
              const grandparent = $from.node(-1)
              if (grandparent && grandparent.type.name.includes('list_item')) {
                const listNode = $from.node(-2)
                if (listNode && listNode.type.name.includes('list')) {
                  const itemIndex = $from.index(-2)
                  if (itemIndex === 0) {
                    return true // Prevent Backspace from breaking the first list item
                  }
                }
              }
            }
          }
          return false
        }
      }
    })))
  }

  crepe.on((listener) => {
    listener.markdownUpdated((_ctx, markdown, prevMarkdown) => {
      if (markdown !== prevMarkdown && !isUpdatingFromProp.value) {
        emit('update:modelValue', markdown)
      }
    })
  })

  try {
    await crepe.create()
    if (autoFocus) {
      focus()
    }
  } catch (error) {
    console.error('Failed to create Milkdown Crepe instance:', error)
  }
})

watch(
  () => modelValue,
  (newValue) => {
    if (crepe && newValue !== crepe.getMarkdown()) {
      isUpdatingFromProp.value = true
      try {
        crepe.editor.action(replaceAll(newValue))
      } catch (error) {
        console.error('Failed to update Milkdown content:', error)
      } finally {
        // Defensive timeout to reset the state lock and allow next user input
        setTimeout(() => {
          isUpdatingFromProp.value = false
        }, 50)
      }
    }
  },
)
</script>

<template>
  <div
    class="milkdown-editor-wrapper w-full h-full"
    :class="onlyOrderedList ? 'min-h-[220px]' : 'min-h-[300px]'"
  >
    <div ref="editorRef" class="editor-container h-full"></div>
  </div>
</template>

<style scoped>
.milkdown-editor-wrapper {
  width: 100%;
}
.editor-container :deep(.milkdown) {
  max-width: 100%;
}
</style>
