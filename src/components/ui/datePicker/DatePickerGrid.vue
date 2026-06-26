<script setup lang="ts">
/**
 * DatePickerGrid.vue
 * 
 * 纯展示组件 (Dumb Component)。
 * 负责渲染日历网格视图，以及处理日期的视觉状态（周末、选中态、禁用态）。
 * 将其内部的 `contentRef` 暴露给父组件，以便父组件掌控复杂的 GSAP 滑动动效。
 */
import { ref, onMounted, computed } from 'vue'
import dayjs from 'dayjs'
import gsap from 'gsap'
import { HolidayUtil } from 'lunar-javascript'

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

const weeksWithData = computed(() => {
  return props.weeks.map(week => week.map(date => {
    const h = HolidayUtil.getHoliday(date.format('YYYY-MM-DD'))
    const weekend = isWeekend(date)
    
    let indicatorType = 'none'
    if (weekend) {
      if (h && h.isWork()) indicatorType = 'work-weekend'
      else indicatorType = 'weekend'
    } else {
      if (h && !h.isWork()) indicatorType = 'holiday-weekday'
    }

    let holidayName = null
    if (h) {
      holidayName = h.isWork() ? '班' : h.getName()
    }

    const isHoliday = !!(h && !h.isWork())
    let isHolidayStart = false
    let isHolidayEnd = false

    if (isHoliday) {
      const prev = HolidayUtil.getHoliday(date.subtract(1, 'day').format('YYYY-MM-DD'))
      const next = HolidayUtil.getHoliday(date.add(1, 'day').format('YYYY-MM-DD'))
      
      if (!prev || prev.isWork() || prev.getTarget() !== h.getTarget()) isHolidayStart = true
      if (!next || next.isWork() || next.getTarget() !== h.getTarget()) isHolidayEnd = true
    }

    const isVisualStart = isHolidayStart || date.day() === 1
    const isVisualEnd = isHolidayEnd || date.day() === 0
    let bgClass = ''
    if (isHoliday) {
      if (isVisualStart && isVisualEnd) {
        bgClass = 'rounded-xl left-1/2 -translate-x-1/2 w-11'
      } else if (isVisualStart) {
        bgClass = 'rounded-l-xl left-1/2 -translate-x-[22px] w-[calc(50%+22px)]'
      } else if (isVisualEnd) {
        bgClass = 'rounded-r-xl left-0 w-[calc(50%+22px)]'
      } else {
        bgClass = 'w-full left-0'
      }
    }

    return {
      date,
      indicatorType,
      holidayName,
      isWork: h ? h.isWork() : false,
      isHoliday,
      bgClass
    }
  }))
})
</script>

<template>
  <div class="overflow-hidden rounded-lg relative transition-all duration-300 z-10" :style="{ height: `${props.rows * 80}px` }" @wheel.prevent="emit('wheel', $event)">
    <!-- 顶部与底部的滚动模糊遮罩 -->
    <div class="absolute top-0 left-0 w-full h-3 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none"></div>
    <div class="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>

    <div ref="contentRef" class="flex flex-col">
      <div v-for="(week, weekIndex) in weeksWithData" :key="weekIndex" class="grid grid-cols-7 text-center h-20 items-center">
        <div v-for="cell in week" :key="cell.date.format('YYYY-MM-DD')" class="relative flex justify-center h-full items-center">
          
          <!-- 节假日连线背景 -->
          <div v-if="cell.isHoliday" 
               class="absolute h-16 pointer-events-none bg-sky-500/15 dark:bg-sky-400/15"
               :class="cell.bgClass">
          </div>

          <div
            class="date-cell relative z-10 w-11 h-16 flex flex-col items-center justify-center rounded-xl cursor-pointer text-sm transition-colors duration-200"
            :class="[
              cell.date.isBefore(props.currentDate, 'day') ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-0.5',
              cell.date.isSame(props.selectedDate, 'day')
                ? 'bg-primary text-primary-foreground shadow-md font-bold'
                : (cell.date.isSame(props.currentDate, 'day')
                   ? 'text-primary font-bold border-2 border-primary bg-primary/5 hover:bg-primary/10'
                   : (cell.date.isBefore(props.currentDate, 'day') ? 'text-muted-foreground' : 'text-foreground hover:bg-secondary/50'))
            ]"
            @click="emit('select', cell.date)">
            
            <!-- 指示横条 -->
            <div
              v-if="cell.indicatorType === 'weekend'"
              class="absolute top-1.5 w-4 h-[3px] rounded-full transition-colors"
              :class="cell.date.isSame(props.selectedDate, 'day') ? 'bg-primary-foreground/70' : 'bg-green-500'"
            ></div>
            <div
              v-else-if="cell.indicatorType === 'holiday-weekday'"
              class="absolute top-1.5 w-4 h-[3px] rounded-full transition-colors"
              :class="cell.date.isSame(props.selectedDate, 'day') ? 'bg-primary-foreground/70' : 'bg-sky-400'"
            ></div>
            <div
              v-else-if="cell.indicatorType === 'work-weekend'"
              class="absolute top-1.5 flex gap-[2px]"
            >
              <div class="w-[7px] h-[3px] rounded-full transition-colors" :class="cell.date.isSame(props.selectedDate, 'day') ? 'bg-primary-foreground/70' : 'bg-red-700 dark:bg-red-800'"></div>
              <div class="w-[7px] h-[3px] rounded-full transition-colors" :class="cell.date.isSame(props.selectedDate, 'day') ? 'bg-primary-foreground/70' : 'bg-red-700 dark:bg-red-800'"></div>
            </div>

            <!-- 日期数字 -->
            <span class="text-base font-medium z-10 transition-colors" 
                  :class="[
                    {'mt-1': cell.indicatorType !== 'none'},
                    cell.date.isSame(props.selectedDate, 'day') 
                      ? '' 
                      : (cell.isWork ? 'text-red-700 dark:text-red-800'
                         : (cell.isHoliday ? 'text-sky-600 dark:text-sky-400'
                            : (cell.indicatorType === 'weekend' ? 'text-green-600 dark:text-green-500' 
                               : '')))
                  ]">
              {{ cell.date.date() }}
            </span>

            <!-- 底部文字: 节日 / 调休 / 月份 -->
            <span
              v-if="cell.holidayName"
              class="absolute bottom-1.5 text-[10px] font-bold"
              :class="cell.date.isSame(props.selectedDate, 'day') ? 'text-primary-foreground/80' : (cell.isWork ? 'text-red-700 dark:text-red-800' : 'text-sky-600 dark:text-sky-400')"
            >
              {{ cell.holidayName }}
            </span>
            <span
              v-else-if="cell.date.date() === 1"
              class="absolute bottom-1.5 text-[10px] font-bold"
              :class="cell.date.isSame(props.selectedDate, 'day') ? 'text-primary-foreground/80' : 'text-primary'"
            >
              {{ cell.date.month() + 1 }}月
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
