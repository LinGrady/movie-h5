import { createStore } from "vuex"
import cinemaModule from "./modules/cinemaModule"
import cityModule from "./modules/cityModule"
import filmModule from "./modules/filmModule"
import orderModule from "./modules/orderModule"
import createPersistedState from "vuex-persistedstate" // vuex持久化

const store = createStore({
  plugins: [createPersistedState()],
  modules: {
    cinema: cinemaModule,
    city: cityModule,
    film: filmModule,
    order: orderModule,
  },
})

export default store
