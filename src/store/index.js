import { createStore } from "vuex"
import cinemaModule from "./modules/cinemaModule"
import cityModule from "./modules/cityModule"
import createPersistedState from "vuex-persistedstate" // vuex持久化

const store = createStore({
  plugins: [createPersistedState()],
  modules: {
    cinema: cinemaModule,
    city: cityModule,
  },
})

export default store
