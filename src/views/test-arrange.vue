<template>
  <el-container class="test-arrange-page">
    <BaseHeader activeIndex="test-arrange"/>
    <el-main>
      <el-row>
        <el-col :span="4" class="point-list">
          <el-input v-model="caseNumber" class="case-number" size="small">
            <template #prepend>CA:</template>
          </el-input>
          <overlay-scrollbars
            :options="{scrollbars: {autoHide: 'scroll'}}"
            class="ol-point-list"
            >
            <draggable
              class="point-list-group"
              :group="{ name: 'point', pull: 'clone', put: false }"
              :clone="clonePoint"
              v-model="pointList"
              v-bind="dragOptions"
            >
              <div
                v-for="point in pointList"
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
                <el-button size="mini" type="danger" plain 
                  @click="emptyGroupList"
                  title="清空选中的方法内的测试组"
                >清空组</el-button>
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
              <el-button type="primary" class="bigicon add-button" icon="el-third-icon-reload" circle title="排序" @click="reSortGroupList"></el-button>
              <el-button type="success" class="bigicon add-button" icon="el-third-icon-plus" circle title="新增" @click="addGroup(1)"></el-button>
              <el-button type="success" class="bigicon add-button" icon="el-third-icon-rocket" circle title="新增10个" @click="addGroup(10)"></el-button>
              <el-button type="success" class="bigicon add-button" icon="el-third-icon-infomation" circle title="新增文本组" @click="addTextGroup"></el-button>
            </el-card>
          </overlay-scrollbars>
        </el-col>
        <el-col :span="6">
          <div class="method-function">
            <el-button-group class="function-button">
              <el-button size="mini" type="danger" plain 
                @click="emptyMethodList" 
                title="删除列表内所有测试组"
              >清空列表</el-button>
              <el-button size="mini" type="danger" plain 
                @click="reGeneMethodList" 
                title="从测试项目重新生成列表，并代替原来的列表"
              >重新生成空列表</el-button>
            </el-button-group>
          </div>
          <overlay-scrollbars class="method-pane">
            <div
              v-for="method in methodBaseData"
              :key="method.id"
              class="method-list-item"
              :class="{'active-method': selectMethod.id == method.id}"
              @click="handleSelectMethod(method.id)"
            >
              {{method.name}}
              <i class="method-icon el-third-icon-container" title="Paste" @click="pasteList"/>
              <i class="method-icon el-third-icon-file-copy" title="Copy" @click="copyList"/>
            </div>
          </overlay-scrollbars>
          <overlay-scrollbars class="regulation-pane">
            <draggable
              group="regulation"
              v-model="displayRegulation"
            >
              <RegulationTask
                v-for="regulation in displayRegulation"
                :key="regulation.id"
                :data="regulation"
                :pointGroupList="pointGroupList"
                :selected="selectRegulation.id == regulation.id"
                @regulation-select="handleSelectRegulation(regulation.id)"
                width="97%"
              ></RegulationTask>
            </draggable>
          </overlay-scrollbars>
          <div class="bottom-function-btn">
            <el-button type="primary" class="bigicon" icon="el-third-icon-robot" circle @click="autoSolve" title="自动安排"></el-button>
            <el-button type="primary" class="bigicon" icon="el-third-icon-cloud-download" circle @click="loadTasklist" title="载入"></el-button>
            <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="saveTasklist" title="保存"></el-button>
            <el-button type="primary" class="bigicon" icon="el-third-icon-right" circle title="下一步" @click="toNextPage"></el-button>
          </div>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>

import BaseHeader from '@/components/BaseHeader.vue'
import GroupNest from '@/components/GroupNest.vue'
import RegulationTask from '@/components/RegulationTask.vue'
import draggable from 'vuedraggable'
import NameFormItem from '@/components/NameFormItem.vue'

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
    NameFormItem
  },
  data () {
    return {
      dragOptions: {
        animation: 200,
        disabled: false,
        ghostClass: "ghost"
      },
      test: '',
      methodList: [],
      materialObj: {},
      selectMethod: {},
      selectRegulation: {},
      batchSubclauseVal: ''
    }
  },
  computed: {
    caseNumber: geneVuexValue('caseNumber'),
    caseTestitemList: geneVuexValue('caseTestitemList'),
    existCaseInfo: geneVuexValue('existCaseInfo'),
    pointList: geneVuexValue('valueList'),
    pointRelation: geneVuexValue('konvaRelation'),
    methodBaseData: geneVuexValue('methodBaseData'),
    displayRegulation: {
      get () {
        return this.selectMethod.regulationList
      },
      set (val) {
        this.$set(this.selectMethod, 'regulationList', val)
      }
    },
    pointGroupList: {
      get () {
        return this.selectMethod.list
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
      return this.$http.post('/data/getCaseData', {
        caseNumber: this.caseNumber,
        list: ['methodBaseData', 'valueList', 'konvaRelation', 'caseCondition', 'caseTestitem']
      })
      .then(({data: {result}})=>{
        if (_.isArray(result.methodBaseData) && !_.isEmpty(result.methodBaseData)) {
          this.methodBaseData = result.methodBaseData
          if (this.selectMethod.id) {
            this.handleSelectMethod(this.selectMethod.id)
          }
        }
        if (_.isArray(result.valueList) && !_.isEmpty(result.valueList)) {
          this.pointList = result.valueList
        }
        if (_.isArray(result.konvaRelation) && !_.isEmpty(result.konvaRelation)) {
          this.pointRelation = result.konvaRelation
        }
        if (_.isArray(result.caseTestitem) && !_.isEmpty(result.caseTestitem)) {
          this.caseTestitemList = result.caseTestitem
        }
        _.forIn(result.caseCondition, group=>{
          _.forIn(group, indCondition=>{
            this.$set(this.existCaseInfo, indCondition.id, indCondition.value)
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
                tempList.push({
                  id: method.id,
                  regulation: _.assign(
                    {method: _.cloneDeep(method)},
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
        _.forIn(group, groupInd=>{
          regulationList.push(groupInd.regulation)
        })
        tempList2.push(_.assign(
          _.cloneDeep(_.find(this.methodList, {id: id})),
          {regulationList: regulationList, list: []}
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
      this.handleSelectRegulation(this.selectMethod.regulationList[0].id)
    },
    handleSelectRegulation (id) {
      this.selectRegulation = _.find(this.selectMethod.regulationList, {id: id})
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
    autoSolve () {
      let startTime = new Date()
      const STATUSCONDITIONID = 'n0l2O8mir'
      let pointList = this.resolvePointList(this.pointList)
      _.forIn(this.methodBaseData, methodObj=>{
        let filterByMethodList = this.pointFilterByConditionList(pointList, methodObj.condition)
        let filterByRegulationList = this.pointTagRegulation(filterByMethodList, methodObj.regulationList)
        let groupedList = _.groupBy(_.filter(filterByRegulationList, point=>{return !_.isEmpty(point.regulation)}), point=>JSON.stringify(point.regulation))

        _.forIn(groupedList, group=>{
          _.forIn(group, point=>{
            point.groupBy = []
            let splitByStatus = false
            let regulationList = point.regulation.map(e=>_.find(methodObj.regulationList, {id: e}))
            _.forIn(regulationList, regulation=>{
              if (regulation.splitByStatus) {
                splitByStatus = true
              }
              _.forIn(regulation.subclause, subclause=>{
                if (this.checkConditionListPass(point, subclause.condition, methodObj.id)) {
                  point.groupBy.push({
                    [regulation.id]: subclause.code
                  })
                  point.maxMixArray.push(subclause.maxMix)
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
                  return _.keys(o)[0]
                })
              )
            })
          )
        })
        _.forIn(groupedList2, groupR=>{
          _.forIn(groupR, group=>{
            let regulationList
            let subclauseValList = {}
            let minMix = _.min(group[0].maxMixArray)
            _.forIn(group, point=>{
              regulationList = point.regulation
              if (minMix > 1 && point.condition['weightType'] != '够重') {
                let parentId = this.findParentId(this.pointRelation, point.id)
                let foundParent = _.find(group, {id: parentId})
                if (foundParent) {
                  point.minorType = 'parentWithed'
                  foundParent.elements.push(_.cloneDeep(point))
                } else {
                  let inwith = false
                  _.forIn(group, parentPoint=>{
                    if (parentPoint.condition['weightType'] == '够重' && parentPoint.elements.length < 3) {
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
            regulationList = regulationList.map(e=>_.find(methodObj.regulationList, {id: e}))
            let finalMethodGroupList = _.chunk(_.filter(group, point=>point.minorType == 'main' || point.minorType == 'unWithed'), minMix)
            let startIndex = methodObj.list.length + 1
            let idList = []
            _.forIn(finalMethodGroupList, pointGroup=>{
              let id = _id()
              methodObj.list.push({
                id: id,
                index: startIndex,
                list: pointGroup
              })
              startIndex += 1
              idList.push(id)
              _.forIn(pointGroup[0].groupBy, groupObj=>{
                let key = _.keys(groupObj)[0]
                let code = _.values(groupObj)[0]
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
              if (subclauseValList[regulation.id]) {
                regulation.subclauseVal = _.assign(regulation.subclauseVal, ...subclauseValList[regulation.id])
              }
            })
          })
        })
      })
      console.log(`used time: ${new Date() - startTime}ms`)
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
    checkConditionListPass (point, conditionList, methodId) {
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
              return condition.value.includes(methodId)
              break
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
        if (this.checkConditionListPass(point, conditionList)){
          tempList.push(point)
        }
      })
      return tempList
    },
    pointTagRegulation (pointList, regulationList) {
      pointList = _.cloneDeep(pointList)
      _.forIn(pointList, point=>{
        point.regulation = []
        point.maxMixArray = []
        point.elements = []
        _.forIn(regulationList, regulation=>{
          if (regulation.method.defaultTest && this.checkConditionListPass(point, regulation.condition)) {
            point.regulation.push(regulation.id)
            point.maxMixArray.push(regulation.method.maxMix)
            if (_.get(regulation, 'caseInfo.isIndTest')) {
              point.maxMixArray.push(1)
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
    saveTasklist () {
      this.confirmDialog(
        ()=>{
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
        {question: '确认保存?', success: '操作完成', cancel: '已取消'}
      )
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
    emptyMethodList () {
      this.confirmDialog(
        ()=>{
          _.forIn(this.methodBaseData, methodGroup=>{
            this.$set(methodGroup, 'list', [])
            _.forIn(methodGroup.regulationList, regulation=>{
              this.$set(regulation, 'list', [])
              this.$set(regulation, 'subclauseVal', {})
            })
          })
        },
        {question: '确认删除列表内所有测试组?', success: '操作完成', cancel: '已取消'}
      )
    },
    copyList () {
      console.log('copyList')
    },
    pasteList () {
      console.log('pasteList')
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

.group-function .batch-subclause
  width: 100%
.ol-point-list
  height: calc(100vh - 2em)
.point-list-item, .method-list-item
  margin: 1px
  padding: 6px
  border: solid 1px rgba(0,0,0,0.125)
  border-radius: 4px
  background-color: #fbfbfb
  font-size: 14px
  cursor: move
.method-function
  margin: 1px
.method-list-item
  padding: 8px 6px
  cursor: pointer
.method-icon
  float: right
  margin: 0 4px
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

.active-method
  background-color: #FFCC66
.regulation-pane
  height: 50vh
  margin-top: 0.5em
.bottom-function-btn
  position: absolute
  bottom: 1em
  right: 1.5em
</style>

<style lang="stylus">
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
      .el-select
        width: 15.5em
      .close-circle-button
        padding: 2px
        margin: 3px 0
        float: right
    .el-card__body
      padding: 6px
</style>