<template>
<el-container class="preview-page">
  <BaseHeader activeIndex="preview"/>
  <el-main>
    <el-row>
      <el-col :span="6" class="task-list-panel">
        <el-input v-model="caseNumber" class="case-number" size="small">
          <template #prepend>Case:</template>
        </el-input>
        <overlay-scrollbars
          :options="{scrollbars: {autoHide: 'scroll'}}"
          class="task-list-div"
        >
          <el-tree
            :data="displayTaskList"
            highlight-current
            @node-click="handleNodeClick"
            class="task-list"
          ></el-tree>
        </overlay-scrollbars>
      </el-col>
      <el-col :span="13" class="task-main">
        <div class="task-header">
          <div class="task-header-info">Case: {{selectTask.taskInfo.CaseNumber}}</div>
          <div class="task-header-info">Report: {{selectTask.taskInfo.ReportNumber}}</div>
          <div class="task-header-info">Job: {{selectTask.taskInfo.JobNumber}}</div>
          <div class="task-header-info one-line">Test Item: {{selectTask.regulation.name}}</div>
          <div class="task-header-info one-line">Method: {{selectTask.method.name}}</div>
        </div>
        <div class="task-remark">
          <NameFormItem class="card-line" prependWidth="110px">
            <template #prepend>English Remark:</template>
            <el-input type="textarea" v-model="selectTask.taskObj.EnglishRemark"></el-input>
          </NameFormItem>
          <NameFormItem class="card-line" prependWidth="110px">
            <template #prepend>Chinese Remark:</template>
            <el-input type="textarea" v-model="selectTask.taskObj.ChineseRemark"></el-input>
          </NameFormItem>
        </div>
        <overlay-scrollbars class="task-body">
          <el-row
            v-for="component in selectTask.taskObj.ComponentArray"
            :key="component.ComponentNo"
            class="component-block"
          >
            <el-col :span="24">
              <NameFormItem class="card-line" prependWidth="2em">
                <template #prepend>{{component.ComponentNo}}.</template>
                <el-select
                  v-model="component.SubClass"
                  size="mini"
                  class="component-select"
                >
                  <el-option
                    v-for="sc in selectTask.regulation.subclause"
                    :key="sc.id"
                    :label="sc.name"
                    :value="sc.code"
                  ></el-option>
                </el-select>
              </NameFormItem>
            </el-col>
            <el-col :span="12">
              <el-input type="textarea" v-model="component.EnglishDescription"></el-input>
            </el-col>
            <el-col :span="12">
              <el-input type="textarea" v-model="component.ChineseDescription"></el-input>
            </el-col>
          </el-row>
        </overlay-scrollbars>
      </el-col>
      <el-col :span="5"></el-col>
      <div class="bottom-function-btn">
        <el-button type="primary" class="bigicon" icon="el-third-icon-cloud-download" circle title="加载"  @click="loadTaskList"></el-button>
        <el-button type="success" class="bigicon" icon="el-third-icon-save" circle title="保存" @click="saveTaskList"></el-button>
        <el-button type="primary" class="bigicon" icon="el-third-icon-export" circle title="导出"></el-button>
      </div>
    </el-row>
  </el-main>
</el-container>
</template>

<script>
import BaseHeader from '@/components/BaseHeader.vue'
import NameFormItem from '@/components/NameFormItem.vue'

import {generate as _id } from 'shortid'

function geneVuexValue (property) {
  return {
    get () { return this.$store.state[property] },
    set (newVal) { this.$store.commit('updateValue', {key: property, value: newVal}) }
  }
}

async function exportData (taskList) {
  for (let task of taskList) {
    console.log(task)
    await $.ajax({
      type:'POST',
      url:'http://10.168.128.44/OTS_UAT/Services/CaseService.asmx/ImportTestItemTask',
      data:{json: JSON.stringify({ImportData: [task.taskObj]})}
    })
    .then(res=>{
        addLog(JSON.parse($(res).find('string').html()))
    })
  }
  console.log('loop end')
}

export default {
  name: 'Preview',
  components: {
    BaseHeader,
    NameFormItem
  },
  data () {
    return {
      log: [],
      taskList: [],
      selectTaskId: undefined
    }
  },
  computed: {
    caseNumber: geneVuexValue('caseNumber'),
    methodBaseData: geneVuexValue('methodBaseData'),
    displayTaskList () {
      let taskTree = []
      _.forIn(_.groupBy(this.taskList, task=>{
        return task.regulation.name
      }), (taskArray, regulation)=>{
        taskTree.push({
          label: regulation,
          children: taskArray.map(task=>{
            return {
              label: task.method.name,
              id: task.id
            }
          })
        })
      })
      return taskTree
    },
    selectTask () {
      return _.find(this.taskList, {id: this.selectTaskId}) || {taskInfo: {}, method: {}, regulation: {}, taskObj: {}, pointIdList: []}
    }
  },
  mounted () {
    window.exportData = exportData
    window.addLog = this.addLog
  },
  methods: {
    loadTaskList () {
      this.$http.post('/data/getCaseData', {
        caseNumber: this.caseNumber,
        list: ['taskList', 'methodBaseData']
      })
      .then(({data: {result}})=>{
        if (_.isArray(result.methodBaseData) && !_.isEmpty(result.methodBaseData)) {
          this.methodBaseData = result.methodBaseData
        }
        if (_.isArray(result.taskList) && !_.isEmpty(result.taskList)) {
          this.$confirm('之前已保存TaskList，载入已保存的TaskList，还是重新生成TaskList', '确认信息', {
            distinguishCancelAndClose: true,
            confirmButtonText: '读取已保存的TaskList',
            cancelButtonText: '重新生成TaskList'
          })
          .then(() => {
            this.taskList = result.taskList
          })
          .catch(action => {
            if (action == 'cancel') {
              this.geneTaskList()
            }
          })
        } else {
          this.geneTaskList()
        }
      })
    },
    geneTaskList () {
      let taskList = []
      _.forIn(this.methodBaseData, methodGroup=>{
        let mainGroupList = []
        _.forIn(methodGroup.list, group=>{
          let pointList = []
          _.forIn(group.list, point=>{
            pointList.push(
              _.mergeWith(
                ..._.flattenDeep(this.resolvePointTree(point)),
                (obj, src)=>[obj, src].join(' w/ ')
              )
            )
          })
          group.description = _.mergeWith(...pointList, (obj, src)=>[obj, src].join(' + '))
        })
        _.forIn(methodGroup.regulationList, regulation=>{
          let taskObj = {
            RequiredSequenceID: 1,
            JobID: regulation.caseInfo.JobID,
            TestMethodID: +methodGroup.code,
            CaseTestItemID: regulation.caseInfo.CaseTestItemID,
            EnglishRemark: '',
            ChineseRemark: '',
            ComponentArray: [],
            ComponentListCheckBy: 2568,
            CreateBy: 68157,
            Operator: 68157
          }
          _.forIn(regulation.list, (pointId, index)=>{
            let foundPoint = _.find(methodGroup.list, {id: pointId})
            taskObj.ComponentArray.push({
              ComponentNo: + index + 1 + '',
              ComponentType: null,
              Trial: 1,
              SubClass: regulation.subclauseVal[pointId] ? regulation.subclauseVal[pointId] : null,
              EnglishDescription: foundPoint.description.englishDescription,
              ChineseDescription: foundPoint.description.chineseDescription,
              IsDataTransfer: true,
              IsShowInReport: true,
            })
          })
          if (!_.isEmpty(taskObj.ComponentArray)) {
            mainGroupList.push({
              id: _id(),
              taskInfo: {
                ..._.pick(regulation.caseInfo, ['CaseNumber', 'JobNumber', 'ReportNumber'])
              },
              method: {
                id: methodGroup.id,
                name: methodGroup.name
              },
              regulation: {
                id: regulation.id,
                name: regulation.name,
                subclause: regulation.subclause
              },
              taskObj: taskObj,
              pointIdList: regulation.list
            })
          }
        })
        taskList.push(mainGroupList)
      })
      taskList = _.filter(taskList, t=>!_.isEmpty(t))
      this.taskList = _.flatten(taskList)
      return taskList
    },
    resolvePointTree (point) {
      let innerArray = []
      if (!_.isEmpty(point.elements)) {
        _.forIn(point.elements, innerPoint=>{
          innerArray.push(this.resolvePointTree(innerPoint))
        })
      }
      return [{englishDescription: point.englishDescription, chineseDescription: point.chineseDescription}, innerArray]
    },
    addLog (log) {
      this.log.push(log)
    },
    handleNodeClick (data) {
      this.selectTaskId = data.id
    },
    saveTaskList () {
      this.confirmDialog(
        ()=>{
          this.$http.post('/data/saveCaseData', {
            caseNumber: this.caseNumber,
            data: {
              taskList: this.taskList
            }
          })
          .then(res=>{
            this.$message({type: 'success', message: '保存成功', showClose: true})
          })
        },
        {question: '确认保存?', success: '操作完成', cancel: '已取消'}
      )
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
.el-main
  padding: 0
.task-list-panel
  border-right: solid 1px rgba(0,0,0,0.125)
.task-list-div
  height: calc(100vh - 32px)
.task-main
  border-right: solid 1px rgba(0,0,0,0.125)
  .el-input, .el-select
    background-color: rgba(0,0,0,0.005)
.task-header
  border: solid 1px rgba(0,0,0,0.125)
  margin: 2px 2px 0
  border-radius: 4px
  background-color: rgba(0,0,0,0.005)
  .task-header-info
    color: #606266
    display: inline-block
    min-width: 32%
    padding: 4px 0 4px 6px
    font-size: 14px
  .one-line
    display: block
.task-remark
  .card-line
    margin: 4px 2px
.task-body
  height: calc(100vh - 205px )
  .component-block
    border: solid 1px rgba(0,0,0,0.125)
    border-radius: 4px
    margin: 4px 2px 6px 2px
    .component-select
      width: 100%
.bottom-function-btn
  position: absolute
  bottom: 1em
  right: 1.5em
</style>

<style lang="stylus">
.task-list
  .el-tree-node__content
    height: auto
    padding: 4px 0
  .el-tree-node__label
    white-space: normal 
.task-main
  .el-input__inner, .el-textarea__inner
    background-color: rgba(0,0,0,0.005)
</style>