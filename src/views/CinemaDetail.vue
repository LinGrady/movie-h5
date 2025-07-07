<template>
  <div class="cinema-detail-container">
    <!-- 导航栏 -->
    <van-nav-bar
      :title="cinemaDetail?.name || '影院详情'"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <!-- 影院基本信息 -->
    <div v-if="cinemaDetail" class="cinema-info">
      <div class="cinema-header">
        <div class="cinema-logo" v-if="cinemaDetail.logo">
          <img :src="cinemaDetail.logo" :alt="cinemaDetail.name" />
        </div>
        <div class="cinema-basic">
          <h2 class="cinema-name">{{ cinemaDetail.name }}</h2>
          <div class="cinema-address">
            <van-icon name="location-o" />
            <span>{{ cinemaDetail.address }}</span>
          </div>
          <div v-if="cinemaDetail.phoneNum" class="cinema-phone">
            <van-icon name="phone-o" />
            <span>{{ cinemaDetail.phoneNum }}</span>
          </div>
        </div>
        <div class="cinema-actions">
          <van-button 
            type="primary" 
            size="small" 
            @click="callCinema"
            v-if="cinemaDetail.phoneNum"
          >
            拨打电话
          </van-button>
        </div>
      </div>
      
      <!-- 影院详细信息 -->
      <div class="cinema-details">
        <van-cell-group title="影院信息">
          <van-cell v-if="cinemaDetail.businessTime" title="营业时间" :value="cinemaDetail.businessTime" />
          <van-cell v-if="cinemaDetail.lowestPrice" title="最低价格" :value="`${(cinemaDetail.lowestPrice / 100).toFixed(2)}元`" />
          <van-cell v-if="cinemaDetail.hallInfo" title="影厅信息" :value="cinemaDetail.hallInfo" />
          <van-cell v-if="cinemaDetail.parkingInfo" title="停车信息" :value="cinemaDetail.parkingInfo" />
          <van-cell v-if="cinemaDetail.the3dGlassesInfo" title="3D眼镜" :value="cinemaDetail.the3dGlassesInfo" />
          <van-cell v-if="cinemaDetail.childTicketInfo" title="儿童票" :value="cinemaDetail.childTicketInfo" />
        </van-cell-group>
        
        <div v-if="cinemaDetail.otherInfo" class="other-info">
          <h3>其他信息</h3>
          <p>{{ cinemaDetail.otherInfo }}</p>
        </div>
      </div>
    </div>
    
    <!-- 电影排期 -->
    <div class="cinema-schedules">
      <van-tabs v-model:active="activeTab" @change="handleTabChange">
        <van-tab title="正在上映">
          <div v-if="filmSchedules.length > 0" class="schedule-list">
            <div 
              v-for="filmSchedule in filmSchedules" 
              :key="filmSchedule.filmInfo.filmId"
              class="film-schedule-item"
            >
              <!-- 电影信息 -->
              <div class="film-info">
                <div class="film-poster">
                  <img :src="filmSchedule.filmInfo.poster" :alt="filmSchedule.filmInfo.name" />
                </div>
                <div class="film-details">
                  <h3 class="film-name">{{ filmSchedule.filmInfo.name }}</h3>
                  <div class="film-meta">
                    <span>{{ filmSchedule.filmInfo.dimensional }}</span>
                    <span>{{ filmSchedule.filmInfo.duration }}分钟</span>
                    <span v-if="filmSchedule.filmInfo.grade">{{ filmSchedule.filmInfo.grade }}分</span>
                  </div>
                </div>
              </div>
              
              <!-- 排期时间 -->
              <div class="schedule-dates">
                <div 
                  v-for="dateInfo in filmSchedule.showDateList" 
                  :key="dateInfo.showDate"
                  class="date-section"
                >
                  <div class="date-header">
                    {{ formatScheduleDate(dateInfo.showDate) }}
                  </div>
                  <div class="schedule-times">
                    <div 
                      v-for="scheduleId in dateInfo.scheduleIdList" 
                      :key="scheduleId"
                      class="schedule-time-btn"
                      @click="handleScheduleClick(scheduleId)"
                    >
                      加载中...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 无排期状态 -->
          <div v-else-if="!loading" class="no-schedules">
            <van-empty description="暂无电影排期" />
          </div>
        </van-tab>
      </van-tabs>
    </div>
    
    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading-overlay" type="spinner" size="24px">
      加载中...
    </van-loading>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useStore } from "vuex"
import { showToast, showConfirmDialog } from "vant"
import dayjs from "dayjs"

const router = useRouter()
const route = useRoute()
const store = useStore()

// 响应式数据
const activeTab = ref(0)
const loading = ref(false)

// 计算属性
const cinemaDetail = computed(() => store.state.cinema.cinemaDetail)
const filmSchedules = computed(() => {
  const cinemaId = route.params.id
  return store.state.cinema.cinemaSchedules[cinemaId] || []
})

// 获取影院详情
const loadCinemaDetail = async () => {
  try {
    loading.value = true
    const cinemaId = route.params.id
    
    await store.dispatch("getCinemaDetail", cinemaId)
  } catch (error) {
    showToast(error.message || "获取影院详情失败")
  } finally {
    loading.value = false
  }
}

// 获取影院排期
const loadCinemaSchedules = async () => {
  try {
    const cinemaId = route.params.id
    await store.dispatch("getCinemaFilmSchedules", cinemaId)
  } catch (error) {
    console.warn("获取排期失败:", error)
  }
}

// 格式化排期日期
const formatScheduleDate = (dateStr) => {
  const date = dayjs(dateStr)
  const today = dayjs()
  
  if (date.isSame(today, 'day')) {
    return '今天 ' + date.format('MM-DD')
  } else if (date.isSame(today.add(1, 'day'), 'day')) {
    return '明天 ' + date.format('MM-DD')
  } else {
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    return date.format('MM-DD') + ' ' + weekDays[date.day()]
  }
}

// 切换标签
const handleTabChange = (index) => {
  activeTab.value = index
}

// 点击排期
const handleScheduleClick = (scheduleId) => {
  router.push(`/schedule/${scheduleId}/seat`)
}

// 拨打电话
const callCinema = () => {
  if (cinemaDetail.value?.phoneNum) {
    showConfirmDialog({
      title: '拨打电话',
      message: `确定要拨打 ${cinemaDetail.value.phoneNum} 吗？`,
    }).then(() => {
      window.location.href = `tel:${cinemaDetail.value.phoneNum}`
    }).catch(() => {
      // 用户取消
    })
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 页面挂载
onMounted(async () => {
  await loadCinemaDetail()
  await loadCinemaSchedules()
})
</script>

<style lang="less" scoped>
.cinema-detail-container {
  background-color: #f7f8fa;
  min-height: 100vh;
  
  .cinema-info {
    background-color: #fff;
    margin-bottom: 10px;
    
    .cinema-header {
      display: flex;
      padding: 16px;
      border-bottom: 1px solid #ebedf0;
      
      .cinema-logo {
        margin-right: 12px;
        
        img {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
        }
      }
      
      .cinema-basic {
        flex: 1;
        min-width: 0;
        
        .cinema-name {
          font-size: 18px;
          font-weight: 600;
          color: #191a1b;
          margin-bottom: 8px;
        }
        
        .cinema-address,
        .cinema-phone {
          display: flex;
          align-items: center;
          margin-bottom: 4px;
          font-size: 14px;
          color: #646566;
          
          .van-icon {
            margin-right: 4px;
            color: #969799;
          }
        }
      }
      
      .cinema-actions {
        display: flex;
        align-items: center;
      }
    }
    
    .cinema-details {
      .other-info {
        padding: 16px;
        
        h3 {
          font-size: 16px;
          color: #191a1b;
          margin-bottom: 8px;
        }
        
        p {
          font-size: 14px;
          color: #646566;
          line-height: 1.6;
        }
      }
    }
  }
  
  .cinema-schedules {
    background-color: #fff;
    
    .schedule-list {
      .film-schedule-item {
        border-bottom: 10px solid #f7f8fa;
        
        .film-info {
          display: flex;
          padding: 16px;
          border-bottom: 1px solid #ebedf0;
          
          .film-poster {
            margin-right: 12px;
            
            img {
              width: 60px;
              height: 85px;
              border-radius: 4px;
              object-fit: cover;
            }
          }
          
          .film-details {
            flex: 1;
            
            .film-name {
              font-size: 16px;
              font-weight: 600;
              color: #191a1b;
              margin-bottom: 8px;
            }
            
            .film-meta {
              display: flex;
              gap: 8px;
              font-size: 12px;
              color: #969799;
              
              span {
                padding: 2px 6px;
                background-color: #f2f3f5;
                border-radius: 2px;
              }
            }
          }
        }
        
        .schedule-dates {
          .date-section {
            padding: 12px 16px;
            border-bottom: 1px solid #f7f8fa;
            
            &:last-child {
              border-bottom: none;
            }
            
            .date-header {
              font-size: 14px;
              font-weight: 500;
              color: #191a1b;
              margin-bottom: 8px;
            }
            
            .schedule-times {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;
              
              .schedule-time-btn {
                min-width: 80px;
                padding: 8px 12px;
                font-size: 12px;
                color: #1989fa;
                border: 1px solid #1989fa;
                border-radius: 4px;
                text-align: center;
                cursor: pointer;
                
                &:active {
                  background-color: #1989fa;
                  color: #fff;
                }
              }
            }
          }
        }
      }
    }
    
    .no-schedules {
      padding: 60px 0;
      text-align: center;
    }
  }
  
  .loading-overlay {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
  }
}
</style> 