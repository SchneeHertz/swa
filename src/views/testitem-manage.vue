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
          <el-menu-item index="material">
            <i class="el-third-icon-gold"></i>
            <span slot="title">材料</span>
          </el-menu-item>
          <el-menu-item index="method">
            <i class="el-third-icon-experiment"></i>
            <span slot="title">测试方法</span>
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
      <el-main v-if="activePage === 'material'" class="material-pane">
        <MaterialCard
          v-for="material in materialList"
          :key="material.id"
          :data="material"
          width="48%"
        ></MaterialCard>
      </el-main>
      <el-main v-else-if="activePage === 'testitem'" class="testitem-pane">
        <el-row>
          <el-col :span="6">
            <div class="testitem-filter">
              <el-input
                v-model="searchName"
                clearable
                class="card-line"
              >
                <template #prepend><span class="testitem-filter-prepend">筛选</span></template>
              </el-input>
              <NameFormItem class="card-line" prependWidth="2em">
                <template #prepend>分组</template>
                <template #default>
                  <el-select
                    v-model="searchGroup"
                    multiple
                    clearable
                  >
                    <el-option value="Total">Total</el-option>
                    <el-option value="Soluble">Soluble</el-option>
                  </el-select>
                </template>
              </NameFormItem>
            </div>
            <div>
              <overlay-scrollbars
                :options="{scrollbars: {autoHide: 'scroll'}}"
                class="regulation-list"
              >
                <li class="list">
                  <ul
                    class="regulation-ul"
                    :class="{'active-regulation': selectRegulation.id == regulation.id}"
                    v-for="regulation in displaySlicedRegultionList"
                    :key="regulation.id"
                    @click="handleSelectRegulation(regulation.id)"
                  >
                    {{regulation.name}}
                  </ul>
                </li>
              </overlay-scrollbars>
              <el-pagination
                :current-page.sync="pageTable"
                :page-size="100"
                layout="total, prev, pager, next"
                :total="displayRegulationCount"
                class="regulation-table-pagination"
              ></el-pagination> 
            </div>
          </el-col>
          <el-col :span="18">
            <el-tabs type="border-card">
              <el-tab-pane label="信息" name="info">

              </el-tab-pane>
              <el-tab-pane label="方法" name="method">

              </el-tab-pane>
              <el-tab-pane label="条件" name="condition">

              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
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
import MaterialCard from '@/components/MaterialCard.vue'
import NameFormItem from '@/components/NameFormItem.vue'

import {generate as _id } from 'shortid'

export default {
  name: 'TestitemManage',
  components: {
    BaseHeader,
    ConditionCardSingle,
    MaterialCard,
    NameFormItem
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
      searchGroup: undefined,
      pageTable: 1,
      selectRegulation: {}
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
      return _.chunk(this.displayRegulationList, 100)[this.pageTable-1]
    },
  },
  mounted () {
    this.$http.get('/data/getMaterialList')
    .then(res=>{
      this.materialList = res.data.materialList
    })
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
    handleSelectRegulation (id) {
      this.selectRegulation = _.cloneDeep(_.find(this.regulationList, {id: id}))
    }
  }
}
</script>

<style lang="stylus" scoped>
.nav-aside
  border-right: solid 1px rgb(220, 223, 230)
.condition-pane, .testitem-pane
  padding: 0
.condition-pane .el-tabs, .testitem-pane .el-tabs
  height: calc(100vh - 2px)
  border-left: none
.condition-card
  vertical-align: top
  width: 39vw
  margin: 0.4vh 0.4vw
  display: inline-block
.card-line:first-child
  margin: 6px 0
.card-line:not(:first-child)
  margin-bottom: 6px
.bottom-function-btn
  position: absolute
  bottom: 2em
  right: 2em
.bigicon
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.2)

.testitem-filter
  height: 12vh
.testitem-filter-prepend
  padding: 0 2px
.regulation-list
  border: solid 1px rgb(220, 223, 230)
  height: calc(88vh - 36px)
.regulation-list .list
  display: block
.regulation-list .regulation-ul
  margin: 0
  padding: 10px 8px
  border-top: solid 1px lightgrey 
  border-bottom: solid 1px lightgrey
.regulation-ul.active-regulation
  background-color: #FFCC66
</style>

<style lang="stylus">
.bottom-function-btn .bigicon [class^="el-third-icon"]
  font-size: 25px
.el-menu-item [class^="el-third-icon"]
  margin: 0 8px 0 3px
  width: 24px
  text-align: center
  font-size: 18px
  vertical-align: middle
</style>
