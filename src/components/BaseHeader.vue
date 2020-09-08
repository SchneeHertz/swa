<template>
  <div>
    <el-menu 
      :default-active="activeIndex" 
      mode="vertical" 
      @select="handleSelect" 
      :collapse="true"
      background-color="#606266"
      text-color="#FFFFFF"
      active-text-color="#F18400"
      class="el-menu-vertical"
    >
      <el-menu-item index="case-info">
        <i class="el-icon-warning-outline"></i>
        <template v-slot:title><span>信息</span></template>
      </el-menu-item>
      <el-menu-item index="point-list">
        <i class="el-icon-scissors"></i>
        <template v-slot:title><span>选点</span></template>
      </el-menu-item>
      <el-menu-item index="test-arrange">
        <i class="el-icon-document-copy"></i>
        <template v-slot:title><span>安排测试</span></template>
      </el-menu-item>
      <el-menu-item index="preview">
        <i class="el-icon-finished"></i>
        <template v-slot:title><span>预览及导出</span></template>
      </el-menu-item>
      <el-menu-item index="user-manage" v-show="authority == 'admin'">
        <i class="el-third-icon-team"></i>
        <template v-slot:title><span>用户管理</span></template>
      </el-menu-item>
      <el-menu-item index="testitem-manage">
        <i class="el-icon-guide"></i>
        <template v-slot:title><span>测试项目管理</span></template>
      </el-menu-item>
      <el-menu-item index="user-page">
        <i class="el-icon-user"></i>
        <template v-slot:title><span>{{displayUsername}}</span></template>
      </el-menu-item>
    </el-menu>
  </div>
</template>
<script>

function geneVuexValue (property) {
  return {
    get () { return this.$store.state[property] },
    set (newVal) { this.$store.commit('updateValue', {key: property, value: newVal}) }
  }
}

export default {
  name:'BaseHeader',
  props:{
    activeIndex:String
  },
  data () {
    return {}
  },
  computed:{
    viewSetting: geneVuexValue('viewSetting'),
    displayUsername () {
      return this.$store.state.username
    },
    authority () {
      return this.$store.state.authority
    }
  },
  mounted () {
    let userData = this.getUserInfo(sessionStorage.getItem('token')) || {}
    this.$store.commit('updateValue', {key: 'username', value: userData.name})
    this.$store.commit('updateValue', {key: 'authority', value: userData.authority})
    this.$store.commit('updateValue', {key: 'otsId', value: userData.otsId})
    this.viewSetting = JSON.parse(localStorage.getItem('viewSetting')) || {}
  },
  methods:{
    handleSelect (index) {
      if(index == 'logout'){
        this.$confirm('退出登录', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          sessionStorage.setItem('token', '')
          this.$router.push('/')
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消',
            showClose: true
          })
        })
      } else {
        this.$router.push(index)
      }
    },
    getUserInfo(token){
      if(token != null && token != 'null'){
        let base64Url = token.split('.')[1]
        let base64 = base64Url.replace('-', '+').replace('_', '/')
        let decode = JSON.parse(window.atob(base64))
        return decode
      }else {
        return null
      }
    }
  }
}
</script>
<style lang="stylus" scoped>
.btn-block
  width: 100%
.el-menu-vertical
  height: 100vh
.el-menu-vertical:not(.el-menu--collapse)
  width: 160px
.el-menu-vertical
  for row in 1 2 3
    li:nth-last-child({row})
      position: absolute
      width: 100%
      bottom: row * 56px - 56px
</style>

<style lang="stylus">
.el-menu-vertical
  .el-tooltip
    text-align: center
    [class^="el-third-icon"]
      font-size: 18px
</style>

