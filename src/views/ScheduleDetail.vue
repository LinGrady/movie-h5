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
      
      <!-- 无座位图状态 -->
      <div v-else-if="!loading" class="no-seats">
        <van-empty description="暂无座位信息">
          <template #image>
            <van-icon name="location-o" size="60" color="#dcdee0" />
          </template>
          <p>座位图加载失败</p>
          <van-button type="primary" size="small" @click="loadSeatMap">
            重新加载
          </van-button>
        </van-empty>
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
  
  // 按行号排序，并对每行的座位按列号排序
  return Object.values(rows)
    .sort((a, b) => {
      // 尝试数字排序，失败则使用字符串排序
      const aNum = parseInt(a.rowId)
      const bNum = parseInt(b.rowId)
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum
      }
      return a.rowId.localeCompare(b.rowId)
    })
    .map(row => ({
      ...row,
      seats: row.seats.sort((a, b) => {
        const aNum = parseInt(a.columnId)
        const bNum = parseInt(b.columnId)
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum
        }
        return a.columnId.localeCompare(b.columnId)
      })
    }))
})

// 计算总价
const totalPrice = computed(() => {
  return selectedSeats.value.reduce((total, seat) => {
    // 根据分区价格计算，如果没有则使用基准价格
    let seatPrice = scheduleDetail.value?.basePrice || 0
    
    if (scheduleDetail.value?.sectionPrices && seat.sectionId) {
      const sectionPrice = scheduleDetail.value.sectionPrices.find(sp => sp.sectionId === seat.sectionId)
      if (sectionPrice) {
        seatPrice = sectionPrice.price
      }
    }
    
    return total + (seatPrice / 100)
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
  if (seat.damagedFlag === 1) {
    showToast("该座位已损坏，无法选择")
    return
  }
  
  if (seat.isLocked === 1) {
    showToast("该座位已被其他用户选择")
    return
  }
  
  const index = selectedSeats.value.findIndex(s => s.seatId === seat.seatId)
  
  if (index > -1) {
    // 取消选择
    selectedSeats.value.splice(index, 1)
    showToast({
      message: `已取消 ${seat.rowId}排${seat.columnId}座`,
      duration: 1000
    })
  } else {
    // 选择座位，限制最多4个
    if (selectedSeats.value.length >= 4) {
      showToast("最多只能选择4个座位")
      return
    }
    selectedSeats.value.push(seat)
    showToast({
      message: `已选择 ${seat.rowId}排${seat.columnId}座`,
      duration: 1000
    })
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

// 获取或提示输入手机号
const getMobileNumber = () => {
  // 这里可以从用户信息获取，或者弹出输入框
  // 暂时使用模拟手机号，实际项目中应该从用户系统获取
  return "13800138000"
}

// 确认选座
const handleConfirm = async () => {
  if (selectedSeats.value.length === 0) {
    showToast("请先选择座位")
    return
  }
  
  // 生成唯一的渠道订单ID
  const channelOrderId = `H5_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // 准备座位数据
  const seatData = selectedSeats.value.map(seat => {
    // 根据分区价格计算，如果没有则使用基准价格
    let seatPrice = scheduleDetail.value?.basePrice || 0
    
    if (scheduleDetail.value?.sectionPrices && seat.sectionId) {
      const sectionPrice = scheduleDetail.value.sectionPrices.find(sp => sp.sectionId === seat.sectionId)
      if (sectionPrice) {
        seatPrice = sectionPrice.price
      }
    }
    
    return {
      offerSeatId: seat.seatId,
      price: seatPrice
    }
  })
  
  // 获取手机号
  const mobile = getMobileNumber()
  
  try {
    loading.value = true
    
    console.log("🔒 开始锁座...")
    console.log("排期ID:", route.params.scheduleId)
    console.log("座位数据:", seatData)
    console.log("手机号:", mobile)
    console.log("渠道订单ID:", channelOrderId)
    
    // 调用锁座API
    const lockResult = await store.dispatch("lockSeats", {
      scheduleId: route.params.scheduleId,
      seats: seatData,
      mobile: mobile,
      channelOrderId: channelOrderId
    })
    
    console.log("✅ 锁座成功:", lockResult)
    
    // 保存锁座信息到store，供订单确认页面使用
    await store.dispatch("saveLockInfo", lockResult)
    
    showToast({
      message: "锁座成功！正在跳转...",
      duration: 2000
    })
    
    // 稍微延迟跳转，让用户看到成功提示
    setTimeout(() => {
      // 跳转到订单确认页面
      router.push({
        path: '/order/confirm',
        query: {
          orderId: lockResult.orderId,
          channelOrderId: lockResult.channelOrderId,
          scheduleId: route.params.scheduleId
        }
      })
    }, 1000)
    
  } catch (error) {
    console.error("❌ 锁座失败:", error)
    
    // 根据错误类型显示不同的提示
    let errorMessage = "锁座失败，请重试"
    if (error.message.includes("座位已被锁定")) {
      errorMessage = "所选座位已被其他用户锁定，请重新选择"
      // 重新加载座位图
      await loadSeatMap()
      // 清空已选座位
      selectedSeats.value = []
    } else if (error.message.includes("网络")) {
      errorMessage = "网络连接失败，请检查网络后重试"
    }
    
    showToast({
      message: errorMessage,
      duration: 3000
    })
  } finally {
    loading.value = false
  }
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
    
    console.log("🎬 加载排期详情, scheduleId:", scheduleId)
    const scheduleData = await store.dispatch("getScheduleDetail", scheduleId)
    console.log("📋 排期详情数据:", scheduleData)
  } catch (error) {
    console.error("获取排期详情失败:", error)
    showToast(error.message || "获取排期详情失败")
  } finally {
    loading.value = false
  }
}

// 加载座位图
const loadSeatMap = async () => {
  try {
    const scheduleId = route.params.scheduleId
    console.log("🪑 加载座位图, scheduleId:", scheduleId)
    const seatData = await store.dispatch("getSeatMap", scheduleId)
    console.log("🎭 座位图数据:", seatData)
  } catch (error) {
    console.warn("获取座位图失败:", error)
    showToast("获取座位图失败，请重试")
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
    
    .no-seats {
      padding: 60px 20px;
      text-align: center;
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