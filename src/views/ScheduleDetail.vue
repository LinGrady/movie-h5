<template>
  <div class="schedule-detail-container">
    <!-- 导航栏 -->
    <van-nav-bar
      title="选择座位"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <!-- 排期信息 -->
    <div v-if="scheduleDetail" class="schedule-info">
      <div class="film-info">
        <h3>{{ scheduleDetail.filmName }}</h3>
        <p>{{ scheduleDetail.dimensional }} | {{ scheduleDetail.language }} | {{ scheduleDetail.duration }}分钟</p>
      </div>
      <div class="cinema-info">
        <p>{{ scheduleDetail.cinemaName }} {{ scheduleDetail.hallName }}</p>
        <p>{{ formatShowTime(scheduleDetail.showDate, scheduleDetail.showTime) }}</p>
      </div>
      <div class="price-info">
        <span class="price">¥{{ (scheduleDetail.basePrice / 100).toFixed(2) }}</span>
      </div>
    </div>
    
    <!-- 座位图 -->
    <div class="seat-map-container">
      <div class="screen">银幕中央</div>
      
      <!-- 座位图 -->
      <div v-if="seatMap.length > 0" class="seat-map">
        <div 
          v-for="(row, rowIndex) in seatRows" 
          :key="rowIndex"
          class="seat-row"
        >
          <span class="row-label">{{ row.rowId }}</span>
          <div class="seats">
            <div
              v-for="seat in row.seats"
              :key="seat.seatId"
              :class="getSeatClass(seat)"
              @click="handleSeatClick(seat)"
            >
              {{ seat.columnId }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 座位图例 -->
      <div class="seat-legend">
        <div class="legend-item">
          <div class="seat available"></div>
          <span>可选</span>
        </div>
        <div class="legend-item">
          <div class="seat selected"></div>
          <span>已选</span>
        </div>
        <div class="legend-item">
          <div class="seat occupied"></div>
          <span>已售</span>
        </div>
        <div class="legend-item">
          <div class="seat unavailable"></div>
          <span>不可选</span>
        </div>
      </div>
    </div>
    
    <!-- 已选座位和确认按钮 -->
    <div v-if="selectedSeats.length > 0" class="booking-footer">
      <div class="selected-info">
        <div class="selected-seats">
          已选座位：
          <span v-for="seat in selectedSeats" :key="seat.seatId" class="seat-tag">
            {{ seat.rowId }}排{{ seat.columnId }}座
          </span>
        </div>
        <div class="total-price">
          总价：¥{{ totalPrice.toFixed(2) }}
        </div>
      </div>
      <van-button type="primary" class="confirm-btn" @click="handleConfirm">
        确认选座
      </van-button>
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
import { showToast } from "vant"
import dayjs from "dayjs"

const router = useRouter()
const route = useRoute()
const store = useStore()

// 响应式数据
const loading = ref(false)
const selectedSeats = ref([])

// 计算属性
const scheduleDetail = computed(() => store.state.cinema.scheduleDetail)
const seatMap = computed(() => {
  const scheduleId = route.params.scheduleId
  return store.state.cinema.seatMap[scheduleId] || []
})

// 将座位按行分组
const seatRows = computed(() => {
  if (seatMap.value.length === 0) return []
  
  const rows = {}
  seatMap.value.forEach(seat => {
    if (!rows[seat.rowId]) {
      rows[seat.rowId] = {
        rowId: seat.rowId,
        seats: []
      }
    }
    rows[seat.rowId].seats.push(seat)
  })
  
  // 按行号排序
  return Object.values(rows).sort((a, b) => a.rowId.localeCompare(b.rowId))
})

// 计算总价
const totalPrice = computed(() => {
  return selectedSeats.value.reduce((total, seat) => {
    // 假设所有座位价格相同，实际应该根据分区价格计算
    const basePrice = scheduleDetail.value?.basePrice || 0
    return total + (basePrice / 100)
  }, 0)
})

// 获取座位样式类
const getSeatClass = (seat) => {
  const classes = ['seat']
  
  if (seat.damagedFlag === 1) {
    classes.push('unavailable')
  } else if (seat.isLocked === 1) {
    classes.push('occupied')
  } else if (selectedSeats.value.some(s => s.seatId === seat.seatId)) {
    classes.push('selected')
  } else {
    classes.push('available')
  }
  
  return classes
}

// 处理座位点击
const handleSeatClick = (seat) => {
  // 不可选择的座位
  if (seat.damagedFlag === 1 || seat.isLocked === 1) {
    return
  }
  
  const index = selectedSeats.value.findIndex(s => s.seatId === seat.seatId)
  
  if (index > -1) {
    // 取消选择
    selectedSeats.value.splice(index, 1)
  } else {
    // 选择座位，限制最多4个
    if (selectedSeats.value.length >= 4) {
      showToast("最多只能选择4个座位")
      return
    }
    selectedSeats.value.push(seat)
  }
}

// 格式化放映时间
const formatShowTime = (showDate, showTime) => {
  const date = dayjs(showDate)
  const today = dayjs()
  
  let dateStr = ''
  if (date.isSame(today, 'day')) {
    dateStr = '今天'
  } else if (date.isSame(today.add(1, 'day'), 'day')) {
    dateStr = '明天'
  } else {
    dateStr = date.format('MM月DD日')
  }
  
  return `${dateStr} ${showTime}`
}

// 确认选座
const handleConfirm = () => {
  if (selectedSeats.value.length === 0) {
    showToast("请先选择座位")
    return
  }
  
  // TODO: 实现锁座和跳转到订单确认页
  showToast("功能开发中，敬请期待")
}

// 返回
const goBack = () => {
  router.back()
}

// 加载排期详情
const loadScheduleDetail = async () => {
  try {
    loading.value = true
    const scheduleId = route.params.scheduleId
    
    await store.dispatch("getScheduleDetail", scheduleId)
  } catch (error) {
    showToast(error.message || "获取排期详情失败")
  } finally {
    loading.value = false
  }
}

// 加载座位图
const loadSeatMap = async () => {
  try {
    const scheduleId = route.params.scheduleId
    await store.dispatch("getSeatMap", scheduleId)
  } catch (error) {
    console.warn("获取座位图失败:", error)
  }
}

// 页面挂载
onMounted(async () => {
  await loadScheduleDetail()
  await loadSeatMap()
})
</script>

<style lang="less" scoped>
.schedule-detail-container {
  background-color: #f7f8fa;
  min-height: 100vh;
  
  .schedule-info {
    background-color: #fff;
    padding: 16px;
    margin-bottom: 10px;
    
    .film-info {
      margin-bottom: 12px;
      
      h3 {
        font-size: 18px;
        font-weight: 600;
        color: #191a1b;
        margin-bottom: 4px;
      }
      
      p {
        font-size: 14px;
        color: #646566;
      }
    }
    
    .cinema-info {
      margin-bottom: 12px;
      
      p {
        font-size: 14px;
        color: #191a1b;
        margin-bottom: 4px;
      }
    }
    
    .price-info {
      .price {
        font-size: 20px;
        font-weight: 600;
        color: #ff6b35;
      }
    }
  }
  
  .seat-map-container {
    background-color: #fff;
    padding: 16px;
    
    .screen {
      text-align: center;
      padding: 12px;
      margin-bottom: 20px;
      background: linear-gradient(to bottom, #f0f0f0, #e0e0e0);
      border-radius: 20px;
      font-size: 14px;
      color: #646566;
    }
    
    .seat-map {
      margin-bottom: 20px;
      
      .seat-row {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        
        .row-label {
          width: 30px;
          font-size: 12px;
          color: #969799;
          text-align: center;
        }
        
        .seats {
          display: flex;
          gap: 4px;
          flex: 1;
          justify-content: center;
          
          .seat {
            width: 24px;
            height: 24px;
            line-height: 24px;
            text-align: center;
            font-size: 10px;
            border-radius: 4px;
            cursor: pointer;
            
            &.available {
              background-color: #f2f3f5;
              color: #646566;
              border: 1px solid #e5e6eb;
              
              &:hover {
                background-color: #e5e6eb;
              }
            }
            
            &.selected {
              background-color: #1989fa;
              color: #fff;
              border: 1px solid #1989fa;
            }
            
            &.occupied {
              background-color: #ff4d4f;
              color: #fff;
              cursor: not-allowed;
            }
            
            &.unavailable {
              background-color: #c8c9cc;
              color: #fff;
              cursor: not-allowed;
            }
          }
        }
      }
    }
    
    .seat-legend {
      display: flex;
      justify-content: center;
      gap: 16px;
      
      .legend-item {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: #646566;
        
        .seat {
          width: 16px;
          height: 16px;
          border-radius: 2px;
          margin-right: 4px;
          
          &.available {
            background-color: #f2f3f5;
            border: 1px solid #e5e6eb;
          }
          
          &.selected {
            background-color: #1989fa;
          }
          
          &.occupied {
            background-color: #ff4d4f;
          }
          
          &.unavailable {
            background-color: #c8c9cc;
          }
        }
      }
    }
  }
  
  .booking-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: #fff;
    padding: 16px;
    border-top: 1px solid #ebedf0;
    display: flex;
    align-items: center;
    gap: 12px;
    
    .selected-info {
      flex: 1;
      
      .selected-seats {
        font-size: 12px;
        color: #646566;
        margin-bottom: 4px;
        
        .seat-tag {
          background-color: #1989fa;
          color: #fff;
          padding: 2px 6px;
          border-radius: 2px;
          margin-left: 4px;
          font-size: 10px;
        }
      }
      
      .total-price {
        font-size: 16px;
        font-weight: 600;
        color: #ff6b35;
      }
    }
    
    .confirm-btn {
      min-width: 100px;
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