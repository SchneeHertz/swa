<template>
  <el-container>
    <BaseHeader activeIndex="testitem-manage"/>
    <el-container style="height:100vh;width:100vw;">
      <el-aside width="132px" class="nav-aside">
        <el-menu
          class="menu"
          @select="handleMenuSelect"
          :default-active="activePage"
        >
          <el-menu-item index="condition">
            <i class="el-icon-document-checked"></i>
            <span slot="title">条件</span>
          </el-menu-item>
          <el-menu-item index="testitem">
            <i class="el-icon-document"></i>
            <span slot="title">测试项目</span>
          </el-menu-item>
          <el-menu-item index="client-request">
            <i class="el-icon-user"></i>
            <span slot="title">客户要求</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main v-if="activePage === 'condition'" class="condition-pane">
        <el-tabs type="border-card" v-model="activeConditionTab">
          <el-tab-pane label="单选" name="single">
            <ConditionCardSingle
              v-for="condition in singleConditionList"
              :key="condition.id"
              :data="condition"
              width="48%"
            >
            </ConditionCardSingle>
          </el-tab-pane>
          <el-tab-pane label="多选" name="multiple">
            <ConditionCardSingle
              v-for="condition in multipleConditionList"
              :key="condition.id"
              :data="condition"
              width="48%"
            >
            </ConditionCardSingle>
          </el-tab-pane>
          <el-tab-pane label="数值" name="number">

          </el-tab-pane>
          <el-tab-pane label="文本" name="text">

          </el-tab-pane>
          <el-tab-pane label="附加" name="afterward">

          </el-tab-pane>
        </el-tabs>
        <div class="bottom-function-btn">
          <el-button type="primary" class="bigicon" icon="el-third-icon-plus" circle @click="addCondition" title="新增"></el-button>
          <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="saveCondition" title="保存"></el-button>
        </div>
        <el-dialog
          title="新增条件"
          :visible.sync="conditionDialogVisible"
          width="65%"
          class="condition-dialog"
        >
          <el-input v-model="conditionDialogData.name" class="card-line">
            <template v-slot:prepend>条件名</template>
          </el-input>
          <template v-slot:footer>
            <el-button type="info" @click="conditionDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmConditionAdd">确定</el-button>
          </template>
        </el-dialog>
      </el-main>
      <el-main v-else-if="activePage === 'testitem'" class="testitem-pane">
        <el-table
          ref="regulation-table"
          :data="displaySlicedRegultionList"
          highlight-current-row
          stripe
          height="50vh"
          class="regulation-table"
        >
          <el-table-column
            prop="name"
            width="300"
            fixed
          >
            <template  v-slot:header>
                <el-input
                  v-model="searchName"
                  size="mini"
                  placeholder="名称，输入筛选"
                  clearable/>
              </template>
          </el-table-column>
        </el-table>
        <el-pagination
          :current-page.sync="pageTable"
          :page-sizes="[50, 100, 200, 500]"
          :page-size.sync="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="displayRegulationCount"
          class="regulation-table-pagination"
        ></el-pagination>
        <div class="bottom-function-btn">
          <el-button type="primary" class="bigicon" icon="el-third-icon-plus" circle @click="addRegulation" title="新增"></el-button>
          <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="saveRegulation" title="保存"></el-button>
        </div>
      </el-main>
      <el-main v-else-if="activePage === 'client-request'" class="client-request-pane">

      </el-main>
    </el-container>
  </el-container>
</template>

<script>

import BaseHeader from '@/components/BaseHeader.vue'
import ConditionCardSingle from '@/components/ConditionCardSingle.vue'

import {generate as _id } from 'shortid'

export default {
  name: 'TestitemManage',
  components: {
    BaseHeader,
    ConditionCardSingle
  },
  data () {
    return {
      materialList: [],
      conditionList: {},
      regulationList:[],
      activePage: 'condition',
      activeConditionTab: 'single',
      conditionDialogVisible: false,
      conditionDialogData: {},
      searchName: undefined,
      pageTable: 1,
      pageSize: 100,
    }
  },
  computed: {
    singleConditionList () {
      return this.conditionList['single']
    },
    multipleConditionList () {
      return this.conditionList['multiple']
    },
    displayRegulationList () {
      return this.regulationList.filter(data => !this.searchName || data.name.toLowerCase().includes(this.searchName.toLowerCase()))
    },
    displayRegulationCount () {
      return this.displayRegulationList.length
    },
    displaySlicedRegultionList () {
      return _.chunk(this.displayRegulationList, this.pageSize)[this.pageTable-1]
    },
  },
  mounted () {
    this.$http.get('/data/getRegulation')
    .then(res=>{
      this.regulationList = res.data.regulationList
    })
    this.$http.get('/data/getCondition')
    .then(res=>{
      this.conditionList = res.data.conditionList
    })
  },
  methods: {
    handleMenuSelect (index) {
      this.activePage = index
    },
    addCondition () {
      this.conditionDialogData = {
        cat: this.activeConditionTab,
        modify: 'add',
        id: _id()
      }
      this.conditionDialogVisible = true
    },
    confirmConditionAdd () {
      this.conditionList[this.conditionDialogData.cat].push(this.conditionDialogData)
      this.conditionDialogVisible = false
    },
    saveCondition () {
      this.$http.post('/data/saveCondition', {
        conditionList: this.conditionList
      })
      .then(res=>{
        if(res.data.success){
          this.$message({
            type: 'success',
            message: res.data.info
          })
          this.$http.get('/data/getCondition')
          .then(res=>{
            this.conditionList = res.data.conditionList
          })
        } else {
          this.$message({
            type: 'warning',
            message: res.data.info
          })
        }
      })
      .catch(() => {
        this.$message({
          type: 'warning',
          message: '未知错误'
        })
      })
    },
    addRegulation () {
      this.$prompt('请输入法规名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        this.regulationList.push({
          name: value,
          id: _id(),
          modify: 'add',
          // condition: [],
          // info: {}
        })
        this.$refs['regulation-table'].setCurrentRow(_.last(this.regulationList))
        // this.selectRegulation = _.last(this.regulationList)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    },
    saveRegulation () {
      this.$http.post('/data/saveRegulation', {
        regulationList: _.filter(this.regulationList, 'modify')
      })
      .then(res=>{
        if(res.data.success){
          this.$message({
            type: 'success',
            message: res.data.info
          })
          this.$http.get('/data/getRegulation')
          .then(res=>{
            this.regulationList = res.data.regulationList
          })
        } else {
          this.$message({
            type: 'warning',
            message: res.data.info
          })
        }
      })
      .catch(() => {
        this.$message({
          type: 'warning',
          message: '未知错误'
        })
      })
    },


  }
}
</script>

<style lang="stylus" scoped>
.nav-aside
  border-right: solid 1px rgb(220, 223, 230)
.condition-pane
  padding: 0
.condition-pane .el-tabs
  height: calc(100vh - 2px)
  border-left: none
.condition-card
  vertical-align: top
  width: 39vw
  margin: 0.4vh 0.4vw
  display: inline-block
.card-line
  margin: 6px 0
.bottom-function-btn
  position: absolute
  bottom: 2em
  right: 2em
.bigicon
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.2)
</style>

<style lang="stylus">
.bottom-function-btn .bigicon [class^="el-third-icon"]
  font-size: 25px
</style>
