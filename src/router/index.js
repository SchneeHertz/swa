import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/case-info',
    name: 'CaseInfo',
    component: () => import('../views/case-info.vue')
  },
  {
    path: '/point-list',
    name: 'PointList',
    component: () => import('../views/point-list.vue')
  },
  {
    path: '/test-arrange',
    name: 'TestArrange',
    component: () => import('../views/test-arrange.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
