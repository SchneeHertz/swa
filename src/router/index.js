import Vue from 'vue'
import VueRouter from 'vue-router'
import axios from 'axios'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/login.vue')
  },
  {
    path: '/signup',
    name: 'Signup',
    component: () => import('../views/signup.vue')
  },
  {
    path: '/changepassword',
    name: 'ChangePassword',
    component: () => import('../views/changepassword.vue')
  },
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
  },
  {
    path: '/preview',
    name: 'Preview',
    component: () => import('../views/preview.vue')
  },
  {
    path: '/testitem-manage',
    name: 'TestitemManage',
    component: () => import('../views/testitem-manage.vue')
  },
  {
    path: '/user-page',
    name: 'UserPage',
    component: () => import('../views/user-page.vue')
  },
  {
    path: '/user-manage',
    name: 'UserManage',
    component: () => import('../views/user-manage.vue')
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach(async (to,from,next) =>{
  const token = sessionStorage.getItem('token')
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
  if(to.path == '/'){
    await axios.get('/data/testAuth')
    .then(()=>{
      Vue.prototype.$http.defaults.headers.common['Authorization'] = 'Bearer ' + token
      next('/case-info')
    })
    .catch(()=>{
      next()
    })
  } else if (to.path == '/signup') {
    next()
  } else if (to.path == '/changepassword') {
    next()
  } else {
    await axios.get('/data/testAuth')
    .then(()=>{
      Vue.prototype.$http.defaults.headers.common['Authorization'] = 'Bearer ' + token
      next()
    })
    .catch(()=>{
      next('/')
    })
  }
})

export default router
