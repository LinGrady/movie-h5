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
        <li 
          v-for="item in cinemaList" 
          :key="item.cinemaId || item.id" 
          @click="handleCinemaClick(item)"
          class="cinema-item"
        >
          <div class="cinema-content">
            <div class="cinema-main">
              <div class="cinema-name">{{ item.name }}</div>
              <div class="cinema-address">{{ item.address }}</div>
              <div v-if="item.lowestPrice" class="cinema-price">
                最低价 ¥{{ (item.lowestPrice / 100).toFixed(2) }}
              </div>
            </div>
            <div class="cinema-action">
              <van-icon name="arrow" />
            </div>
          </div>
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
const getCinemaList = () => store.dispatch("getCinemaList", { cityId: cityId.value })

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

// 点击影院跳转详情页
const handleCinemaClick = (cinema) => {
  const cinemaId = cinema.cinemaId || cinema.id
  router.push(`/cinema/${cinemaId}`)
}
</script>

<style lang="less" scoped>
.cinema {
  overflow: hidden;
  position: relative;
  height: calc(100vh - 106px);
  background-color: #fff;
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .cinema-item {
    border-bottom: 1px solid #ebedf0;
    cursor: pointer;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:active {
      background-color: #f7f8fa;
    }
    
    .cinema-content {
      display: flex;
      align-items: center;
      padding: 16px;
      
      .cinema-main {
        flex: 1;
        min-width: 0;
        
        .cinema-name {
          font-size: 16px;
          font-weight: 500;
          color: #191a1b;
          margin-bottom: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .cinema-address {
          font-size: 13px;
          color: #646566;
          margin-bottom: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .cinema-price {
          font-size: 12px;
          color: #ff6b35;
          font-weight: 500;
        }
      }
      
      .cinema-action {
        margin-left: 12px;
        color: #c8c9cc;
      }
    }
  }
}
</style>
