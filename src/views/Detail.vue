<template>
  <div class="detail-container">
    <!-- 电影海报 -->
    <div class="banner" :style="{ backgroundImage: `url(${filmInfo.poster})` }">
      <router-link to="/film/onshow">
        <img class="back-img" src="../assets/back.svg" alt="" />
      </router-link>
    </div>
    <!-- 影片信息 -->
    <div class="film-detail">
      <!-- 电影名、分数 -->
      <div class="col">
        <div class="film-name">
          <span class="name">{{ filmInfo.name }}</span>
          <span class="item">{{
            filmInfo.item ? filmInfo.item.name : ""
          }}</span>
        </div>
        <div class="film-grade">
          <div v-if="filmInfo.grade">
            <span class="grade">{{ filmInfo.grade }}</span>
            <span class="grade-text">分</span>
          </div>
          <div v-else>暂无评分</div>
        </div>
      </div>
      <!-- 电影分类 -->
      <div class="film-category grey-text">
        {{ filmInfo.category }}
      </div>
      <!-- 上映时间 -->
      <div class="film-premiere-time grey-text">
        {{ dateFilter(filmInfo.premiereAt) }}
      </div>
      <!-- 地区、时长 -->
      <div class="nation-runtime grey-text">
        {{ filmInfo.nation }} | {{ filmInfo.runtime }}分钟
      </div>
      <!-- 电影概要 -->
      <div class="film-synopsis grey-text" :class="{ hidden: isShow }">
        {{ filmInfo.synopsis }}
      </div>
      <!-- 显示与隐藏 -->
      <div class="iconbtn">
        <i
          class="iconfont"
          :class="isShow ? 'icon-arrow_up' : 'icon-arrow_down'"
          @click="isShow = !isShow"
        ></i>
      </div>
    </div>
    <!-- 卡司 -->
    <div class="cast">
      <div class="cast-title">演职人员</div>
      <detail-swiper :perslide="4" swiperclass="swiperActors">
        <div
          class="swiper-slide actor-item"
          v-for="item in filmInfo.actors"
          :key="item.name"
        >
          <img
            class="avatar-img"
            :src="item.avatarAddress"
            style="width: 95px; height: 115px"
            alt=""
          />
          <div class="cast-info">
            <span>{{ item.name }}</span>
            <span>{{ item.role }}</span>
          </div>
        </div>
      </detail-swiper>
    </div>
    <!-- 剧照 -->
    <div class="photo">
      <div class="photo-title">剧照</div>
      <detail-swiper :perslide="2" swiperclass="swiperPhotos">
        <div
          class="swiper-slide photo-item"
          v-for="(item, index) in filmInfo.photos"
          :key="item"
        >
          <img
            class="photo-img"
            :src="item"
            style="width: 200px; height: 125px; margin-right: 10px"
            alt=""
            @click="handlePreview(index)"
          />
        </div>
      </detail-swiper>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue"
import { useRoute } from "vue-router"
import http from "../utils"
import dayjs from "dayjs"
import { ImagePreview } from "vant"
import { showImagePreview } from "vant" // vant 图片预览
import DetailSwiper from "../components/DetailSwiper.vue" // 轮播图

let filmInfo = reactive({})
const isShow = ref(true) // icon箭头

const route = useRoute()
onMounted(() => {
  const id = route.query.id
  http({
    url: `gateway?filmId=${id}&k=6951879`,
    headers: {
      "X-Host": "mall.film-ticket.film.info",
    },
  }).then((result) => {
    let resultFilm = result.data.data.film
    Object.assign(filmInfo, { ...resultFilm })
  })
})

// 电影上映时间
const dateFilter = (timestamp) => {
  return dayjs.unix(timestamp).format("YYYY-MM-DD")
}

// 图片预览
const handlePreview = (index) => {
  showImagePreview({
    images: filmInfo.photos,
    startPosition: index,
    loop: false,
    closeable: true,
    closeIconPosition: "top-left",
  })
}
</script>

<style lang="less" scoped>
.detail-container {
  background-color: rgb(240, 238, 238);
  .banner {
    height: 230px;
    background-size: cover;
    background-position: center center;
    .back-img {
      margin-top: 8px;
      margin-left: 8px;
      width: 30px;
      height: 30px;
    }
  }
  .film-detail {
    padding: 10px;
    background-color: white;
    .col {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      .film-name {
        font-size: 22px;
        color: rgb(55, 55, 55);
        width: 240px;
        .name {
          margin-right: 10px;
        }
        .item {
          font-size: 18px;
          color: rgb(96, 96, 96);
        }
      }
      .film-grade {
        font-size: 22px;
        font-style: italic;
        color: rgb(255, 200, 0);
        margin-right: 20px;
      }
    }
    .film-category {
      margin-bottom: 5px;
    }
    .nation-runtime {
      margin-bottom: 10px;
    }
    .film-synopsis {
      &.hidden {
        height: 38px !important;
        overflow: hidden;
      }
    }
    .iconbtn {
      text-align: center;
      font-size: 20px !important;
    }
  }
  .grey-text {
    color: rgb(152, 151, 151);
    font-size: 14px;
  }
  .cast {
    margin-top: 10px;
    padding: 20px 0px 10px 0px;
    background-color: white;
    .cast-title {
      font-size: 19px;
      color: rgb(72, 71, 71);
      margin: 0px 0px 20px 10px;
    }
    .actor-item {
      .avatar-img {
        object-fit: cover;
        border-radius: 10px;
      }
      :first-child {
        margin-left: 5px;
      }
      :last-child {
        margin-left: 5px;
      }
      .cast-info {
        width: 90px;
        color: rgb(152, 151, 151);
        display: flex;
        flex-direction: column;
        align-items: center;
        :first-child {
          color: rgb(72, 71, 71);
        }
      }
    }
  }
  .photo {
    margin-top: 10px;
    padding: 20px 0px 10px 0px;
    background-color: white;
    .photo-title {
      font-size: 19px;
      color: rgb(72, 71, 71);
      margin: 0px 0px 20px 10px;
    }
    .photo-item {
      margin-right: 5px;
      .photo-img {
        object-fit: cover;
      }
    }
  }
}
</style>
