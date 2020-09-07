<template>
  <el-container class="user-page">
    <BaseHeader activeIndex="user-page"/>
    <el-main>
      <el-row>
        <el-card class="history-case">
          <template #header>历史Case</template>
          <el-table
            :data="historyCase"
            border
            stripe
            height="90vh"
          >
            <el-table-column prop="id" label="case号">
              <template #default="scope">
                <router-link :to="`/case-info?case=${scope.row.id}`">{{scope.row.id}}</router-link>
              </template>
            </el-table-column>
            <el-table-column prop="date" label="最后更新时间">
              <template #default="scope">{{new Date(scope.row.date).toLocaleString()}}</template>
            </el-table-column>
          </el-table>
        </el-card>
        <el-card class="view-setting">
          <template #header>设置</template>
          <NameFormItem class="card-line" prependWidth="30px">
            <template #prepend>测试界面语言</template>
            <el-select 
              v-model="viewSetting.language"
              @change="saveSetting"
            >
              <el-option label="英文" value="englishDescription"></el-option>
              <el-option label="中文" value="chineseDescription"></el-option>
            </el-select>
          </NameFormItem>
          <NameFormItem class="card-line" prependWidth="30px">
            <template #prepend>测试界面列数</template>
            <el-select
              v-model="viewSetting.column"
              @change="saveSetting"
            >
              <el-option label="1" :value="1"></el-option>
              <el-option label="2" :value="2"></el-option>
            </el-select>
          </NameFormItem>
        </el-card>
      </el-row>
    </el-main>
    <div class="bottom-function-btn">
      <el-tooltip effect="dark" content="退出登录" placement="top">
        <el-button type="primary" class="bigicon" icon="el-third-icon-logout" circle @click="logout"></el-button>
      </el-tooltip>
    </div>
  </el-container>
</template>

<script>
import BaseHeader from '@/components/BaseHeader.vue'
import NameFormItem from '@/components/NameFormItem.vue'

function geneVuexValue (property) {
  return {
    get () { return this.$store.state[property] },
    set (newVal) { this.$store.commit('updateValue', {key: property, value: newVal}) }
  }
}

export default {
  name: 'UserPage',
  components: {
    BaseHeader,
    NameFormItem
  },
  data () {
    return {
      historyCase: []
    }
  },
  computed: {
    viewSetting: geneVuexValue('viewSetting'),
  },
  mounted () {
    this.loadHistoryCase()
  },
  methods: {
    saveSetting () {
      localStorage.setItem('viewSetting', JSON.stringify(this.viewSetting))
    },
    loadHistoryCase () {
      return this.$http.post('/data/getUserHistoryCase', {
        duration: 604800000
      })
      .then(res=>{
        if (res.data.success) {
          this.historyCase = res.data.result
        }
      })
    },
    logout () {
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
    }
  }
}
</script>

<style lang="stylus" scoped>
.el-main
  padding: 0
.history-case
  width: 32vw
  .el-table
    max-height: 50vh
.view-setting
  width: 28vw
  .card-line
    margin: 4px 0
.bottom-function-btn
  position: absolute
  bottom: 1em
  right: 1.5em
</style>

<style lang="stylus">
.user-page
  .el-card
    display: inline-block
    margin: 8px
    vertical-align: top
    .el-card__header
      padding: 10px 20px
    .el-card__body
      padding: 16px
</style>