import js from '@eslint/js'
import json from '@eslint/json'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

const sourceFiles = ['**/*.{js,cjs,mjs,ts,tsx,vue}']

export default tseslint.config(
  {
    ignores: ['dist', 'dist-electron', 'node_modules', 'coverage'],
  },
  {
    ...js.configs.recommended,
    files: sourceFiles,
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: sourceFiles,
  })),
  ...pluginVue.configs['flat/recommended'].map((config) => ({
    ...config,
    files: config.files ?? ['**/*.vue'],
  })),
  {
    plugins: {
      json,
    },
  },
  {
    files: ['**/*.json'],
    ignores: ['tsconfig*.json', '.vscode/*.json'],
    language: 'json/json',
    rules: {
      'json/no-duplicate-keys': 'error',
    },
  },
  {
    files: ['tsconfig*.json', '.vscode/*.json'],
    language: 'json/jsonc',
    rules: {
      'json/no-duplicate-keys': 'error',
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  {
    files: sourceFiles,
    plugins: {
      vue: pluginVue,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'error',
    },
  },
  eslintConfigPrettier,
)
