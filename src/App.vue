<template>
  <div>
    <router-view></router-view>
    <TabBar v-if="isShowTabbar()" />
  </div>
</template>

<script setup>
import { useRoute } from "vue-router"
import TabBar from "./components/TabBar.vue"

const route = useRoute()
const isShowTabbar = () => {
  const noTabbar = ["/detail"]
  return !noTabbar.includes(route.path)
}
</script>
<style>
html,
body {
  margin: 0;
  padding: 0;
}
p,
h3 {
  margin: 0;
  padding: 0;
}
</style>
