<template>
  <div>
    <van-list
      v-model:loading="loading"
      :finished="finished"
      :immediate-check="false"
      finished-text="没有更多了"
      @load="onLoad"
      style="margin-bottom: 60px"
    >
      <van-cell
        v-for="item in dataList"
        :key="item.filmId"
        @click="handleClick(item.filmId)"
      >
        <div class="movie-img">
          <img :src="item.poster" alt="" />
        </div>
        <div class="movie-info">
          <h3>{{ item.name }}</h3>
          <p class="actor">主演： {{ actorFilter(item.actors) }}</p>
          <p>{{ item.nation }} | {{ item.runtime }} 分钟</p>
        </div>
      </van-cell>
    </van-list>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { List } from "vant"
import http from "../../utils"

const loading = ref(false)
const finished = ref(false)
const dataList = ref([]) // 电影数据
const totalCount = ref(0) // 总条数
const current = ref(1)

const actorFilter = (actors) => {
  if (!actors) return "暂无主演"
  return actors.map((item) => item.name).join(" ")
}

onMounted(() => {
  // 首次请求电影数据
  http({
    url: `gateway?cityId=310100&pageNum=1&pageSize=10&type=1&k=136082`,
    headers: {
      "X-Host": "mall.film-ticket.film.list",
    },
  }).then((result) => {
    const { films, total } = result.data.data
    dataList.value = films
    totalCount.value = total
  })
})

// 下拉请求
const onLoad = () => {
  if (
    dataList.value.length === totalCount.value &&
    dataList.value.length !== 0
  ) {
    finished.value = true
    return
  }

  current.value++
  http({
    url: `gateway?cityId=310100&pageNum=${current.value}&pageSize=10&type=1&k=136082`,
    headers: {
      "X-Host": "mall.film-ticket.film.list",
    },
  }).then((result) => {
    const { films, total } = result.data.data
    dataList.value = [...dataList.value, ...films]
    totalCount.value = total
    loading.value = false
  })
}

// 跳转电影详情页
const router = useRouter()
const handleClick = (id) => {
  router.push(`/detail?id=${id}`)
}
</script>

<style lang="less" scoped>
.van-cell {
  overflow: hidden;
  padding: 5px;
  .movie-img {
    img {
      margin-right: 10px;
      float: left;
      width: 100px;
      height: 140px;
    }
  }
  .movie-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    h3 {
      font-size: 20px;
      color: rgb(74, 74, 74);
      margin-bottom: 20px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .actor {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-bottom: 10px;
    }
  }
}
</style>
