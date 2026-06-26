<script setup lang="ts">
import { onMounted, useTemplateRef, watch } from "vue";
import gsap from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(MorphSVGPlugin);

const {
  paths,
  activeIndex = 0,
  duration = 0.42,
  ease = "power2.inOut",
  size = "100%",
  viewBox = "0 0 24 24",
  morphType = "linear",
  shapeIndex = "auto",
} = defineProps<{
  paths: string[];
  activeIndex?: number;
  duration?: number;
  ease?: string;
  size?: string;
  viewBox?: string;
  morphType?: "linear" | "rotational";
  shapeIndex?: number | "auto" | number[];
}>();

const pathRef = useTemplateRef<SVGPathElement>("pathRef");
let currentIndex = activeIndex;

onMounted(() => {
  pathRef.value?.setAttribute("d", paths[activeIndex] ?? paths[0] ?? "");
});

watch(
  () => activeIndex,
  (nextIndex) => {
    if (!pathRef.value || nextIndex === currentIndex || !paths[nextIndex]) {
      return;
    }

    gsap.to(pathRef.value, {
      morphSVG: {
        shape: paths[nextIndex],
        type: morphType,
        shapeIndex: shapeIndex,
      },
      duration,
      ease,
      onComplete: () => {
        currentIndex = nextIndex;
      },
    });
  },
);
</script>

<template>
  <svg 
    class="morph-icon" 
    :width="size" 
    :height="size" 
    :viewBox="viewBox" 
    aria-hidden="true"
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  >
    <path ref="pathRef" />
  </svg>
</template>
