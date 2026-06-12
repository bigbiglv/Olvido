<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const account = ref('')
const password = ref('')
const rememberMe = ref(true)
const showPassword = ref(false)
const isSubmitting = ref(false)
const loginError = ref('')
const canSubmit = computed(() =>
  Boolean(account.value.trim() && password.value && !isSubmitting.value),
)

function getSafeRedirectPath(redirect: unknown) {
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    return redirect
  }
  return '/'
}

async function handleSubmit() {
  loginError.value = ''

  if (!account.value.trim() || !password.value) {
    loginError.value = '请输入账号和密码'
    return
  }

  isSubmitting.value = true

  try {
    await authStore.login({
      account: account.value.trim(),
      password: password.value,
      rememberMe: rememberMe.value,
    })

    await router.replace(getSafeRedirectPath(route.query.redirect))
  } catch (error) {
    loginError.value = error instanceof Error ? error.message : '登录失败，请稍后重试'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 px-4">
    <section class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold">欢迎登录</h1>
        <p class="text-slate-500 mt-2 text-sm">Frontend Template 基础脚手架</p>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="mb-5">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">用户名或邮箱</label>
          <input
            v-model="account"
            type="text"
            class="w-full h-11 px-4 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
            placeholder="请输入账号"
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-slate-700 mb-1.5">密码</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="w-full h-11 px-4 pr-11 rounded-lg border border-slate-200 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition"
              placeholder="请输入密码"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" class="size-5" />
              <Eye v-else class="size-5" />
            </button>
          </div>
        </div>

        <div class="flex items-center justify-between mb-6 text-sm">
          <label class="flex items-center gap-2 cursor-pointer text-slate-600">
            <input v-model="rememberMe" type="checkbox" class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
            记住我
          </label>
          <button type="button" class="text-indigo-600 hover:text-indigo-700 font-medium">
            忘记密码？
          </button>
        </div>

        <div v-if="loginError" class="mb-4 text-sm text-red-500 text-center">
          {{ loginError }}
        </div>

        <button
          type="submit"
          :disabled="!canSubmit"
          class="w-full h-12 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? '登录中...' : '登 录' }}
        </button>
      </form>
    </section>
  </main>
</template>
