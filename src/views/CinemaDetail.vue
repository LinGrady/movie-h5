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
                  <template v-if="filmSchedule.filmInfo.verticalCover || filmSchedule.filmInfo.poster">
                    <img 
                      :src="filmSchedule.filmInfo.verticalCover || filmSchedule.filmInfo.poster" 
                      :alt="filmSchedule.filmInfo.name"
                      @error="handleImageError"
                    />
                  </template>
                  <template v-else>
                    <div class="poster-placeholder">
                      <van-icon name="photo-o" size="30" color="#dcdee0" />
                    </div>
                  </template>
                </div>
                <div class="film-details">
                  <h3 class="film-name">{{ filmSchedule.filmInfo.name }}</h3>
                  <div class="film-meta">
                    <span>{{ filmSchedule.filmInfo.dimensional }}</span>
                    <span v-if="filmSchedule.filmInfo.duration">{{ filmSchedule.filmInfo.duration }}分钟</span>
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
                      v-for="schedule in getSchedulesForDate(dateInfo.scheduleIdList)" 
                      :key="schedule.scheduleID || schedule.id"
                      class="schedule-time-btn"
                      @click="handleScheduleClick(schedule.scheduleID || schedule.id)"
                    >
                      <div class="time">{{ schedule.showTime || '时间待定' }}</div>
                      <div class="price">¥{{ schedule.basePrice ? (schedule.basePrice / 100).toFixed(0) : '价格待定' }}</div>
                    </div>
                    
                    <!-- 如果没有排期详情，显示基本信息 -->
                    <template v-if="getSchedulesForDate(dateInfo.scheduleIdList).length === 0">
                      <div 
                        v-for="scheduleId in dateInfo.scheduleIdList"
                        :key="scheduleId"
                        class="schedule-time-btn loading"
                        @click="handleScheduleClick(scheduleId)"
                      >
                        <div class="time">加载中...</div>
                        <div class="price">¥--</div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 无排期状态 -->
          <div v-else-if="!loading" class="no-schedules">
            <van-empty description="暂无电影排期">
              <template #image>
                <van-icon name="tv-o" size="60" color="#dcdee0" />
              </template>
              <p>该影院暂无电影排期</p>
              <van-button type="primary" size="small" @click="loadCinemaSchedules">
                重新加载
              </van-button>
            </van-empty>
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
const scheduleList = computed(() => store.state.cinema.scheduleList)

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
    const schedules = await store.dispatch("getCinemaFilmSchedules", cinemaId)
    
    console.log("📅 影院排期数据:", schedules)
    
    // 收集所有排期ID
    const allScheduleIds = []
    schedules.forEach(filmSchedule => {
      if (filmSchedule.showDateList && Array.isArray(filmSchedule.showDateList)) {
        filmSchedule.showDateList.forEach(dateInfo => {
          if (dateInfo.scheduleIdList && Array.isArray(dateInfo.scheduleIdList)) {
            allScheduleIds.push(...dateInfo.scheduleIdList)
          }
        })
      }
    })
    
    console.log("🎬 收集到的排期ID:", allScheduleIds)
    
    // 批量获取排期详情
    if (allScheduleIds.length > 0) {
      const scheduleDetails = await store.dispatch("getScheduleList", allScheduleIds)
      console.log("⏰ 排期详情数据:", scheduleDetails)
    }
  } catch (error) {
    console.warn("获取排期失败:", error)
  }
}

// 格式化排期日期
const formatScheduleDate = (dateStr) => {
  try {
    // 处理时间戳格式（秒）
    let date
    if (typeof dateStr === 'number' || /^\d+$/.test(dateStr)) {
      date = dayjs.unix(parseInt(dateStr))
    } else {
      date = dayjs(dateStr)
    }
    
    if (!date.isValid()) {
      return '日期待定'
    }
    
    const today = dayjs()
    
    if (date.isSame(today, 'day')) {
      return '今天 ' + date.format('MM-DD')
    } else if (date.isSame(today.add(1, 'day'), 'day')) {
      return '明天 ' + date.format('MM-DD')
    } else {
      const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
      return date.format('MM-DD') + ' ' + weekDays[date.day()]
    }
  } catch (error) {
    console.warn('日期格式化失败:', dateStr, error)
    return '日期待定'
  }
}

// 根据排期ID列表获取对应的排期详情
const getSchedulesForDate = (scheduleIds) => {
  return scheduleIds.map(scheduleId => {
    return scheduleList.value.find(schedule => schedule.scheduleID === scheduleId)
  }).filter(Boolean) // 过滤掉undefined项目
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

// 处理图片加载错误
const handleImageError = (event) => {
  // 隐藏图片，显示占位图标
  event.target.style.display = 'none'
  const placeholder = event.target.parentNode.querySelector('.poster-placeholder')
  if (!placeholder) {
    const div = document.createElement('div')
    div.className = 'poster-placeholder'
    div.innerHTML = '<i class="van-icon van-icon-photo-o" style="font-size: 30px; color: #dcdee0;"></i>'
    event.target.parentNode.appendChild(div)
  }
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
            
            .poster-placeholder {
              width: 60px;
              height: 85px;
              border-radius: 4px;
              background-color: #f7f8fa;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px solid #ebedf0;
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
                padding: 6px 8px;
                font-size: 12px;
                color: #1989fa;
                border: 1px solid #1989fa;
                border-radius: 4px;
                text-align: center;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                
                .time {
                  font-weight: 500;
                  margin-bottom: 2px;
                }
                
                .price {
                  font-size: 10px;
                  color: #ff6b35;
                }
                
                &:active {
                  background-color: #1989fa;
                  color: #fff;
                  
                  .price {
                    color: #fff;
                  }
                }
                
                &.loading {
                  background-color: #f7f8fa;
                  color: #c8c9cc;
                  border-color: #e1e4e8;
                  cursor: default;
                  
                  &:active {
                    background-color: #f7f8fa;
                    color: #c8c9cc;
                  }
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