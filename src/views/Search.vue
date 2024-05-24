<template>
  <div>
    <van-search
      v-model="content"
      show-action
      placeholder="请输入搜索关键词"
      @search="onSearch"
      @cancel="onCancel"
    />
    <van-list>
      <van-cell v-for="item in computedCinemaList" :key="item.cinemaId">
        <div class="cell-content">
          <div>{{ item.name }}</div>
          <div class="address">{{ item.address }}</div>
        </div>
      </van-cell>
    </van-list>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { useStore } from "vuex"
import { Search } from "vant"
import { List } from "vant"

const content = ref("")

const store = useStore()
const cinemaList = computed(() => store.state.cinema.cinemaList)
const computedCinemaList = computed(() => {
  if (content.value === "") return []
  return cinemaList.value.filter(
    (item) =>
      item.name.toUpperCase().includes(content.value.toUpperCase()) ||
      item.address.toUpperCase().includes(content.value.toUpperCase()),
  )
})

const router = useRouter()
const onCancel = () => {
  router.replace("/cinema")
}
const onSearch = () => {}
</script>

<style lang="less" scoped>
.cell-content {
  text-align: left;
  .address {
    font-size: 12px;
    color: gray;
  }
}
</style>
