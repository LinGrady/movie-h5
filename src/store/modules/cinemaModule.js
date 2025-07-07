import http from "../../utils"

const cinemaModule = {
  state: () => ({
    // 影院列表相关
    cinemaList: [],
    cinemaTotal: 0,
    
    // 影院详情相关
    cinemaDetail: null,
    
    // 排期相关
    cinemaSchedules: {}, // 按影院ID存储排期数据
    scheduleList: [],
    scheduleDetail: null,
    
    // 座位相关
    seatMap: {},
    
    // 搜索和筛选
    searchKeyword: "",
    filteredCinemas: [],
  }),
  
  mutations: {
    // 影院列表相关
    setCinemaList(state, data) {
      state.cinemaList = data.list || data.cinemas || []
      state.cinemaTotal = data.total || state.cinemaList.length
    },
    
    // 影院详情相关
    setCinemaDetail(state, cinema) {
      state.cinemaDetail = cinema
    },
    
    // 排期相关
    setCinemaSchedules(state, { cinemaId, schedules }) {
      state.cinemaSchedules[cinemaId] = schedules
    },
    
    setScheduleList(state, schedules) {
      state.scheduleList = schedules
    },
    
    setScheduleDetail(state, schedule) {
      state.scheduleDetail = schedule
    },
    
    // 座位相关
    setSeatMap(state, { scheduleId, seats }) {
      state.seatMap[scheduleId] = seats
    },
    
    // 搜索筛选
    setSearchKeyword(state, keyword) {
      state.searchKeyword = keyword
    },
    
    setFilteredCinemas(state, cinemas) {
      state.filteredCinemas = cinemas
    },
  },
  
  actions: {
    // 获取有排片的影院列表（新API）
    async getCinemaList({ commit }, { cityId, filmId = null }) {
      try {
        const result = await http({
          url: `/api/v1/schedule/cinema/list`,
          method: 'POST',
          headers: {
            'X-Token': 'base64({"bid":1})', // 根据实际情况配置
            'Content-Type': 'application/json',
          },
          data: {
            cityId: parseInt(cityId),
            filmId: filmId ? parseInt(filmId) : undefined,
          },
        })
        
        commit("setCinemaList", result.data.data)
        return result.data.data
      } catch (error) {
        // 如果新API失败，回退到旧API
        console.warn("新API调用失败，使用旧API:", error)
        return this.dispatch("getCinemaListFallback", cityId)
      }
    },
    
    // 兼容旧API的方法
    async getCinemaListFallback({ commit }, cityId) {
      try {
        const result = await http({
          url: `https://m.maizuo.com/gateway?cityId=${cityId}&ticketFlag=1&k=2500238`,
          headers: {
            "X-Host": "mall.film-ticket.cinema.list",
          },
        })
        
        commit("setCinemaList", { cinemas: result.data.data.cinemas })
        return result.data.data
      } catch (error) {
        throw new Error("获取影院列表失败")
      }
    },
    
    // 获取影院详情
    async getCinemaDetail({ commit }, cinemaId) {
      try {
        const result = await http({
          url: `/api/v1/cinema/detail`,
          method: 'POST',
          headers: {
            'X-Token': 'base64({"bid":1})',
            'Content-Type': 'application/json',
          },
          data: {
            cinemaId: parseInt(cinemaId),
          },
        })
        
        commit("setCinemaDetail", result.data.data)
        return result.data.data
      } catch (error) {
        throw new Error("获取影院详情失败")
      }
    },
    
    // 获取影院的电影排期
    async getCinemaFilmSchedules({ commit }, cinemaId) {
      try {
        const result = await http({
          url: `/api/v1/schedule/cinema/film/list`,
          method: 'POST',
          headers: {
            'X-Token': 'base64({"bid":1})',
            'Content-Type': 'application/json',
          },
          data: {
            cinemaId: parseInt(cinemaId),
          },
        })
        
        const schedules = result.data.data.list || []
        commit("setCinemaSchedules", { cinemaId, schedules })
        return schedules
      } catch (error) {
        throw new Error("获取影院排期失败")
      }
    },
    
    // 获取排期详情
    async getScheduleDetail({ commit }, scheduleId) {
      try {
        const result = await http({
          url: `/api/v1/schedule/detail`,
          method: 'POST',
          headers: {
            'X-Token': 'base64({"bid":1})',
            'Content-Type': 'application/json',
          },
          data: {
            scheduleId: scheduleId,
          },
        })
        
        commit("setScheduleDetail", result.data.data)
        return result.data.data
      } catch (error) {
        throw new Error("获取排期详情失败")
      }
    },
    
    // 获取座位图
    async getSeatMap({ commit }, scheduleId) {
      try {
        const result = await http({
          url: `/api/v1/schedule/seat`,
          method: 'POST',
          headers: {
            'X-Token': 'base64({"bid":1})',
            'Content-Type': 'application/json',
          },
          data: {
            scheduleId: scheduleId,
          },
        })
        
        const seats = result.data.data.seats || []
        commit("setSeatMap", { scheduleId, seats })
        return seats
      } catch (error) {
        throw new Error("获取座位图失败")
      }
    },
    
    // 搜索影院
    async searchCinemas({ commit, state }, keyword) {
      commit("setSearchKeyword", keyword)
      
      if (!keyword.trim()) {
        commit("setFilteredCinemas", [])
        return []
      }
      
      // 客户端搜索
      const filtered = state.cinemaList.filter(cinema => {
        return cinema.name.toLowerCase().includes(keyword.toLowerCase()) ||
               (cinema.address && cinema.address.toLowerCase().includes(keyword.toLowerCase()))
      })
      
      commit("setFilteredCinemas", filtered)
      return filtered
    },
  },
}

export default cinemaModule
