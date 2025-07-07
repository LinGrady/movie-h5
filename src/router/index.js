import { createWebHashHistory, createRouter } from "vue-router"

const routes = [
  {
    path: "/film",
    component: () => import("../views/Film.vue"),
    redirect: "/film/onshow",
    children: [
      {
        path: "/film/onshow",
        component: () => import("../views/Film/onShow.vue"),
      },
      {
        path: "/film/comingsoon",
        component: () => import("../views/Film/comingSoon.vue"),
      },
    ],
  },
  { path: "/cinema", component: () => import("../views/Cinema.vue") },
  {
    path: "/cinema/search",
    component: () => import("../views/Search.vue"),
  },
  {
    path: "/cinema/city",
    component: () => import("../views/City.vue"),
  },
  {
    path: "/cinema/:id",
    component: () => import("../views/CinemaDetail.vue"),
  },
  {
    path: "/schedule/:scheduleId/seat",
    component: () => import("../views/ScheduleDetail.vue"),
  },
  { path: "/login", component: () => import("../views/Login.vue") },
  { path: "/detail", component: () => import("../views/Detail.vue") },
  { path: "/film/search", component: () => import("../views/FilmSearch.vue") },
  {
    path: "/:catchAll(.*)",
    redirect: "/film",
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
