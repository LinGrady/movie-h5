<template>
  <div class="swiper" :class="props.swiperclass">
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
  perslide: {
    type: Number,
    default: 1,
  },
  swiperclass: {
    type: String,
    default: "swiper-container",
  },
})

onMounted(() => {
  const swiper = new Swiper(`.${props.swiperclass}`, {
    slidesPerView: props.perslide,
    freeMode: true,
  })
})
</script>
