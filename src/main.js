import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import './style/theme/index.css'
import './assets/icon/iconfont.css'
import _ from 'lodash'
import $ from 'jquery'
import axios from 'axios'
import VueKonva from 'vue-konva'

import { OverlayScrollbarsPlugin } from 'overlayscrollbars-vue'
import 'overlayscrollbars/css/OverlayScrollbars.css'  
Vue.use(OverlayScrollbarsPlugin)

Vue.prototype.$http = axios
Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(VueKonva)
window._ = _
window.$ = $

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
