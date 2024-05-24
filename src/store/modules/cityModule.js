const cityModule = {
  state: () => ({
    cityId: "310100",
    cityName: "上海",
  }),
  mutations: {
    changeCityData(state, { name: cityName, cityId }) {
      state.cityName = cityName
      state.cityId = cityId
    },
  },
}

export default cityModule
