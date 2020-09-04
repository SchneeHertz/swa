<template>
  <el-container>
    <BaseHeader activeIndex="point-list"/>
    <el-main>
      <el-row>
        <el-col :span="14">
          <div class="point-list-header">
            <el-input v-model="caseNumber" class="case-number" size="small" @keyup.enter.native="loadPointList">
              <template #prepend>Case:</template>
            </el-input>
            <div class="point-function-button">
              <el-switch v-model="useStyle" active-text="Style" @change="handleStyleSwitchChange"></el-switch>
            </div>
          </div>
          <el-card
            class="point-form"
            shadow="never"
          >
            <template #header>
              {{selectPoint.index ? selectPoint.index: nextIndex}}
            </template>
            <overlay-scrollbars
              :options="{overflowBehavior: {x: 'hidden'}}"
              class="point-form-body"
            >
              <el-row :gutter="4">
                <el-col :span="12">
                  <el-input
                    type="textarea"
                    placeholder="英文描述"
                    class="point-description point-form-line"
                    v-model="selectPoint['englishDescription']"
                    @change="autoCorrect"
                    :autosize="{ minRows: 2, maxRows: 4}"
                    ref="pointDescriptionEnglish"
                    id="pointDescriptionEnglish"
                  ></el-input>
                </el-col>
                <el-col :span="12">
                  <el-input
                    type="textarea"
                    placeholder="中文描述"
                    class="point-description point-form-line"
                    v-model="selectPoint['chineseDescription']"
                    :autosize="{minRows: 2, maxRows: 4}"
                  ></el-input>
                </el-col>
                <el-col :span="12">
                  <NameFormItem 
                    class="point-option point-form-line" 
                    prependWidth="4em" 
                    v-show="useStyle"
                  >
                    <template #prepend>Style</template>
                    <template #default>
                      <el-select
                        v-model="selectPoint['style']"
                        allow-create
                        filterable
                        multiple
                        size="mini"
                      >
                        <el-option
                          v-for="op in styleList"
                          :key="op"
                          :value="op"
                        ></el-option>
                      </el-select>
                    </template>
                  </NameFormItem>
                </el-col>
                <el-col 
                  :span="12"
                  v-for="indForm in simpleConditionList"
                  :key="indForm.id"
                >
                  <NameFormItem class="point-option point-form-line">
                    <template #prepend>{{indForm.name}}</template>
                    <template #default>
                      <el-select
                        v-model="selectPoint.condition[indForm.id]"
                        filterable
                        size="mini"
                        :multiple="indForm.cat == 'multiple'"
                      >
                        <el-tooltip 
                          effect="dark"
                          :content="op.remark"
                          placement="right"
                          v-for="op in indForm.list"
                          :key="op.value"
                          :open-delay="500"
                        >
                          <el-option
                            :label="op.value"
                            :value="op.value"
                          ></el-option>
                        </el-tooltip>
                      </el-select>
                    </template>
                  </NameFormItem>
                </el-col>
                <el-col 
                  :span="12"
                  v-for="indForm in displayAfterwardConditionList"
                  :key="indForm.id"
                >
                  <NameFormItem class="point-option point-form-line">
                    <template #prepend>{{indForm.name}}</template>
                    <template #default>
                      <el-select
                        v-model="selectPoint.condition[indForm.id]"
                        filterable
                        size="mini"
                        :multiple="indForm.cat == 'multiple'"
                      >
                        <el-tooltip 
                          effect="dark"
                          :content="op.remark"
                          placement="right"
                          v-for="op in indForm.list"
                          :key="op.value"
                          :open-delay="500"
                        >
                          <el-option
                            :label="op.value"
                            :value="op.value"
                          ></el-option>
                        </el-tooltip>
                      </el-select>
                    </template>
                  </NameFormItem>
                </el-col>
              </el-row>
            </overlay-scrollbars>
            <div class="footer-button-group">
              <el-button size="small" type="success" plain @click="addPoint()">新增</el-button>
              <el-button size="small" type="success" plain @click="modifyPoint">修改</el-button>
              <el-button size="small" type="primary" plain @click="resetPointForm">重置</el-button>
            </div>
          </el-card>
          <div class="point-list-table">
            <el-table
            :data="displayPointList"
            ref="tablepointlist"
            height="66vh"
            size="medium"
            highlight-current-row
            @cell-click="handleCellClick"
            :default-sort = "{prop: 'index', order: 'ascending'}"
            >
              <el-table-column
                label="#"
                prop="index"
                width="60"
                sortable
                :sort-method="sortIndex"
              />
              <el-table-column label="english" prop="englishDescription" width="180">
                <template #header>
                  <el-input
                    v-model="searchEnglishString"
                    size="mini"
                    placeholder="English"
                  />
                </template>
              </el-table-column>
              <el-table-column label="chinese" prop="chineseDescription" width="180">
                <template #header>
                  <el-input
                    v-model="searchChineseString"
                    size="mini"
                    placeholder="Chinese"
                  />
                </template>
              </el-table-column>
              <el-table-column label="material" width="160">
                <template v-slot:default="props">
                  {{props.row.condition.material ? props.row.condition.material.join(',') : ''}}
                </template>
              </el-table-column>
              <el-table-column label="Operate" width="120">
                <template v-slot:default="props">
                  <div class="mini-circle-btn">
                    <el-button type="success" icon="el-third-icon-file-copy" circle plain @click="handleCopyPoint(props.row.id)"></el-button>
                    <el-button type="danger" icon="el-third-icon-close" circle plain @click="handleDeletePoint(props.row.id)"></el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
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
        </el-col>
      </el-row>
    </el-main>
    <div class="bottom-function-btn">
      <el-tooltip effect="dark" content="加载" placement="top">
        <el-button type="primary" class="bigicon" icon="el-third-icon-cloud-download" circle @click="loadPointList" :loading="loadPointListLoading"></el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="保存" placement="top">
        <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="savePointList"></el-button>
      </el-tooltip>
      <el-tooltip effect="dark" content="下一步" placement="top">
        <el-button type="primary" class="bigicon" icon="el-third-icon-right" circle title="下一步" @click="toNextPage"></el-button>
      </el-tooltip>
    </div>
  </el-container>
</template>

<script>

import BaseHeader from '@/components/BaseHeader.vue'
import NameFormItem from '@/components/NameFormItem.vue'
import '@/components/areacomplete.js'

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
    NameFormItem
  },
  data () {
    return {
      configKonva: {
        width: window.innerWidth*0.4,
        height: window.innerHeight - 80
      },
      conditionList: {},
      loadPointListLoading: false,
      materialObj: {},
      useStyle: false,
      selectPoint: {condition: {}},
      searchEnglishString: '',
      searchChineseString: '',
      preList: [
        'plastic', 'soft plastic', 'rubber', 'coating', 'glitter', 'rubber coating', 'paper label', 'ceramic', 'elastic', 'printing', 'feather', 
        'lubricant', 'adhesive', 'non-woven', 'string', 'polyfiber', 'plywood', 'flocking', 'fabric', 'woven band', 'embroidery', 'hardboard',
        'thread', 'lacquer', 'silicone rubber', 'battery', 'satin ribbon', 'hook and loop fastener',
        'interlayer', 'wire jacket', 'backing', 'sewn-in label', 'corrugated', 'laminated', 'electrolytic capacitor',  'surfaced', 'lettering',
        'chassis', 'blister', 'instruction', 'sticker', 'clothes',
        'transparent', 'translucent', 'multi-color', 'iridescent', 'silvery', 'apricot', 'purple', 'off-white'
      ]
    }
  },
  computed: {
    caseNumber: geneVuexValue('caseNumber'),
    caseTestitemList: geneVuexValue('caseTestitemList'),
    existCaseInfo: geneVuexValue('existCaseInfo'),
    konvaGroupList: geneVuexValue('konvaGroupList'),
    valueList: geneVuexValue('valueList'),
    shapeList: geneVuexValue('shapeList'),
    konvaRelation: geneVuexValue('konvaRelation'),
    simpleConditionList () {
      return _.chain(this.conditionList).pick(['single', 'multiple', 'special']).values().flatten().filter(e=>!e.caseRank).sortBy('rank').value()
    },
    testitemIdList () {
      return _.flatten(this.caseTestitemList.filter(e=>e.selected).map(e=>e.regulation)).map(e=>e.id)
    },
    afterwardConditionList () {
      return _.chain(this.conditionList).get('afterward').filter(e=>!e.caseRank).value()
    },
    styleList () {
      return _.chain(this.valueList).map(e=>e.style).flatten().compact().uniq().sortBy().value() || []
    },
    nextIndex () {
      return  this.findMinIndex(this.valueList.map(e=>e.index)) + ''
    },
    materialCondition () {
      let materialValArray = []
      _.forIn(_.get(this.selectPoint, 'condition.material', []), material=>{
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
      let result =  _.mergeWith({}, ...materialValArray, (obj,src)=>{
        if (_.isArray(obj)) {
          return _.uniq(_.compact(obj.concat(src)))
        }
      })
      return result
    },
    displayAfterwardConditionList () {
      let tempList = []
      if (!_.isEmpty(this.selectPoint['condition'])) {
      _.forIn(this.afterwardConditionList, condition=>{
        let isCheck = _.every(condition.condition, innerCd=>{
          switch(innerCd.id){
            case 'ictestitem':
              if (innerCd.logic == 'yes') {
                if (innerCd.valueLogic == 'and') {
                  return _.difference(innerCd.value, this.testitemIdList).length == 0
                } else if (innerCd.valueLogic == 'or') {
                  return _.uniq(innerCd.value.concat(this.testitemIdList)).length < _.uniq(innerCd.value).concat(_.uniq(this.testitemIdList)).length
                }
              } else if (innerCd.logic == 'no') {
                if (innerCd.valueLogic == 'and') {
                  return _.difference(innerCd.value, this.testitemIdList).length > 0
                } else if (innerCd.valueLogic == 'or') {
                  return !(_.difference(innerCd.value, this.testitemIdList).length == 0)
                }
              }
              break
            case 'icenglish':
              if (innerCd.logic == 'yes') {
                if (innerCd.valueLogic == 'and') {
                  return _.every(innerCd.value, (word)=>{ return (this.selectPoint.englishDescription + '').toLowerCase().includes(word.toLowerCase()) })
                } else if (innerCd.valueLogic == 'or') {
                  return _.some(innerCd.value, (word)=>{ return (this.selectPoint.englishDescription + '').toLowerCase().includes(word.toLowerCase()) })
                }
              } else if (innerCd.logic == 'no') {
                if (innerCd.valueLogic == 'and') {
                  return !_.every(innerCd.value, (word)=>{ return (this.selectPoint.englishDescription + '').toLowerCase().includes(word.toLowerCase()) })
                } else if (innerCd.valueLogic == 'or') {
                  return !_.some(innerCd.value, (word)=>{ return (this.selectPoint.englishDescription + '').toLowerCase().includes(word.toLowerCase()) })
                }
              }
              break
            case 'icchinese':
              if (innerCd.logic == 'yes') {
                if (innerCd.valueLogic == 'and') {
                  return _.every(innerCd.value, (word)=>{ return (this.selectPoint.chineseDescription + '').includes(word) })
                } else if (innerCd.valueLogic == 'or') {
                  return _.some(innerCd.value, (word)=>{ return (this.selectPoint.chineseDescription + '').includes(word) })
                }
              } else if (innerCd.logic == 'no') {
                if (innerCd.valueLogic == 'and') {
                  return !_.every(innerCd.value, (word)=>{ return (this.selectPoint.chineseDescription + '').includes(word) })
                } else if (innerCd.valueLogic == 'or') {
                  return !_.some(innerCd.value, (word)=>{ return (this.selectPoint.chineseDescription + '').includes(word) })
                }
              }
              break
            default:
              let pointValue = _.flatten([_.get(this.selectPoint, ['condition', innerCd.id]) || this.materialCondition[innerCd.id]])
              if (innerCd.logic == 'yes') {
                if (innerCd.valueLogic == 'and') {
                  return _.difference(innerCd.value, pointValue).length == 0
                } else if (innerCd.valueLogic == 'or') {
                  return _.uniq(innerCd.value.concat(pointValue)).length < _.uniq(innerCd.value).concat(_.uniq(pointValue)).length
                }
              } else if (innerCd.logic == 'no') {
                if (innerCd.valueLogic == 'and') {
                  return _.difference(innerCd.value, pointValue).length > 0
                } else if (innerCd.valueLogic == 'or') {
                  return !(_.difference(innerCd.value, pointValue).length == 0)
                }
              }
              break
            }
        })
        if (isCheck) {
          tempList.push(condition)
        } else {
          // if (this.selectPoint.condition[condition.id] ) this.$set(this.selectPoint.condition, condition.id, undefined)
        }
      })
      }
      return tempList
    },
    displayPointList () {
      return this.valueList
        .filter(data => !this.searchEnglishString || data.englishDescription.toLowerCase().includes(this.searchEnglishString.toLowerCase()))
        .filter(data => !this.searchChineseString || data.chineseDescription.toLowerCase().includes(this.searchChineseString.toLowerCase()))
    },
    wordList () {
      return  _(this.valueList).map(point=>point.englishDescription.split(/[^a-zA-Z0-9-]+/))
        .flatten().filter(word=>word.length > 6).map(word=>word.toLowerCase()).concat(this.preList).uniq().sortBy().value()
    }
  },
  mounted () {
    this.loadConditionList()
    this.loadMaterialList()
    this.$nextTick(()=>{
      if (!_.isEmpty(this.styleList)) {
        this.useStyle = true
      }
    })
    let that = this
    $('#pointDescriptionEnglish').areacomplete({
      wordCount: 1,
      mode: 'inner',
      on: {
        query (text, cb) {
          if(/[A-Z]/.test(text[0])){
            cb(_.filter(that.wordList, word=>word.toLowerCase().indexOf(text.toLowerCase()) == 0).map(word=>_.upperFirst(word)))
          } else {
            cb(_.filter(that.wordList, word=>word.toLowerCase().indexOf(text.toLowerCase()) == 0))
          }
        }
      }
    })
  },
  watch: {

  },
  methods: {
    autoCorrect () {
      this.$set(this.selectPoint, 'englishDescription', _.upperFirst(this.selectPoint['englishDescription']))
    },
    handleCellClick (row, column) {
      if (_.isEmpty(this.konvaGroupList) && _.isEmpty(this.shapeList)) {
        this.$message({type: 'error', message: '需要载入已有的样品点关系', showClose: true})
        return
      }
      if (column.label != 'Operate') {
        this.selectPoint = _.cloneDeep(row)
        _.forIn(this.valueList, point=>{
          this.$set(this.findRectData(point.id), 'strokeEnabled', false)
        })
        this.$set(this.findRectData(row.id), 'strokeEnabled', true)
      } else {
        this.$refs.tablepointlist.setCurrentRow()
      }
    },
    sortIndex (a, b) {
      return b.index - a.index
    },
    resetPointForm () {
      this.selectPoint = {condition: {}}
    },
    loadConditionList () {
      return this.$http.get('/data/getCondition')
      .then(res=>{
        this.conditionList = res.data.conditionList
      })
    },
    loadMaterialList () {
      return this.$http.get('/data/getMaterialList')
      .then(res=>{
        this.materialObj = res.data.materialList
      })
    },
    loadPointList () {
      this.loadPointListLoading = true
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
        list: ['konvaGroupList', 'valueList', 'shapeList', 'konvaRelation', 'caseCondition', 'caseTestitem']
      })
      .then(({data: {result}})=>{
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
        if (_.isArray(result.valueList) && !_.isEmpty(result.valueList)) {
          this.valueList = result.valueList
        }
        if (_.isArray(result.shapeList) && !_.isEmpty(result.shapeList)) {
          this.shapeList = result.shapeList.map(e=>{e.sceneFunc = sceneFunc; e.dragBoundFunc = dragBoundFunc; return e})
        }
        if (_.isArray(result.konvaRelation) && !_.isEmpty(result.konvaRelation)) {
          this.konvaRelation = result.konvaRelation
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
      .finally(()=>{
        this.loadPointListLoading = false
      })
    },
    addPoint (assign) {
      let id = _id()
      let index = this.findMinIndex(this.valueList.map(e=>e.index)) + ''
      let x = 40 * ((+index - 1) % Math.floor(this.configKonva.width / 40))
      let y = 30 * Math.floor((+index - 1) / Math.floor(this.configKonva.width / 40))
      let addObj = {}
      if (_.isEmpty(assign)) {
        addObj = _.assign({}, _.cloneDeep(this.selectPoint), {id: id, index: index})
        this.selectPoint = {condition: _.cloneDeep(this.selectPoint.condition)}
      } else {
        addObj = _.assign({}, assign, {id: id, index: index})
        this.selectPoint = addObj
      }
      this.valueList.push(addObj)
      this.konvaRelation.push({id: id, label: index})
      this.shapeList.unshift(this.createShape(id, x, y, 40, 30, index))
      this.$refs.pointDescriptionEnglish.focus()
      return addObj
    },
    modifyPoint () {
      let foundPoint  = _.findIndex(this.valueList, {id: this.selectPoint.id})
      if (foundPoint != -1) {
        this.$set(this.valueList, foundPoint, _.assign(this.valueList[foundPoint], _.cloneDeep(this.selectPoint)))
      }
      this.selectPoint = {condition: {}}
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
          context.font = '1.5em Arial'
          context.textAlign = 'center'
          context.textBaseline = 'middle'
          context.fillText(shape.name(), shape.width()*0.5, shape.height()*0.5)
          context.closePath()
          context.fillStrokeShape(shape)
        },
        dragBoundFunc (pos) {
          let width =  window.innerWidth*0.4 - 40
          let height = window.innerHeight - 80 - 25
          return {
            x: pos.x < 0 ? 0 : pos.x > width ? width : pos.x,
            y: pos.y < 0 ? 0 : pos.y > height ? height : pos.y,
          }
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
        let findRect = this.findRect(this.shapeList, e.target)
        findRect.fill = 'rgba(0, 255, 0, 0.6)'
        let findData = _.find(this.valueList, {id: e.target.attrs.id})
        switch (findData.condition['weightType']) {
          case 'Enough':
            findRect.width = 80
            findRect.height = 50
            break
          case 'Not enough':
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
        let mainPart = this.findRect(this.shapeList, e.target)
        mainPart.fill = 'rgba(255, 0, 0, 0.6)'
        let group = {
          id: _id(),
          list: [],
          draggable: true,
          mainPart: {
            x: mainPart.x,
            y: mainPart.y
          },
          dragBoundFunc (pos) {
            let width =  window.innerWidth*0.4 - mainPart.x - 80
            let height = window.innerHeight - 80 - mainPart.y - 50
            return {
              x: pos.x < - mainPart.x ? - mainPart.x : pos.x > width ? width : pos.x,
              y: pos.y < - mainPart.y ? - mainPart.y : pos.y > height ? height : pos.y,
            }
          }
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
          findRect.fill = 'rgba(255, 255, 255, 0.6)'
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
    handleCopyPoint (id) {
      let foundPoint  = _.find(this.valueList, {id: id})
      this.addPoint(_.pick(_.cloneDeep(foundPoint), ['englishDescription', 'chineseDescription', 'condition']))
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
    savePointList () {
      this.$http.post('/data/saveCaseData', {
        caseNumber: this.caseNumber,
        data: {
          konvaGroupList: _.cloneDeep(this.konvaGroupList).map(i=>{
            i.list.map(e=>{e.sceneFunc = undefined; e.dragBoundFunc = undefined; return e})
            i.dragBoundFunc = undefined
            return i
          }),
          valueList: this.valueList,
          shapeList: _.cloneDeep(this.shapeList).map(e=>{e.sceneFunc = undefined; e.dragBoundFunc = undefined; return e}),
          konvaRelation: this.konvaRelation
        }
      })
      .then(res=>{
        this.$message({type: 'success', message: '保存成功', showClose: true})
      })
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
    handleStyleSwitchChange (val) {
      if (!val) {
        this.confirmDialog(
          ()=>{
            _.forIn(this.valueList, point=>{
              this.$set(point, 'style', undefined)
            })
          },
          {question: '清除所有样品点的Style?', success: '已清除', cancel: '已取消'}
        )
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.el-main
  padding: 0

.point-list-header
  .case-number
    width: 17em
  .point-function-button
    display: inline-block
    width: calc(100% - 16em)
    margin-bottom: -6px
    .el-switch
      float: right

.point-form
  height: calc(34vh - 2em - 10px)
  margin-top: 8px
  .el-textarea
    font-size: 15px
.point-form-body
  height: calc(34vh - 5em - 46px)

.point-form-line
  margin: 2px 0

.footer-button-group
  float: right

.point-list-table
  .el-table
    font-size:15px
.mini-circle-btn .el-button
  padding: 1px
  margin: 0 1px

.konva-list
  border-left: 1px solid rgb(220, 223, 230)
  border-bottom: 1px solid rgb(220, 223, 230)
.bottom-function-btn
  position: absolute
  bottom: 1em
  right: 1.5em
</style>

<style lang="stylus">
.point-form
  .el-input__inner
    font-size: 15px
  .el-card__header
    padding: 8px 20px
  .el-card__body
    padding: 10px
  .el-card__footer
    padding: 10px 20px
  .point-option .el-select--mini
    width: 100%

ul.auto-list
  position: absolute
  margin: 0
  padding: 0
  border: 1px solid rgba(0, 0, 0, 0.125)
  border-radius: 4px
  background-color: white
  list-style: none
  z-index: 100
  font-size: 14px
ul.auto-list > li:hover, ul.auto-list > li[data-selected=true]
	background-color: cornflowerblue
ul.auto-list > li
  cursor: default
  padding: 4px
mark
  background-color: transparent
  font-weight: bold
</style>
