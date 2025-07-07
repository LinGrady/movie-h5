import http from "../../utils"

const filmModule = {
  state: () => ({
    // 正在热映电影列表
    nowPlayingList: [],
    nowPlayingTotal: 0,
    
    // 即将上映电影列表
    comingSoonList: [],
    comingSoonTotal: 0,
    
    // 搜索相关
    searchKeyword: "",
    searchResults: [],
    searchHistory: [],
  }),
  
  mutations: {
    // 正在热映相关
    setNowPlayingList(state, data) {
      state.nowPlayingList = data.films || []
      state.nowPlayingTotal = data.total || 0
    },
    
    // 追加正在热映数据（分页加载）
    appendNowPlayingList(state, data) {
      state.nowPlayingList = [...state.nowPlayingList, ...(data.films || [])]
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
    
    // 搜索相关
    setSearchKeyword(state, keyword) {
      state.searchKeyword = keyword
    },
    
    setSearchResults(state, results) {
      state.searchResults = results
    },
    
    addSearchHistory(state, keyword) {
      if (keyword && !state.searchHistory.includes(keyword)) {
        state.searchHistory.unshift(keyword)
        // 最多保存10条搜索历史
        if (state.searchHistory.length > 10) {
          state.searchHistory = state.searchHistory.slice(0, 10)
        }
      }
    },
    
    clearSearchHistory(state) {
      state.searchHistory = []
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
        } else {
          commit("appendNowPlayingList", result.data.data)
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
    
    // 搜索电影
    async searchFilms({ commit, state }, { keyword, cityId = "310100" }) {
      try {
        commit("setSearchKeyword", keyword)
        
        if (!keyword.trim()) {
          commit("setSearchResults", [])
          return []
        }
        
        // 合并所有电影数据进行搜索
        const allFilms = [...state.nowPlayingList, ...state.comingSoonList]
        
        // 客户端搜索匹配
        const results = allFilms.filter(film => {
          return film.name.toLowerCase().includes(keyword.toLowerCase()) ||
                 (film.actors && film.actors.some(actor => 
                   actor.name.toLowerCase().includes(keyword.toLowerCase())
                 )) ||
                 (film.director && film.director.toLowerCase().includes(keyword.toLowerCase()))
        })
        
        commit("setSearchResults", results)
        
        // 添加到搜索历史
        if (results.length > 0) {
          commit("addSearchHistory", keyword)
        }
        
        return results
      } catch (error) {
        throw new Error("搜索电影失败")
      }
    },
    
    // 获取热门搜索建议
    getSearchSuggestions({ state }, keyword) {
      if (!keyword.trim()) {
        return state.searchHistory.slice(0, 5)
      }
      
      // 基于搜索历史的建议
      return state.searchHistory.filter(item => 
        item.toLowerCase().includes(keyword.toLowerCase())
      ).slice(0, 5)
    },
  },
}

export default filmModule 