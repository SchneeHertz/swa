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
            @keyup.enter.native="topw"
          >
          </el-input>
          <el-input 
            v-model="user.password" 
            placeholder="密码，长度12-20，包含大写字母，小写字母及数字"
            title="密码，长度12-20，包含大写字母，小写字母及数字"
            ref="password"
            type="password"
            @keyup.enter.native="toem"
            show-password
          >
          </el-input>
          <el-input 
            v-model="user.email" 
            placeholder="电子邮箱"
            ref="email"
            type="text"
          >
          </el-input>
          <el-button type="info" @click="checkPassword" :loading="loading">注册</el-button>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loading: false,
      user: {
        name: '',
        password: '',
        email: ''
      },
      mailtoLink: ''
    }
  },
  mounted () {
    this.$http.get('/auth/get-mailto-link')
    .then(res=>{
      this.mailtoLink = res.data.info
    })
  },
  methods:{
    toLoginPage () {
      this.$router.push('/')
    },
    topw(){
      this.$refs.password.focus()
    },
    toem(){
      this.$refs.email.focus()
    },
    checkPassword () {
      if (this.user.name.match(/^.{4,20}$/) && this.user.password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{12,20}$/) && this.user.email.match(/^\S+@\S+\.\S+$/)) {
        this.signup()
      } else {
        this.$message({
          type: 'warning',
          message: '用户名长度应该在4-20之间，密码长度应该在12-20之间，且包含大写字母，小写字母及数字，电子邮箱不包含空格',
          duration: 20000,
          showClose: true
        })
      }
    },
    signup(){
      this.loading = true
      this.$http.post('/auth/signup', this.user)
        .then((res)=>{
          this.loading = false
          if(res.data.success){
            this.$message({
              type: 'success',
              message: res.data.info
            })
            this.$router.push('/')
            let a = document.createElement("a")
            document.body.appendChild(a)
            a.href = encodeURI(`mailto:${this.mailtoLink}?subject=Sampling Web App Permission Request&body=Account ${this.user.email} is registered, please review.`)
            a.click()
            document.body.removeChild(a)
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
