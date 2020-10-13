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
        <el-card
          class="history-count"
        >
          <template #header>里程</template>
          <div class="card-line">材料计数:</div>
          <div class="card-line">本月</div>
          <el-progress :percentage="historyCount.monthPointPercentage" :format="()=>historyCount.monthPointValue" :color="customColors"></el-progress>
          <div class="card-line">今年</div>
          <el-progress :percentage="historyCount.yearPointPercentage" :format="()=>historyCount.yearPointValue"></el-progress>
          <el-divider />
          <div class="card-line">组数计数:</div>
          <div class="card-line">本月</div>
          <el-progress :percentage="historyCount.monthGroupPercentage" :format="()=>historyCount.monthGroupValue" :color="customColors"></el-progress>
          <div class="card-line">今年</div>
          <el-progress :percentage="historyCount.yearGroupPercentage" :format="()=>historyCount.yearGroupValue"></el-progress>
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
      historyCase: [],
      historyCount: {},
      customColors: [
        {color: '#f56c6c', percentage: 40},
        {color: '#eed200', percentage: 64},
        {color: '#5cb87a', percentage: 80},
        {color: '#1989fa', percentage: 100}
      ]
    }
  },
  computed: {
    viewSetting: geneVuexValue('viewSetting'),
  },
  mounted () {
    this.loadHistoryCase()
    this.loadHistoryCount()
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
    loadHistoryCount () {
      return this.$http.get('/data/getUserHistoryCount')
      .then(res=>{
        if (res.data.success) {
          let countData = res.data.result
          let countPer = (type, countData) => {
            let m = countData['monthCount'][type]
            let y = countData['yearCount'][type]
            let mPer = m / ((y / ((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (60*60*24*1000))) * 30) * 80
            if (mPer > 100) {
              mPer = 100
            }
            let yPer = (new Date() - new Date(new Date().getFullYear(), 0, 0)) / (60*60*24*1000*365) * 100
            if (yPer > 100) {
              yPer = 100
            }
            return {
              month: {value: m, percentage: mPer},
              year: {value: y, percentage: yPer}
            }
          }
          let pointCount =  countPer('pointCount', countData)
          let groupCount = countPer('groupCount', countData)
          this.historyCount = {
            monthPointValue: pointCount.month.value,
            monthPointPercentage: pointCount.month.percentage,
            monthGroupValue: groupCount.month.value,
            monthGroupPercentage: groupCount.month.percentage,
            yearPointValue: pointCount.year.value,
            yearPointPercentage: pointCount.year.percentage,
            yearGroupValue: groupCount.year.value,
            yearGroupPercentage: groupCount.year.percentage,
          }
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
.view-setting, .history-count
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