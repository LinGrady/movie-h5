<template>
  <div class="film-search-container">
    <!-- 搜索栏 -->
    <van-search
      v-model="searchInput"
      placeholder="搜索电影、演员、导演"
      show-action
      @search="handleSearch"
      @cancel="handleCancel"
      @input="handleInput"
      @focus="handleFocus"
      :autofocus="true"
      clearable
    />
    
    <!-- 搜索内容区域 -->
    <div class="search-content">
      <!-- 搜索建议 -->
      <div v-if="showSuggestions && suggestions.length > 0" class="suggestions">
        <div class="section-title">搜索建议</div>
        <div 
          v-for="suggestion in suggestions" 
          :key="suggestion"
          class="suggestion-item"
          @click="handleSuggestionClick(suggestion)"
        >
          <van-icon name="search" class="suggestion-icon" />
          <span>{{ suggestion }}</span>
        </div>
      </div>
      
      <!-- 搜索历史 -->
      <div v-if="!searchKeyword && searchHistory.length > 0" class="search-history">
        <div class="section-header">
          <div class="section-title">搜索历史</div>
          <van-button 
            type="primary" 
            size="mini" 
            plain 
            @click="clearHistory"
          >
            清空
          </van-button>
        </div>
        <div class="history-tags">
          <van-tag
            v-for="history in searchHistory"
            :key="history"
            type="default"
            size="medium"
            class="history-tag"
            @click="handleHistoryClick(history)"
          >
            {{ history }}
          </van-tag>
        </div>
      </div>
      
      <!-- 搜索结果 -->
      <div v-if="searchKeyword && !showSuggestions" class="search-results">
        <div v-if="searchResults.length > 0" class="results-header">
          找到 {{ searchResults.length }} 部相关电影
        </div>
        
        <!-- 电影列表 -->
        <div v-if="searchResults.length > 0" class="film-list">
          <van-cell
            v-for="film in searchResults"
            :key="film.filmId"
            class="film-item"
            @click="handleFilmClick(film.filmId)"
          >
            <div class="film-content">
              <div class="film-poster">
                <img :src="film.poster" :alt="film.name" />
              </div>
              
              <div class="film-info">
                <div class="film-title">
                  <span class="name" v-html="highlightText(film.name, searchKeyword)"></span>
                  <span v-if="film.item" class="item-tag">{{ film.item.name }}</span>
                </div>
                
                <div class="film-actors">
                  <span class="label">主演：</span>
                  <span v-html="highlightActors(film.actors, searchKeyword)"></span>
                </div>
                
                <div class="film-meta">
                  <span class="label">{{ film.nation }} | {{ film.runtime }}分钟</span>
                </div>
              </div>
            </div>
          </van-cell>
        </div>
        
        <!-- 无搜索结果 -->
        <div v-else class="no-results">
          <van-empty description="暂无相关电影" />
        </div>
      </div>
      
      <!-- 默认状态 -->
      <div v-if="!searchKeyword && searchHistory.length === 0" class="default-state">
        <van-empty description="搜索你感兴趣的电影" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import { showToast } from "vant"
import { formatActors } from "../utils/dateFormat"

const router = useRouter()
const store = useStore()

// 响应式数据
const searchInput = ref("")
const showSuggestions = ref(false)
const suggestions = ref([])

// 计算属性
const searchKeyword = computed(() => store.state.film.searchKeyword)
const searchResults = computed(() => store.state.film.searchResults)
const searchHistory = computed(() => store.state.film.searchHistory)

// 处理搜索输入
const handleInput = (value) => {
  if (value.trim()) {
    showSuggestions.value = true
    suggestions.value = store.dispatch("getSearchSuggestions", value.trim())
  } else {
    showSuggestions.value = false
    suggestions.value = []
  }
}

// 处理搜索框获得焦点
const handleFocus = () => {
  if (searchInput.value.trim()) {
    showSuggestions.value = true
    suggestions.value = store.dispatch("getSearchSuggestions", searchInput.value.trim())
  }
}

// 执行搜索
const handleSearch = async (keyword) => {
  if (!keyword.trim()) {
    showToast("请输入搜索关键词")
    return
  }
  
  showSuggestions.value = false
  
  try {
    await store.dispatch("searchFilms", { 
      keyword: keyword.trim(),
      cityId: store.state.city.cityId 
    })
  } catch (error) {
    showToast(error.message || "搜索失败")
  }
}

// 点击搜索建议
const handleSuggestionClick = (suggestion) => {
  searchInput.value = suggestion
  handleSearch(suggestion)
}

// 点击搜索历史
const handleHistoryClick = (history) => {
  searchInput.value = history
  handleSearch(history)
}

// 清空搜索历史
const clearHistory = () => {
  store.commit("clearSearchHistory")
  showToast("已清空搜索历史")
}

// 取消搜索
const handleCancel = () => {
  router.back()
}

// 点击电影跳转详情页
const handleFilmClick = (filmId) => {
  router.push(`/detail?id=${filmId}`)
}

// 高亮搜索关键词
const highlightText = (text, keyword) => {
  if (!keyword || !text) return text
  const regex = new RegExp(`(${keyword})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// 高亮演员名称
const highlightActors = (actors, keyword) => {
  if (!actors || !keyword) {
    return formatActors(actors)
  }
  
  const actorNames = formatActors(actors)
  const regex = new RegExp(`(${keyword})`, 'gi')
  return actorNames.replace(regex, '<mark>$1</mark>')
}

// 页面挂载时确保有电影数据用于搜索
onMounted(async () => {
  const cityId = store.state.city.cityId
  
  // 如果没有电影数据，先加载
  if (store.state.film.nowPlayingList.length === 0) {
    try {
      await store.dispatch("getNowPlayingList", { cityId, pageNum: 1, pageSize: 20 })
    } catch (error) {
      console.warn("加载电影数据失败:", error)
    }
  }
  
  if (store.state.film.comingSoonList.length === 0) {
    try {
      await store.dispatch("getComingSoonList", { cityId, pageNum: 1, pageSize: 20 })
    } catch (error) {
      console.warn("加载电影数据失败:", error)
    }
  }
})
</script>

<style lang="less" scoped>
.film-search-container {
  background-color: #fff;
  min-height: 100vh;
  
  .search-content {
    padding: 16px;
    
    .section-title {
      font-size: 16px;
      color: #323233;
      margin-bottom: 12px;
      font-weight: 500;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    // 搜索建议
    .suggestions {
      margin-bottom: 20px;
      
      .suggestion-item {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f7f8fa;
        cursor: pointer;
        
        .suggestion-icon {
          margin-right: 8px;
          color: #969799;
        }
        
        &:last-child {
          border-bottom: none;
        }
        
        &:active {
          background-color: #f7f8fa;
        }
      }
    }
    
    // 搜索历史
    .search-history {
      margin-bottom: 20px;
      
      .history-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .history-tag {
          cursor: pointer;
          
          &:active {
            opacity: 0.7;
          }
        }
      }
    }
    
    // 搜索结果
    .search-results {
      .results-header {
        font-size: 14px;
        color: #646566;
        margin-bottom: 16px;
        padding-bottom: 8px;
        border-bottom: 1px solid #ebedf0;
      }
      
      .film-list {
        .film-item {
          padding: 0;
          margin-bottom: 12px;
          
          :deep(.van-cell__value) {
            padding: 12px;
          }
          
          .film-content {
            display: flex;
            align-items: flex-start;
            
            .film-poster {
              flex-shrink: 0;
              margin-right: 12px;
              
              img {
                width: 60px;
                height: 85px;
                border-radius: 4px;
                object-fit: cover;
              }
            }
            
            .film-info {
              flex: 1;
              min-width: 0;
              
              .film-title {
                display: flex;
                align-items: center;
                margin-bottom: 6px;
                
                .name {
                  font-size: 16px;
                  color: #191a1b;
                  font-weight: 500;
                  flex: 1;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  
                  :deep(mark) {
                    background-color: #ffeb3b;
                    color: #333;
                    padding: 0 2px;
                  }
                }
                
                .item-tag {
                  margin-left: 6px;
                  font-size: 9px;
                  color: #fff;
                  background-color: #d2d6dc;
                  padding: 1px 3px;
                  border-radius: 2px;
                  height: 14px;
                  line-height: 12px;
                  flex-shrink: 0;
                }
              }
              
              .film-actors,
              .film-meta {
                margin-bottom: 4px;
                
                .label {
                  font-size: 13px;
                  color: #797d82;
                  line-height: 1.4;
                  
                  :deep(mark) {
                    background-color: #ffeb3b;
                    color: #333;
                    padding: 0 2px;
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // 无结果和默认状态
    .no-results,
    .default-state {
      padding: 60px 0;
      text-align: center;
    }
  }
}
</style> 