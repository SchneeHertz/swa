<template>
  <el-container>
    <BaseHeader activeIndex="point-list" :isCollapse="isCollapse"/>
    <el-main>
      <el-row>
        <el-col :span="14" style="height:100vh;">
          <el-scrollbar wrap-class="point-card-list">
          <PointCard
            v-for="valueObj in valueList"
            :key="valueObj.id"
            :formList="formList"
            :data.sync="valueObj"
            width="48%"
            @delete-point="handleDeletePoint(valueObj.id)"
            @focus-point="handleFocusPoint(valueObj.id)"
            @blur-point="handleBlurPoint(valueObj.id)"
          >
            <template #header>
              {{valueObj.index}}
            </template>
          </PointCard>
          </el-scrollbar>
        </el-col>
        <el-col :span="10" style="height:100vh;">
            <el-scrollbar wrap-class="konva-list">
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
            </el-scrollbar>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>

import BaseHeader from '@/components/BaseHeader.vue'
import PointCard from '@/components/PointCard.vue'

import {generate as _id } from 'shortid'

const INIT_ID = _id()

export default {
  name: 'PointList',
  components: {
    BaseHeader,
    PointCard
  },
  data () {
    return {
      isCollapse: true,
      materialList: [],
      shapeList: [],
      konvaGroupList: [],
      // konvaRelation: [],
      konvaRelation: [{
        id: INIT_ID,
        label: '1'
      }],
      dragItemId: null,
      configKonva: {
        width: window.innerWidth*0.4,
        height: window.innerHeight
      },
      // valueList: [],
      valueList: [{
        id: INIT_ID,
        index: '1'
      }],
      formList: [{
        id: _id(),
        key: 'material',
        description: '材质',
        optionList: [{
          label: 'Wood',
          value: 'Wood'
        }, {
          label: 'Metal',
          value: 'Metal'
        }]
      }, {
        id: _id(),
        key: 'mouthable',
        description: '可入口',
        optionList: [{
          label: 'mouthable',
          value: 'mouthable'
        }, {
          label: 'unmouthable',
          value: 'unmouthable'
        }]
      }, {
        id: _id(),
        key: 'weightType',
        description: '足量',
        optionList: [{
          label: '足重',
          value: 'mainPart'
        }, {
          label: '不足重',
          value: 'tinyPart'
        }]
      }]
    }
  },
  computed: {

  },
  mounted () {
    this.$http.get('/data/getMaterialList')
    .then(res=>{
      this.materialList = res.data.materialList
    })
    // this.$options.watch.valueList()
    this.shapeList.push(this.createShape(INIT_ID, 0, 0, 40, 30, '1'))
  },
  watch: {
    valueList(newVal, oldVal){
      if ((_.last(newVal) && _.last(newVal).englishDescription) || _.isEmpty(newVal)) {
        let id = _id()
        let index = this.findMinIndex(newVal.map(e=>e.index)) + ''
        let x = 40 * ((+index - 1) % Math.floor(this.configKonva.width / 40))
        let y = 30 * Math.floor((+index - 1) / Math.floor(this.configKonva.width / 40))
        newVal.push({id: id, index: index})
        this.konvaRelation.push({id: id, label: index})
        this.shapeList.unshift(this.createShape(id, x, y, 40, 30, index))
      }
    }
  },
  methods: {
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
        switch (findData.weightType) {
          case 'mainPart':
            findRect.width = 80
            findRect.height = 50
            break
          case 'tinyPart':
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
      let findRect = this.$refs.stage.getNode().find(`#${id}`)[0]
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
          type: 'warning'
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
    }
  }
}
</script>

<style lang="stylus" scoped>
.el-main
  padding: 0
</style>

<style lang="stylus">
.point-card-list
  height: 100vh
.konva-list
  height: 100vh
  border-left: 1px solid grey
</style>
