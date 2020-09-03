<template>
  <el-container class="user-manage">
    <BaseHeader activeIndex="user-manage"/>
    <el-main>
      <el-table
        :data="userList"
        stripe
        height="88vh"
      >
        <el-table-column
          prop="name"
          label="用户名"
          sortable
        />
        <el-table-column
          prop="email"
          label="电子邮箱"
          sortable
        />
        <el-table-column
          label="OTS ID"
        >
          <template v-slot:default="props">
            <el-input 
              size="mini" 
              v-model.number="props.row.otsId"
              @change="updateUserStatus(props.row.id)"
            ></el-input>
          </template>
        </el-table-column>
        <el-table-column
          label="用户权限"
        >
          <template v-slot:default="props">
            <el-select 
              v-model="props.row.authority"
              @change="updateUserStatus(props.row.id)"
              size="mini"
            >
              <el-option label="无权限" value="none"></el-option>
              <el-option label="普通用户" value="user"></el-option>
              <el-option label="管理员" value="admin"></el-option>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column
          label="状态"
          sortable
          width="100"
        >
          <template v-slot:default="props">
            <span class="user-status">
              {{props.row.modify === 'modify' ? '已修改' : props.row.modify === 'delete' ? '将被删除' : ''}}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="80"
        >
          <template v-slot:default="props">
            <el-button type="danger" size="mini" @click="deleteUser(props.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="bottom-function-btn">
        <el-tooltip effect="dark" content="保存" placement="top">
          <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="saveUserList"></el-button>
        </el-tooltip>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import BaseHeader from '@/components/BaseHeader.vue'

export default {
  name: 'UserManage',
  components: {
    BaseHeader,
  },
  data () {
    return {
      userList: []
    }
  },
  mounted () {
    this.loadUserData()
  },
  methods: {
    loadUserData () {
      this.$http.get('/data/getUserGroup')
      .then(res=>{
        if(res.data.success){
          this.userList = res.data.userList
        } else {
          this.$message({
            type: 'warning',
            message: res.data.info
          })
        }
      })
    },
    updateUserStatus (id) {
      this.$set(_.find(this.userList, {id: id}), 'modify','modify')
    },
    deleteUser (id) {
      this.confirmDialog(
        ()=>this.$set(_.find(this.userList, {id: id}), 'modify','delete'),
        {
          question: '删除此用户账号?',
          success: '已标记删除',
          cancel: '已取消'
        },
        ()=>this.$set(_.find(this.userList, {id: id}), 'modify',undefined)
      )
    },
    saveUserList () {
      this.$http.post('/data/saveUserGroup', {
        userList: this.userList
      })
      .then(res=>{
        if(res.data.success){
          this.$http.get('/data/getUserGroup')
          .then(res=>{
            this.userList = res.data.userList
          })
          this.$message({type: 'success', message: res.data.info, showClose: true})
        } else {
          this.$message({type: 'warning', message: res.data.info, showClose: true})
        }
      })
      .catch(() => {
        this.$message({type: 'warning', message: '未知错误', showClose: true})
      })
    },
    confirmDialog(callback, message = {question: '继续?', success: '操作完成', cancel: '已取消'}, failCallback = new Function) {
      this.$confirm(message.question, '提示', {confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'})
      .then(() => {
        callback()
        this.$message({type: 'success', message: message.success, showClose: true})
      })
      .catch(() => {
        failCallback()
        this.$message({type: 'info', message: message.cancel, showClose: true})
      })
    },
  }
}
</script>

<style lang="stylus" scoped>
.regulation-status, .user-status
  color: red
.bottom-function-btn
  position: absolute
  bottom: 1em
  right: 1.5em
</style>