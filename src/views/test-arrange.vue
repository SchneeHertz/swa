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
                  v-model="subclauseObj.subclauseVal[group.id]"
                  placeholder="Sub Clause"
                >
                  <el-option
                    v-for="subclause in subclauseObj.subclause"
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
          <overlay-scrollbars class="method-pane">
            <div
              v-for="method in methodBaseData"
              :key="method.id"
              class="method-list-item"
              :class="{'active-method': selectMethod.id == method.id}"
              @click="handleSelectMethod(method.id)"
            >
              {{method.name}}
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
            <el-button type="primary" class="bigicon" icon="el-third-icon-right" circle title="下一步" @click="geneMethodList"></el-button>
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
    draggable
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
      methodBaseData: {},
      selectMethod: {},
      selectRegulation: {}
    }
  },
  computed: {
    pointList: geneVuexValue('valueList'),
    pointRelation: geneVuexValue('konvaRelation'),
    caseNumber: geneVuexValue('caseNumber'),
    caseTestitemList: geneVuexValue('caseTestitemList'),
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
    subclauseObj () {
      return {
        subclauseVal: this.selectRegulation.subclauseVal || {},
        subclause: this.selectRegulation.subclause || []
      }
    }
  },
  mounted () {
    this.loadMaterialList()
    this.loadMethodList()
    .then(()=>{
      if (!_.isEmpty(this.caseTestitemList)) {
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
    geneMethodList () {
      let tempList = []
      let tempList2 = []
      _.forIn(this.caseTestitemList, testitem=>{
        if (testitem.regulation && testitem.selected) {
          if (_.isArray(testitem.regulation.method)) {
            _.forIn(testitem.regulation.method, method=>{
              tempList.push({
                id: method.id,
                regulation: _.assign(
                  {method: _.cloneDeep(method)},
                  _.omit(_.cloneDeep(testitem.regulation), 'method'),
                  {caseInfo: _.omit(_.cloneDeep(testitem), 'regulation'), list: [], subclauseVal:{}, shareSolution: true}
                )
              })
            })
          }
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
      let pointList = this.resolvePointList(this.pointList)
      _.forIn(this.methodBaseData, methodObj=>{
        _.forIn(this.pointFilterByConditionList(pointList, methodObj.condition), point=>{
          methodObj.list.push({
            id: _id(),
            index: this.findMinIndex(methodObj.list.map(e=>+e.index)),
            list: [_.merge({elements: []}, point)]
          })
        })
      })
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
    pointFilterByConditionList(pointList, conditionList) {
      let tempList = []
      _.forIn(pointList, point=>{
        let passConditions = _.every(conditionList, condition=>{
          switch (condition.id) {
            case 'icenglish':
              if (condition.logic == 'yes') {
                if (condition.valueLogic == 'and') {
                  return _.every(condition.value, (word)=>{ return (point.englishDescription + '').includes(word) })
                } else if (condition.valueLogic == 'or') {
                  return _.some(condition.value, (word)=>{ return (point.englishDescription + '').includes(word) })
                }
              } else if (condition.logic == 'no') {
                if (condition.valueLogic == 'and') {
                  return !_.every(condition.value, (word)=>{ return (point.englishDescription + '').includes(word) })
                } else if (condition.valueLogic == 'or') {
                  return !_.some(condition.value, (word)=>{ return (point.englishDescription + '').includes(word) })
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
            default:
              let pointValue = _.flatten([_.get(point, `condition[${condition.id}]`, [])])
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
        passConditions ? tempList.push(point) : ''
      })
      return tempList
    },
    loadTasklist () {
      return this.$http.post('/data/getCaseData', {
        caseNumber: this.caseNumber,
        list: ['methodBaseData', 'valueList', 'konvaRelation']
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
      })
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
.ghost
  opacity: 0.5
.point-list
  border-right: solid 1px rgba(0,0,0,0.125)
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
.method-list-item
  padding: 8px 6px
  cursor: pointer
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
  height: 40vh
  border-bottom: solid 1px rgba(0,0,0,0.125)

.active-method
  background-color: #FFCC66
.regulation-pane
  height: 52vh
  margin-top: 1em
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
      height: 100vh
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