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
          >
            <template #header>
              {{valueObj.id}}
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
      konvaRelation: [],
      dragItemId: null,
      configKonva: {
        width: window.innerWidth*0.4,
        height: window.innerHeight
      },
      valueList: [{
        id: _id()
      }],
      formList: [{
        id: _id(),
        description: 'material',
        optionList: [{
          label: 'Wood',
          value: 'Wood'
        }, {
          label: 'Metal',
          value: 'Metal'
        }]
      }, {
        id: _id(),
        description: 'mouthable',
        optionList: [{
          label: 'mouthable',
          value: 'mouthable'
        }, {
          label: 'unmouthable',
          value: 'ummouthable'
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
    this.shapeList.push(this.createShape(50,50,80,50,'point1'))
    this.shapeList.push(this.createShape(50,50,80,50,'point2'))
    this.shapeList.map(e=>{
      this.konvaRelation.push({
        id: e.id,
        label: e.name,
      })
    })
  },
  updated(){
    if (_.last(this.valueList).englishDescription) {
      this.valueList.push({id: _id()})
    }
  },
  methods: {
    createShape (x, y, width, height, name) {
      return {
        id: _id(),
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
        sceneFunc (context, shape) {
          context.beginPath()
          context.rect(0, 0, shape.width(), shape.height())
          context.font = '1em Arial'
          context.textAlign = 'center'
          context.fillText(shape.name(), shape.width()*0.5, shape.height()*0.6)
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
