<template>
  <div class="main-body">
    <img src="../assets/logo.png">
    <el-row class="content">
      <el-col :xs="24" :sm="{span: 6,offset: 9}">
        <el-row>
          <el-input 
            v-model="user.name" 
            placeholder="用户名"
            ref="name"
            type="text"
            @keyup.enter.native="topw"
          >
          </el-input>
          <el-input 
            v-model="user.password" 
            placeholder="密码"
            ref="password"
            type="password"
            @keyup.enter.native="login"
            show-password
          >
          </el-input>
          <el-row :gutter="8">
            <el-col :span="8"><el-button type="info" @click="changepassword" plain>修改密码</el-button></el-col>
            <el-col :span="6"><el-button type="info" @click="signup" plain>注册</el-button></el-col>
            <el-col :span="10"><el-button type="primary" @click="login" :loading="loading">登录</el-button></el-col>
          </el-row>
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
        password: ''
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
    topw(){
      this.$refs.password.focus()
    },
    changepassword () {
      this.$router.push('/changepassword')
    },
    signup(){
      this.$router.push('/signup')
    },
    encryptPassword (password) {
      let encrypt = new JSEncrypt()
      encrypt.setPublicKey(this.publicKey)
      return encrypt.encrypt(password)
    },
    login() {
      this.loading = true
      this.$http.post('/auth/login', {
        name: this.user.name,
        password: this.encryptPassword(this.user.password)
      })
        .then((res)=>{
          this.loading = false
          if(res.data.success){
            sessionStorage.setItem('token',res.data.token)
            this.$message({
              type: 'success',
              message: '登录成功！'
            })
            this.$router.push('/case-info')
          }else{
            this.$message.error(res.data.info)
            sessionStorage.setItem('token',null)
            if (res.data.redirect) {
              this.$router.push(res.data.redirect)
            }
          }
        })
        .catch((err) => {
            this.loading = false
            this.$message.error('请求错误！')
            sessionStorage.setItem('token',null)
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
