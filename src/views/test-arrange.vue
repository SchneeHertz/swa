<template>
  <el-container class="test-arrange-page">
    <BaseHeader activeIndex="test-arrange"/>
    <el-main>
      <el-row>
        <el-col :span="4" class="point-list">
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
                  v-model="group.index"
                  size="mini"
                ></el-input>
                <el-select
                  size="mini"
                  v-model="test"
                  placeholder="Sub Clause"
                >
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
          <div class="method-pane"></div>
          <div class="regulation-pane"></div>
          <div class="bottom-function-btn">
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
    draggable
  },
  data () {
    return {
      pointGroupList: [],
      dragOptions: {
        animation: 200,
        disabled: false,
        ghostClass: "ghost"
      },
      test: ''
    }
  },
  computed: {
    pointList: geneVuexValue('valueList'),
    pointRelation: geneVuexValue('konvaRelation'),
    caseNumber: geneVuexValue('caseNumber'),
    caseTestitemList: geneVuexValue('caseTestitemList'),
  },
  mounted () {

  },
  methods: {
    geneMethodList () {
      
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
    loadTasklist () {

    },
    saveTasklist () {

    },
    toNextPage () {

    },
  }
}
</script>

<style lang="stylus" scoped>
.el-main
  padding: 0
.ghost
  opacity: 0.5
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
.regulation-pane
  height: 52vh
.bottom-function-btn
  position: absolute
  bottom: 1em
  right: 1.5em
</style>

<style lang="stylus">
.test-arrange-page
  .point-list
    border-right: solid 1px rgba(0,0,0,0.125)
  .ol-point-list
    height: 100vh
  .point-list-item
    margin: 1px
    padding: 6px
    border: solid 1px rgba(0,0,0,0.125)
    border-radius: 4px
    background-color: #f5f5f5
    font-size: 14px
    cursor: move
  
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