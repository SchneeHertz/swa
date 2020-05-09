<template>
  <el-container>
    <BaseHeader activeIndex="testitem-manage"/>
    <el-container style="height:100vh;width:100vw;">
      <el-aside width="132px">
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
            <ConditionCard
              v-for="condition in singleConditionList"
              :key="condition.id"
            
            />
          </el-tab-pane>
          <el-tab-pane label="多选" name="multiple">

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
          title="编辑条件"
          :visible.sync="conditionDialogVisible"
          width="65%"
          class="condition-dialog"
        >
          <el-input v-model="conditionDialogData.name" class="card-line">
            <template v-slot:prepend>条件名</template>
          </el-input>
          <el-input v-model="conditionDialogData.rank" type="number" placeholder="输入整数，越大优先度越高" class="card-line">
            <template v-slot:prepend>优先度</template>
          </el-input>
          <template v-slot:footer>
            <el-button type="info" @click="conditionDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmConditionEdit">确定</el-button>
          </template>
        </el-dialog>
      </el-main>
      <el-main v-else-if="activePage === 'testitem'" class="testitem-pane">

      </el-main>
    </el-container>
  </el-container>
</template>

<script>

import BaseHeader from '@/components/BaseHeader.vue'
import ConditionCard from '@/components/ConditionCard.vue'

import {generate as _id } from 'shortid'

export default {
  name: 'TestitemManage',
  components: {
    BaseHeader,
    ConditionCard
  },
  data () {
    return {
      materialList: [],
      conditionList: {},
      regulationList:[],
      activePage: 'condition',
      activeConditionTab: 'single',
      conditionDialogVisible: false,
      conditionDialogData: {}
    }
  },
  computed: {
    singleConditionList () {
      return this.conditionList['single']
    },
    multipleConditionList () {
      return this.conditionList['multiple']
    }
  },
  mounted () {
    this.$http.get('/data/getMaterialList')
    .then(res=>{
      this.materialList = res.data.materialList
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
    confirmConditionEdit () {
      switch (this.conditionDialogData.modify) {
        case 'add':
          this.conditionList[this.conditionDialogData.cat].push(this.conditionDialogData)
          break
      }
      this.conditionDialogVisible = false
    },
    saveCondition () {

    },
  }
}
</script>

<style lang="stylus" scoped>
.condition-pane
  padding: 0
.condition-pane .el-tabs
  height: calc(100vh - 2px)
  // border-bottom-width: 0
  // border-top-width: 0
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
