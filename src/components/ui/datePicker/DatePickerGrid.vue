<script setup lang="ts">
/**
 * DatePickerGrid.vue
 * 
 * 纯展示组件 (Dumb Component)。
 * 负责渲染日历网格视图，以及处理日期的视觉状态（周末、选中态、禁用态）。
 * 将其内部的 `contentRef` 暴露给父组件，以便父组件掌控复杂的 GSAP 滑动动效。
 */
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import gsap from 'gsap'

interface Props {
  /** 当前可见的日历周数据 */
  weeks: dayjs.Dayjs[][]
  /** 系统当前日期 (今天) */
  currentDate: dayjs.Dayjs
  /** 用户选中的目标日期 */
  selectedDate: dayjs.Dayjs
  /** 渲染的行数 */
  rows?: number
}

interface Emits {
  (e: 'select', date: dayjs.Dayjs): void
  (e: 'wheel', event: WheelEvent): void
}

const props = withDefaults(defineProps<Props>(), {
  rows: 2
})

const emit = defineEmits<Emits>()

const contentRef = ref<HTMLElement | null>(null)

// 暴露出内部 DOM 容器，供智能父组件(Controller)进行复杂动画编排
defineExpose({ contentRef })

onMounted(() => {
  // 首次挂载时的弹簧入场动效
  if (contentRef.value) {
    const cells = contentRef.value.querySelectorAll('.date-cell')
    gsap.from(cells, { opacity: 0, scale: 0.5, y: 20, duration: 0.5, stagger: 0.02, ease: 'back.out(1.5)' })
  }
})

/** 判断是否为周末，用于展示不同的 UI 提示 */
const isWeekend = (date: dayjs.Dayjs) => {
  const d = date.day()
  return d === 0 || d === 6
}
</script>

<template>
  <div class="overflow-hidden rounded-lg relative transition-all duration-300 z-10" :style="{ height: `${props.rows * 80}px` }" @wheel.prevent="emit('wheel', $event)">
    <!-- 顶部与底部的滚动模糊遮罩 -->
    <div class="absolute top-0 left-0 w-full h-3 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>

    <div ref="contentRef" class="flex flex-col">
      <div v-for="(week, weekIndex) in props.weeks" :key="weekIndex" class="grid grid-cols-7 text-center h-20 items-center">
        <div v-for="date in week" :key="date.format('YYYY-MM-DD')" class="flex justify-center h-full items-center">
          <div
class="date-cell relative w-11 h-16 flex flex-col items-center justify-center rounded-xl cursor-pointer text-sm transition-colors duration-200"
               :class="[
                 date.isBefore(props.currentDate, 'day') ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-0.5',
                 date.isSame(props.selectedDate, 'day')
                   ? 'bg-primary text-primary-foreground shadow-md font-bold'
                   : (date.isSame(props.currentDate, 'day')
                      ? 'text-primary font-bold border-2 border-primary bg-primary/5 hover:bg-primary/10'
                      : (date.isBefore(props.currentDate, 'day') ? 'text-muted-foreground' : 'text-foreground hover:bg-secondary'))
               ]"
               @click="emit('select', date)">
            <!-- 周末指示横线 -->
            <div
v-if="isWeekend(date)" class="absolute top-1.5 w-4 h-[3px] rounded-full transition-colors"
                 :class="date.isSame(props.selectedDate, 'day') ? 'bg-primary-foreground/70' : 'bg-green-500'"></div>

            <span class="text-base font-medium z-10" :class="{'mt-1': isWeekend(date)}">{{ date.date() }}</span>

            <!-- 每月1号展示月份提示语 -->
            <span
v-if="date.date() === 1" class="absolute bottom-1.5 text-[10px] font-bold"
                  :class="date.isSame(props.selectedDate, 'day') ? 'text-primary-foreground/80' : 'text-primary'">
              {{ date.month() + 1 }}月
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
