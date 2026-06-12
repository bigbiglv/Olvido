import js from '@eslint/js'
import json from '@eslint/json'
import vueI18n from '@intlify/eslint-plugin-vue-i18n'
import eslintConfigPrettier from 'eslint-config-prettier'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

const sourceFiles = ['**/*.{js,cjs,mjs,ts,tsx,vue}']

export default tseslint.config(
  {
    ignores: ['dist', 'node_modules', 'coverage'],
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
      '@intlify/vue-i18n': vueI18n,
      vue: pluginVue,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'error',
      '@intlify/vue-i18n/no-dynamic-keys': 'error',
      '@intlify/vue-i18n/no-missing-keys': 'error',
      '@intlify/vue-i18n/no-missing-keys-in-other-locales': 'error',
      '@intlify/vue-i18n/no-raw-text': [
        'error',
        {
          ignorePattern:
            '^(?:[\\d\\s.,:;!?%+\\-*/=()[\\]{}<>#&|~^\'"`]+|[A-Z][A-Z0-9]*(?:[._-][A-Z0-9]+)*|\\.[A-Za-z0-9_-]+|\\d+(?:\\.\\d+)?(?:px|rem|em|ms|s|KB|MB|GB|%)?)$',
        },
      ],
      '@intlify/vue-i18n/no-unknown-locale': 'error',
      '@intlify/vue-i18n/no-unused-keys': [
        'warn',
        {
          extensions: ['.ts', '.vue'],
        },
      ],
    },
    settings: {
      'vue-i18n': {
        localeDir: {
          pattern: './src/i18n/locales/*/**/*.json',
          localeKey: 'path',
          localePattern: /src[\\/]i18n[\\/]locales[\\/](?<locale>[A-Za-z0-9-_]+)[\\/].+\.json$/,
        },
        messageSyntaxVersion: '^11.0.0',
      },
    },
  },
  eslintConfigPrettier,
)
