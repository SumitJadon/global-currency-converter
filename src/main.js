import Vue from 'vue'
import VueI18n from 'vue-i18n'
import App from './GlobalCurrencyConverterApp.vue'
import vuetify from './plugins/vuetify'
import strings from './assets/strings.json';

Vue.use(VueI18n)
Vue.config.productionTip = false

// Create VueI18n instance with options
const i18n = new VueI18n({
  locale: localStorage.getItem('locale') || 'en-US',
  messages: strings.strings
})

new Vue({
  i18n,
  vuetify,
  render: h => h(App)
}).$mount('#app')



