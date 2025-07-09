<template>
  <div class="coming-soon-container">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      :immediate-check="false"
      finished-text="- 无更多电影 -"
      @load="onLoad"
      style="margin-bottom: 60px"
    >
      <van-cell
        v-for="item in filmList"
        :key="item.filmId"
        class="film-item"
        @click="handleFilmClick(item.filmId)"
      >
        <div class="film-content">
          <!-- 电影海报 -->
          <div class="film-poster">
            <img :src="item.poster" :alt="item.name" />
          </div>
          
          <!-- 电影信息 -->
          <div class="film-info">
            <div class="film-title">
              <span class="name">{{ item.name }}</span>
              <span v-if="item.item" class="item-tag">{{ item.item.name }}</span>
            </div>
            
            <div class="film-actors">
              <span class="label">主演：{{ formatActors(item.actors) }}</span>
            </div>
            
            <div class="film-premiere">
              <span class="label">上映日期：{{ formatPremiereTime(item.premiereAt) }}</span>
            </div>
          </div>
          
          <!-- 预购按钮 -->
          <div v-if="item.isPresale" class="presale-btn" @click.stop="handlePresale(item.filmId)">
            预购
          </div>
        </div>
      </van-cell>
    </van-list>
    
    <!-- 错误状态 -->
    <div v-if="showError" class="error-cover">
      <div class="error-content">
        <van-icon name="warning-o" size="60" color="#ccc" />
        <p>访问异常，请稍后再试</p>
        <van-button type="primary" @click="retry">重试</van-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import { showToast } from "vant"
import { formatPremiereTime, formatActors } from "../../utils/dateFormat"

const router = useRouter()
const store = useStore()

// 响应式数据
const loading = ref(false)
const finished = ref(false)
const currentPage = ref(1)
const showError = ref(false)

// 计算属性
const filmList = computed(() => store.state.film.comingSoonList)
const total = computed(() => store.state.film.comingSoonTotal)
const cityId = computed(() => store.state.city.cityId)

// 是否可以加载更多
const canLoadMore = computed(() => {
  return filmList.value.length < total.value
})

// 加载电影列表
const loadFilmList = async (pageNum = 1, isLoadMore = false) => {
  try {
    loading.value = true
    showError.value = false
    
    const result = await store.dispatch("getComingSoonList", {
      cityId: cityId.value,
      pageNum,
      pageSize: 10,
    })
    
    // 如果没有更多数据
    if (!result.films || result.films.length === 0) {
      finished.value = true
    }
    
    loading.value = false
  } catch (error) {
    loading.value = false
    if (pageNum === 1) {
      showError.value = true
    } else {
      showToast(error.message || "加载失败")
    }
  }
}

// 上拉加载更多
const onLoad = () => {
  if (!canLoadMore.value) {
    finished.value = true
    return
  }
  
  currentPage.value++
  loadFilmList(currentPage.value, true)
}

// 点击电影跳转详情页
const handleFilmClick = (filmId) => {
  router.push(`/detail?id=${filmId}`)
}

// 点击预购按钮
const handlePresale = (filmId) => {
  // TODO: 实现预购功能，跳转到影院选择页
  router.push(`/film/${filmId}/cinemas`)
}

// 重试加载
const retry = () => {
  currentPage.value = 1
  finished.value = false
  loadFilmList(1)
}

// 页面挂载时加载数据
onMounted(() => {
  loadFilmList(1)
})
</script>

<style lang="less" scoped>
.coming-soon-container {
  background-color: #fff;
  min-height: 100vh;
  
  .film-item {
    padding: 0;
    
    :deep(.van-cell__value) {
      padding: 15px;
    }
  }
  
  .film-content {
    display: flex;
    align-items: flex-start;
    position: relative;
    min-height: 94px; /* 确保最小高度 */
    
    .film-poster {
      flex-shrink: 0; /* 防止海报被压缩 */
      img {
        width: 66px;
        height: 94px;
        border-radius: 4px;
        object-fit: cover;
        display: block; /* 避免图片底部空隙 */
      }
    }
    
    .film-info {
      flex: 1;
      padding: 0 12px;
      min-width: 0; /* 解决flex子元素溢出问题 */
      padding-right: 70px; /* 为预购按钮预留空间 */
      
      .film-title {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        
        .name {
          font-size: 16px;
          color: #191a1b;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .item-tag {
          margin-left: 6px;
          font-size: 9px;
          color: #fff;
          background-color: #d2d6dc;
          padding: 1px 3px;
          border-radius: 2px;
          height: 14px;
          line-height: 12px;
          flex-shrink: 0; /* 防止标签被压缩 */
        }
      }
      
      .film-actors,
      .film-premiere {
        display: flex;
        margin-bottom: 6px;
        
        .label {
          font-size: 13px;
          color: #797d82;
          line-height: 1.4;
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
    
    .presale-btn {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%); /* 垂直居中 */
      width: 50px;
      height: 25px;
      line-height: 25px;
      text-align: center;
      font-size: 13px;
      color: #ffb232;
      border: 1px solid #ffb232;
      border-radius: 2px;
      cursor: pointer;
      
      &:active {
        background-color: #ffb232;
        color: #fff;
      }
    }
  }
  
  .error-cover {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    
    .error-content {
      text-align: center;
      
      p {
        margin: 20px 0;
        color: #bdc0c5;
        font-size: 14px;
      }
    }
  }
}
</style>
