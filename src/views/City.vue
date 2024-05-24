<template>
  <div>
    <van-index-bar :index-list="computedCityList">
      <div v-for="cities in cityList" :key="cities.type">
        <van-index-anchor :index="cities.type" />
        <van-cell
          v-for="city in cities.list"
          :title="city.name"
          :key="city.cityId"
          @click="handleChangePage(city)"
        ></van-cell>
      </div>
    </van-index-bar>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import http from "../utils"
import { IndexBar, IndexAnchor } from "vant"

const store = useStore()

const cityList = ref([])
onMounted(() => {
  http({
    url: "/gateway?k=2323064",
    headers: {
      "X-Host": "mall.film-ticket.city.list",
    },
  }).then((result) => {
    // cityList.value = result.data.data.cities
    handleCityData(result.data.data.cities)
  })
})

const computedCityList = computed(() => {
  return cityList.value.map((item) => item.type)
})

// 对城市列表数据进行组装
const handleCityData = (data) => {
  // 二维数组
  const letterArr = []
  for (let code = 65; code < 91; code++) {
    letterArr.push(String.fromCharCode(code))
  }
  const newCities = []
  letterArr.forEach((letter) => {
    const list = data.filter((item) => {
      return item.pinyin.substring(0, 1).toUpperCase() === letter
    })
    // 获取到每一个字母开头的城市数据
    if (list.length) {
      newCities.push({
        type: letter,
        list,
      })
    }
  })
  cityList.value = newCities
}

// 选择城市
const router = useRouter()
const handleChangePage = (city) => {
  store.commit("changeCityData", city)
  router.back()
}
</script>

<style lang="less" scoped></style>
