<template>
  <el-container>
    <BaseHeader activeIndex="point-list"/>
    <el-main>
      <el-row>
        <el-col :span="24">
          <div class="point-list-header">
            <el-input v-model="caseNumber" class="case-number" size="small" @keyup.enter.native="loadPointList">
              <template #prepend>Case:</template>
            </el-input>
            <div class="point-function-button">
              <el-switch v-model="useStyle" active-text="Style" @change="handleStyleSwitchChange"></el-switch>
            </div>
          </div>
          <div class="point-edit-area">
            <el-row>
              <el-col :span="24" class="select-point-group">
                <overlay-scrollbars
                  class="select-point-group-line"
                >
                  <ComponentCard
                    v-for="point in selectPointGroup"
                    :key="point.id"
                    width="20em"
                    :data="point"
                    :nextIndex="nextIndex"
                    :simpleConditionList="simpleConditionList"
                    :afterwardConditionList="afterwardConditionList"
                    :testitemIdList="testitemIdList"
                    :materialObj="materialObj"
                    :useStyle="useStyle"
                    :styleList="styleList"
                    :wordList="wordList"
                    :enableMainPartSelect="enableMainPartSelect"
                    @copy-point="handleCopyPart(point.id)"
                    @delete-point="handleDeletePart(point.id)"
                  />
                </overlay-scrollbars>
              </el-col>
              <el-col :span="24">
                <div class="footer-button-group">
                  <el-button size="small" type="success" plain @click="addPoint()">增加组到列表</el-button>
                  <el-button size="small" type="success" plain @click="modifyPoint">修改</el-button>
                  <el-button size="small" type="primary" plain @click="resetPointForm">重置</el-button>
                  <el-button size="small" type="primary" plain @click="addPart">增加点到组</el-button>
                </div>
                <el-select
                  v-model="complexId"
                  placeholder="复合类型"
                  size="small"
                  class="point-group-type"
                  :disabled="!enableMainPartSelect"
                >
                  <el-option label="" :value="undefined"></el-option>
                  <el-tooltip 
                    effect="dark"
                    :content="`${complex.mergeDescription} | ${complex.splitDescription}`"
                    placement="right"
                    v-for="complex in complexList"
                    :key="complex.id"
                    :open-delay="500"
                  >
                    <el-option
                      :label="complex.name"
                      :value="complex.id"
                    />
                  </el-tooltip>
                </el-select>
              </el-col>
            </el-row>
          </div>
          <div class="point-list-table">
            <el-table
            :data="displayPreviewList"
            ref="tablepointlist"
            height="52vh"
            size="medium"
            highlight-current-row
            @cell-click="handleCellClick"
            :default-sort = "{prop: 'index', order: 'descending'}"
            >
              <el-table-column
                label="#"
                prop="index"
                width="60"
                sortable
                :sort-method="sortIndex"
              />
              <el-table-column
                label="english"
                prop="englishDescription"
                width="180"
                sortable
              >
                <template #header>
                  <el-input
                    v-model="searchEnglishString"
                    size="mini"
                    placeholder="English"
                    class="table-inner-filter"
                  />
                </template>
              </el-table-column>
              <el-table-column
                label="chinese"
                prop="chineseDescription"
                width="180"
                sortable
              >
                <template #header>
                  <el-input
                    v-model="searchChineseString"
                    size="mini"
                    placeholder="Chinese"
                    class="table-inner-filter"
                  />
                </template>
              </el-table-column>
              <el-table-column 
                label="材质"
                prop="材质"
                width="160"
                sortable
              />
              <el-table-column 
                label="接触类型"
                prop="接触类型"
                width="120"
                sortable
              />
              <el-table-column 
                label="样品部位"
                prop="样品部位"
                width="120"
                sortable
              />
              <el-table-column 
                label="够重"
                prop="够重"
                width="100"
                sortable
              />
              <el-table-column 
                label="other"
                prop="other"
                width="160"
                sortable
              />
              <el-table-column label="Operate" width="120">
                <template v-slot:default="props">
                  <div class="mini-circle-btn">
                    <!-- <el-button type="success" icon="el-third-icon-file-copy" circle plain @click="handleCopyPoint(props.row.id)"></el-button> -->
                    <el-button type="danger" icon="el-third-icon-close" circle plain @click="handleDeletePoint(props.row.id)"></el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>
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
import ComponentCard from '@/components/ComponentCard.vue'
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
    NameFormItem,
    ComponentCard
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
      selectPointGroup: [{id: _id(), condition: {}}],
      searchEnglishString: '',
      searchChineseString: '',
      preList: [
        'plastic', 'soft plastic', 'rubber', 'coating', 'glitter', 'rubber coating', 'paper label', 'ceramic', 'elastic', 'printing', 'feather', 
        'lubricant', 'adhesive', 'non-woven', 'string', 'polyfiber', 'plywood', 'flocking', 'fabric', 'woven band', 'embroidery', 'hardboard',
        'thread', 'lacquer', 'silicone rubber', 'battery', 'satin ribbon', 'hook and loop fastener',
        'interlayer', 'wire jacket', 'backing', 'sewn-in label', 'corrugated', 'laminated', 'electrolytic capacitor',  'surfaced', 'lettering',
        'chassis', 'blister', 'instruction', 'sticker', 'clothes',
        'transparent', 'translucent', 'multi-color', 'iridescent', 'silvery', 'apricot', 'purple', 'off-white'
      ],
      complexId: undefined,
      complexList: [],
      enableMainPartSelect: true
    }
  },
  computed: {
    caseNumber: geneVuexValue('caseNumber'),
    caseTestitemList: geneVuexValue('caseTestitemList'),
    existCaseInfo: geneVuexValue('existCaseInfo'),
    pointList: geneVuexValue('pointList'),
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
      return _.chain(this.pointList).map(e=>e.style).flatten().compact().uniq().sortBy().value() || []
    },
    nextIndex () {
      return  this.findMinIndex(this.pointList.map(e=>e.index)) + ''
    },
    displayPreviewList () {
      return this.previewList
        .filter(data => !this.searchEnglishString || data.englishDescription.toLowerCase().includes(this.searchEnglishString.toLowerCase()))
        .filter(data => !this.searchChineseString || data.chineseDescription.toLowerCase().includes(this.searchChineseString.toLowerCase()))
    },
    wordList () {
      return  _(this.pointList).map(point=>_.get(point, 'englishDescription', '').split(/[^a-zA-Z0-9-]+/))
        .flatten().filter(word=>word.length > 6).map(word=>word.toLowerCase()).concat(this.preList).uniq().sortBy().value()
    },
    previewList () {
      let tempList = []
      _.forIn(this.pointList, point=>{
        let tempPoint ={}
        let tempCondition = []
        _.forIn(point.condition, (value, id)=>{
          let foundCondition = _.find([...this.simpleConditionList, ...this.afterwardConditionList], {id: id})
          if (foundCondition) {
            let key = foundCondition.name
            if (['材质', '接触类型', '样品部位', '够重'].includes(key)) {
              tempPoint[key] = value
            } else {
              tempCondition.push(`${key}: ${value}`)
            }
          }
        })
        tempList.push(_.assign({}, _.pick(point, ['index', 'englishDescription', 'chineseDescription', 'style', 'id']), tempPoint, {other: tempCondition.join(',')}))
      })
      _.forIn(tempList, point=>{
        point['材质'] = point['材质'] ? point['材质'].join(', ') : '-'
      })
      return tempList
    },
  },
  mounted () {
    this.loadConditionList()
    this.loadMaterialList()
    this.loadComplexList()
    this.$nextTick(()=>{
      if (!_.isEmpty(this.styleList)) {
        this.useStyle = true
      }
    })
  },
  watch: {

  },
  methods: {
    handleCellClick (row, column) {
      if (column.label != 'Operate') {
        let foundPoint = _.find(this.pointList, {id: row.id})
        if (foundPoint) {
          if (foundPoint.complexGroupId) {
            this.selectPointGroup = _.cloneDeep(_.filter(this.pointList, {complexGroupId: foundPoint.complexGroupId}))
            this.complexId = foundPoint.complexId
            this.enableMainPartSelect = false
          } else {
            this.selectPointGroup = [_.cloneDeep(foundPoint)]
            this.enableMainPartSelect = true
          }
        }
      } else {
        this.$refs.tablepointlist.setCurrentRow()
      }
    },
    sortIndex (a, b) {
      return parseInt(a.index) - parseInt(b.index)
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
    loadComplexList () {
      return this.$http.get('/data/getComplexList')
      .then(res=>{
        this.complexList = _.sortBy(res.data.complexList, 'name')
      })
    },
    loadPointList () {
      this.loadPointListLoading = true
      return this.$http.post('/data/getCaseData', {
        caseNumber: this.caseNumber,
        list: ['pointList', 'caseCondition', 'caseTestitem']
      })
      .then(res=>{
        if (res.data.success) {
          let result = res.data.result
          if (_.isArray(result.pointList) && !_.isEmpty(result.pointList)) {
            this.pointList = result.pointList
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
        this.loadPointListLoading = false
      })
    },
    handleCopyPart (id) {
      let foundPoint  = _.find(this.selectPointGroup, {id: id})
      this.selectPointGroup.push(
        _.assign(
          {id: _id()},
          _.pick(_.cloneDeep(foundPoint), ['englishDescription', 'chineseDescription', 'condition', 'style', 'complexId', 'complexGroupId'])
        )
      )
    },
    handleDeletePart (id) {
      let foundPoint = _.find(this.selectPointGroup, {id: id})
      let pointSet = _.findIndex(this.selectPointGroup, {id: id})
      if (foundPoint.mainPart == 'main' && this.selectPointGroup.length != 1) {
        this.$message({type: 'warning', message: '不能在存在附属点的情况下删除主体', showClose: true})
      } else {
        this.selectPointGroup.splice(pointSet, 1)
      }
      if (_.isEmpty(this.selectPointGroup)) {
        this.resetPointForm()
      }
    },
    addPart () {
      this.selectPointGroup.push({id: _id(), condition: {}})
    },
    addPoint () {
      let index = this.findMinIndex(this.pointList.map(e=>e.index)) + ''
      let mainCount = 0
      let partCount = 1
      let complexGroupId = _id()
      let tempList = []
      _.forIn(this.selectPointGroup, part=>{
        if (part.mainPart == 'main') {
          tempList.push(_.assign({}, part, {
            id: _id(),
            index: index + 'M',
            complexId: this.complexId,
            complexGroupId: complexGroupId
          }))
          mainCount++
        } else {
          tempList.push(_.assign({}, part, {
            id: _id(),
            index: index + 'P' + partCount,
            complexId: this.complexId,
            complexGroupId: complexGroupId
          }))
          partCount++
        }
      })
      if (this.complexId){
        if (mainCount == 1) {
          this.pointList = [...this.pointList, ...tempList]
          this.resetPointForm()
        } else {
          this.$message({type: 'warning', message: '缺少主体或主体数量大于1', showClose: true})
        }
      } else {
        if (this.selectPointGroup.length == 1) {
          this.pointList.push(_.assign({}, this.selectPointGroup[0], {id: _id(), index: index}))
          this.resetPointForm()
        } else {
          this.$message({type: 'warning', message: '请选择复合类型', showClose: true})
        }
      }
    },
    modifyPoint () {
      _.forIn(this.selectPointGroup, selectPoint=>{
        let foundPoint  = _.findIndex(this.pointList, {id: selectPoint.id})
        if (foundPoint != -1) {
          this.$set(this.pointList, foundPoint, _.assign(this.pointList[foundPoint], _.cloneDeep(selectPoint)))
        }
      })
      this.resetPointForm()
    },
    resetPointForm () {
      this.selectPointGroup = [{id: _id(), condition: {}}]
      this.complexId = undefined
      this.enableMainPartSelect = true
    },
    handleDeletePoint (id) {
      let foundPoint = _.find(this.pointList, {id: id})
      let pointSet = _.findIndex(this.pointList, {id: id})
      if (foundPoint) {
        if (foundPoint.complexGroupId) {
          let foundGroup = _.filter(this.pointList, {complexGroupId: foundPoint.complexGroupId})
          if (foundPoint.mainPart == 'main' && foundGroup.length > 1) {
            this.$message({type: 'warning', message: '不能在存在附属点的情况下删除主体', showClose: true})
          } else {
            this.pointList.splice(pointSet, 1)
          }
        } else {
          this.pointList.splice(pointSet, 1)
        }
      }
    },
    savePointList () {
      this.$http.post('/data/saveCaseData', {
        caseNumber: this.caseNumber,
        data: {
          pointList: this.pointList
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
            _.forIn(this.pointList, point=>{
              this.$set(point, 'style', undefined)
            })
          },
          {question: '清除所有样品点的Style?', success: '已清除', cancel: '已取消'}
        )
      }
    },
    findMinIndex (array) {
      let result
      _.forOwn(_(array).map(e=>parseInt(e)).sortBy().uniq().value(), (v,i)=>{
        if (+v != +i+1) {
          result = +i+1
          return false
        }
      })
      return result ? result : _(array).map(e=>parseInt(e)).sortBy().pop() + 1
    },
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
    width: calc(100% - 18em)
    margin-bottom: -6px
    .el-switch
      float: right

.point-edit-area
  .select-point-group
    overflow: auto
    .select-point-group-line
      white-space: nowrap
  .footer-button-group
    margin: 0 10px
    display: inline-block
  .point-group-type
    display: inline-block

.point-list-table
  .el-table
    font-size:14px
    .table-inner-filter.el-input
      width: 85%
      margin: 0 0 -8px 
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
  z-index: 10
</style>

<style lang="stylus">
.table-inner-filter+.caret-wrapper
  margin: -18px 0 0
ul.auto-list
  display: none
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
