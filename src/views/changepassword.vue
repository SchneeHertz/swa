<template>
  <div class="main-body">
    <img src="../assets/logo.png" @click="toLoginPage">
    <el-row class="content">
      <el-col :xs="24" :sm="{span: 6,offset: 9}">
        <el-row>
          <el-input 
            v-model="user.name" 
            placeholder="用户名"
            ref="name"
            type="text"
            @keyup.enter.native="toopw"
          >
          </el-input>
          <el-input 
            v-model="user.oldpassword" 
            placeholder="旧密码"
            ref="oldpassword"
            type="password"
            @keyup.enter.native="topw"
            show-password
          >
          </el-input>
          <el-input 
            v-model="user.password" 
            placeholder="新密码，长度12-20，包含大写字母，小写字母及数字"
            title="新密码，长度12-20，包含大写字母，小写字母及数字"
            ref="password"
            type="password"
            show-password
          >
          </el-input>
          <el-button type="info" @click="checkPassword" :loading="loading">修改密码</el-button>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import JSEncrypt from 'jsencrypt'

export default {
  data () {
    return {
      loading: false,
      user: {
        name: '',
        oldpassword: '',
        password: '',
      },
      publicKey: undefined
    }
  },
  mounted () {
    this.$http.get('/auth/getPublicKey')
    .then(res=>{
      this.publicKey = res.data.publicKey
    })
  },
  methods:{
    toLoginPage () {
      this.$router.push('/')
    },
    toopw(){
      this.$refs.oldpassword.focus()
    },
    topw(){
      this.$refs.password.focus()
    },
    encryptPassword (password) {
      let encrypt = new JSEncrypt()
      encrypt.setPublicKey(this.publicKey)
      return encrypt.encrypt(password)
    },
    checkPassword () {
      if (this.user.password !== this.user.oldpassword){
        if (this.user.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{12,20}$/)) {
          this.changePassword()
        } else {
          this.$message({
            type: 'warning',
            message: '密码长度应该在12-20之间，且包含大写字母，小写字母及数字'
          })
        }
      } else {
        this.$message({
          type: 'warning',
          message: '新密码与旧密码不能相同'
        })
      }      
    },
    changePassword(){
      this.loading = true
      this.$http.post('/auth/cpw', {
        name: this.user.name,
        oldpassword: this.encryptPassword(this.user.oldpassword),
        password: this.encryptPassword(this.user.password)
      })
        .then((res)=>{
          this.loading = false
          if(res.data.success){
            this.$message({
              type: 'success',
              message: res.data.info
            })
            this.$router.push('/')
          }else{
            this.$message.error(res.data.info)
          }
        })
        .catch((err) => {
            this.loading = false
            this.$message.error('请求错误！')
        })
    }
  }
}
</script>

<style lang="stylus" scoped>
.main-body
  text-align: center
.el-row.content
  padding 16px
.title
  font-size 28px
.el-input
  margin 12px 0
.el-button
  width 100%
  margin-top 12px    
</style>
