<script setup lang="ts">
/**
 * DatePicker/index.vue
 *
 * 智能容器组件 (Controller / Smart Component)。
 * 负责维护核心日期状态、处理跨组件的 GSAP 滑动动效、以及复杂的日期差值计算。
 * 具体的 UI 展现已被拆分至 DatePickerHeader 和 DatePickerGrid。
 */
import { ref, nextTick, computed, watch, onMounted } from 'vue'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import gsap from 'gsap'
import DatePickerHeader from './DatePickerHeader.vue'
import DatePickerGrid from './DatePickerGrid.vue'
import type { DateUnit } from './types'
import { HolidayUtil } from 'lunar-javascript'

onMounted(() => {
  const currentYear = new Date().getFullYear()
  const holidays = HolidayUtil.getHolidays(currentYear)
  console.log(`今年的节假日信息 (${currentYear}):`, holidays)
})

dayjs.extend(isoWeek)
interface Props {
  rows?: number
  bordered?: boolean
}

interface Emits {
  (e: 'confirm', date: dayjs.Dayjs): void
}

const props = withDefaults(defineProps<Props>(), {
  rows: 3,
  bordered: true
})

const emits = defineEmits<Emits>()

const pickersConfig = [
  { unit: 'year' as DateUnit, format: 'YYYY', displayWidth: 'w-[44px]', popupWidth: 'w-[72px]' },
  { unit: 'month' as DateUnit, format: 'MM', displayWidth: 'w-[24px]', popupWidth: 'w-[56px]' },
  { unit: 'day' as DateUnit, format: 'DD', displayWidth: 'w-[24px]', popupWidth: 'w-[56px]' },
]

// ==========================================
// State: Core Dates & Grid
// ==========================================
const currentDate = dayjs()
const selectedDate = ref<dayjs.Dayjs>(currentDate)
const startMonday = ref(currentDate.startOf('isoWeek'))
const weeks = ref<dayjs.Dayjs[][]>([])

const generateWeeks = (start: dayjs.Dayjs, numRows: number) => {
  const w = []
  for (let r = 0; r < numRows; r++) {
    w.push(Array.from({ length: 7 }).map((_, i) => start.add(r * 7 + i, 'day')))
  }
  return w
}

weeks.value = generateWeeks(startMonday.value, props.rows)

// ==========================================
// State: Grid Animations
// ==========================================
const gridRef = ref<InstanceType<typeof DatePickerGrid> | null>(null)
let isAnimating = false

const handleWheel = async (e: WheelEvent) => {
  if (isAnimating || !gridRef.value?.contentRef) return
  isAnimating = true

  const direction = e.deltaY > 0 ? 1 : -1
  const weekHeight = 80 // h-20 is 80px
  const distance = weekHeight * props.rows
  const contentEl = gridRef.value.contentRef

  if (direction === 1) {
    // 向下滚动，加载未来周
    const nextStart = startMonday.value.add(props.rows, 'week')
    weeks.value.push(...generateWeeks(nextStart, props.rows))
    await nextTick()

    gsap.to(contentEl, {
      y: -distance,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        startMonday.value = nextStart
        weeks.value = generateWeeks(startMonday.value, props.rows)
        gsap.set(contentEl, { y: 0 })
        isAnimating = false
      },
    })

    const cells = contentEl.querySelectorAll('.date-cell')
    const newCells = Array.from(cells).slice(-(7 * props.rows))
    gsap.from(newCells, {
      opacity: 0,
      scale: 0.5,
      y: 20,
      duration: 0.4,
      stagger: 0.02,
      ease: 'back.out(1.5)',
    })
  } else {
    // 向上滚动，加载历史周
    const prevStart = startMonday.value.subtract(props.rows, 'week')
    weeks.value.unshift(...generateWeeks(prevStart, props.rows))
    await nextTick()

    gsap.set(contentEl, { y: -distance })
    gsap.to(contentEl, {
      y: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        startMonday.value = prevStart
        weeks.value = generateWeeks(startMonday.value, props.rows)
        isAnimating = false
      },
    })

    const cells = contentEl.querySelectorAll('.date-cell')
    const newCells = Array.from(cells).slice(0, 7 * props.rows)
    gsap.from(newCells, {
      opacity: 0,
      scale: 0.5,
      y: -20,
      duration: 0.4,
      stagger: 0.02,
      ease: 'back.out(1.5)',
    })
  }
}

// ==========================================
// Actions: Selection
// ==========================================
const handleSelect = (date: dayjs.Dayjs) => {
  if (date.isBefore(currentDate, 'day')) return
  selectedDate.value = date
}

// ==========================================
// Computed: Date Differences
// ==========================================
const isWorkday = (date: dayjs.Dayjs) => {
  const h = HolidayUtil.getHoliday(date.format('YYYY-MM-DD'))
  if (h) return h.isWork()
  const d = date.day()
  return d !== 0 && d !== 6
}

const diffWorkdays = computed(() => {
  let count = 0
  const start = currentDate.startOf('day')
  const end = selectedDate.value.startOf('day')
  if (start.isSame(end, 'day')) return 0

  let temp = start.clone()
  const step = end.isAfter(start) ? 1 : -1
  while (!temp.isSame(end, 'day')) {
    temp = temp.add(step, 'day')
    if (isWorkday(temp)) count++
  }
  return count
})

const diffData = computed(() => {
  const diff = selectedDate.value.startOf('day').diff(currentDate.startOf('day'), 'day')
  let mainType: 'word' | 'number' = 'word'
  let mainText = ''
  let mainNumber = 0
  let mainSuffix = ''

  if (diff === 0) mainText = '今天'
  else if (diff === 1) mainText = '明天'
  else if (diff === 2) mainText = '后天'
  else if (diff === -1) mainText = '昨天'
  else if (diff === -2) mainText = '前天'
  else {
    mainType = 'number'
    mainNumber = Math.abs(diff)
    mainSuffix = diff > 0 ? '天后' : '天前'
  }

  return { diff, mainType, mainText, mainNumber, mainSuffix, workdays: diffWorkdays.value }
})

// ==========================================
// Effects: Transition Delays
// ==========================================
const delays = ref<Record<string, number>>({ year: 0, month: 0, day: 0, diff: 0, workdays: 0 })

watch(selectedDate, (newVal, oldVal) => {
  if (!oldVal) return
  let d = 0
  const step = 0.08

  const updateDelay = (key: string, condition: boolean) => {
    if (condition) {
      delays.value[key] = d
      d += step
    } else {
      delays.value[key] = 0
    }
  }

  updateDelay('year', newVal.year() !== oldVal.year())
  updateDelay('month', newVal.month() !== oldVal.month())
  updateDelay('day', newVal.date() !== oldVal.date())

  const newDiff = newVal.startOf('day').diff(currentDate.startOf('day'), 'day')
  const oldDiff = oldVal.startOf('day').diff(currentDate.startOf('day'), 'day')
  updateDelay('diff', newDiff !== oldDiff)

  let oldWdCount = 0
  if (!currentDate.startOf('day').isSame(oldVal.startOf('day'), 'day')) {
    let t = currentDate.startOf('day').clone()
    const stp = oldVal.startOf('day').isAfter(currentDate.startOf('day')) ? 1 : -1
    while (!t.isSame(oldVal.startOf('day'), 'day')) {
      t = t.add(stp, 'day')
      if (isWorkday(t)) oldWdCount++
    }
  }
  updateDelay('workdays', diffWorkdays.value !== oldWdCount)
})

// ==========================================
// Actions: Interactive Pickers
// ==========================================
const pickingMode = ref<DateUnit | null>(null)
const pickerDirection = ref(1)

const getAdjacentDate = (unit: DateUnit, dir: number) => selectedDate.value.add(dir, unit)
const isPickerDisabled = (unit: DateUnit, dir: number) =>
  getAdjacentDate(unit, dir).isBefore(currentDate, 'day')

let lastPickerWheelTime = 0
const handlePickerWheel = (e: WheelEvent, unit: DateUnit) => {
  const now = Date.now()
  if (now - lastPickerWheelTime < 120) return
  lastPickerWheelTime = now
  handlePickerClick(unit, e.deltaY > 0 ? 1 : -1)
}

const handlePickerClick = async (unit: DateUnit, direction: number) => {
  if (direction === -1 && isPickerDisabled(unit, -1)) return

  pickerDirection.value = direction
  let newDate = selectedDate.value.add(direction, unit)
  if (newDate.isBefore(currentDate, 'day')) newDate = currentDate.clone()

  const oldStart = startMonday.value.format('YYYY-MM-DD')
  selectedDate.value = newDate
  startMonday.value = newDate.startOf('isoWeek')

  if (oldStart !== startMonday.value.format('YYYY-MM-DD')) {
    weeks.value = generateWeeks(startMonday.value, props.rows)
    await nextTick()
    const contentEl = gridRef.value?.contentRef
    if (contentEl) {
      gsap.killTweensOf(contentEl)
      gsap.fromTo(
        contentEl,
        { opacity: 0, scale: 0.98, y: direction > 0 ? 15 : -15 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power2.out' },
      )
    }
  }
}
</script>

<template>
  <div
    class="flex flex-col p-4 bg-background rounded-2xl select-none w-[360px] relative"
    :class="props.bordered ? 'border border-border shadow-lg' : ''"
  >
    <!-- Click-outside overlay for pickers -->
    <div v-if="pickingMode" class="fixed inset-0 z-40" @click="pickingMode = null"></div>

    <DatePickerHeader
      :selected-date="selectedDate"
      :current-date="currentDate"
      :diff-data="diffData"
      :delays="delays"
      :picking-mode="pickingMode"
      :picker-direction="pickerDirection"
      :pickers-config="pickersConfig"
      @update:picking-mode="pickingMode = $event"
      @picker-click="handlePickerClick"
      @picker-wheel="handlePickerWheel"
      @confirm="emits('confirm', selectedDate)"
    />

    <DatePickerGrid
      ref="gridRef"
      :weeks="weeks"
      :current-date="currentDate"
      :selected-date="selectedDate"
      :rows="props.rows"
      @select="handleSelect"
      @wheel="handleWheel"
    />
  </div>
</template>
