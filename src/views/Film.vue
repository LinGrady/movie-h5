<template>
  <div>
    <!-- 轮播图 -->
    <film-swiper>
      <div class="swiper-slide" v-for="(imgUrl, index) in imgList" :key="index">
        <div
          class="swiper-image"
          :style="{ backgroundImage: `url(${imgUrl})` }"
        ></div>
      </div>
    </film-swiper>
    <!-- 内容 -->
    <film-header></film-header>
    <router-view></router-view>
  </div>
</template>

<script setup>
import { ref } from "vue"
import FilmSwiper from "../components/FilmSwiper.vue" // 轮播图
import FilmHeader from "../components/FilmHeader.vue" // 热映/上映 切换

const imgList = ref([
  "http://124.223.69.156:5500/h5-01.jpg",
  "http://124.223.69.156:5500/h5-02.jpg",
  "http://124.223.69.156:5500/h5-03.png",
])
</script>

<style lang="less" scoped>
.swiper-slide {
  .swiper-image {
    height: 200px;
    background-size: cover;
    background-position: center center;
  }
}
</style>
