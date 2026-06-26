<script setup lang="ts">
/**
 * DatePickerHeader.vue
 * 
 * 纯展示组件 (Dumb Component)。
 * 负责渲染顶部的日期控制区，包括：年/月/日选择器、时间差计算展示、确认按钮。
 * 所有状态均通过 props 传入，所有的用户交互均通过 emit 通知父组件。
 */
import { Button } from '@/components/ui/button'
import dayjs from 'dayjs'
import { PropType } from 'vue'

type DateUnit = 'year' | 'month' | 'day'

interface DiffData {
  diff: number
  mainType: 'word' | 'number'
  mainText: string
  mainNumber: number
  mainSuffix: string
  workdays: number
}

interface PickerConfig {
  unit: DateUnit
  format: string
  displayWidth: string
  popupWidth: string
}

const props = defineProps({
  /** 当前选中的目标日期 */
  selectedDate: { type: Object as PropType<dayjs.Dayjs>, required: true },
  /** 系统当前日期 (今天) */
  currentDate: { type: Object as PropType<dayjs.Dayjs>, required: true },
  /** 计算好的时间差数据对象 */
  diffData: { type: Object as PropType<DiffData>, required: true },
  /** 动画交错延迟数据对象 */
  delays: { type: Object as PropType<Record<string, number>>, required: true },
  /** 当前激活的微型选择器模式 */
  pickingMode: { type: String as PropType<DateUnit | null>, default: null },
  /** 微型选择器的滚动方向标识 (1: 向下/未来, -1: 向上/过去) */
  pickerDirection: { type: Number, default: 1 },
  /** 选择器结构渲染配置 */
  pickersConfig: { type: Array as PropType<PickerConfig[]>, required: true }
})

const emit = defineEmits(['update:pickingMode', 'pickerClick', 'pickerWheel', 'confirm'])

/** 获取相邻的日期用于展示在滚轮上下方 */
const getAdjacentDate = (unit: DateUnit, dir: number) => props.selectedDate.add(dir, unit)

/** 判断对应方向的日期是否为过去时间，以禁用选择 */
const isPickerDisabled = (unit: DateUnit, dir: number) => getAdjacentDate(unit, dir).isBefore(props.currentDate, 'day')

const setPickingMode = (mode: DateUnit | null) => {
  emit('update:pickingMode', mode)
}
</script>

<template>
  <div class="flex justify-between items-center mb-4 relative z-50">
    <!-- 左侧区域：年月日快速选择 -->
    <div class="flex items-center ml-1 text-base font-semibold text-foreground relative z-50">
      
      <template v-for="(picker, index) in pickersConfig" :key="picker.unit">
        <div class="relative flex justify-center items-center">
          <!-- 静态文本触发器 -->
          <div
:class="`relative ${picker.displayWidth} h-8 flex items-center justify-center overflow-hidden cursor-pointer hover:text-primary transition-colors`" 
               @click="setPickingMode(picker.unit)">
            <Transition name="date-slide">
              <span :key="selectedDate.format(picker.format)" class="absolute w-full text-center tracking-wide" :style="{ '--enter-delay': `${delays[picker.unit]}s` }">
                {{ selectedDate.format(picker.format) }}
              </span>
            </Transition>
          </div>
          
          <!-- 悬浮弹窗选择器 -->
          <Transition name="fade-scale">
            <div v-if="pickingMode === picker.unit" class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
              <div
:class="`bg-background/80 backdrop-blur-xl shadow-2xl border border-border/40 rounded-2xl flex flex-col p-1 select-none origin-center ${picker.popupWidth} gap-0.5`" 
                   @wheel.prevent.stop="emit('pickerWheel', $event, picker.unit)">
                
                <!-- 上一个 -->
                <div
class="relative flex items-center justify-center h-[26px] w-full transition-colors rounded-lg overflow-hidden"
                     :class="isPickerDisabled(picker.unit, -1) ? 'opacity-30 cursor-not-allowed' : 'hover:bg-secondary cursor-pointer'"
                     @click.stop="emit('pickerClick', picker.unit, -1)">
                  <Transition :name="pickerDirection > 0 ? 'picker-slide-up' : 'picker-slide-down'">
                    <span :key="getAdjacentDate(picker.unit, -1).format(picker.format)" class="absolute w-full text-center text-[12px] font-medium text-muted-foreground/60 transition-colors" :class="!isPickerDisabled(picker.unit, -1) && 'hover:text-foreground'">{{ getAdjacentDate(picker.unit, -1).format(picker.format) }}</span>
                  </Transition>
                </div>
                
                <!-- 当前选中 -->
                <div class="relative flex items-center justify-center h-[30px] w-full bg-primary/10 rounded-lg overflow-hidden">
                  <Transition :name="pickerDirection > 0 ? 'picker-slide-up' : 'picker-slide-down'">
                    <span :key="selectedDate.format(picker.format)" class="absolute w-full text-center text-[14px] font-bold text-primary">{{ selectedDate.format(picker.format) }}</span>
                  </Transition>
                </div>
                
                <!-- 下一个 -->
                <div
class="relative flex items-center justify-center h-[26px] w-full transition-colors rounded-lg overflow-hidden hover:bg-secondary cursor-pointer"
                     @click.stop="emit('pickerClick', picker.unit, 1)">
                  <Transition :name="pickerDirection > 0 ? 'picker-slide-up' : 'picker-slide-down'">
                    <span :key="getAdjacentDate(picker.unit, 1).format(picker.format)" class="absolute w-full text-center text-[12px] font-medium text-muted-foreground/60 transition-colors hover:text-foreground">{{ getAdjacentDate(picker.unit, 1).format(picker.format) }}</span>
                  </Transition>
                </div>
                
              </div>
            </div>
          </Transition>
        </div>

        <!-- 破折号分隔符 -->
        <span v-if="index < pickersConfig.length - 1" class="text-zinc-400 mx-0.5">-</span>
      </template>
    </div>

    <!-- 右侧区域：差值展示与确认 -->
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
      <Button size="sm" class="h-8 text-xs rounded-lg px-4 ml-1" @click="emit('confirm')">确认</Button>
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

.date-slide-enter-from { opacity: 0; transform: translateY(15px); }
.date-slide-leave-to { opacity: 0; transform: translateY(-15px); }

.fade-scale-enter-active,
.fade-scale-leave-active,
.fade-scale-enter-active > div,
.fade-scale-leave-active > div {
  transition: opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to { opacity: 0; }
.fade-scale-enter-from > div,
.fade-scale-leave-to > div { transform: scale(0.8); }

.picker-slide-up-enter-active,
.picker-slide-up-leave-active,
.picker-slide-down-enter-active,
.picker-slide-down-leave-active {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}

.picker-slide-up-enter-from { transform: translateY(15px); opacity: 0; }
.picker-slide-up-leave-to { transform: translateY(-15px); opacity: 0; }

.picker-slide-down-enter-from { transform: translateY(-15px); opacity: 0; }
.picker-slide-down-leave-to { transform: translateY(15px); opacity: 0; }
</style>
