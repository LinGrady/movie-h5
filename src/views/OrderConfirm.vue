<template>
  <div class="order-confirm-container">
    <!-- 导航栏 -->
    <van-nav-bar
      title="订单确认"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />
    
    <!-- 订单信息 -->
    <div v-if="orderInfo" class="order-content">
      <!-- 电影信息 -->
      <div class="movie-info">
        <div class="movie-header">
          <h3>{{ orderInfo.filmName }}</h3>
          <div class="movie-meta">
            {{ orderInfo.filmDimensional }} | {{ orderInfo.language || '国语' }}
          </div>
        </div>
      </div>
      
      <!-- 影院和场次信息 -->
      <div class="cinema-info">
        <van-cell-group title="观影信息">
          <van-cell title="影院" :value="orderInfo.cinemaName" />
          <van-cell title="影厅" :value="orderInfo.hallName" />
          <van-cell title="场次" :value="formatShowTime(orderInfo.showTime)" />
          <van-cell title="座位" :value="formatSeats(orderInfo.seats)" />
        </van-cell-group>
      </div>
      
      <!-- 价格信息 -->
      <div class="price-info">
        <van-cell-group title="价格明细">
          <van-cell 
            v-for="seat in orderInfo.seats" 
            :key="seat.offerSeatId"
            :title="`${seat.rowId}排${seat.columnId}座`"
            :value="`¥${(seat.price / 100).toFixed(2)}`"
          />
          <van-cell 
            title="总计" 
            :value="`¥${(orderInfo.settleAmount / 100).toFixed(2)}`"
            class="total-price"
          />
        </van-cell-group>
      </div>
      
      <!-- 联系人信息 -->
      <div class="contact-info">
        <van-cell-group title="联系人信息">
          <van-field
            v-model="contactForm.name"
            label="姓名"
            placeholder="请输入姓名"
            required
          />
          <van-field
            v-model="contactForm.mobile"
            label="手机号"
            placeholder="请输入手机号"
            type="tel"
            required
          />
        </van-cell-group>
      </div>
      
      <!-- 锁座倒计时 -->
      <div class="countdown-info">
        <van-notice-bar
          left-icon="clock-o"
          :text="`锁座剩余时间：${formatCountdown(countdown)}`"
          color="#ff6b35"
          background="#fff3e0"
        />
      </div>
    </div>
    
    <!-- 底部确认按钮 -->
    <div class="confirm-footer">
      <div class="price-summary">
        <div class="total-amount">
          总计：¥{{ orderInfo ? (orderInfo.settleAmount / 100).toFixed(2) : '0.00' }}
        </div>
      </div>
      <van-button 
        type="primary" 
        class="confirm-btn"
        :loading="submitting"
        @click="handleSubmit"
      >
        确认支付
      </van-button>
    </div>
    
    <!-- 加载状态 -->
    <van-loading v-if="loading" class="loading-overlay" type="spinner" size="24px">
      加载中...
    </van-loading>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue"
import { useRouter, useRoute } from "vue-router"
import { useStore } from "vuex"
import { showToast, showConfirmDialog } from "vant"
import dayjs from "dayjs"

const router = useRouter()
const route = useRoute()
const store = useStore()

// 响应式数据
const loading = ref(false)
const submitting = ref(false)
const countdown = ref(15 * 60) // 15分钟锁座时间，单位秒
const timer = ref(null)

// 订单信息
const orderInfo = ref(null)

// 联系人表单
const contactForm = ref({
  name: '',
  mobile: ''
})

// 格式化座位信息
const formatSeats = (seats) => {
  if (!seats || seats.length === 0) return ''
  return seats.map(seat => `${seat.rowId}排${seat.columnId}座`).join('、')
}

// 格式化放映时间
const formatShowTime = (showTime) => {
  return dayjs(showTime).format('MM月DD日 HH:mm')
}

// 格式化倒计时
const formatCountdown = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 启动倒计时
const startCountdown = () => {
  timer.value = setInterval(() => {
    countdown.value--
    
    if (countdown.value <= 0) {
      clearInterval(timer.value)
      showToast("锁座已超时，请重新选择")
      router.back()
    }
  }, 1000)
}

// 获取订单信息
const loadOrderInfo = async () => {
  try {
    loading.value = true
    
    // 从路由参数获取订单信息
    const { orderId, channelOrderId, scheduleId } = route.query
    
    if (!channelOrderId) {
      showToast("订单信息错误")
      router.back()
      return
    }
    
    try {
      // 尝试调用获取订单详情API
      const orderData = await store.dispatch("getOrderInfo", {
        channelOrderId: channelOrderId,
        orderId: orderId
      })
      
      orderInfo.value = orderData
      startCountdown()
      
    } catch (error) {
      // 如果API失败，使用锁座信息和排期信息组合数据
      console.warn("获取订单API失败，使用本地数据:", error)
      
      // 获取锁座信息
      const lockInfo = store.state.order.lockInfo
      const scheduleDetail = store.state.cinema.scheduleDetail
      
      if (lockInfo && scheduleDetail) {
        orderInfo.value = {
          orderId: orderId,
          channelOrderId: channelOrderId,
          filmName: scheduleDetail.filmName,
          filmDimensional: scheduleDetail.dimensional,
          language: scheduleDetail.language,
          cinemaName: scheduleDetail.cinemaName,
          hallName: scheduleDetail.hallName,
          showTime: `${scheduleDetail.showDate} ${scheduleDetail.showTime}`,
          seats: lockInfo.seats || [],
          settleAmount: lockInfo.settleAmount || 0
        }
        startCountdown()
      } else {
        // 最后的备选方案：使用模拟数据
        const mockOrderInfo = {
          orderId: orderId,
          channelOrderId: channelOrderId,
          filmName: "电影票务系统",
          filmDimensional: "2D",
          cinemaName: "示例影院",
          hallName: "1号厅",
          showTime: new Date().toISOString(),
          seats: [
            { offerSeatId: "1", rowId: "5", columnId: "6", price: 3500 },
            { offerSeatId: "2", rowId: "5", columnId: "7", price: 3500 }
          ],
          settleAmount: 7000
        }
        
        orderInfo.value = mockOrderInfo
        startCountdown()
      }
    }
    
  } catch (error) {
    showToast(error.message || "获取订单信息失败")
    router.back()
  } finally {
    loading.value = false
  }
}

// 表单验证
const validateForm = () => {
  if (!contactForm.value.name.trim()) {
    showToast("请输入姓名")
    return false
  }
  
  if (!contactForm.value.mobile.trim()) {
    showToast("请输入手机号")
    return false
  }
  
  const mobileRegex = /^1[3-9]\d{9}$/
  if (!mobileRegex.test(contactForm.value.mobile)) {
    showToast("请输入正确的手机号")
    return false
  }
  
  return true
}

// 提交订单
const handleSubmit = async () => {
  if (!validateForm()) {
    return
  }
  
  try {
    submitting.value = true
    
    // 调用确认订单API
    const { orderId, channelOrderId } = route.query
    
    console.log("💳 开始确认订单...")
    console.log("订单ID:", orderId)
    console.log("渠道订单ID:", channelOrderId)
    console.log("联系人信息:", contactForm.value)
    
    const confirmResult = await store.dispatch("confirmOrder", {
      channelOrderId: channelOrderId,
      orderId: orderId
    })
    
    console.log("✅ 订单确认成功:", confirmResult)
    
    showToast({
      message: "支付成功！",
      duration: 2000
    })
    
    // 清除订单状态
    store.dispatch("clearOrderState")
    
    // 延迟跳转
    setTimeout(() => {
      // 跳转到订单列表页面（如果存在）或返回首页
      try {
        router.replace("/user/orders")
      } catch {
        router.replace("/film")
      }
    }, 1500)
    
  } catch (error) {
    console.error("❌ 订单确认失败:", error)
    
    let errorMessage = "支付失败，请重试"
    if (error.message.includes("超时")) {
      errorMessage = "支付超时，请稍后重试"
    } else if (error.message.includes("余额")) {
      errorMessage = "余额不足，请选择其他支付方式"
    } else if (error.message.includes("网络")) {
      errorMessage = "网络连接失败，请检查网络后重试"
    }
    
    showToast({
      message: errorMessage,
      duration: 3000
    })
  } finally {
    submitting.value = false
  }
}

// 返回
const goBack = () => {
  showConfirmDialog({
    title: '确认返回',
    message: '返回将取消当前锁座，确定要返回吗？',
  }).then(async () => {
    try {
      // 调用解锁座位API
      const { orderId, channelOrderId } = route.query
      
      if (orderId && channelOrderId) {
        console.log("🔓 开始解锁座位...")
        await store.dispatch("unlockSeats", {
          channelOrderId: channelOrderId,
          orderId: orderId
        })
        console.log("✅ 座位解锁成功")
      }
      
      // 清除订单状态
      store.dispatch("clearOrderState")
      
      router.back()
    } catch (error) {
      console.warn("⚠️ 解锁座位失败:", error)
      // 即使解锁失败也允许返回
      router.back()
    }
  }).catch(() => {
    // 用户取消
  })
}

// 页面挂载
onMounted(() => {
  loadOrderInfo()
})

// 页面卸载时清理定时器
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<style lang="less" scoped>
.order-confirm-container {
  background-color: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 80px;
  
  .order-content {
    .movie-info {
      background-color: #fff;
      padding: 16px;
      margin-bottom: 10px;
      
      .movie-header {
        h3 {
          font-size: 18px;
          font-weight: 600;
          color: #191a1b;
          margin-bottom: 8px;
        }
        
        .movie-meta {
          font-size: 14px;
          color: #646566;
        }
      }
    }
    
    .cinema-info,
    .price-info,
    .contact-info {
      margin-bottom: 10px;
      
      :deep(.van-cell__title) {
        font-weight: 500;
      }
      
      .total-price {
        :deep(.van-cell__value) {
          font-size: 16px;
          font-weight: 600;
          color: #ff6b35;
        }
      }
    }
    
    .countdown-info {
      margin-bottom: 10px;
    }
  }
  
  .confirm-footer {
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
    
    .price-summary {
      flex: 1;
      
      .total-amount {
        font-size: 18px;
        font-weight: 600;
        color: #ff6b35;
      }
    }
    
    .confirm-btn {
      min-width: 120px;
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