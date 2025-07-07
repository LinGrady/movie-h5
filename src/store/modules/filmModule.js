import http from "../../utils"

const filmModule = {
  state: () => ({
    // 正在热映电影列表
    nowPlayingList: [],
    nowPlayingTotal: 0,
    
    // 即将上映电影列表
    comingSoonList: [],
    comingSoonTotal: 0,
  }),
  
  mutations: {
    // 正在热映相关
    setNowPlayingList(state, data) {
      state.nowPlayingList = data.films || []
      state.nowPlayingTotal = data.total || 0
    },
    
    // 即将上映相关
    setComingSoonList(state, data) {
      state.comingSoonList = data.films || []
      state.comingSoonTotal = data.total || 0
    },
    
    // 追加即将上映数据（分页加载）
    appendComingSoonList(state, data) {
      state.comingSoonList = [...state.comingSoonList, ...(data.films || [])]
      state.comingSoonTotal = data.total || 0
    },
  },
  
  actions: {
    // 获取正在热映电影列表
    async getNowPlayingList({ commit }, { cityId = "310100", pageNum = 1, pageSize = 10 }) {
      try {
        const result = await http({
          url: `gateway?cityId=${cityId}&pageNum=${pageNum}&pageSize=${pageSize}&type=1&k=136082`,
          headers: {
            "X-Host": "mall.film-ticket.film.list",
          },
        })
        
        if (pageNum === 1) {
          commit("setNowPlayingList", result.data.data)
        }
        
        return result.data.data
      } catch (error) {
        throw new Error("获取正在热映电影失败")
      }
    },
    
    // 获取即将上映电影列表
    async getComingSoonList({ commit }, { cityId = "310100", pageNum = 1, pageSize = 10 }) {
      try {
        const result = await http({
          url: `gateway?cityId=${cityId}&pageNum=${pageNum}&pageSize=${pageSize}&type=2&k=136082`,
          headers: {
            "X-Host": "mall.film-ticket.film.list",
          },
        })
        
        if (pageNum === 1) {
          commit("setComingSoonList", result.data.data)
        } else {
          commit("appendComingSoonList", result.data.data)
        }
        
        return result.data.data
      } catch (error) {
        throw new Error("获取即将上映电影失败")
      }
    },
  },
}

export default filmModule 