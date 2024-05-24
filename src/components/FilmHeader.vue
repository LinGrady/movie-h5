<template>
  <div class="film-header">
    <div
      :class="{ active: isActive('/film/onshow') }"
      @click="goTabBar('/film/onshow')"
    >
      正在热映
    </div>
    <div
      :class="{ active: isActive('/film/comingsoon') }"
      @click="goTabBar('/film/comingsoon')"
    >
      即将上映
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router"

const router = useRouter()
const goTabBar = (url) => {
  router.push(url)
}

// TabBar 激活效果
const route = useRoute()
const isActive = (url) => {
  return route.path === url
}
</script>

<style lang="less" scoped>
.film-header {
  display: flex;
  height: 50px;
  line-height: 50px;
  text-align: center;
  font-size: 22px;
  font-weight: 600;
  div {
    flex: 1;
  }
  .active {
    color: rgb(177, 4, 4);
    border-bottom: 2px solid rgb(177, 4, 4);
  }
}
</style>
