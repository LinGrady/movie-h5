import axios from "axios"
import { showLoadingToast, closeToast } from "vant"

// 创建默认实例（卖座API）
const http = axios.create({
  baseURL: "https://m.maizuo.com/",
  timeout: 10000,
  headers: {
    "X-Client-Info":
      '{"a":"3000","ch":"1002","v":"5.0.4","e":"1596502176387264316178433","bc":"310100"}',
  },
})

// 创建新的座位预订API实例
const seatReserveHttp = axios.create({
  baseURL: "http://scm-gateway.sdyxscm/api/seat-reserve/",  // 这是正确的
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    "X-Token": "eyJiaWQiOjUzOH0=", // 更新为用户提供的token
  },
})

// 通用请求处理函数
const createRequest = (instance) => {
  // 添加请求拦截器
  instance.interceptors.request.use(
    function (config) {
      showLoadingToast({
        message: "加载中...",
        forbidClick: true,
      })
      // 在发送请求之前做些什么
      return config
    },
    function (error) {
      closeToast()
      // 对请求错误做些什么
      return Promise.reject(error)
    },
  )

  // 添加响应拦截器
  instance.interceptors.response.use(
    function (response) {
      closeToast()
      // 2xx 范围内的状态码都会触发该函数。
      // 对响应数据做点什么
      return response
    },
    function (error) {
      closeToast()
      // 超出 2xx 范围的状态码都会触发该函数。
      // 对响应错误做点什么
      return Promise.reject(error)
    },
  )

  return instance
}

// 应用拦截器
createRequest(http)
createRequest(seatReserveHttp)

// 智能请求函数，根据URL自动选择合适的实例
const smartRequest = (config) => {
  // 如果URL以/api/v1开头，使用座位预订API
  if (config.url && config.url.startsWith('/api/v1')) {
    console.log(`🎫 使用座位预订API: ${config.url}`)
    return seatReserveHttp(config)
  }
  // 否则使用默认的卖座API
  console.log(`🎬 使用卖座API: ${config.url}`)
  return http(config)
}

// 导出智能请求函数作为默认导出
export default smartRequest

// 也可以单独导出各个实例
export { http as maizuoHttp, seatReserveHttp }
