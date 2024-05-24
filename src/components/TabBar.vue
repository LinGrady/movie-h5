<template>
  <div class="tabbar">
    <div
      :class="['tabButton', { active: isActive('/film') }]"
      @click="goTabBar('/film')"
    >
      <i class="iconfont icon-dianying"></i>
      <div>电影</div>
    </div>
    <div
      :class="['tabButton', { active: isActive('/cinema') }]"
      @click="goTabBar('/cinema')"
    >
      <i class="iconfont icon-yingyuan"></i>
      <div>影院</div>
    </div>
    <div
      :class="['tabButton', { active: isActive('/login') }]"
      @click="goTabBar('/login')"
    >
      <i class="iconfont icon-wode"></i>
      <div>我的</div>
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
  return route.path.startsWith(url)
}
</script>

<style lang="less" scoped>
.tabbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  border-top: 1px solid white;
  background-color: white;
  z-index: 99;
  display: flex;
  justify-content: space-around;
  .tabButton {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #707070;
    font-size: 15px;
    .iconfont {
      font-size: 25px !important;
    }
  }
  .active {
    color: #1296db;
  }
}
</style>
