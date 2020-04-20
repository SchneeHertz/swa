import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import './style/theme/index.css'
import './assets/icon/iconfont.css'
import _ from 'lodash'
import axios from 'axios'
import VueKonva from 'vue-konva'

Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(VueKonva)
window._ = _

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')