<template>
  <div>
    <van-nav-bar
      title="标题"
      @click-left="onClickLeft"
      @click-right="onClickRight"
    >
      <template #left>
        {{ cityName }}<van-icon color="black" name="arrow-down" />
      </template>
      <template #right>
        <van-icon size="23" color="black" name="search" />
      </template>
    </van-nav-bar>
    <!-- 影院列表 -->
    <div class="cinema">
      <ul>
        <li v-for="item in cinemaList" :key="item.cinemaId">
          <div>{{ item.name }}</div>
          <div class="address">{{ item.address }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, onActivated, watch } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import { NavBar } from "vant"
import BScroll from "@better-scroll/core"
import ScrollBar from "@better-scroll/scroll-bar" // 滚动条
import MouseWheel from "@better-scroll/mouse-wheel" // 鼠标滚动
BScroll.use(ScrollBar).use(MouseWheel)

const height = ref(0)

const store = useStore()
const cinemaList = computed(() => store.state.cinema.cinemaList)
const cityId = computed(() => store.state.city.cityId)
const cityName = computed(() => store.state.city.cityName)

// 请求影院列表数据
const getCinemaList = () => store.dispatch("getCinemaList", cityId.value)

// 初始化滚动条
const initializeScroll = () => {
  new BScroll(".cinema", {
    scrollbar: {
      fade: true,
    },
    mouseWheel: true,
  })
}

onMounted(() => {
  // 无需监听 cinemaList 的变化
  // 理由是切换路由选择城市，只会渲染一次
  getCinemaList(cityId.value).then(() => {
    // 加载完 cinamaList 以后再初始化 scroll 组件
    initializeScroll()
  })
})

// 点击nav-bar右侧搜索 跳转到Search.vue页面
const router = useRouter()
const onClickRight = () => {
  router.push("/cinema/search")
}
const onClickLeft = () => {
  router.push("/cinema/city")
}
</script>

<style lang="less" scoped>
.cinema {
  overflow: hidden;
  position: relative;
  height: calc(100vh - 106px);
  li {
    padding: 5px;
    .address {
      font-size: 12px;
      color: gray;
    }
  }
}
</style>
