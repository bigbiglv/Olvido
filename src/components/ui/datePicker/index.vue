<script setup lang="ts">
import { ref, nextTick, computed, onMounted, watch } from 'vue'
import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'
import gsap from 'gsap'
import { Button } from '@/components/ui/button'

dayjs.extend(isoWeek)

const props = defineProps({
  rows: {
    type: Number,
    default: 2
  }
})

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

const contentRef = ref<HTMLElement | null>(null)
let isAnimating = false

onMounted(() => {
  if (contentRef.value) {
    const cells = contentRef.value.querySelectorAll('.date-cell')
    gsap.from(cells, {
      opacity: 0,
      scale: 0.5,
      y: 20,
      duration: 0.5,
      stagger: 0.02,
      ease: 'back.out(1.5)'
    })
  }
})

const handleWheel = async (e: WheelEvent) => {
  if (isAnimating) return
  isAnimating = true

  const direction = e.deltaY > 0 ? 1 : -1
  const weekHeight = 80 // h-20 is 80px
  const distance = weekHeight * props.rows // scroll by `props.rows` weeks

  if (direction === 1) { // scroll down, next weeks
    const nextStart = startMonday.value.add(props.rows, 'week')
    weeks.value.push(...generateWeeks(nextStart, props.rows))
    await nextTick()

    // Animate container up
    gsap.to(contentRef.value, {
      y: -distance,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        startMonday.value = nextStart
        weeks.value = generateWeeks(startMonday.value, props.rows)
        gsap.set(contentRef.value, { y: 0 })
        isAnimating = false
      }
    })

    // Stagger animate new cells in
    if (contentRef.value) {
      const cells = contentRef.value.querySelectorAll('.date-cell')
      const newCells = Array.from(cells).slice(-(7 * props.rows))
      gsap.from(newCells, {
        opacity: 0,
        scale: 0.5,
        y: 20,
        duration: 0.4,
        stagger: 0.02,
        ease: 'back.out(1.5)'
      })
    }
  } else { // scroll up, previous weeks
    const prevStart = startMonday.value.subtract(props.rows, 'week')
    weeks.value.unshift(...generateWeeks(prevStart, props.rows))
    await nextTick()
    gsap.set(contentRef.value, { y: -distance })

    gsap.to(contentRef.value, {
      y: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        startMonday.value = prevStart
        weeks.value = generateWeeks(startMonday.value, props.rows)
        isAnimating = false
      }
    })

    if (contentRef.value) {
      const cells = contentRef.value.querySelectorAll('.date-cell')
      const newCells = Array.from(cells).slice(0, 7 * props.rows)
      gsap.from(newCells, {
        opacity: 0,
        scale: 0.5,
        y: -20,
        duration: 0.4,
        stagger: 0.02,
        ease: 'back.out(1.5)'
      })
    }
  }
}

const isWeekend = (date: dayjs.Dayjs) => {
  const d = date.day()
  return d === 0 || d === 6
}

const handleSelect = (date: dayjs.Dayjs) => {
  if (date.isBefore(currentDate, 'day')) return
  selectedDate.value = date
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
    if (temp.day() !== 0 && temp.day() !== 6) {
      count++
    }
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
  
  return {
    diff,
    mainType,
    mainText,
    mainNumber,
    mainSuffix,
    workdays: diffWorkdays.value
  }
})

const delays = ref({
  year: 0,
  month: 0,
  day: 0,
  diff: 0,
  workdays: 0
})

watch(selectedDate, (newVal, oldVal) => {
  if (!oldVal) return
  let d = 0
  const step = 0.08 // 80ms stagger
  
  if (newVal.year() !== oldVal.year()) {
    delays.value.year = d
    d += step
  } else {
    delays.value.year = 0
  }
  
  if (newVal.month() !== oldVal.month()) {
    delays.value.month = d
    d += step
  } else {
    delays.value.month = 0
  }
  
  if (newVal.date() !== oldVal.date()) {
    delays.value.day = d
    d += step
  } else {
    delays.value.day = 0
  }
  
  const newDiff = newVal.startOf('day').diff(currentDate.startOf('day'), 'day')
  const oldDiff = oldVal.startOf('day').diff(currentDate.startOf('day'), 'day')
  if (newDiff !== oldDiff) {
    delays.value.diff = d
    d += step
  } else {
    delays.value.diff = 0
  }
  
  // To compute old workdays, calculate from oldVal
  let oldWdCount = 0
  if (!currentDate.startOf('day').isSame(oldVal.startOf('day'), 'day')) {
    let t = currentDate.startOf('day').clone()
    const stp = oldVal.startOf('day').isAfter(currentDate.startOf('day')) ? 1 : -1
    while (!t.isSame(oldVal.startOf('day'), 'day')) {
      t = t.add(stp, 'day')
      if (t.day() !== 0 && t.day() !== 6) oldWdCount++
    }
  }
  if (diffWorkdays.value !== oldWdCount) {
    delays.value.workdays = d
    d += step
  } else {
    delays.value.workdays = 0
  }
})
</script>

<template>
  <div class="flex flex-col p-4 bg-background rounded-2xl shadow-lg border border-border select-none w-[360px]">
    <div class="flex justify-between items-center mb-4">
      <div class="flex items-center ml-1 text-base font-semibold text-foreground">
        <!-- Year -->
        <div class="relative w-[44px] h-8 flex items-center overflow-hidden">
          <Transition name="date-slide">
            <span :key="selectedDate.format('YYYY')" class="absolute w-full text-center tracking-wide" :style="{ '--enter-delay': `${delays.year}s` }">
              {{ selectedDate.format('YYYY') }}
            </span>
          </Transition>
        </div>
        <span class="text-zinc-400 mx-0.5">-</span>
        <!-- Month -->
        <div class="relative w-[24px] h-8 flex items-center overflow-hidden">
          <Transition name="date-slide">
            <span :key="selectedDate.format('MM')" class="absolute w-full text-center tracking-wide" :style="{ '--enter-delay': `${delays.month}s` }">
              {{ selectedDate.format('MM') }}
            </span>
          </Transition>
        </div>
        <span class="text-zinc-400 mx-0.5">-</span>
        <!-- Day -->
        <div class="relative w-[24px] h-8 flex items-center overflow-hidden">
          <Transition name="date-slide">
            <span :key="selectedDate.format('DD')" class="absolute w-full text-center tracking-wide" :style="{ '--enter-delay': `${delays.day}s` }">
              {{ selectedDate.format('DD') }}
            </span>
          </Transition>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center text-xs font-medium h-6" :class="diffData.diff === 0 ? 'text-primary' : 'text-muted-foreground'">
          <template v-if="diffData.mainType === 'word'">
            <div class="relative h-full flex items-center justify-center overflow-hidden">
              <span class="invisible">{{ diffData.mainText }}</span>
              <Transition name="date-slide">
                <span :key="diffData.mainText" class="absolute w-full text-center" :style="{ '--enter-delay': `${delays.diff}s` }">{{ diffData.mainText }}</span>
              </Transition>
            </div>
          </template>
          <template v-else>
            <div class="relative h-full flex items-center justify-center overflow-hidden">
              <span class="invisible">{{ diffData.mainNumber }}</span>
              <Transition name="date-slide">
                <span :key="diffData.mainNumber" class="absolute w-full text-center" :style="{ '--enter-delay': `${delays.diff}s` }">{{ diffData.mainNumber }}</span>
              </Transition>
            </div>
            <span class="ml-0.5">{{ diffData.mainSuffix }}</span>
          </template>

          <template v-if="diffData.workdays > 0">
            <span class="ml-1 text-muted-foreground/80">(</span>
            <div class="relative h-full flex items-center justify-center overflow-hidden text-muted-foreground/80">
              <span class="invisible">{{ diffData.workdays }}</span>
              <Transition name="date-slide">
                <span :key="diffData.workdays" class="absolute w-full text-center" :style="{ '--enter-delay': `${delays.workdays}s` }">{{ diffData.workdays }}</span>
              </Transition>
            </div>
            <span class="text-muted-foreground/80">个工作日)</span>
          </template>
        </div>
        <Button size="sm" class="h-8 text-xs rounded-lg px-4 ml-1">确认</Button>
      </div>
    </div>

    <div class="overflow-hidden rounded-lg relative transition-all duration-300" :style="{ height: `${props.rows * 80}px` }" @wheel.prevent="handleWheel">
      <!-- Gradient masks for smooth top/bottom edge scrolling -->
      <div class="absolute top-0 left-0 w-full h-3 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none"></div>
      <div class="absolute bottom-0 left-0 w-full h-3 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none"></div>

      <div class="flex flex-col" ref="contentRef">
        <div v-for="(week, weekIndex) in weeks" :key="weekIndex" class="grid grid-cols-7 text-center h-20 items-center">
          <div v-for="date in week" :key="date.format('YYYY-MM-DD')" class="flex justify-center h-full items-center">
            <div @click="handleSelect(date)"
                 class="date-cell relative w-11 h-16 flex flex-col items-center justify-center rounded-xl cursor-pointer text-sm transition-colors duration-200"
                 :class="[
                   date.isBefore(currentDate, 'day') ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-0.5',
                   date.isSame(selectedDate, 'day')
                     ? 'bg-primary text-primary-foreground shadow-md font-bold'
                     : (date.isSame(currentDate, 'day')
                        ? 'text-primary font-bold border-2 border-primary bg-primary/5 hover:bg-primary/10'
                        : (date.isBefore(currentDate, 'day') ? 'text-muted-foreground' : 'text-foreground hover:bg-secondary'))
                 ]">
              <div v-if="isWeekend(date)" class="absolute top-1.5 w-4 h-[3px] rounded-full transition-colors"
                   :class="date.isSame(selectedDate, 'day') ? 'bg-primary-foreground/70' : 'bg-green-500'"></div>

              <span class="text-base font-medium z-10" :class="{'mt-1': isWeekend(date)}">{{ date.date() }}</span>

              <span v-if="date.date() === 1" class="absolute bottom-1.5 text-[10px] font-bold"
                    :class="date.isSame(selectedDate, 'day') ? 'text-primary-foreground/80' : 'text-primary'">
                {{ date.month() + 1 }}月
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.date-slide-enter-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: var(--enter-delay, 0s);
}

.date-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  transition-delay: 0s;
}

.date-slide-enter-from {
  opacity: 0;
  transform: translateY(15px);
}

.date-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px);
}
</style>
