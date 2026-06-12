<script setup lang="ts">
import { useRouter } from 'vue-router'
import { LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { h, onMounted, ref } from 'vue'
import Editor from '@/components/Editor/index.vue'

import { Form, FormInput, FormSelect, FormSwitch, FormTextarea } from '@/components/form'
import { Dialog, Layout, useDialog } from '@/components/dialog'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  await router.replace('/login')
}

// === 表单 Demo ===
const formSchema = toTypedSchema(z.object({
  username: z.string().min(2, '用户名至少2个字符').max(20, '用户名最多20个字符'),
  role: z.string().min(1, '请选择角色'),
  notify: z.boolean().default(false),
  bio: z.string().optional(),
}))

const { handleSubmit, resetForm } = useForm({
  validationSchema: formSchema,
  initialValues: {
    username: '',
    role: '',
    notify: false,
    bio: ''
  }
})

const onSubmit = handleSubmit((values) => {
  Dialog.show({
    component: h(Layout, null, {
      title: () => '表单提交成功',
      default: () => h('div', { class: 'p-6 text-slate-700' }, [
        h('pre', { class: 'bg-slate-100 p-4 rounded-md text-sm whitespace-pre-wrap font-mono' }, JSON.stringify(values, null, 2))
      ]),
      footer: () => h('div', { class: 'flex justify-end p-4 border-t border-slate-100' }, [
        h('button', {
          class: 'px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition',
          onClick: () => Dialog.closeAll()
        }, '确认')
      ])
    }),
    options: { width: 500, defaultMaximized: false }
  })
})

// === 弹窗 Demo ===
const DemoModal = {
  setup() {
    const { cancel, submit } = useDialog()
    return () => h(Layout, null, {
      title: () => '示例弹窗',
      default: () => h('div', { class: 'p-6 text-slate-600' }, '这是一个通过 Dialog.show() 动态调用的弹窗组件。通过代码方式轻松控制弹窗状态。'),
      footer: () => h('div', { class: 'flex justify-end gap-3 p-4 border-t border-slate-100' }, [
        h('button', {
          class: 'px-4 py-2 bg-slate-100 rounded-md hover:bg-slate-200 text-slate-700 transition',
          onClick: () => cancel()
        }, '取消'),
        h('button', {
          class: 'px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition',
          onClick: () => submit(true)
        }, '确定')
      ])
    })
  }
}

function openDemoDialog() {
  Dialog.show({
    component: DemoModal,
    options: { width: 480, defaultMaximized: false }
  }).then((res) => {
    if (res) {
      console.log('用户点击了确定')
    }
  })
}

// === Milkdown & SQLite Integration ===
const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined
const dbStatus = ref('未连接')
const documents = ref<any[]>([])
const selectedDocContent = ref('# 欢迎使用 Milkdown 编辑器\n\n您可以在这里实时编辑 Markdown 内容，配合 SQLite 数据库实现数据持久化。')

async function loadDocuments() {
  if (isElectron) {
    dbStatus.value = '正在连接 SQLite 数据库...'
    try {
      documents.value = await window.electronAPI.getDocuments()
      dbStatus.value = `已连接 SQLite (当前有 ${documents.value.length} 个文档)`
    } catch (err: any) {
      console.error(err)
      dbStatus.value = `连接失败: ${err.message || err}`
    }
  } else {
    dbStatus.value = '网页预览模式 (自动使用 Mock 数据)'
    documents.value = [
      { id: '1', title: 'Milkdown 说明书', content: '# 欢迎使用 Milkdown 编辑器\n\n您可以在这里实时编辑 Markdown 内容，配合 SQLite 数据库实现数据持久化。', updatedAt: new Date().toISOString() },
    ]
  }
}

async function handleSaveDemo() {
  if (isElectron) {
    try {
      // 自动提取第一行作为标题，去掉 markdown 符号
      const firstLine = selectedDocContent.value.split('\n')[0] || ''
      const title = firstLine.replace(/[#*`_\s]/g, '') || '无标题文档'
      
      await window.electronAPI.saveDocument({
        title,
        content: selectedDocContent.value,
      })
      await loadDocuments()
    } catch (err) {
      console.error('保存失败:', err)
    }
  } else {
    console.log('在浏览器端模拟保存:', selectedDocContent.value)
    // 模拟更新 Mock 列表
    const firstLine = selectedDocContent.value.split('\n')[0] || ''
    const title = firstLine.replace(/[#*`_\s]/g, '') || '无标题文档'
    documents.value = [
      { id: '1', title, content: selectedDocContent.value, updatedAt: new Date().toISOString() }
    ]
  }
}

onMounted(() => {
  loadDocuments()
})
</script>

<template>
  <main class="min-h-screen bg-slate-50 flex flex-col items-center py-10 text-slate-900 px-4 overflow-y-auto">
    <div class="max-w-5xl w-full flex flex-col gap-8">
      
      <!-- 头部卡片 -->
      <div class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h1 class="text-3xl font-bold mb-2 text-indigo-950">Frontend Template</h1>
          <p class="text-slate-500">一个极简的 Vue 3 基础工程脚手架模板</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex flex-col text-right">
            <span class="text-sm text-slate-500">当前登录用户</span>
            <span class="font-medium text-slate-900">{{ authStore.user?.nickname ?? authStore.user?.username ?? '测试用户' }}</span>
          </div>
          <button
            class="inline-flex h-9 items-center gap-2 rounded-md bg-slate-50 border border-slate-200 px-4 text-sm font-medium text-slate-600 shadow-sm transition hover:text-indigo-600 hover:border-indigo-200"
            type="button"
            @click="handleLogout"
          >
            <LogOut class="size-4" />
            退出
          </button>
        </div>
      </div>

      <!-- Milkdown & SQLite 演示区域 -->
      <section class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
          <div>
            <h2 class="text-xl font-bold text-slate-800">Markdown 编辑器 (Milkdown) & 数据库 (SQLite)</h2>
            <p class="text-xs text-slate-400 mt-1">环境状态: <span class="font-semibold" :class="isElectron ? 'text-green-600' : 'text-amber-600'">{{ dbStatus }}</span></p>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="loadDocuments"
              class="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition cursor-pointer"
            >
              刷新数据
            </button>
            <button
              @click="handleSaveDemo"
              class="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-sm cursor-pointer"
            >
              保存当前内容
            </button>
          </div>
        </div>

        <div class="grid md:grid-cols-[200px_1fr] gap-6 min-h-[350px]">
          <!-- 左侧历史列表 -->
          <div class="border-r border-slate-100 pr-4 space-y-2">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">已存文档</h3>
            <div v-if="documents.length === 0" class="text-xs text-slate-400 py-4">暂无数据</div>
            <button
              v-for="doc in documents"
              :key="doc.id"
              @click="selectedDocContent = doc.content"
              class="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition text-sm flex flex-col gap-1 cursor-pointer"
            >
              <span class="font-medium text-slate-700 truncate">{{ doc.title || '未命名文档' }}</span>
              <span class="text-[10px] text-slate-400">{{ new Date(doc.updatedAt).toLocaleTimeString() }}</span>
            </button>
          </div>
          <!-- 右侧编辑区 -->
          <div class="p-2 border border-slate-200 rounded-xl bg-slate-50/50">
            <Editor v-model="selectedDocContent" />
          </div>
        </div>
      </section>

      <div class="grid md:grid-cols-[1fr_minmax(0,400px)] gap-8 items-start">
        <!-- 表单组件演示 -->
        <section class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 class="text-xl font-bold mb-6 border-b border-slate-100 pb-4 text-slate-800">表单组件 (Form)</h2>
          <Form @submit="onSubmit" class="space-y-6">
            <FormInput
              name="username"
              label="用户名"
              placeholder="请输入用户名"
            />
            
            <FormSelect
              name="role"
              label="系统角色"
              placeholder="请选择角色"
              :options="[
                { label: '系统管理员', value: 'admin' },
                { label: '普通用户', value: 'user' },
                { label: '受限访客', value: 'guest' }
              ]"
            />
            
            <FormSwitch
              name="notify"
              label="开启消息通知"
              description="当有新消息时我们将通过邮件实时通知您，重要消息不遗漏。"
            />

            <FormTextarea
              name="bio"
              label="个人简介"
              placeholder="简单介绍一下自己，不超过 200 字..."
              :rows="3"
            />
            
            <div class="pt-4 flex gap-3 border-t border-slate-100">
              <button
                type="button"
                @click="resetForm()"
                class="px-5 py-2 text-sm font-medium border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition"
              >
                重置
              </button>
              <button
                type="submit"
                class="px-5 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                提交表单
              </button>
            </div>
          </Form>
        </section>

        <!-- 弹窗组件演示 -->
        <section class="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <h2 class="text-xl font-bold mb-6 border-b border-slate-100 pb-4 text-slate-800">弹窗组件 (Dialog)</h2>
          <div class="space-y-4">
            <p class="text-slate-600 text-sm leading-relaxed mb-6">
              基础脚手架提供了编程式调用的 <code>Dialog.show()</code> API。<br/><br/>
              你可以直接传入自定义的 Vue 组件进行渲染，或者使用原生的渲染函数 (h) 进行快捷创建，完美支持响应式和生命周期。
            </p>
            
            <button
              @click="openDemoDialog"
              class="w-full inline-flex justify-center items-center px-5 py-2.5 text-sm font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition"
            >
              打开示例弹窗
            </button>
          </div>
        </section>
      </div>

    </div>
  </main>
</template>
