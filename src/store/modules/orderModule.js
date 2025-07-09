import http from "../../utils"

const orderModule = {
  state: () => ({
    // 当前订单信息
    currentOrder: null,
    
    // 订单列表
    orderList: [],
    orderTotal: 0,
    
    // 订单详情
    orderDetail: null,
    
    // 锁座信息
    lockInfo: null,
  }),
  
  mutations: {
    // 设置当前订单
    setCurrentOrder(state, order) {
      state.currentOrder = order
    },
    
    // 设置订单列表
    setOrderList(state, { orders, total }) {
      state.orderList = orders || []
      state.orderTotal = total || 0
    },
    
    // 设置订单详情
    setOrderDetail(state, order) {
      state.orderDetail = order
    },
    
    // 设置锁座信息
    setLockInfo(state, lockInfo) {
      state.lockInfo = lockInfo
    },
    
    // 清除当前订单
    clearCurrentOrder(state) {
      state.currentOrder = null
      state.lockInfo = null
    },
  },
  
  actions: {
    // 获取订单详情
    async getOrderInfo({ commit }, { channelOrderId, orderId }) {
      try {
        const result = await http({
          url: `/api/v1/order/info`,
          method: 'POST',
          data: {
            channelOrderId: channelOrderId,
            orderId: orderId,
          },
        })
        
        const orderInfo = result.data.data
        commit("setOrderDetail", orderInfo)
        commit("setCurrentOrder", orderInfo)
        return orderInfo
      } catch (error) {
        throw new Error("获取订单信息失败: " + (error.response?.data?.msg || error.message))
      }
    },
    
    // 确认订单（支付）
    async confirmOrder({ commit }, { channelOrderId, orderId }) {
      try {
        const result = await http({
          url: `/api/v1/order/confirm`,
          method: 'POST',
          data: {
            channelOrderId: channelOrderId,
            orderId: orderId,
          },
        })
        
        return result.data.data
      } catch (error) {
        throw new Error("确认订单失败: " + (error.response?.data?.msg || error.message))
      }
    },
    
    // 获取用户订单列表
    async getUserOrders({ commit }, { pageNum = 1, pageSize = 10, status = null }) {
      try {
        // 注意：这个API在swagger中没有定义，这里是预期的结构
        // 实际项目中需要根据真实API调整
        const result = await http({
          url: `/api/v1/user/orders`,
          method: 'POST',
          data: {
            pageNum: pageNum,
            pageSize: pageSize,
            status: status,
          },
        })
        
        commit("setOrderList", {
          orders: result.data.data.list || [],
          total: result.data.data.total || 0
        })
        
        return result.data.data
      } catch (error) {
        // 如果API不存在，返回空列表（开发阶段）
        console.warn("获取订单列表失败:", error)
        commit("setOrderList", { orders: [], total: 0 })
        return { list: [], total: 0 }
      }
    },
    
    // 退票申请
    async refundTicket({ commit }, { channelOrderId, orderId, reason, refundAmount, operator }) {
      try {
        const result = await http({
          url: `/api/v1/order/refund-ticket`,
          method: 'POST',
          data: {
            channelOrderId: channelOrderId,
            orderId: orderId,
            reason: reason,
            refundAmount: refundAmount,
            operator: operator,
            isSettle: 1, // 默认结算
          },
        })
        
        return result.data.data
      } catch (error) {
        throw new Error("退票申请失败: " + (error.response?.data?.msg || error.message))
      }
    },
    
    // 保存锁座信息（临时存储，用于订单确认页面）
    saveLockInfo({ commit }, lockInfo) {
      commit("setLockInfo", lockInfo)
    },
    
    // 清除订单状态
    clearOrderState({ commit }) {
      commit("clearCurrentOrder")
    },
  },
  
  getters: {
    // 获取订单状态文本
    getOrderStatusText: () => (status) => {
      const statusMap = {
        0: '正在锁座',
        '-1': '锁座失败',
        1: '锁座成功',
        2: '出票中',
        3: '出票成功',
        '-3': '出票失败',
        4: '已全部退款',
        5: '用户取消',
        6: '超时取消',
        7: '等待供应商出票'
      }
      return statusMap[status] || '未知状态'
    },
    
    // 获取订单状态颜色
    getOrderStatusColor: () => (status) => {
      const colorMap = {
        0: '#1989fa',  // 蓝色 - 进行中
        '-1': '#ee0a24', // 红色 - 失败
        1: '#07c160',  // 绿色 - 成功
        2: '#ff976a',  // 橙色 - 处理中
        3: '#07c160',  // 绿色 - 成功
        '-3': '#ee0a24', // 红色 - 失败
        4: '#969799',  // 灰色 - 已退款
        5: '#969799',  // 灰色 - 已取消
        6: '#969799',  // 灰色 - 超时取消
        7: '#ff976a'   // 橙色 - 处理中
      }
      return colorMap[status] || '#969799'
    },
  },
}

export default orderModule 