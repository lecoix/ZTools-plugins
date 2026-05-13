<template>
  <div
    class="code-editor-box"
    :class="{ 'is-copied': isCopied }"
    :style="editorStyle"
    :data-theme="store.codeEditorThemeMode"
  >
    <codemirror
      ref="cmRef"
      class="code-editor"
      v-model="localValue"
      :style="{ height: '100%' }"
      :autofocus="autofocus"
      :indent-with-tab="true"
      :tab-size="2"
      :extensions="extensions"
      @change="handleInput"
    />

    <div v-if="localValue" class="editor-actions" aria-label="编辑器操作">
      <button
        class="editor-action editor-action--ghost"
        type="button"
        title="清空内容"
        aria-label="清空内容"
        @click="clear"
      >
        <n-icon size="15"><Icon icon="icon-park-outline:delete" /></n-icon>
      </button>

      <button
        class="editor-action editor-action--primary"
        type="button"
        :title="isCopied ? '已复制' : '复制内容'"
        :aria-label="isCopied ? '已复制' : '复制内容'"
        @click="copyToClipboard"
      >
        <n-icon size="15">
          <Icon :icon="isCopied ? 'icon-park-outline:check-one' : 'icon-park-outline:copy'" />
        </n-icon>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { sql } from '@codemirror/lang-sql'
import { java } from '@codemirror/lang-java'
import { vue as vueLang } from '@codemirror/lang-vue'
import { oneDark } from '@codemirror/theme-one-dark'
import { placeholder as editorPlaceholder } from '@codemirror/view'
import { Icon } from '@iconify/vue'
import { NIcon, useThemeVars } from 'naive-ui'
import { useAppStore } from '@/store'

const props = defineProps({
  modelValue: { type: String, default: '' },
  mode: { type: String, default: 'text' },
  autofocus: { type: Boolean, default: false },
  placeholder: { type: String, default: '' },
  readonly: { type: Boolean, default: false }
})

const emit = defineEmits(['update:modelValue', 'change'])

const store = useAppStore()
const themeVars = useThemeVars()

const localValue = ref(props.modelValue || '')
const cmRef = ref(null)
const isCopied = ref(false)
const copyTimeout = ref(null)

const editorStyle = computed(() => ({
  '--editor-primary': themeVars.value.primaryColor,
  '--editor-primary-hover': themeVars.value.primaryColorHover,
  '--editor-primary-pressed': themeVars.value.primaryColorPressed,
  '--editor-idle-border': store.isDarkTheme ? '#303946' : themeVars.value.borderColor,
  '--editor-focus-border': store.isDarkTheme ? '#70c0e8' : '#2080f0',
  '--editor-focus-shadow': store.isDarkTheme ? 'rgba(112, 192, 232, 0.18)' : 'rgba(32, 128, 240, 0.16)',
  '--editor-success': themeVars.value.successColor,
  '--editor-error': themeVars.value.errorColor,
  '--editor-border': themeVars.value.borderColor,
  '--editor-divider': themeVars.value.dividerColor,
  '--editor-card': themeVars.value.cardColor,
  '--editor-popover': themeVars.value.popoverColor,
  '--editor-body': themeVars.value.bodyColor,
  '--editor-text': themeVars.value.textColor2,
  '--editor-muted': themeVars.value.textColor3,
  '--editor-placeholder': themeVars.value.placeholderColor
}))

const langExtensions = computed(() => {
  switch (props.mode) {
    case 'sql': return [sql()]
    case 'javascript': return [javascript()]
    case 'text/x-java':
    case 'java': return [java()]
    case 'vue': return [vueLang()]
    case 'handlebars': return [javascript()]
    default: return []
  }
})

const extensions = computed(() => {
  const exts = [...langExtensions.value]
  if (props.placeholder) {
    exts.push(editorPlaceholder(props.placeholder))
  }
  if (store.codeEditorThemeMode === 'dracula' || store.isDarkTheme) {
    exts.push(oneDark)
  }
  return exts
})

watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal || ''
})

function handleInput(value) {
  localValue.value = value
  emit('update:modelValue', value)
  emit('change', value)
}

function copyToClipboard() {
  if (!localValue.value) return
  navigator.clipboard.writeText(localValue.value).then(() => {
    isCopied.value = true
    focus()
    if (copyTimeout.value) clearTimeout(copyTimeout.value)
    copyTimeout.value = setTimeout(() => resetCopyState(), 1500)
  }).catch(err => {
    console.error('复制失败:', err)
  })
}

function resetCopyState() {
  if (copyTimeout.value) {
    clearTimeout(copyTimeout.value)
    copyTimeout.value = null
  }
  isCopied.value = false
}

function focus() {
  if (cmRef.value?.view) {
    cmRef.value.view.focus()
  }
}

function selectAll() {
  const view = cmRef.value?.view
  if (view) {
    view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } })
    view.focus()
  }
}

function clear() {
  localValue.value = ''
  emit('update:modelValue', '')
  emit('change', '')
  focus()
}

onBeforeUnmount(() => {
  if (copyTimeout.value) clearTimeout(copyTimeout.value)
})

defineExpose({ focus, selectAll, clear })
</script>

<style scoped>
.code-editor-box {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--editor-idle-border, var(--editor-border, rgba(31, 41, 55, 0.12)));
  border-radius: 8px;
  background: var(--editor-card, #fff);
  box-shadow: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.code-editor-box:hover,
.code-editor-box:focus-within {
  border-color: var(--editor-focus-border, var(--editor-primary, #2080f0));
  box-shadow: 0 0 0 3px var(--editor-focus-shadow, rgba(32, 128, 240, 0.16));
}

@supports (color: color-mix(in srgb, #000 50%, #fff)) {
  .code-editor-box:hover,
  .code-editor-box:focus-within {
    border-color: color-mix(in srgb, var(--editor-primary, #2080f0) 42%, var(--editor-border, #efeff5));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--editor-primary, #2080f0) 12%, transparent);
  }
}

.code-editor {
  height: 100%;
}

.editor-actions {
  position: absolute;
  top: 8px;
  right: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 12;
  padding: 4px;
  border: 1px solid color-mix(in srgb, var(--editor-divider, #efeff5) 84%, transparent);
  border-radius: 10px;
  background: color-mix(in srgb, var(--editor-popover, #fff) 86%, transparent);
  box-shadow:
    0 10px 24px color-mix(in srgb, var(--editor-text, #333) 14%, transparent),
    inset 0 1px 0 color-mix(in srgb, var(--editor-card, #fff) 72%, #fff 28%);
  backdrop-filter: blur(14px);
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
  pointer-events: none;
  transition: opacity 0.18s ease, transform 0.18s ease, border-color 0.18s ease;
}

.code-editor-box:hover .editor-actions,
.code-editor-box:focus-within .editor-actions,
.code-editor-box.is-copied .editor-actions {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: auto;
}

.editor-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  color: var(--editor-muted, #606266);
  background: transparent;
  transition:
    color 0.16s ease,
    background 0.16s ease,
    transform 0.16s ease,
    box-shadow 0.16s ease;
}

.editor-action:hover {
  transform: translateY(-1px);
}

.editor-action:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--editor-primary, #18a058) 52%, transparent);
  outline-offset: 2px;
}

.editor-action--ghost:hover {
  color: var(--editor-error, #d03050);
  background: color-mix(in srgb, var(--editor-error, #d03050) 10%, transparent);
}

.editor-action--primary {
  color: #fff;
  background: linear-gradient(180deg, var(--editor-primary-hover, #36ad6a), var(--editor-primary, #18a058));
  box-shadow: 0 8px 16px color-mix(in srgb, var(--editor-primary, #18a058) 32%, transparent);
}

.editor-action--primary:hover {
  color: #fff;
  background: linear-gradient(180deg, var(--editor-primary, #18a058), var(--editor-primary-pressed, #0c7a43));
  box-shadow: 0 10px 20px color-mix(in srgb, var(--editor-primary, #18a058) 38%, transparent);
}

.is-copied .editor-action--primary {
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--editor-success, #18a058) 86%, #fff),
    var(--editor-success, #18a058)
  );
  box-shadow: 0 8px 18px color-mix(in srgb, var(--editor-success, #18a058) 34%, transparent);
}

:deep(.v-codemirror) {
  height: 100%;
}

:deep(.cm-editor) {
  height: 100%;
  font-size: 13px;
  background: transparent;
}

:deep(.cm-gutters) {
  border-right: 1px solid color-mix(in srgb, var(--editor-divider, #efeff5) 82%, transparent);
  background: color-mix(in srgb, var(--editor-body, #f5f5f5) 72%, var(--editor-card, #fff));
  color: var(--editor-placeholder, #999);
}

:deep(.cm-activeLine),
:deep(.cm-activeLineGutter) {
  background-color: color-mix(in srgb, var(--editor-primary, #18a058) 8%, transparent);
}

:deep(.cm-editor.cm-focused),
:deep(.cm-focused) {
  outline: none !important;
}

:deep(.cm-scroller) {
  overflow: auto;
  font-family: "JetBrains Mono", "Cascadia Code", "SFMono-Regular", Consolas, monospace;
  line-height: 1.52;
}

:deep(.cm-content) {
  padding: 10px 0 14px;
}

:deep(.cm-placeholder) {
  color: var(--editor-placeholder, #999);
  font-style: italic;
  opacity: 0.72;
}

:deep(.cm-line) {
  padding: 0 14px;
}

.code-editor-box[data-theme='dracula'],
body.dark .code-editor-box {
  border-color: var(--editor-idle-border, #303946);
  background: var(--editor-card, #18181c);
  box-shadow: none;
}

@supports (color: color-mix(in srgb, #000 50%, #fff)) {
  .code-editor-box[data-theme='dracula'],
  body.dark .code-editor-box {
    border-color: color-mix(in srgb, var(--editor-divider, #303946) 88%, transparent);
  }
}

.code-editor-box[data-theme='dracula']:hover,
.code-editor-box[data-theme='dracula']:focus-within,
body.dark .code-editor-box:hover,
body.dark .code-editor-box:focus-within {
  border-color: var(--editor-focus-border, #70c0e8);
  box-shadow: 0 0 0 3px var(--editor-focus-shadow, rgba(112, 192, 232, 0.18));
}

@supports (color: color-mix(in srgb, #000 50%, #fff)) {
  .code-editor-box[data-theme='dracula']:hover,
  .code-editor-box[data-theme='dracula']:focus-within,
  body.dark .code-editor-box:hover,
  body.dark .code-editor-box:focus-within {
    border-color: color-mix(in srgb, var(--editor-primary, #70c0e8) 44%, var(--editor-divider, #ffffff17));
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--editor-primary, #70c0e8) 14%, transparent);
  }
}

.code-editor-box[data-theme='dracula'] .editor-actions,
body.dark .code-editor-box .editor-actions {
  border-color: color-mix(in srgb, var(--editor-divider, #ffffff17) 86%, transparent);
  background: color-mix(in srgb, var(--editor-popover, #242428) 78%, transparent);
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.code-editor-box[data-theme='dracula'] .editor-action,
body.dark .code-editor-box .editor-action {
  color: var(--editor-muted, #a0a3a7);
}

.code-editor-box[data-theme='dracula'] .editor-action--ghost:hover,
body.dark .code-editor-box .editor-action--ghost:hover {
  color: var(--editor-error, #e88080);
  background: color-mix(in srgb, var(--editor-error, #e88080) 18%, transparent);
}

.code-editor-box[data-theme='dracula'] .editor-action--primary,
body.dark .code-editor-box .editor-action--primary {
  color: #fff;
}

.code-editor-box[data-theme='dracula'] :deep(.cm-gutters),
body.dark .code-editor-box :deep(.cm-gutters) {
  border-right-color: color-mix(in srgb, var(--editor-divider, #ffffff17) 80%, transparent);
  background: color-mix(in srgb, var(--editor-body, #101014) 64%, var(--editor-card, #18181c));
  color: var(--editor-placeholder, #8d9095);
}

.code-editor-box[data-theme='dracula'] :deep(.cm-activeLine),
.code-editor-box[data-theme='dracula'] :deep(.cm-activeLineGutter),
body.dark .code-editor-box :deep(.cm-activeLine),
body.dark .code-editor-box :deep(.cm-activeLineGutter) {
  background-color: color-mix(in srgb, var(--editor-primary, #63e2b7) 12%, transparent);
}
</style>
