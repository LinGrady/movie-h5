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
    <div class="search-btn" @click="goToSearch">
      <van-icon name="search" size="20" />
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router"

const router = useRouter()
const goTabBar = (url) => {
  router.push(url)
}

// 跳转到搜索页面
const goToSearch = () => {
  router.push("/film/search")
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
  position: relative;
  
  div {
    flex: 1;
  }
  
  .active {
    color: rgb(177, 4, 4);
    border-bottom: 2px solid rgb(177, 4, 4);
  }
  
  .search-btn {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 50%;
    flex: none !important;
    
    &:active {
      background-color: #f7f8fa;
    }
  }
}
</style>
