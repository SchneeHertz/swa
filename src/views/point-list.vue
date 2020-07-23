<template>
  <el-container>
    <BaseHeader activeIndex="point-list"/>
    <el-main>
      <el-row>
        <el-col :span="14">
          <div class="point-list-header">
            <el-input v-model="caseNumber" class="case-number" size="small">
              <template #prepend>Case:</template>
            </el-input>
            <el-button-group class="function-button">
              <el-button size="mini" >超小按钮</el-button>
            </el-button-group>
          </div>
          <overlay-scrollbars
            :options="{scrollbars: {autoHide: 'scroll'}}"
            class="point-card-list"
          >
            <PointCard
              v-for="valueObj in valueList"
              :key="valueObj.id"
              :simpleConditionList="simpleConditionList"
              :afterwardConditionList="afterwardConditionList"
              :testitemIdList="testitemIdList"
              :data.sync="valueObj"
              width="48%"
              :isSelected="valueObj.isSelected"
              @delete-point="handleDeletePoint(valueObj.id)"
              @focus-point="handleFocusPoint(valueObj.id)"
              @blur-point="handleBlurPoint(valueObj.id)"
              @select-point="handleSelectPoint(valueObj.id)"
            >
              <template #header>
                {{valueObj.index}}
              </template>
            </PointCard>
            <el-card class="add-point-card">
              <el-button type="success" class="bigicon add-button" icon="el-third-icon-plus" circle title="新增" @click="addPoint(1)"></el-button>
              <el-button type="success" class="bigicon add-button" icon="el-third-icon-rocket" circle title="新增10个" @click="addPoint(10)"></el-button>
            </el-card>
          </overlay-scrollbars>
        </el-col>
        <el-col :span="10">
          <overlay-scrollbars
            :options="{scrollbars: {autoHide: 'scroll'}}"
            class="konva-list"
          >
            <v-stage
              ref="stage"
              :config="configKonva"
              @dragstart="handleDragstart"
              @dragend="handleDragend"
              @drop="handleDrop"
              @dblclick="handleDbClick"
            >
              <v-layer ref="layer">
                <v-group
                  v-for="group in konvaGroupList"
                  :key="group.id"
                  :config="group"
                >
                  <v-shape
                    v-for="item in group.list"
                    :key="item.id"
                    :config="item"
                  ></v-shape>
                </v-group>
                <v-shape
                  v-for="item in shapeList"
                  :key="item.id"
                  :config="item"
                ></v-shape>
              </v-layer>
            </v-stage>
          </overlay-scrollbars>
          <div class="bottom-function-btn">
            <el-button type="primary" class="bigicon" icon="el-third-icon-cloud-download" circle title="加载" @click="loadPointList"></el-button>
            <el-button type="success" class="bigicon" icon="el-third-icon-save" circle title="保存" @click="savePointList"></el-button>
            <el-button type="primary" class="bigicon" icon="el-third-icon-right" circle title="下一步" @click="toNextPage"></el-button>
          </div>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>

import BaseHeader from '@/components/BaseHeader.vue'
import PointCard from '@/components/PointCard.vue'

import {generate as _id } from 'shortid'

function geneVuexValue (property) {
  return {
    get () { return this.$store.state[property] },
    set (newVal) { this.$store.commit('updateValue', {key: property, value: newVal}) }
  }
}

export default {
  name: 'PointList',
  components: {
    BaseHeader,
    PointCard
  },
  data () {
    return {
      dragItemId: null,
      configKonva: {
        width: window.innerWidth*0.4,
        height: window.innerHeight - 80
      },
      conditionList: {},
      loadPointListLoading: false
    }
  },
  computed: {
    konvaGroupList: geneVuexValue('konvaGroupList'),
    valueList: geneVuexValue('valueList'),
    shapeList: geneVuexValue('shapeList'),
    konvaRelation: geneVuexValue('konvaRelation'),
    caseNumber: geneVuexValue('caseNumber'),
    caseTestitemList: geneVuexValue('caseTestitemList'),
    simpleConditionList () {
      return _.chain(this.conditionList).pick(['single', 'multiple', 'special']).values().flatten().filter(e=>!e.caseRank).sortBy('rank').value()
    },
    testitemIdList () {
      return this.caseTestitemList.filter(e=>e.selected).map(e=>e.regulation.id)
    },
    afterwardConditionList () {
      return _.chain(this.conditionList).get('afterward').value()
    },
    // testitemConditionList () {
    //   return _.chain(this.conditionList).get('testitem')
    //     .filter(e=>_.uniq(e.testitem.concat(this.testitemIdList)).length < e.testitem.length + this.testitemIdList.length)
    //     .sortBy('rank').value()
    // },
  },
  mounted () {
    // if (_.isEmpty(this.valueList)){
    //   const INIT_ID = _id()
    //   this.valueList.push({
    //     id: INIT_ID,
    //     index: '1',
    //     condition: {}
    //   }),
    //   this.konvaRelation.push({
    //     id: INIT_ID,
    //     label: '1'
    //   })
    //   this.shapeList.push(this.createShape(INIT_ID, 0, 0, 40, 30, '1'))
    // }
    this.loadConditionList()
  },
  beforeDestroy () {
    // this.valueList = this.valueList
    // this.shapeList = this.shapeList
    // this.konvaGroupList = this.konvaGroupList
    // this.konvaRelation = this.konvaRelation
  },
  watch: {
    shapeList (newVal) {
      this.$store.commit('updateValue', {
        key: 'shapeList',
        value: newVal
      })
    },
    konvaGroupList (newVal) {
      this.$store.commit('updateValue', {
        key: 'konvaGroupList',
        value: newVal
      })
    },
    konvaRelation (newVal) {
      this.$store.commit('updateValue', {
        key: 'konvaRelation',
        value: newVal
      })
    }
  },
  methods: {
    loadConditionList () {
      return this.$http.get('/data/getCondition')
      .then(res=>{
        this.conditionList = res.data.conditionList
      })
    },
    addPoint (count = 1, assign = {}) {
      for (let i = 0; i < count; i++) {
        let id = _id()
        let index = this.findMinIndex(this.valueList.map(e=>e.index)) + ''
        let x = 40 * ((+index - 1) % Math.floor(this.configKonva.width / 40))
        let y = 30 * Math.floor((+index - 1) / Math.floor(this.configKonva.width / 40))
        this.valueList.push(_.assign({id: id, index: index, condition: {}}, assign))
        this.konvaRelation.push({id: id, label: index})
        this.shapeList.unshift(this.createShape(id, x, y, 40, 30, index))
      }
      if (count == 1) {
        this.$nextTick(()=>{
          $(`#input-${_.last(this.valueList).id}`).focus()
        })
      }
    },
    createShape (id, x, y, width, height, name) {
      return {
        id: id,
        x: x,
        y: y,
        width: width,
        height: height,
        fill: 'rgba(255,255,255,0.6)',
        opacity: 1,
        draggable: true,
        shadowColor: 'black',
        shadowBlur: 10,
        shadowOpacity: 0.4,
        stroke: '#000000',
        strokeWidth: 2,
        strokeEnabled: false,
        sceneFunc (context, shape) {
          context.beginPath()
          context.rect(0, 0, shape.width(), shape.height())
          context.font = '1em Arial'
          context.textAlign = 'center'
          context.fillText(shape.name(), shape.width()*0.5, shape.height()*0.65)
          context.closePath()
          context.fillStrokeShape(shape)
        },
        name: name
      }
    },
    findRelation (arr, id) {
      let result
      for (let i of arr) {
        if (result) {
          break
        }
        if (i.id == id) {
          result = i
          break
        }
        if (!_.isEmpty(i.children)) {
          result = this.findRelation(i.children, id)
        }
      }
      return result
    },
    removeRelation (arr, id) {
      let result
      for (let i of arr) {
        if (result) {
          break
        }
        if (i.id == id) {
          result = arr.splice(arr.findIndex(i=>i.id == id), 1)[0]
          break
        }
        if (!_.isEmpty(i.children)) {
          result = this.removeRelation(i.children, id)
        }
      }
      return result
    },
    handleDragstart (e) {
      if (e.target.getClassName() == 'Shape') {
        this.dragItemId = e.target.attrs.id
        let findRect = this.findRect(this.shapeList, e.target)
        findRect.fill = 'rgba(0, 255, 0, 0.6)'
        let findData = _.find(this.valueList, {id: e.target.attrs.id})
        switch (findData.condition['weightType']) {
          case '够重':
            findRect.width = 80
            findRect.height = 50
            break
          case '不够重':
          case '<10mg':
            findRect.width = 60
            findRect.height = 30
            break
        }
        this.moveItem(e.target.attrs.id, this.shapeList, this.shapeList)
      }
    },
    handleDragend (e) {
      if (e.target.getClassName() == 'Shape') {
        let findRect = this.findRect(this.shapeList, e.target)
        findRect.fill = 'rgba(255, 255, 255, 0.6)'
        let {height, width} = e.target.attrs
        let {x, y} = e.target.getClientRect({skipShadow:true})
        findRect.x = x
        findRect.y = y
        let pointList = [
          [x - 2, y - 2],                 [x + width / 2, y - 2],                [x + 2 + width, y - 2],
          [x - 2, y + height / 2],                                                     [x + 2 + width, y + height / 2],
          [x - 2, y + height + 2], [x + width / 2, y + height + 2], [x + 2 + width, y + 2 + height]
        ]
        let coverShape
        _.forIn(pointList, ([x, y])=>{
          let shape = this.$refs.layer.getNode().getIntersection({x, y})
          if (shape) {
            coverShape = shape
            return false
          }
        })
        if (coverShape) {
          this.findRect(this.shapeList, e.target).draggable = this.findRect(this.shapeList, coverShape).draggable = false
          coverShape.fire('drop', {
            type: 'drop',
            from: e.target,
            target: coverShape,
            evt: e.evt
          }, true)
        }
        this.displayText = null
      }
    },
    handleDrop (e) {
      if (e.target.getParent().getClassName() == 'Group') {
        let aimGroup = e.target.getParent()
        let groupOffset = aimGroup.position()
        let findGroup = _.find(this.konvaGroupList, {id: aimGroup.attrs.id})
        let findRect = this.findRect(this.shapeList, e.from)
        findRect.fill = 'rgba(255, 255, 0, 0.6)'
        findRect.x -= groupOffset.x
        findRect.y -= groupOffset.y
        this.moveItem(e.from.id(), this.shapeList, findGroup.list)
      } else {
        this.findRect(this.shapeList, e.from).fill = 'rgba(255, 255, 0, 0.6)'
        this.findRect(this.shapeList, e.target).fill = 'rgba(255, 0, 0, 0.6)'
        let group = {
          id: _id(),
          list: [],
          draggable: true
        }
        this.moveItem(e.target.id(), this.shapeList, group.list)
        this.moveItem(e.from.id(), this.shapeList, group.list)
        this.konvaGroupList.push(group)
      }
      let findTargetRelation = this.findRelation(this.konvaRelation, e.target.id())
      let findFromRelation = this.removeRelation(this.konvaRelation, e.from.id())
      if (!findTargetRelation) {
        this.konvaRelation.push({
          id: e.target.id(),
          label: e.target.name(),
          children: [findFromRelation]
        })
      } else {
        if (!_.isArray(findTargetRelation.children)) {
          findTargetRelation.children = []
        }
        findTargetRelation.children.push(findFromRelation)
      }
    },
    handleDbClick (e) {
      if (e.target.getParent().getClassName() == 'Group') {
        let aimGroup = e.target.getParent()
        let groupOffset = aimGroup.position()
        let findGroup = _.find(this.konvaGroupList, {id: aimGroup.attrs.id})
        let rectRelation = this.removeRelation(this.konvaRelation, e.target.id())
        let removeItemFromGroup = (rect) => {
          let findRect = _.find(findGroup.list, {id: rect.id})
          findRect.draggable = true
          findRect.fill = 'rgba(255, 255, 220, 0.6)'
          findRect.x += groupOffset.x
          findRect.y += groupOffset.y
          this.moveItem(rect.id, findGroup.list, this.shapeList)
          this.konvaRelation.push({
            id: rect.id,
            label: rect.label
          })
          if (!_.isEmpty(rect.children)) {
            rect.children.map(e=>removeItemFromGroup(e))
          }
        }
        removeItemFromGroup(rectRelation)
        this.konvaGroupList = this.konvaGroupList.filter(e=>e.list.length != 0)
      }
    },
    moveItem (id, fromList, toList) {
      let finditem = fromList.find(i => i.id === id)
      if (finditem) {
        let index = fromList.indexOf(finditem)
        fromList.splice(index, 1)
        toList.push(finditem)
      }
    },
    findRect (list, shape) {
      return _.find(list, {id: shape.attrs.id}) || {}
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
    handleDeletePoint (id) {
      let findRect = this.$refs.stage.getNode().findOne(`#${id}`)
      this.handleDbClick({target: findRect})
      let findInSL = _.findIndex(this.shapeList, {id: id})
      if (findInSL != -1) {
        this.shapeList.splice(findInSL, 1)
        this.removeRelation(this.konvaRelation, id)
        let pointSet = _.findIndex(this.valueList, {id: id})
        this.valueList.splice(pointSet, 1)
      } else {
        this.$message({
          message: '未知错误',
          type: 'warning',
          showClose: true
        })
        console.log(findRect, findInSL)
      }
    },
    findRectData (id) {
      let result = _.find(this.shapeList, {id: id})
      if (result) {
        return result
      } else {
        return _.find(_.flatten(this.konvaGroupList.map(e=>e.list)), {id: id})
      }
    },
    handleFocusPoint (id) {
      this.$set(this.findRectData(id), 'strokeEnabled', true)
    },
    handleBlurPoint (id) {
      this.$set(this.findRectData(id), 'strokeEnabled', false)
    },
    handleSelectPoint(id) {
      let findPoint =  _.find(this.valueList, {id: id})
      this.$set(findPoint, 'isSelected', !findPoint.isSelected)
    },
    loadPointList () {
      this.loadPointListLoading = true
      let sceneFunc = (context, shape)=>{
        context.beginPath()
        context.rect(0, 0, shape.width(), shape.height())
        context.font = '1em Arial'
        context.textAlign = 'center'
        context.fillText(shape.name(), shape.width()*0.5, shape.height()*0.65)
        context.closePath()
        context.fillStrokeShape(shape)
      }
      return this.$http.post('/data/getCaseData', {
        caseNumber: this.caseNumber,
        list: ['konvaGroupList', 'valueList', 'shapeList', 'konvaRelation']
      })
      .then(({data: {result}})=>{
        if (_.isArray(result.konvaGroupList) && !_.isEmpty(result.konvaGroupList)) {
          this.konvaGroupList = result.konvaGroupList.map(i=>{i.list.map(e=>{e.sceneFunc = sceneFunc; return e}); return i})
        }
        if (_.isArray(result.valueList) && !_.isEmpty(result.valueList)) {
          this.valueList = result.valueList
        }
        if (_.isArray(result.shapeList) && !_.isEmpty(result.shapeList)) {
          this.shapeList = result.shapeList.map(e=>{e.sceneFunc = sceneFunc; return e})
        }
        if (_.isArray(result.konvaRelation) && !_.isEmpty(result.konvaRelation)) {
          this.konvaRelation = result.konvaRelation
        }
      })
      .finally(()=>{
        this.loadPointListLoading = false
      })
    },
    savePointList () {
      this.confirmDialog(
        ()=>{
          this.$http.post('/data/saveCaseData', {
            caseNumber: this.caseNumber,
            data: {
              konvaGroupList: _.cloneDeep(this.konvaGroupList).map(i=>{i.list.map(e=>{e.sceneFunc = undefined; return e}); return i}),
              valueList: this.valueList,
              shapeList: _.cloneDeep(this.shapeList).map(e=>{e.sceneFunc = undefined; return e}),
              konvaRelation: this.konvaRelation
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
      this.$router.push('/test-arrange')
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
.point-card-list
  height: calc(100vh - 2em)
.point-list-header
  .case-number
    width: 17em
  .function-button
    float: right
    margin: 2px 2px
.add-point-card
  width: 48%
  height: 10em
  display: inline-block
  margin: 4px
  text-align: center
.add-point-card .add-button
  position: relative
  top: 2.2em
.konva-list
  border-left: 1px solid rgb(220, 223, 230)
  border-bottom: 1px solid rgb(220, 223, 230)
.bottom-function-btn
  position: absolute
  bottom: 1em
  right: 1.5em
</style>

<style lang="stylus">
.point-card-list .component-card
  vertical-align: top
</style>
