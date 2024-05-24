<template>
  <div class="swiper">
    <div class="swiper-wrapper">
      <slot></slot>
    </div>
    <div class="swiper-pagination"></div>
  </div>
</template>

<script setup>
import { onMounted } from "vue"
import Swiper from "swiper"
import { Pagination, Autoplay } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"
import "swiper/css/autoplay"

onMounted(() => {
  const swiper = new Swiper(".swiper", {
    modules: [Pagination, Autoplay],
    pagination: {
      el: ".swiper-pagination",
    },
    loop: true,
    autoplay: {
      delay: 3000,
    },
  })
})
</script>
