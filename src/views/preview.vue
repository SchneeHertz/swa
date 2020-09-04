<template>
<el-container class="preview-page">
  <BaseHeader activeIndex="preview"/>
  <el-main>
    <el-row>
      <el-col :span="6" class="task-list-panel">
        <el-input v-model="caseNumber" class="case-number" size="small" @keyup.enter.native="loadTaskList">
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
          <div class="task-header-info one-line">Method: {{selectTask.regulation.method.name}}</div>
        </div>
        <div class="task-remark">
          <NameFormItem class="card-line" prependWidth="8em">
            <template #prepend>English Remark:</template>
            <el-input type="textarea" v-model="selectTask.taskObj.EnglishRemark"></el-input>
          </NameFormItem>
          <NameFormItem class="card-line" prependWidth="8em">
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
              <el-input
                type="textarea"
                v-model="component.EnglishDescription"
                :autosize="{minRows: 2, maxRows: 6}"
              ></el-input>
            </el-col>
            <el-col :span="12">
              <el-input
                type="textarea"
                v-model="component.ChineseDescription"
                :autosize="{minRows: 2, maxRows: 6}"
              ></el-input>
            </el-col>
          </el-row>
        </overlay-scrollbars>
      </el-col>
      <el-col :span="5"></el-col>
      <div class="bottom-function-btn">
        <el-tooltip effect="dark" content="加载" placement="top">
          <el-button type="primary" class="bigicon" icon="el-third-icon-cloud-download" circle @click="loadTaskList"></el-button>
        </el-tooltip>
        <el-tooltip effect="dark" content="保存" placement="top">
          <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="saveTaskList"></el-button>
        </el-tooltip>
        <el-tooltip effect="dark" content="导出" placement="top">
          <el-button type="primary" class="bigicon" icon="el-third-icon-export" circle @click="showExportDialog"></el-button>
        </el-tooltip>
      </div>
    </el-row>
    <el-dialog
      title="导出到OTS"
      :visible.sync="dialogVisible"
      width="75%"
      top="2vh"
      class="export-dialog"
      :close-on-click-modal="false"
    >
      <el-card shadow="never">
        <template #header>导出进度</template>
        <el-progress :percentage="exportPercentage.value"></el-progress>
        <overlay-scrollbars class="export-log">
          <p
            v-for="(log, index) in exportLog"
            :key="index"
            :class="[log.success ? 'success-log' : 'fail-log']"
          >{{log.info}}</p>
        </overlay-scrollbars>
      </el-card>
      <el-table
        :data="taskList"
        height="44vh"
        @selection-change="handleSelectionChange"
        ref="taskTable"
      >
        <el-table-column type="selection"></el-table-column>
        <el-table-column label="JobNumber" width="180">
          <template v-slot:default="props">
            {{props.row.taskInfo.JobNumber}}
          </template>
        </el-table-column>
        <el-table-column label="TestItem">
          <template v-slot:default="props">
            {{props.row.regulation.name}}
          </template>
        </el-table-column>
        <el-table-column label="Method">
          <template v-slot:default="props">
            {{props.row.regulation.method.name}}
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="dialogVisible = false">关闭</el-button>
        <el-button type="primary" @click="confirmExport" :loading="exportLoading.value">导出</el-button>
      </span>
    </el-dialog>
  </el-main>
</el-container>
</template>

<script>
import BaseHeader from '@/components/BaseHeader.vue'
import NameFormItem from '@/components/NameFormItem.vue'
import {generate as _id } from 'shortid'
const OTSHOST = '10.168.128.44/OTS_UAT'
// const OTSHOST = 'cnots.sgs.net/OTS'

function geneVuexValue (property) {
  return {
    get () { return this.$store.state[property] },
    set (newVal) { this.$store.commit('updateValue', {key: property, value: newVal}) }
  }
}

async function exportData (taskList) {
  let existComponentObj = {}
  let taskCount = taskList.length
  let inCount = 0
  for (let task of taskList) {
    let uploadTask = _.cloneDeep(task.taskObj)
    _.forIn(uploadTask.ComponentArray, component=>{
      if (_.has(component, 'ShareID')) {
        if (existComponentObj[component.ShareID]) {
          component.ShareSolutionComponentID = existComponentObj[component.ShareID]
        }
      }
    })
    await $.ajax({
      type:'POST',
      url:`http://${OTSHOST}/Services/CaseService.asmx/ImportTestItemTask`,
      data:{json: JSON.stringify({ImportData: [uploadTask]})}
    })
    .then(res=>{
      let exportResult = _.head(JSON.parse($(res).find('string').html()))
      if (exportResult.ImportResult === 'Success') {
        addLog({
          success: true,
          info: `${task.taskInfo.JobNumber}, ${task.taskInfo.TestItemDescription}, ${task.taskInfo.TestMethodName} 导出成功`
        })
      } else {
        addLog({
          success: false,
          info: `${task.taskInfo.JobNumber}, ${task.taskInfo.TestItemDescription}, ${task.taskInfo.TestMethodName} 导出失败：${exportResult.ImportResult}`
        })
      }
    })
    inCount++
    exportPercentage.value =  Math.round(inCount / taskCount * 100)
    await $.ajax({
      type:'POST',
      url:`http://${OTSHOST}/Services/CaseService.asmx/GetTaskList`,
      data: {
        CaseNumber: null, 
        ReportNumber: null, 
        JobNumber: task.taskInfo.JobNumber
      }
    })
    .then(res=>{
      return JSON.parse($(res).find('string').html())
    })
    .then(resData=>{
      let findTask = _.find(resData, {CaseTestItemID: task.taskInfo.CaseTestItemID, TestMethodID: task.taskInfo.TestMethodID})
      if (findTask) {
        _.forIn(findTask.ComponentArray, taskComponent=>{
          let findComponent = _.find(task.taskObj.ComponentArray, {ComponentNo: taskComponent.ComponentNo})
          if (findComponent && !existComponentObj[findComponent.ShareID]) {
            existComponentObj[findComponent.ShareID] = taskComponent.SampleComponentID
          }
        })
      }
    })
  }
  exportLoading.value = false
}

export default {
  name: 'Preview',
  components: {
    BaseHeader,
    NameFormItem
  },
  data () {
    return {
      exportLog: [],
      taskList: [],
      selectTaskId: undefined,
      dialogVisible: false,
      exportPercentage: {
        value: 0
      },
      tableSelectTask: undefined,
      exportLoading: {
        value: false
      }
    }
  },
  computed: {
    caseNumber: geneVuexValue('caseNumber'),
    pointList: geneVuexValue('valueList'),
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
              label: task.regulation.method.name,
              id: task.id
            }
          })
        })
      })
      return taskTree
    },
    selectTask () {
      return _.find(this.taskList, {id: this.selectTaskId}) || {taskInfo: {}, method: {}, regulation: {method:{}}, taskObj: {}, pointIdList: []}
    }
  },
  mounted () {
    window.addLog = this.addLog
    window.exportPercentage = this.exportPercentage
    window.exportLoading = this.exportLoading
  },
  methods: {
    loadTaskList () {
      this.$http.post('/data/getCaseData', {
        caseNumber: this.caseNumber,
        list: ['taskList', 'valueList', 'methodBaseData']
      })
      .then(({data: {result}})=>{
        if (_.isArray(result.valueList) && !_.isEmpty(result.valueList)) {
          this.pointList = result.valueList
        }
        if (_.isArray(result.methodBaseData) && !_.isEmpty(result.methodBaseData)) {
          this.methodBaseData = result.methodBaseData
          this.refreshDescription(this.methodBaseData)
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
    refreshDescription (methodBaseData) {
      _.forIn(methodBaseData, methodG=>{
        _.forIn(methodG.list, listGroup=>{
          _.forIn(listGroup.list, point=>{
            let foundSourcePoint = _.find(this.pointList, {id: point.id})
            if (foundSourcePoint) {
              point.englishDescription = foundSourcePoint.englishDescription
              point.chineseDescription = foundSourcePoint.chineseDescription
            }
          })
        })
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
        let methodPointList = methodGroup.list.map(p=>p.id)
        _.forIn(methodGroup.regulationList, regulation=>{
          let ComponentArray = []
          let sortedList = _.filter(methodPointList, pointId=>_.includes(regulation.list, pointId))
          _.forIn(sortedList, (pointId, index)=>{
            let foundPoint = _.find(methodGroup.list, {id: pointId})
            if (foundPoint) {
              let tempComponent = {
                ComponentNo: + index + 1 + '',
                ComponentType: null,
                Trial: 1,
                SubClass: regulation.subclauseVal[pointId] ? regulation.subclauseVal[pointId] : null,
                EnglishDescription: foundPoint.description.englishDescription,
                ChineseDescription: foundPoint.description.chineseDescription,
                IsDataTransfer: true,
                IsShowInReport: true
              }
              if (regulation.shareSolution) {
                tempComponent.ShareID = pointId
              }
              ComponentArray.push(tempComponent)
            }
          })
          if (!_.isEmpty(ComponentArray)) {
            let taskInfo = {
              TestMethodID: +regulation.method.code,
              TestMethodName: regulation.method.name,
              ..._.pick(regulation.caseInfo, ['CaseNumber', 'JobNumber', 'ReportNumber', 'CaseTestItemID', 'TestItemDescription'])
            }
            let findExistTask = _.find(mainGroupList, task=>_.isEqual(_.omit(task.taskInfo, 'TestMethodName'), _.omit(taskInfo, 'TestMethodName')))
            if (findExistTask) { //merge same source task
              let middleIndex = _.last(findExistTask.taskObj.ComponentArray).ComponentNo
              ComponentArray = ComponentArray.map(c=>{c.ComponentNo = + c.ComponentNo + (+ middleIndex) + ''; return c})
              findExistTask.taskObj.ComponentArray = findExistTask.taskObj.ComponentArray.concat(ComponentArray)
            } else {
              mainGroupList.push({
                id: _id(),
                taskInfo: {
                  TestMethodID: +regulation.method.code,
                  TestMethodName: regulation.method.name,
                  ..._.pick(regulation.caseInfo, ['CaseNumber', 'JobNumber', 'ReportNumber', 'CaseTestItemID', 'TestItemDescription'])
                },
                method: {
                  id: methodGroup.id,
                  name: methodGroup.name
                },
                regulation: {
                  id: regulation.id,
                  name: regulation.name,
                  method: regulation.method,
                  subclause: regulation.subclause
                },
                taskObj: {
                  RequiredSequenceID: 1,
                  JobID: regulation.caseInfo.JobID,
                  TestMethodID: +regulation.method.code,
                  CaseTestItemID: regulation.caseInfo.CaseTestItemID,
                  EnglishRemark: '',
                  ChineseRemark: '',
                  ComponentArray: ComponentArray,
                  ComponentListCheckBy: 2568,
                  CreateBy: this.$store.state.otsId ? + this.$store.state.otsId : null,
                  Operator: this.$store.state.otsId ? + this.$store.state.otsId : null
                },
                pointIdList: regulation.list
              })
            }
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
      this.exportLog.push(log)
    },
    handleNodeClick (data) {
      this.selectTaskId = data.id
    },
    saveTaskList () {
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
    showExportDialog () {
      this.exportLog = []
      this.exportPercentage.value = 0
      this.dialogVisible = true
      this.$nextTick(()=>{
        if (_.isEmpty(this.tableSelectTask)) {
          this.$refs.taskTable.toggleAllSelection()
        }
      })
    },
    handleSelectionChange (val) {
      this.tableSelectTask = val
    },
    confirmExport () {
      this.$set(this.exportLoading, 'value', true)
      exportData(this.tableSelectTask)
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
  height: calc(100vh - 14em )
  .component-block
    border: solid 1px rgba(0,0,0,0.125)
    border-radius: 4px
    margin: 4px 2px 8px 2px
    .component-select
      width: 100%
.export-log
  max-height: 28vh
  .success-log
    color: green
    margin: 0.2em
  .fail-log
    color: red
    margin: 0.2em
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
  .el-input__inner
    background-color: rgba(0,0,0,0.01)
.export-dialog
  margin: 0 auto
  .el-dialog__body
    padding: 10px 18px
  .el-card__header
    padding: 8px 12px
  .el-card__body
    padding: 15px
</style>