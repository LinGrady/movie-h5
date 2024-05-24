<template>
  <div class="swiper" :class="props.slideClass">
    <div class="swiper-wrapper">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue"
import Swiper from "swiper"
import "swiper/css"

const props = defineProps({
  perslide: Number,
  slideClass: String,
})

onMounted(() => {
  const swiper = new Swiper(`.${props.slideClass}`, {
    slidesPerView: props.perslide,
  })
})
</script>

<style lang="less" scoped></style>
