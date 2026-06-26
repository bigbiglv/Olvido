<template>
  <div class="absolute inset-0 z-0 overflow-hidden irregular-shape">
    <!-- 基础磨砂玻璃背景 -->
    <div class="absolute inset-0 bg-white/40 dark:bg-zinc-800/40 backdrop-blur-md"></div>
    
    <!-- 激进的动态网格/流体元素赋予设计感 -->
    <div class="absolute -left-6 -top-6 w-24 h-24 bg-indigo-500/30 dark:bg-indigo-500/40 rounded-full mix-blend-multiply blur-2xl animate-float-1"></div>
    <div class="absolute right-0 bottom-0 w-28 h-28 bg-purple-500/30 dark:bg-purple-500/40 rounded-full mix-blend-multiply blur-2xl animate-float-2"></div>
    
    <!-- 左侧强调线 -->
    <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-indigo-500/80 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.6)]"></div>
    
    <!-- 边框高光 -->
    <div class="absolute inset-0 border border-white/60 dark:border-white/10 irregular-shape"></div>
  </div>
</template>

<style scoped>
/* 紧凑且带有微小不规则的设计感轮廓 */
.irregular-shape {
  border-radius: 6px 10px 6px 8px;
}

/* 更加激进且绝对平滑的交错往复动画 */
@keyframes float-1 {
  0% { transform: translate(0, 0) scale(0.8) rotate(0deg); }
  100% { transform: translate(25px, 15px) scale(1.5) rotate(45deg); }
}

@keyframes float-2 {
  0% { transform: translate(0, 0) scale(0.8) rotate(0deg); }
  100% { transform: translate(-30px, -20px) scale(1.6) rotate(-45deg); }
}

.animate-float-1 {
  animation: float-1 4s ease-in-out infinite alternate;
}

.animate-float-2 {
  animation: float-2 5s ease-in-out infinite alternate;
}
</style>
