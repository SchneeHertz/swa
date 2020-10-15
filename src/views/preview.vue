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
      <el-col :span="12" class="task-main">
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
            <el-input
              type="textarea"
              v-model="selectTask.taskObj.EnglishRemark"
              @change="updatePatch('EnglishRemark')"
            ></el-input>
          </NameFormItem>
          <NameFormItem class="card-line" prependWidth="8em">
            <template #prepend>Chinese Remark:</template>
            <el-input
              type="textarea"
              v-model="selectTask.taskObj.ChineseRemark"
              @change="updatePatch('ChineseRemark')"
            ></el-input>
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
                <template #prepend><span class="component-no">{{component.ComponentNo}}.</span></template>
                <el-select
                  v-model="component.SubClass"
                  size="mini"
                  class="component-select"
                  @change="updatePatch('SubClass', component.id)"
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
                @change="updatePatch('EnglishDescription', component.id)"
                class="task-description"
              ></el-input>
            </el-col>
            <el-col :span="12">
              <el-input
                type="textarea"
                v-model="component.ChineseDescription"
                :autosize="{minRows: 2, maxRows: 6}"
                @change="updatePatch('ChineseDescription', component.id)"
                class="task-description"
              ></el-input>
            </el-col>
          </el-row>
        </overlay-scrollbars>
        <div class="bottom-function-btn-task">
          <el-tooltip effect="dark" content="新增描述" placement="top">
            <el-button type="primary" class="bigicon" icon="el-third-icon-plus" circle @click="addAdditionalGroup"></el-button>
          </el-tooltip>
        </div>
      </el-col>
      <el-col :span="6">        
        <overlay-scrollbars class="patch-pane">
          <el-card
            v-for="patch in additionalGroup.concat(patchList)"
            :key="patch.type+patch.CaseTestItemID+patch.TestMethodID+patch.id"
            class="patch-card"
            shadow="never"
          >
            <template #header>
              {{patch.type}}
              <el-button type="text" class="close-circle-button" icon="el-third-icon-close" @click="removePatch(patch)" plain/>
            </template>
            <div class="card-line">
              <label class="card-label">项目: <span>{{patch.info.regulation}}</span></label>
            </div>
            <div class="card-line">
              <label class="card-label">方法: <span>{{patch.info.method}}</span></label>
            </div>
            <div class="card-line" v-show="patch.info.index">
              <label class="card-label">序号: <span>{{patch.info.index == undefined ? '' : patch.info.index}}</span></label>
            </div>
            <div class="card-line" v-html="patch.html"></div>
          </el-card>
        </overlay-scrollbars>
      </el-col>
      <div class="bottom-function-btn">
        <el-tooltip effect="dark" content="加载" placement="top">
          <el-button type="primary" class="bigicon" icon="el-third-icon-cloud-download" circle @click="loadTaskList"></el-button>
        </el-tooltip>
        <el-tooltip effect="dark" content="保存修改列表" placement="top">
          <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="savePatchList"></el-button>
        </el-tooltip>
        <el-tooltip effect="dark" content="导出" placement="top">
          <el-button type="primary" class="bigicon" icon="el-third-icon-export" circle @click="showExportDialog"></el-button>
        </el-tooltip>
        <el-tooltip effect="dark" content="完成" placement="top">
          <el-button type="warning" class="bigicon" icon="el-third-icon-check" circle @click="finishCase"></el-button>
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
import DiffMatchPatch from 'diff-match-patch'

// const OTSHOST = '10.168.128.44/OTS_UAT'
const OTSHOST = 'cnots.sgs.net/OTS'

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
      dialogVisible: false,
      exportPercentage: {
        value: 0
      },
      tableSelectTask: undefined,
      exportLoading: {
        value: false
      },
      selectTask: {taskInfo: {}, method: {}, regulation: {method:{}}, taskObj: {}, pointIdList: []},
      taskListBackup: [],
      additionalGroup: [],
      patchList: []
    }
  },
  computed: {
    caseNumber: geneVuexValue('caseNumber'),
    pointList: geneVuexValue('pointList'),
    methodBaseData: geneVuexValue('methodBaseData'),
    caseTestitemList: geneVuexValue('caseTestitemList'),
    existCaseInfo: geneVuexValue('existCaseInfo'),
    conditionList: geneVuexValue('conditionList'),
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
        list: ['patchList', 'additionalGroup', 'pointList', 'methodBaseData']
      })
      .then(res=>{
        if (res.data.success) {
          let result = res.data.result
          if (_.isArray(result.pointList) && !_.isEmpty(result.pointList)) {
            this.pointList = result.pointList
          }
          if (_.isArray(result.methodBaseData) && !_.isEmpty(result.methodBaseData)) {
            this.methodBaseData = result.methodBaseData
            this.refreshDescription(this.methodBaseData)
          }
          if (_.isArray(result.patchList) && !_.isEmpty(result.patchList)) {
            this.patchList = result.patchList
          }
          if (_.isArray(result.additionalGroup) && !_.isEmpty(result.additionalGroup)) {
            this.additionalGroup = result.additionalGroup
          }
          this.geneTaskList()
          this.applyAdditionalGroup(this.additionalGroup)
          this.applyPatch(this.patchList)
          this.selectTask = {taskInfo: {}, method: {}, regulation: {method:{}}, taskObj: {}, pointIdList: []}
        } else {
          this.$message({type: 'error', message: res.data.info, showClose: true})
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
              point.style = foundSourcePoint.style
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
              _.assignWith(
                ..._.flattenDeep(this.resolvePointTree(point)),
                (obj, src)=>[obj, src].join(' w/ ')
              )
            )
          })
          group.description = _.assignWith(...pointList, (obj, src)=>[obj, src].join(' + '))
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
                IsShowInReport: true,
                id: pointId
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
      this.taskListBackup = _.cloneDeep(this.taskList)
      return taskList
    },
    resolvePointTree (point) {
      let innerArray = []
      if (!_.isEmpty(point.elements)) {
        _.forIn(point.elements, innerPoint=>{
          innerArray.push(this.resolvePointTree(innerPoint))
        })
      }
      if (!_.isEmpty(point.style)) {
        return [{englishDescription: point.englishDescription + ` (${point.style.join(', ')})`, chineseDescription: point.chineseDescription + ` (${point.style.join(', ')})`}, innerArray]
      } else {
        return [{englishDescription: point.englishDescription, chineseDescription: point.chineseDescription}, innerArray]
      }
    },
    addAdditionalGroup () {
      if (!_.isEmpty(this.selectTask.taskObj)) {
        let taskObj = this.selectTask.taskObj
        let newId = _id()
        let index = + _.last(taskObj.ComponentArray).ComponentNo + 1 + ''
        taskObj.ComponentArray.push({
          ComponentNo: index,
          ComponentType: null,
          Trial: 1,
          SubClass: null,
          EnglishDescription: '',
          ChineseDescription: '',
          IsDataTransfer: true,
          IsShowInReport: true,
          id: newId
        })
        this.additionalGroup.push({
          type: 'additionalGroup',
          CaseTestItemID: taskObj.CaseTestItemID,
          TestMethodID: taskObj.TestMethodID,
          id: newId,
          info: {
            regulation: this.selectTask.taskInfo.TestItemDescription,
            method: this.selectTask.taskInfo.TestMethodName,
            index: index
          }
        })
      }
    },
    applyAdditionalGroup (additionalGroup) {
      _.forIn(additionalGroup, group=>{
        let foundTask = _.find(this.taskList, task=>{
          return task.taskInfo.CaseTestItemID == group.CaseTestItemID && task.taskInfo.TestMethodID == group.TestMethodID
        })
        if (foundTask) {
          let index = + _.last(foundTask.taskObj.ComponentArray).ComponentNo + 1 + ''
          foundTask.taskObj.ComponentArray.push({
            ComponentNo: index,
            ComponentType: null,
            Trial: 1,
            SubClass: null,
            EnglishDescription: '',
            ChineseDescription: '',
            IsDataTransfer: true,
            IsShowInReport: true,
            id: group.id
          })
        }
      })
    },
    updatePatch (key, id) {
      let backupTask = _.find(this.taskListBackup, task=>{
        return task.taskInfo.CaseTestItemID == this.selectTask.taskInfo.CaseTestItemID &&task.taskInfo.TestMethodID == this.selectTask.taskInfo.TestMethodID
      })
      let diff_patch
      let foundPatch
      let oldGroup
      let newGroup
      switch (key) {
        case 'EnglishRemark':
        case 'ChineseRemark':
          diff_patch = this.diffString(backupTask.taskObj[key], this.selectTask.taskObj[key])
          foundPatch = _.find(this.patchList, {
            type: key,
            CaseTestItemID: this.selectTask.taskInfo.CaseTestItemID,
            TestMethodID: this.selectTask.taskInfo.TestMethodID
          })
          if (foundPatch) {
            _.assign(foundPatch, diff_patch)
          } else {
            this.patchList.push(_.assign({
              type: key,
              CaseTestItemID: this.selectTask.taskInfo.CaseTestItemID,
              TestMethodID: this.selectTask.taskInfo.TestMethodID,
              info: {
                regulation: this.selectTask.taskInfo.TestItemDescription,
                method: this.selectTask.taskInfo.TestMethodName,
              }
            }, diff_patch))
          }
          break
        case 'EnglishDescription':
        case 'ChineseDescription':
          oldGroup = _.find(backupTask.taskObj.ComponentArray, {id: id})
          let oldDescription = _.get(oldGroup, key, '')
          newGroup = _.find(this.selectTask.taskObj.ComponentArray, {id: id})
          let newDescription = newGroup[key]
          diff_patch = this.diffString(oldDescription, newDescription)
          foundPatch = _.find(this.patchList, {
            type: key,
            CaseTestItemID: this.selectTask.taskInfo.CaseTestItemID,
            TestMethodID: this.selectTask.taskInfo.TestMethodID,
            id: id
          })
          if (foundPatch) {
            _.assign(foundPatch, diff_patch)
          } else {
            this.patchList.push(_.assign({
              type: key,
              CaseTestItemID: this.selectTask.taskInfo.CaseTestItemID,
              TestMethodID: this.selectTask.taskInfo.TestMethodID,
              id: id,
              info: {
                regulation: this.selectTask.taskInfo.TestItemDescription,
                method: this.selectTask.taskInfo.TestMethodName,
                index: newGroup.ComponentNo
              }
            }, diff_patch))
          }
          break
        case 'SubClass':
          oldGroup = _.find(backupTask.taskObj.ComponentArray, {id: id})
          let subClauseBefore = _.get(oldGroup, key, null)
          let subClauseBeforeName = subClauseBefore  ? _.find(this.selectTask.regulation.subclause, {code: subClauseBefore}).name : ''
          newGroup = _.find(this.selectTask.taskObj.ComponentArray, {id: id})
          let subClauseAfter = newGroup[key]
          let subClauseAfterName = subClauseAfter  ? _.find(this.selectTask.regulation.subclause, {code: subClauseAfter}).name : ''
          diff_patch = {
            subClause: subClauseAfter,
            html: `<del style="background:#ffe6e6;">${subClauseBeforeName}</del><ins style="background:#e6ffe6;">${subClauseAfterName}</ins>`
          }
          foundPatch = _.find(this.patchList, {
            type: key,
            CaseTestItemID: this.selectTask.taskInfo.CaseTestItemID,
            TestMethodID: this.selectTask.taskInfo.TestMethodID,
            id: id
          })
          if (foundPatch) {
            _.assign(foundPatch, diff_patch)
          } else {
            this.patchList.push(_.assign({
              type: key,
              CaseTestItemID: this.selectTask.taskInfo.CaseTestItemID,
              TestMethodID: this.selectTask.taskInfo.TestMethodID,
              id: id,
              info: {
                regulation: this.selectTask.taskInfo.TestItemDescription,
                method: this.selectTask.taskInfo.TestMethodName,
                index: newGroup.ComponentNo
              }
            }, diff_patch))
          }
          break
      }
    },
    diffString (strOld, strNew) {
      let dmp = new DiffMatchPatch()
      let diff = dmp.diff_main(strOld, strNew)
      dmp.diff_cleanupSemantic(diff)
      let patch = dmp.patch_make(strOld, diff)
      let html = dmp.diff_prettyHtml(diff)
      return {diff: diff, patch: patch, html: html}
    },
    applyPatch (patchList) {
      let dmp = new DiffMatchPatch()
      _.forIn(patchList, patch=>{
        let foundTask = _.find(this.taskList, task=>{
          return task.taskInfo.CaseTestItemID == patch.CaseTestItemID && task.taskInfo.TestMethodID == patch.TestMethodID
        })
        let foundGroup
        if (foundTask) {
          switch (patch.type) {
            case 'EnglishRemark':
            case 'ChineseRemark':
              this.$set(foundTask.taskObj, patch.type, dmp.patch_apply(patch.patch, foundTask.taskObj[patch.type])[0])
              break
            case 'EnglishDescription':
            case 'ChineseDescription':
              foundGroup = _.find(foundTask.taskObj.ComponentArray, {id: patch.id})
              if (foundGroup) {
                this.$set(foundGroup, patch.type, dmp.patch_apply(patch.patch, foundGroup[patch.type])[0])
              }
              break
            case 'SubClass':
              foundGroup = _.find(foundTask.taskObj.ComponentArray, {id: patch.id})
              if (foundGroup) {
                this.$set(foundGroup, patch.type, patch.subClause)
              }
              break
          }
        }
      })
    },
    removePatch (patch) {
      let foundTask = _.find(this.taskList, task=>{
        return task.taskInfo.CaseTestItemID == patch.CaseTestItemID && task.taskInfo.TestMethodID == patch.TestMethodID
      })
      let foundBackupTask = _.find(this.taskListBackup, task=>{
        return task.taskInfo.CaseTestItemID == patch.CaseTestItemID && task.taskInfo.TestMethodID == patch.TestMethodID
      })
      switch (patch.type) {
        case 'EnglishRemark':
        case 'ChineseRemark':
          this.$set(foundTask.taskObj, patch.type, foundBackupTask.taskObj[patch.type])
          break
        case 'EnglishDescription':
        case 'ChineseDescription':
        case 'SubClass':
          let foundGroup = _.find(foundTask.taskObj.ComponentArray, {id: patch.id})
          let foundBackupGroup = _.find(foundBackupTask.taskObj.ComponentArray, {id: patch.id})
          if (foundGroup && foundBackupGroup) {
            this.$set(foundGroup, patch.type, foundBackupGroup[patch.type])
          }
          break
        case 'additionalGroup':
          let foundGroupIndex = _.findIndex(foundTask.taskObj.ComponentArray, {id: patch.id})
          foundTask.taskObj.ComponentArray.splice(foundGroupIndex, 1)
          break
      }
      switch (patch.type) {
        case 'EnglishRemark':
        case 'ChineseRemark':
        case 'EnglishDescription':
        case 'ChineseDescription':
        case 'SubClass':
          this.patchList.splice(_.findIndex(this.patchList, patch), 1)
          break
        case 'additionalGroup':
          this.patchList = _.filter(this.patchList, p=>p.id !== patch.id)
          this.additionalGroup.splice(_.findIndex(this.additionalGroup, patch), 1)
          break
      }
    },
    addLog (log) {
      this.exportLog.push(log)
    },
    handleNodeClick (data) {
      let foundTask = _.find(this.taskList, {id: data.id})
      if (foundTask) {
        this.selectTask = foundTask
      }
    },
    savePatchList () {
      this.$http.post('/data/saveCaseData', {
        caseNumber: this.caseNumber,
        data: {
          patchList: this.patchList,
          additionalGroup: this.additionalGroup
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
    finishCase () {
      this.caseNumber = undefined
      this.pointList= []
      this.methodBaseData = []
      this.caseTestitemList = []
      this.existCaseInfo = {}
      this.conditionList = {}
      this.$router.push('/case-info')
    }
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
  height: calc(100vh - 12.5em )
  .component-block
    border: solid 1px rgba(0,0,0,0.125)
    border-radius: 4px
    margin: 4px 2px 8px 2px
    .component-select
      width: 100%
    .component-no
      color: #606266
      font-weight: bold

.patch-pane
  height: calc(100vh - 5em)
.patch-card
  .card-line
    margin: 4px 0
    font-size: 14px
  .card-label
    color: grey
  .card-label span 
    color #2c3e50

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
.bottom-function-btn-task
  position: absolute
  bottom: 1em
  right: 20em
  z-index: 1
</style>

<style lang="stylus">
.task-list
  .el-tree-node.is-current>.el-tree-node__content
    background-color: #f8c280
  .el-tree-node__content
    height: auto
    padding: 4px 0
  .el-tree-node__content:hover
    background-color: #C0C4CC
  .el-tree-node__label
    white-space: normal 
.task-main
  .el-input__inner
    background-color: rgba(0,0,0,0.01)
  .task-description .el-textarea__inner
    color: #333435

.patch-card
  margin: 4px 2px
  .el-card__header
    padding: 8px 12px
    font-size: 15px
    background-color: rgba(0,0,0,0.04)
    .close-circle-button
      padding: 2px
      margin: -2px 0
      float: right
  .el-card__body
    padding: 10px

.export-dialog
  margin: 0 auto
  .el-dialog__body
    padding: 10px 18px
  .el-card__header
    padding: 8px 12px
  .el-card__body
    padding: 15px
</style>