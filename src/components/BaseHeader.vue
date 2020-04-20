<template>
  <div>
    <el-menu 
      :default-active="activeIndex" 
      mode="vertical" 
      @select="handleSelect" 
      :collapse="isCollapse"
      background-color="#606266"
      text-color="#FFFFFF"
      active-text-color="#F18400"
      class="el-menu-vertical"
    >
      <el-menu-item index="point-list">
        <i class="el-icon-scissors"></i>
        <template v-slot:title><span>选点</span></template>
      </el-menu-item>
      <el-menu-item index="test-arrange">
        <i class="el-icon-document-copy"></i>
        <template v-slot:title><span>安排测试</span></template>
      </el-menu-item>
      <el-menu-item index="logout" class="to-bottom">
        <i class="el-icon-user"></i>
        <template v-slot:title><span>{{displayUsername}}</span></template>
      </el-menu-item>
    </el-menu>
  </div>
</template>
<script>
export default {
  name:'BaseHeader',
  props:{
    activeIndex:String,
    isCollapse: Boolean
  },
  data () {
    return {
    }
  },
  computed:{
    displayUsername(){
      return this.$store.state.username
    }
  },
  mounted () {
    // let userData = this.getUserInfo(sessionStorage.getItem('token')) || {}
    // this.$store.commit('updateValue', {key: 'username', value: userData.name})
    // this.$store.commit('updateValue', {key: 'authority', value: userData.authority})
  },
  methods:{
    handleSelect(index){
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
            message: '已取消'
          })
        })
      } else if (index == 'setting') { 

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
.to-bottom
  position:absolute
  width: 100%
  bottom: 0
.btn-block
  width: 100%
.el-menu-vertical
  height: 100%
.el-menu-vertical:not(.el-menu--collapse)
  width: 132px
</style>

