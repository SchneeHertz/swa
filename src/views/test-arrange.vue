<template>
  <el-container class="test-arrange-page">
    <BaseHeader activeIndex="test-arrange"/>
    <el-main>
      <el-row>
        <el-col :span="4" class="point-list">
          <el-input v-model="caseNumber" class="case-number" size="small" @keyup.enter.native="loadTasklist">
            <template #prepend>Case:</template>
          </el-input>
          <el-input v-model="searchString" class="pointlist-searchstring" size="small">
            <template #prepend>筛选</template>
          </el-input>
          <overlay-scrollbars
            :options="{scrollbars: {autoHide: 'scroll'}}"
            class="ol-point-list"
            >
            <draggable
              class="point-list-group"
              :group="{ name: 'point', pull: 'clone', put: false }"
              :clone="clonePoint"
              v-model="displayPointList"
              v-bind="dragOptions"
            >
              <div
                v-for="point in displayPointList"
                :key="point.id"
                class="point-list-item"
              >
                {{point.index}}. {{point.englishDescription}}
              </div>
            </draggable>
          </overlay-scrollbars>
        </el-col>
        <el-col :span="14" class="group-list">
          <div class="group-function">
            <el-row>
              <el-col :span="8">
                <el-tooltip effect="dark" content="清空选中的方法内的测试组" placement="bottom">
                  <el-button size="mini" type="danger" plain 
                    @click="emptyGroupList"
                  >清空组</el-button>
                </el-tooltip>
              </el-col>
              <el-col :span="16">
                <NameFormItem prependWidth="60px">
                  <template #prepend>批量选择 Subclause</template>
                  <el-select 
                    size="mini" 
                    v-model="batchSubclauseVal"
                    @change="batchSubclause"
                    class="batch-subclause"
                  >
                    <el-option :value="undefined" lable=""></el-option>
                    <el-option
                      v-for="subclause in displaySubclause"
                      :key="subclause.id"
                      :value="subclause.code"
                      :label="subclause.name"
                    ></el-option>
                  </el-select>
                </NameFormItem>
              </el-col>
            </el-row>
          </div>
          <overlay-scrollbars
            :options="{scrollbars: {autoHide: 'scroll'}}"
            class="ol-group-list"
          >
            <el-card
              class="group-card"
              v-for="group in pointGroupList"
              :key="group.id"
              :class="{'isSelectedGroup': selectRegulationGroupList.includes(group.id)}"
            >
              <template #header>
                <el-input
                  class="group-index"
                  v-model.number="group.index"
                  size="mini"
                ></el-input>
                <el-select
                  size="mini"
                  v-model="displaySubclauseVal[group.id]"
                  @change="$forceUpdate()"
                  placeholder="Sub Clause"
                >
                  <el-option :value="undefined" lable=""></el-option>
                  <el-option
                    v-for="subclause in displaySubclause"
                    :key="subclause.id"
                    :value="subclause.code"
                    :label="subclause.name"
                  ></el-option>
                </el-select>
                <el-button type="text" class="close-circle-button" icon="el-third-icon-close" @click="removeGroup(group.id)" plain/>
              </template>
              <group-nest v-model="group.list" />
            </el-card>
            <el-card class="add-group-card">
              <el-tooltip effect="dark" content="排序" placement="top">
                <el-button type="primary" class="bigicon add-button" icon="el-third-icon-reload" circle @click="reSortGroupList"></el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="新增" placement="top">
                <el-button type="success" class="bigicon add-button" icon="el-third-icon-plus" circle @click="addGroup(1)"></el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="新增10个" placement="top">
                <el-button type="success" class="bigicon add-button" icon="el-third-icon-rocket" circle @click="addGroup(10)"></el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="新增文本组" placement="top">
                <el-button type="success" class="bigicon add-button" icon="el-third-icon-infomation" circle @click="addTextGroup"></el-button>
              </el-tooltip>
            </el-card>
          </overlay-scrollbars>
        </el-col>
        <el-col :span="6">
          <div class="method-function">
            <el-tooltip effect="dark" content="从测试项目重新生成列表，并代替原来的列表" placement="bottom">
              <el-button size="mini" type="danger" plain 
                @click="reGeneMethodList" 
              >重新生成空列表</el-button>
            </el-tooltip>
            <el-switch
              class="method-switch"
              v-model="hideEmptyMethod"
              active-text="隐藏空Method"
            ></el-switch>
          </div>
          <overlay-scrollbars class="method-pane">
            <div
              v-for="method in displayMethodBaseData"
              :key="method.id"
              class="method-list-item"
              :class="{'active-method': selectMethod.id == method.id}"
              @click="handleSelectMethod(method.id)"
            >
              {{method.name}}
              <i class="method-icon el-third-icon-container" title="Paste" @click="pasteList(method)"/>
              <i class="method-icon el-third-icon-file-copy" title="Copy" @click="copyList(method.list)"/>
            </div>
          </overlay-scrollbars>
          <overlay-scrollbars class="regulation-pane">
            <draggable
              group="regulation"
              v-model="displayRegulation"
            >
              <RegulationTask
                v-for="regulation in displayRegulation"
                :key="regulation.id + regulation.method.id + regulation.method.group"
                :data="regulation"
                :pointGroupList="pointGroupList"
                :selected="selectRegulation.id == regulation.id && selectRegulation.method.id == regulation.method.id && selectRegulation.method.group == regulation.method.group"
                @regulation-select="handleSelectRegulation(regulation.id, regulation.method.id, regulation.method.group)"
                width="97%"
              ></RegulationTask>
            </draggable>
          </overlay-scrollbars>
          <div class="bottom-function-btn">
            <el-tooltip effect="dark" content="自动安排" placement="top">
              <el-button type="primary" class="bigicon" icon="el-third-icon-robot" circle @click="showSolveDialog"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="载入" placement="top">
              <el-button type="primary" class="bigicon" icon="el-third-icon-cloud-download" circle @click="loadTasklist" :loading="loadTasklistLoading"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="保存" placement="top">
              <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="saveTasklist"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="下一步" placement="top">
              <el-button type="primary" class="bigicon" icon="el-third-icon-right" circle @click="toNextPage"></el-button>
            </el-tooltip>
          </div>
        </el-col>
      </el-row>
      <el-dialog
        title="自动安排测试"
        :visible.sync="dialogVisible"
        width="90%"
        top="2vh"
        class="autosolve-dialog"
        :close-on-click-modal="false"
      >
        <el-row>
          <el-col :span="7">
            <div class="solve-option">
              <NameFormItem class="card-line" prependWidth="7em">
                <template #prepend>按Style分开Mix</template>
                <template #default>
                  <el-select
                    v-model="mixByStyle"
                    size="mini"
                  >
                    <el-option label="是" :value="true"></el-option>
                    <el-option label="否" :value="false"></el-option>
                  </el-select>
                </template>
              </NameFormItem>
              <NameFormItem class="card-line" prependWidth="7em">
                <template #prepend>客户</template>
                <template #default>
                  <el-select
                    v-model="selectClient"
                    size="mini"
                  >
                    <el-option
                      v-for="op in clientList"
                      :key="op"
                      :value="op"
                    ></el-option>
                  </el-select>
                </template>
              </NameFormItem>
            </div>
          </el-col>
          <el-col :span="17">
            <overlay-scrollbars class="regulation-select-pane">
            <DialogRegulationSelector
              v-for="methodGroup in methodBaseData"
              :key="methodGroup.id"
              :data="methodGroup"
              width="48%"
            >
            </DialogRegulationSelector>
            </overlay-scrollbars>
          </el-col>
        </el-row>
        <template #footer>
          <span class="dialog-footer">
            <el-button type="info" @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmAutoSolve">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<script>

import BaseHeader from '@/components/BaseHeader.vue'
import GroupNest from '@/components/GroupNest.vue'
import RegulationTask from '@/components/RegulationTask.vue'
import draggable from 'vuedraggable'
import NameFormItem from '@/components/NameFormItem.vue'
import DialogRegulationSelector from '@/components/DialogRegulationSelector.vue'

import {generate as _id } from 'shortid'

function geneVuexValue (property) {
  return {
    get () { return this.$store.state[property] },
    set (newVal) { this.$store.commit('updateValue', {key: property, value: newVal}) }
  }
}

export default {
  name: 'TestArrange',
  display: "Transitions",
  components: {
    BaseHeader,
    GroupNest,
    RegulationTask,
    draggable,
    NameFormItem,
    DialogRegulationSelector
  },
  data () {
    return {
      dragOptions: {
        animation: 200,
        disabled: false,
        ghostClass: "ghost"
      },
      methodList: [],
      materialObj: {},
      selectMethod: {},
      selectRegulation: {},
      batchSubclauseVal: '',
      dialogVisible: false,
      mixByStyle: false,
      selectClient: undefined,
      searchString: undefined,
      loadTasklistLoading: false,
      copyedList: [],
      hideEmptyMethod: false
    }
  },
  computed: {
    caseNumber: geneVuexValue('caseNumber'),
    caseTestitemList: geneVuexValue('caseTestitemList'),
    existCaseInfo: geneVuexValue('existCaseInfo'),
    konvaGroupList: geneVuexValue('konvaGroupList'),
    pointList: geneVuexValue('valueList'),
    shapeList: geneVuexValue('shapeList'),
    pointRelation: geneVuexValue('konvaRelation'),
    methodBaseData: geneVuexValue('methodBaseData'),
    displayRegulation: {
      get () {
        return this.selectMethod.regulationList || []
      },
      set (val) {
        this.$set(this.selectMethod, 'regulationList', val)
      }
    },
    displayPointList () {
      return this.pointList.filter(data => !this.searchString || JSON.stringify(data).toLowerCase().includes(this.searchString.toLowerCase()))
    },
    pointGroupList: {
      get () {
        return this.selectMethod.list || []
      },
      set (val) {
        this.$set(this.selectMethod, 'list', val)
      }
    },
    displaySubclauseVal () {
      return this.selectRegulation.subclauseVal || {}
    },
    displaySubclause () {
      return this.selectRegulation.subclause || []
    },
    selectRegulationGroupList () {
      return this.selectRegulation.list || []
    },
    clientList () {
      return _.chain(this.methodBaseData).map(e=>e.regulationListForClient)
        .flatten().compact().map(e=>e.client)
        .flatten().compact().uniq().sortBy().unshift(undefined).value()
    },
    displayMethodBaseData () {
      if (this.hideEmptyMethod) {
        return _.filter(this.methodBaseData, methodG=>methodG.list.length != 0)
      } else {
        return this.methodBaseData
      }
    }
  },
  mounted () {
    this.loadMaterialList()
    this.loadMethodList()
    .then(()=>{
      if (_.isEmpty(this.methodBaseData)) {
        this.geneMethodList()
      }
    })
  },
  methods: {
    loadMaterialList () {
      return this.$http.get('/data/getMaterialList')
      .then(res=>{
        this.materialObj = res.data.materialList
      })
    },
    loadMethodList () {
      return this.$http.get('/data/getMethodList')
      .then(res=>{
        this.methodList = _.sortBy(res.data.methodList, 'name')
      })
    },
    loadTasklist () {
      this.loadTasklistLoading = true
      let sceneFunc = (context, shape)=>{
        context.beginPath()
        context.rect(0, 0, shape.width(), shape.height())
        context.font = '1.5em Arial'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(shape.name(), shape.width()*0.5, shape.height()*0.5)
        context.closePath()
        context.fillStrokeShape(shape)
      }
      let dragBoundFunc = (pos) => {
        let width =  window.innerWidth*0.4 - 80
        let height = window.innerHeight - 80 - 50
        return {
          x: pos.x < 0 ? 0 : pos.x > width ? width : pos.x,
          y: pos.y < 0 ? 0 : pos.y > height ? height : pos.y,
        }
      }
      return this.$http.post('/data/getCaseData', {
        caseNumber: this.caseNumber,
        list: ['methodBaseData', 'konvaGroupList', 'valueList', 'shapeList', 'konvaRelation', 'caseCondition', 'caseTestitem']
      })
      .then(res=>{
        if (res.data.success) {
          let result = res.data.result
          if (_.isArray(result.konvaGroupList) && !_.isEmpty(result.konvaGroupList)) {
            this.konvaGroupList = result.konvaGroupList.map(i=>{
              i.list.map(e=>{e.sceneFunc = sceneFunc; e.dragBoundFunc = dragBoundFunc; return e})
              i.dragBoundFunc = (pos) => {
                let width =  window.innerWidth*0.4 - i.mainPart.x - 80
                let height = window.innerHeight - 80 - i.mainPart.y - 50
                return {
                  x: pos.x < - i.mainPart.x ? - i.mainPart.x : pos.x > width ? width : pos.x,
                  y: pos.y < - i.mainPart.y ? - i.mainPart.y : pos.y > height ? height : pos.y,
                }
              }
              return i
            })
          }
          if (_.isArray(result.shapeList) && !_.isEmpty(result.shapeList)) {
            this.shapeList = result.shapeList.map(e=>{e.sceneFunc = sceneFunc; e.dragBoundFunc = dragBoundFunc; return e})
          }
          if (_.isArray(result.valueList) && !_.isEmpty(result.valueList)) {
            this.pointList = result.valueList
          }
          if (_.isArray(result.methodBaseData) && !_.isEmpty(result.methodBaseData)) {
            this.methodBaseData = result.methodBaseData
            this.refreshDescription(this.methodBaseData)
            if (this.selectMethod.id) {
              this.handleSelectMethod(this.selectMethod.id)
            }
          }
          if (_.isArray(result.konvaRelation) && !_.isEmpty(result.konvaRelation)) {
            this.pointRelation = result.konvaRelation
          }
          if (_.isArray(result.caseTestitem) && !_.isEmpty(result.caseTestitem)) {
            this.caseTestitemList = result.caseTestitem
          }
          if (result.caseCondition) {
            _.forIn(result.caseCondition, group=>{
              _.forIn(group, indCondition=>{
                this.$set(this.existCaseInfo, indCondition.id, indCondition.value)
              })
            })
          }
        } else {
          this.$message({type: 'error', message: res.data.info, showClose: true})
        }
      })
      .finally(()=>{
        this.loadTasklistLoading = false
        this.hideEmptyMethod = true
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
    geneMethodList () {
      let tempList = []
      let tempList2 = []
      _.forIn(this.caseTestitemList, testitem=>{
        if (testitem.regulation && testitem.selected) {
          _.forIn(testitem.regulation, regulation=>{
            if (_.isArray(regulation.method)) {
              _.forIn(regulation.method, method=>{
                let foundMethod = _.find(this.methodList, {id: method.id})
                tempList.push({
                  id: method.id,
                  regulation: _.assign(
                    {method: _.assign(_.cloneDeep(method), {code: foundMethod.code, name: foundMethod.name})},
                    _.omit(_.cloneDeep(regulation), 'method'),
                    {caseInfo: _.omit(_.cloneDeep(testitem), 'regulation'), list: [], subclauseVal:{}, shareSolution: true}
                  )
                })
              })
            }
          })
        }
      })
      _.forIn(_.groupBy(tempList, 'id'), (group, id)=>{
        let regulationList = []
        let regulationListForClient = []
        _.forIn(group, groupInd=>{
          if (_.isEmpty(groupInd.regulation.client)) {
            regulationList.push(groupInd.regulation)
          } else {
            regulationListForClient.push(groupInd.regulation)
          }
        })
        tempList2.push(_.assign(
          _.cloneDeep(_.find(this.methodList, {id: id})),
          {
            regulationList: regulationList,
            regulationListForClient: regulationListForClient,
            list: []
          }
        ))
      })
      this.methodBaseData = tempList2
    },
    reGeneMethodList () {
      this.confirmDialog(
        ()=>{
          this.geneMethodList()
          this.selectRegulation = {}
          this.selectMethod = {}
        },
        {question: '确认从测试项目重新生成列表，并代替原来的列表?', success: '操作完成', cancel: '已取消'}
      )
    },
    handleSelectMethod (id) {
      this.selectMethod = _.find(this.methodBaseData, {id: id})
      this.handleSelectRegulation(
        _.head(this.selectMethod.regulationList).id,
        _.head(this.selectMethod.regulationList).method.id,
        _.head(this.selectMethod.regulationList).method.group
      )
    },
    handleSelectRegulation (regulationId, methodId, methodGroup) {
      this.selectRegulation = _.find(this.selectMethod.regulationList, r=>{
        return r.id == regulationId && r.method.id == methodId && r.method.group == methodGroup
      })
    },
    clonePoint (point) {
      return _.merge(_.cloneDeep(point), {elements: []})
    },
    findMinIndex (array) {
      let result
      _.forOwn(_.sortBy(array, e=>+e), (v,i)=>{
        if (+v != +i+1) {
          result = +i+1
          return false
        }
      })
      return result ? result : array.length+1
    },
    addGroup (count = 1) {
      for (let i = 0; i < count; i++) {
        let index = this.findMinIndex(this.pointGroupList.map(e=>e.index))
        this.pointGroupList.push({
          id: _id(),
          index: index,
          list: []
        })
      }
    },
    addTextGroup () {

    },
    reSortGroupList () {
      this.pointGroupList = _.sortBy(this.pointGroupList, 'index')
    },
    removeGroup (id) {
      let foundGroup = _.findIndex(this.pointGroupList, {id: id})
      if (foundGroup != -1) {
        this.pointGroupList.splice(foundGroup, 1)
      }
    },
    showSolveDialog () {
      this.dialogVisible = true
    },
    confirmAutoSolve () {
      _.forIn(this.methodBaseData, methodGroup=>{
        _.forIn(methodGroup.regulationListForClient, regulation=>{
          if ( (this.selectClient && _.includes(regulation.client, this.selectClient)) || regulation.switchTo ) {
            let foundGeneralRegulationIndex = _.findIndex(methodGroup.regulationList, {code: regulation.code})
            foundGeneralRegulationIndex ? methodGroup.regulationList.splice(foundGeneralRegulationIndex, 1, regulation) : ''
          }
        })
      })
      this.autoSolve()
      this.dialogVisible = false
    },
    autoSolve () {
      let startTime = new Date()
      const STATUSCONDITIONID = 'n0l2O8mir'
      const ACCESSIBLECONDTION = '1yrtsYdd12'
      const MATERIALCONDTION = 'material'
      let sortedPointList = _.sortBy(this.pointList, (point)=>{
        return ["Accessible and mouthable", "Unmouthable but accessible ", "Cover by fabric and mouthable", "Inaccessible and unmouthable"].indexOf(point.condition['ACCESSIBLECONDTION'])
      }, (point)=>{
        return _.get(point.condition, 'material[0]')
      })
      let pointList = this.resolvePointList(sortedPointList)
      let pointHashObj = {}
      let pointPicked = {}
      _.forIn(this.methodBaseData, methodObj=>{
        let filterByMethodList = this.pointFilterByConditionList(pointList, methodObj.condition)
        let filterByRegulationList = this.pointTagRegulation(filterByMethodList, methodObj.regulationList, pointPicked)
        let groupedList = _.groupBy(_.filter(filterByRegulationList, point=>{return !_.isEmpty(point.regulation)}), point=>JSON.stringify(point.regulation.map(r=>r.id)))
        _.forIn(groupedList, group=>{
          _.forIn(group, point=>{
            point.groupBy = []
            let splitByStatus = false
            let regulationList = point.regulation
            // let regulationList = point.regulation.map(e=>_.find(methodObj.regulationList, {id: e}))
            if (this.mixByStyle) {
              if (!_.isEmpty(point.style)) {
                point.groupBy.push({
                  style: _.sortBy(point.style)
                })
              }
            }
            _.forIn(regulationList, regulation=>{
              if (regulation.splitByStatus) {
                splitByStatus = true
              }
              _.forIn(regulation.subclause, subclause=>{
                if (this.checkConditionListPass({point: point, conditionList:subclause.condition, methodId:methodObj.id, group: regulation.method.group})) {
                  point.groupBy.push({
                    [regulation.id + '_' + regulation.method.group]: subclause.code
                  })
                  if (subclause.maxMix) {
                    point.maxMixArray.push(subclause.maxMix)
                  }
                  return false
                }
              })
            })
            if (splitByStatus) {
              point.groupBy.push({
                status: point.condition[STATUSCONDITIONID]
              })
            }
          })
        })
        let groupedList2 = []
        _.forIn(groupedList, group=>{
          groupedList2.push(
            _.groupBy(group, point=>{
              return JSON.stringify(
                _.sortBy(point.groupBy, o=>{
                  return _.head(_.keys(o))
                })
              )
            })
          )
        })
        _.forIn(groupedList2, groupR=>{
          _.forIn(groupR, group=>{
            let regulationList
            let subclauseValList = {}
            let minMix = _.min(_.head(group).maxMixArray)
            _.forIn(group, point=>{
              regulationList = point.regulation
              if (minMix > 1 && point.condition['weightType'] != 'Enough') {
                let parentId = this.findParentId(this.pointRelation, point.id)
                let foundParent = _.find(group, {id: parentId})
                if (foundParent) {
                  point.minorType = 'parentWithed'
                  foundParent.elements.push(_.cloneDeep(point))
                } else {
                  let inwith = false
                  _.forIn(group, parentPoint=>{
                    if (parentPoint.condition['weightType'] == 'Enough' && parentPoint.elements.length < 3) {
                      parentPoint.elements.push(_.cloneDeep(point))
                      point.minorType = 'withed'
                      inwith = true
                      return false
                    }
                  })
                  if (!inwith) {
                    point.minorType = 'unWithed'
                  }
                }
              } else {
                point.minorType = 'main'
              }
            })
            // regulationList = regulationList.map(e=>_.find(methodObj.regulationList, {id: e}))
            let finalMethodGroupList = _.chunk(_.filter(group, point=>point.minorType == 'main' || point.minorType == 'unWithed'), minMix)
            let startIndex = methodObj.list.length + 1
            let idList = []
            _.forIn(finalMethodGroupList, pointGroup=>{
              let id = _id()
              let pointHash = _.flatten(this.geneGroupId(pointGroup)).join('')
              pointHashObj[id] = pointHash
              methodObj.list.push({
                id: id,
                index: startIndex,
                list: pointGroup
              })
              startIndex += 1
              idList.push(id)
              _.forIn(_.head(pointGroup).groupBy, groupObj=>{
                let key = _.head(_.keys(groupObj))
                let code = _.head(_.values(groupObj))
                if (!subclauseValList[key]) {
                  subclauseValList[key] = []
                }
                if (key != 'status') {
                  subclauseValList[key].push({[id]: code})
                }
              })
            })
            _.forIn(regulationList, regulation=>{
              regulation.list = regulation.list.concat(idList)
              if (subclauseValList[regulation.id + '_' + regulation.method.group]) {
                regulation.subclauseVal = _.assign(regulation.subclauseVal, ...subclauseValList[regulation.id + '_' + regulation.method.group])
              }
            })
          })
        })
      })
      _.forIn(this.methodBaseData, methodG=>{
        methodG.regulationList = _(methodG.regulationList).sortBy(r=>r.list.length).reverse().value()
      })
      _.forIn(_.groupBy(this.methodBaseData, 'methodGroup'), (methodG, methodGroup)=>{
        if (methodGroup != 'undefined') {
          let methodG2 = _.sortBy(_.cloneDeep(methodG), 'methodGroupRank')
          _.forIn(methodG, methodRegulation=>{
            let findGIndex = _.findIndex(this.methodBaseData, {id: methodRegulation.id})
            this.methodBaseData.splice(findGIndex, 1)
          })
          let methodBaseDataIndId = _id()
          this.methodBaseData.push({
            id: methodBaseDataIndId,
            name: methodG2.map(e=>e.name).join(', '),
            list: _.chain(methodG2).map(e=>e.list).flatten().uniqBy(e=>{
              return pointHashObj[e.id] ? pointHashObj[e.id] : _id()
            }).map((e, index)=>{
              e.id = pointHashObj[e.id] + '_' + methodBaseDataIndId
              e.index = index + 1
              return e
            }).value(),
            regulationList: _.chain(methodG2).map(e=>e.regulationList).flatten().map(regulation=>{
              regulation.grouped = true
              let tempList = []
              regulation.list.map(oldId=>{
                tempList.push(pointHashObj[oldId] + '_' + methodBaseDataIndId)
              })
              regulation.list = tempList
              let tempObj = {}
              _.forIn(regulation.subclauseVal, (code, oldId)=>{
                tempObj[pointHashObj[oldId] + '_' + methodBaseDataIndId] = code
              })
              regulation.subclauseVal = tempObj
              return regulation
            }).value()
          })
        }
      })
      this.hideEmptyMethod = true
      console.log(`used time: ${new Date() - startTime}ms`)
      console.log(pointPicked)
    },
    resolvePointList (pointList) {
      let tempList = []
      _.forIn(_.cloneDeep(pointList), point=>{
        let materialValArray = []
        _.forIn(_.get(point, 'condition.material', []), material=>{
          let materialData = _.find(this.materialObj.material, {name: material})
          let mtempObj = {}
          _.forIn(materialData, (valArray, key)=>{
            let found = _.find(this.materialObj.materialCondition, {property: key})
            if (found) {
              mtempObj[found.id] = valArray
            }
          })
          materialValArray.push(mtempObj)
        })
        _.mergeWith(point.condition, ...materialValArray, (obj,src)=>{
          if (_.isArray(obj)) {
            return _.uniq(_.compact(obj.concat(src)))
          }
        })        
        tempList.push(point)
      })
      return tempList
    },
    checkConditionListPass ({point, conditionList, methodId, group}) {
      if (_.isEmpty(conditionList)) {
        return false
      }
      return _.every(conditionList, condition=>{
          switch (condition.id) {
            case 'icenglish':
              if (condition.logic == 'yes') {
                if (condition.valueLogic == 'and') {
                  return _.every(condition.value, (word)=>{ return (point.englishDescription + '').toLowerCase().includes(word.toLowerCase()) })
                } else if (condition.valueLogic == 'or') {
                  return _.some(condition.value, (word)=>{ return (point.englishDescription + '').toLowerCase().includes(word.toLowerCase()) })
                }
              } else if (condition.logic == 'no') {
                if (condition.valueLogic == 'and') {
                  return !_.every(condition.value, (word)=>{ return (point.englishDescription + '').toLowerCase().includes(word.toLowerCase()) })
                } else if (condition.valueLogic == 'or') {
                  return !_.some(condition.value, (word)=>{ return (point.englishDescription + '').toLowerCase().includes(word.toLowerCase()) })
                }
              }
              break
            case 'icchinese':
              if (condition.logic == 'yes') {
                if (condition.valueLogic == 'and') {
                  return _.every(condition.value, (word)=>{ return (point.chineseDescription + '').includes(word) })
                } else if (condition.valueLogic == 'or') {
                  return _.some(condition.value, (word)=>{ return (point.chineseDescription + '').includes(word) })
                }
              } else if (condition.logic == 'no') {
                if (condition.valueLogic == 'and') {
                  return !_.every(condition.value, (word)=>{ return (point.chineseDescription + '').includes(word) })
                } else if (condition.valueLogic == 'or') {
                  return !_.some(condition.value, (word)=>{ return (point.chineseDescription + '').includes(word) })
                }
              }
              break
            case 'icmethod':
              if (condition.logic == 'yes') {
                return condition.value.includes(methodId)
              } else if (condition.logic == 'no') {
                return !condition.value.includes(methodId)
              }
              break
            case 'icgroup':
              if (condition.logic == 'yes') {
                return condition.value.includes(group)
              } else if (condition.logic == 'no') {
                return !condition.value.includes(group)
              }
            default:
              let pointValue = _.flatten([point.condition[condition.id] || this.existCaseInfo[condition.id]])
              if (condition.logic == 'yes') {
                if (condition.valueLogic == 'and') {
                  return _.difference(condition.value, pointValue).length == 0
                } else if (condition.valueLogic == 'or') {
                  return _.uniq(condition.value.concat(pointValue)).length < _.uniq(condition.value).concat(_.uniq(pointValue)).length
                }
              } else if (condition.logic == 'no') {
                if (condition.valueLogic == 'and') {
                  return _.difference(condition.value, pointValue).length > 0
                } else if (condition.valueLogic == 'or') {
                  return !(_.difference(condition.value, pointValue).length == 0)
                }
              }
              break
          }
        })
    },
    pointFilterByConditionList(pointList, conditionList) {
      let tempList = []
      _.forIn(pointList, point=>{
        if (this.checkConditionListPass({point:point, conditionList: conditionList})){
          tempList.push(point)
        }
      })
      return tempList
    },
    pointTagRegulation (pointList, regulationList, pointPicked) {
      pointList = _.cloneDeep(pointList)
      _.forIn(pointList, point=>{
        point.regulation = []
        point.maxMixArray = []
        point.elements = []
        _.forIn(regulationList, regulation=>{
          if (regulation.method.defaultTest && this.checkConditionListPass({point:point, conditionList: regulation.condition})) {
            let checked = true
            if (_.isArray(pointPicked[point.id])) {
              if (_.some(pointPicked[point.id], sign=>{
                  return sign.regulationId == regulation.id &&  sign.group == regulation.method.group
                })
              ) {
                  checked = false
              } else {
                pointPicked[point.id].push({regulationId: regulation.id, group: regulation.method.group})
              }
            } else {
              pointPicked[point.id] = []
              pointPicked[point.id].push({regulationId: regulation.id, group: regulation.method.group})
            }
            if (checked) {
              point.regulation.push(regulation)
              point.maxMixArray.push(regulation.method.maxMix)
              if (_.get(regulation, 'caseInfo.isIndTest')) {
                point.maxMixArray.push(1)
              }
            }
          }
        })
      })
      return pointList
    },
    findParentId (relationList, id) {
      let result
      for (let relation of relationList) {
        if (result) {
          break
        }
        if (_.some(relation.children, r=>r.id == id)) {
          result = relation.id
          break
        } else {
          if (_.isArray(relation.children)) {
            result = this.findParentId(relation.children, id)
          }
        }
      }
      if (result && !_.some(relationList, r=> r.id == result)) {
        do {
          result = this.findParentId(relationList, result)
        } while (result && !_.some(relationList, r=> r.id == result))
      }
      return result
    },
    geneGroupId (group) {
      let result = []
      for (let point of group) {
        result.push(point.id)
        if (!_.isEmpty(point.elements)) {
          result.push('w-' ,this.geneGroupId(point.elements), '-w')
        }
      }
      return result
    },
    saveTasklist () {
      this.$http.post('/data/saveCaseData', {
        caseNumber: this.caseNumber,
        data: {
          methodBaseData: this.methodBaseData
        }
      })
      .then(res=>{
        this.$message({type: 'success', message: '保存成功', showClose: true})
      })
    },
    toNextPage () {
      this.$router.push('/preview')
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
    emptyGroupList () {
      this.confirmDialog(
        ()=>{
          this.$set(this.selectMethod, 'list', [])
          _.forIn(this.selectMethod.regulationList, regulation=>{
            this.$set(regulation, 'list', [])
            this.$set(regulation, 'subclauseVal', {})
          })
        },
        {question: '确认清空选中的方法内的测试组?', success: '操作完成', cancel: '已取消'}
      )
    },
    batchSubclause () {
      this.$set(this.selectRegulation, 'subclauseVal', _.zipObject(
        this.selectRegulation.list,
        _.fill(new Array(this.selectRegulation.list.length), this.batchSubclauseVal)
      ))
    },
    copyList (sourceList) {
      this.copyedList = _.cloneDeep(sourceList).map(
        g=>{
          g.id = _id()
          g.list = g.list.map(p=>_.omit(p, 'regulation'))
          return g
        }
      )
      this.$message({type: 'success', message: 'Copyed!', showClose: true})
    },
    pasteList (method) {
      method.list = method.list.concat(_.cloneDeep(this.copyedList))
      this.$message({type: 'success', message: 'Pasted!', showClose: true})
    }
  }
}
</script>

<style lang="stylus" scoped>
.el-main
  padding: 0
.ghost
  opacity: 0.5
.point-list
  border-right: solid 1px rgba(0,0,0,0.125)
.pointlist-searchstring
  margin-top: 1px

.group-function .batch-subclause
  width: 100%
.ol-point-list
  height: calc(100vh - 4em - 1px)
.point-list-item, .method-list-item
  margin: 1px
  padding: 6px
  border: solid 1px rgba(0,0,0,0.125)
  border-radius: 4px
  background-color: #fbfbfb
  font-size: 15px
  cursor: move
.method-function
  margin: 1px
.method-list-item
  padding: 8px 6px
  cursor: pointer
.method-icon
  float: right
  margin: 0 4px

.isSelectedGroup
  box-shadow: 0px 0px 2px 2px rgba(0,128,255,0.6)
.add-group-card
  width: 21em
  height: 6em
  display: inline-block
  margin: 4px
  text-align: center
.add-group-card .add-button
  position: relative
  top: 1em
.method-pane
  height: 38vh
  border-bottom: solid 1px rgba(0,0,0,0.125)

.method-switch
  margin: 4px 2px 0 0
  float: right
.active-method
  background-color: #FFCC66
.regulation-pane
  height: 50vh
  margin-top: 0.5em
.bottom-function-btn
  position: absolute
  bottom: 1em
  right: 1.5em

.solve-option
  .card-line
    margin: 4px 10px
.regulation-select-pane
  max-height: 72vh
</style>

<style lang="stylus">
.point-list
  .el-input-group__prepend
    padding: 0 10px
    width: 34px
    text-align: center
.test-arrange-page
  .group-list
    border-right: solid 1px rgba(0,0,0,0.125)
    .ol-group-list
      height: calc(100vh - 2em)
    .el-card.group-card
      margin: 4px 6px
      width: 21em
      display: inline-block
      vertical-align: top
    .el-card__header
      padding: 6px 10px
      .group-index
        display: inline-block
        width: 3.2em
        .el-input__inner
          padding: 0 5px
          text-align: center
          font-weight: bold
          font-size: 14px
      .el-select
        width: 15.5em
      .close-circle-button
        padding: 2px
        margin: 3px 0
        float: right
    .el-card__body
      padding: 6px
</style>