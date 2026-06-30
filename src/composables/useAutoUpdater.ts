import { ref } from 'vue'
import { confirm } from '@/components/confirm'
import { Dialog } from '@/components/dialog'
import { useLocalStorage } from '@vueuse/core'
import UpdateProgressDialog from '@/components/dialogs/UpdateProgressDialog.vue'

export const autoUpdateEnabled = useLocalStorage('olvido-auto-update', true)

const isCheckingUpdate = ref(false)
const downloadProgress = ref(0)
const isDownloading = ref(false)
let initialized = false

export function useAutoUpdater() {
  const cancelDownload = async () => {
    isDownloading.value = false
    downloadProgress.value = 0
    await window.api?.updater?.cancel()
  }

  const initAutoUpdater = () => {
    if (initialized) return
    initialized = true

    if (window.api && window.api.updater) {
      window.api.updater.onUpdateAvailable(async (info) => {
        const manual = isCheckingUpdate.value
        isCheckingUpdate.value = false
        
        if (manual) {
          const wantsUpdate = await confirm({
            title: '发现新版本',
            description: `发现新版本 v${info.version}，是否现在下载更新？\n\n${info.releaseNotes ? String(info.releaseNotes).replace(/(<([^>]+)>)/gi, '') : ''}`,
            okText: '立即下载',
            cancelText: '暂不更新',
          })
          if (wantsUpdate) {
            isDownloading.value = true
            downloadProgress.value = 0
            window.api.updater.download()
          }
        } else {
          // Auto check on startup
          isDownloading.value = true
          downloadProgress.value = 0
          window.api.updater.download()
          Dialog.show(UpdateProgressDialog)
        }
      })

      window.api.updater.onUpdateNotAvailable(() => {
        if (isCheckingUpdate.value) {
          isCheckingUpdate.value = false
          confirm({
            title: '已是最新版本',
            description: '当前版本已是最新，无需更新。',
            okText: '确定',
            cancelText: '',
          })
        }
      })

      window.api.updater.onDownloadProgress((progressObj) => {
        downloadProgress.value = Math.round(progressObj.percent || 0)
      })

      window.api.updater.onUpdateDownloaded(() => {
        isDownloading.value = false
        downloadProgress.value = 100
        confirm({
          title: '更新准备就绪',
          description: '新版本已下载完毕，是否立即重启安装？',
          okText: '重启安装',
          cancelText: '暂不安装',
        }).then((agreed) => {
          if (agreed) window.api.updater.install()
        })
      })

      window.api.updater.onError((err) => {
        if (isCheckingUpdate.value || isDownloading.value) {
          isCheckingUpdate.value = false
          isDownloading.value = false
          confirm({
            title: '检查更新失败',
            description: `发生错误：${err}`,
            okText: '确定',
            cancelText: '',
          })
        }
      })
    }
  }

  const checkUpdate = async (manual = false) => {
    if (isCheckingUpdate.value || isDownloading.value) return
    if (manual) isCheckingUpdate.value = true
    await window.api?.updater?.check()
  }

  return {
    autoUpdateEnabled,
    isCheckingUpdate,
    downloadProgress,
    isDownloading,
    initAutoUpdater,
    checkUpdate,
    cancelDownload,
  }
}
