<template>
  <el-container class="test-arrange-page">
    <BaseHeader activeIndex="test-arrange"/>
    <el-main>
      <el-row>
        <el-col :span="4" class="point-list">
          <el-input v-model="caseNumber" class="case-number" size="small" @keyup.enter.native="loadTasklist">
            <template #prepend>Case:</template>
          </el-input>
          <el-select
            v-model="searchStrArray"
            allow-create
            filterable
            multiple
            clearable
            collapse-tags
            size="small"
            placeholder="筛选"
            class="pointlist-searchstring"
          >
            <el-tooltip 
              effect="dark"
              :content="prop.value"
              placement="right"
              :open-delay="500"
              v-for="prop in pointListPropList"
              :key="prop.value"
            >
              <el-option
                :value="prop.value"
                :label="prop.label"
              ></el-option>
            </el-tooltip>
          </el-select>
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
                {{point.index}}. {{viewSetting.language ? point[viewSetting.language] : point.englishDescription}} {{point.style ? point.style.length > 0 ? `(${point.style.join(', ')})` : '' : ''}}
              </div>
            </draggable>
          </overlay-scrollbars>
        </el-col>
        <el-col :span="14" class="group-list">
          <div class="group-function">
            <el-row>
              <el-col :span="16">
                <el-tooltip effect="dark" content="清空选中的方法内的测试组" placement="bottom">
                  <el-button size="mini" type="danger" plain 
                    @click="emptyGroupList"
                  >清空组</el-button>
                </el-tooltip>
                <el-popover
                  v-model="showRegulationPointCount"
                  trigger="manual"
                >
                  <overlay-scrollbars :options="{scrollbars: {autoHide: 'scroll'}}" class="regulation-point-count">
                    <el-table
                      v-for="(table, type) in displayCheckTable"
                      :key="type"
                      :data="table"
                      size="mini"
                      border
                      stripe
                      class="count-table"
                    >
                      <el-table-column :label="type" width="100">
                        <template #default="scope">
                          {{scope.row[type].join(' & ')}}
                        </template>
                      </el-table-column>
                      <el-table-column 
                        v-for="label in ContactList"
                        :key="label"
                        :label="label"
                        width="120"
                      >
                        <template #default="scope">
                          <div :style="{color: scope.row[label] && scope.row[label]['select'] ?
                                                  scope.row[label]['select'] > scope.row[label]['all'] ?
                                                    'red'
                                                    : scope.row[label]['select'] == scope.row[label]['all'] ?
                                                      'limegreen'
                                                      : 'black' 
                                                  : 'black', 'text-align': 'center'}">
                            <span>{{scope.row[label] ? scope.row[label]['select'] ? scope.row[label]['select'] : 0 : ''}}</span>
                            <span>{{scope.row[label] ? scope.row[label]['all'] ? `(${scope.row[label]['all']})` : `(${scope.row[label]})` : ''}}</span>
                          </div>
                        </template>
                      </el-table-column>
                    </el-table>
                  </overlay-scrollbars>
                  <el-button
                    size="mini"
                    slot="reference"
                    icon="el-icon-menu"
                    @click="showRegulationPointCount = !showRegulationPointCount"
                  ></el-button>
                </el-popover>
                <el-button
                  size="mini"
                  class="regulation-tips-button"
                  @click="showRegulationTips = !showRegulationTips"
                >?</el-button>
                <el-dialog
                  title="材料选取规则"
                  :visible.sync="showRegulationTips"
                  v-draggable
                  :modal="false"
                  class="regulation-tips-dialog"
                  top="5vh"
                >
                  <overlay-scrollbars :options="{scrollbars: {autoHide: 'scroll'}}" class="regulation-tips">
                    <el-table
                      :data="displayRegulationTips"
                      size="mini"
                      stripe
                    >
                      <el-table-column label="Title"  prop="title" width="180" />
                      <el-table-column label="Content"  prop="content" width="420" />
                    </el-table>
                  </overlay-scrollbars>
                </el-dialog>
              </el-col>
              <el-col :span="8">
                <el-select 
                  size="mini" 
                  v-model="batchSubclauseVal"
                  @change="batchSubclause"
                  class="batch-subclause"
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
              :style="{width: viewSetting.column == 1 ? '43em' : viewSetting.column == 2 ? '21em': '21em'}"
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
                  :style="{width: viewSetting.column == 1 ? '36em' : viewSetting.column == 2 ? '14.5em': '14.5em'}"
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
                <el-button type="text" class="close-circle-button" icon="el-third-icon-block" @click="splitGroup(group.id)" plain/>
              </template>
              <group-nest v-model="group.list" :language="viewSetting.language"/>
            </el-card>
            <el-card
              class="add-group-card"
              :style="{width: viewSetting.column == 1 ? '43em' : viewSetting.column == 2 ? '21em': '21em'}"
            >
              <el-tooltip effect="dark" content="排序" placement="top">
                <el-button type="primary" class="bigicon add-button" icon="el-third-icon-reload" circle @click="reSortGroupList"></el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="新增" placement="top">
                <el-button type="success" class="bigicon add-button" icon="el-third-icon-plus" circle @click="addGroup(1)"></el-button>
              </el-tooltip>
              <el-tooltip effect="dark" content="新增10个" placement="top">
                <el-button type="success" class="bigicon add-button" icon="el-third-icon-rocket" circle @click="addGroup(10)"></el-button>
              </el-tooltip>
            </el-card>
          </overlay-scrollbars>
        </el-col>
        <el-col :span="6">
          <div class="method-function">
            <el-tooltip effect="dark" content="从测试项目重新生成列表，并代替现在的列表" placement="bottom">
              <el-button size="mini" type="danger" plain 
                @click="reGeneMethodList" 
              >重置</el-button>
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
              <div class="method-name">{{method.name}}</div>
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
                @solve-ind="autoSolveInd(selectMethod, regulation)"
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
                    multiple
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
  directives: {
    draggable: function(el, binding, vnode) {
			let dlg = el.getElementsByClassName("el-dialog")[0]
			let title = el.getElementsByClassName("el-dialog__title")[0]
			title.style.userSelect="none"
			title.style["-ms-user-select"] = "none"
			title.style["-moz-user-select"] = "none"
			title.style.cursor="default"
			dlg.offsetX = 0
			dlg.offsetY = 0
			let move = function(e){
				dlg.style.marginLeft = '0px'
				dlg.style.marginTop = '0px'
				dlg.style.left = (e.pageX - dlg.offsetX) + 'px'
				dlg.style.top = ((e.pageY - dlg.offsetY)<0 ? 0 :(e.pageY - dlg.offsetY)) + 'px'
			}
			let up = function() {
				removeEventListener('mousemove', move)
				removeEventListener('mouseup', up)
			}
			let down = function(e){
				dlg.offsetX = (e.pageX - dlg.offsetLeft)
				dlg.offsetY = (e.pageY - dlg.offsetTop )
				addEventListener('mousemove', move)
				addEventListener('mouseup', up)
			}
			let header = el.getElementsByClassName("el-dialog__header")[0]
			header.addEventListener('mousedown', down)
    }
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
      selectClient: [],
      loadTasklistLoading: false,
      copyedList: [],
      hideEmptyMethod: false,
      complexList: [],
      showRegulationPointCount: false,
      conditionList: {},
      showRegulationTips: false,
      specialConditionObj: {
        icmethod: '测试方法',
        icgroup: '分组',
        icenglish: '英文描述',
        icchinese: '中文描述'
      },
      searchStrArray: []
    }
  },
  computed: {
    caseNumber: geneVuexValue('caseNumber'),
    caseTestitemList: geneVuexValue('caseTestitemList'),
    existCaseInfo: geneVuexValue('existCaseInfo'),
    pointList: geneVuexValue('pointList'),
    methodBaseData: geneVuexValue('methodBaseData'),
    viewSetting: geneVuexValue('viewSetting'),
    displayRegulation: {
      get () {
        return this.selectMethod.regulationList || []
      },
      set (val) {
        this.$set(this.selectMethod, 'regulationList', val)
      }
    },
    displayPointList () {
      if (_.isEmpty(this.searchStrArray)) {
        return this.pointList
      } else {
        return this.pointList.filter(data => _.every(this.searchStrArray, str=> JSON.stringify(data).toLowerCase().includes(str.toLowerCase())))
      }
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
        .flatten().compact().uniq().sortBy().value()
    },
    displayMethodBaseData () {
      if (this.hideEmptyMethod) {
        return _.filter(this.methodBaseData, methodG=>methodG.list.length != 0)
      } else {
        return this.methodBaseData
      }
    },
    ContactList () {
      const ACCESSIBLE = '1yrtsYdd12'
      let foundCondition =  _.find(this.conditionList['single'], {id: ACCESSIBLE})
      return _.get(foundCondition, 'list', []).map(o=>o.value)
    },
    displayCheckTable () {
      if (this.showRegulationPointCount) {
        const ACCESSIBLE = '1yrtsYdd12'
        const MATERIAL = 'material'
        const PARTTYPE = '_a12VsWvQ'
        let groupList = _(_.filter(this.selectMethod.list, o=>this.selectRegulation.list.includes(o.id))).map(o=>o.list).flatten().value()
        let popElement = (groupList) => {
          let tempList = []
          let check = false
          _.forIn(groupList, group=>{
            if (_.isEmpty(group.elements)) {
              tempList.push(group)
            } else {
              tempList.push(group, ...group.elements)
              group.elements = []
              check = true
            }
          })
          if (check) {
            return popElement(tempList)
          } else {
            return tempList
          }
        }
        let selectPointList = popElement(_.cloneDeep(groupList))
        let geneCountObj = (list) => {
          let tempObj = {}
          _.forIn(list, point=>{
            let partType = point.condition[PARTTYPE]
            if (!tempObj[partType]) {
              tempObj[partType] = []
            }
            let material = point.condition[MATERIAL]
            let accessible = point.condition[ACCESSIBLE]
            let findExist = _.find(tempObj[partType], {[partType]: material})
            if (!findExist) {
              tempObj[partType].push({
                [partType]: material,
                [accessible]: 1
              })
            } else {
              findExist[accessible] ? findExist[accessible]++ : findExist[accessible] = 1
            }
          })
          return tempObj
        }
        let selectCount = geneCountObj(selectPointList)
        let pointCount = geneCountObj(this.pointList)
        _.forIn(pointCount, (table, partType)=>{
          if (selectCount[partType]) {
            _.forIn(table, row=>{
              let findSelect = _.find(selectCount[partType], {[partType]: row[partType]})
              _.assignWith(row, findSelect, (obj, src)=>{
                if (!_.isArray(obj)) {
                  return {
                    all: obj,
                    select: src
                  }
                }
              })
            })
          }
        })
        return pointCount
      } else {
        return {}
      }
    },
    conditionObj () {
      return _.assign({}, this.specialConditionObj, ..._(this.conditionList).values().flatten().concat(this.materialObj.materialCondition).map(c=>({[c.id]: c.name})).value())
    },
    complexObj () {
      return _.assign({}, ..._(this.complexList).map(c=>({[c.id]: c.name})).value())
    },
    methodObj () {
      let tempList = {}
      _.forIn(this.caseTestitemList, testitem=>{
        if (testitem.regulation && testitem.selected) {
          _.forIn(testitem.regulation, regulation=>{
            if (_.isArray(regulation.method)) {
              _.forIn(regulation.method, method=>{
                let foundMethod = _.find(this.methodList, {id: method.id})
                tempList[method.id] = foundMethod.name
              })
            }
          })
        }
      })
      return tempList
    },
    displayRegulationTips () {
      if (this.showRegulationTips && !_.isEmpty(this.selectRegulation) && !_.isEmpty(this.selectMethod)) {
        let tipsTable = []
        tipsTable.push({
          title: 'Regulation',
          content: this.selectRegulation.name
        }, {
          title: 'Method',
          content: this.methodObj[this.selectRegulation.method.id]
        }, {
          title: 'Client',
          content: this.selectRegulation.client ? this.selectRegulation.client.join(', ') : ''
        })
        let regulationRule = '满足以下所有条件:  '
        _.forIn(this.selectRegulation.condition, (condition, index)=>{
          regulationRule += `
            ${+index+1}. 
            ${this.conditionObj[condition.id]}
            ${condition.logic == 'no' ? '不' : ''}
            ${condition.valueLogic == 'all' && condition.value.length > 1 ? '同时' : ''}
            是
            ${condition.value.join(', ')}
            ${condition.valueLogic == 'or' && condition.value.length > 1 ? '其中之一' : ''}
            ;
          `
        })
        tipsTable.push({
          title: 'Regulation Rule',
          content: regulationRule
        })
        tipsTable.push({
          title: 'Include Complex Material',
          content: `${this.selectRegulation.includeComplex.map(id=>this.complexObj[id]).join(', ')}`
        })
        let selectMethodCondition = this.selectMethod.condition ? this.selectMethod.condition : _.find(this.selectMethod.conditionGroup, {id: this.selectRegulation.method.id}).condition
        let methodRule = '满足以下所有条件:  '
        _.forIn(selectMethodCondition, (condition, index)=>{
          methodRule += `
            ${+index+1}. 
            ${this.conditionObj[condition.id]}
            ${condition.logic == 'no' ? '不' : ''}
            ${condition.valueLogic == 'all' && condition.value.length > 1 ? '同时' : ''}
            是
            ${condition.value.join(', ')}
            ${condition.valueLogic == 'or' && condition.value.length > 1 ? '其中之一' : ''}
            ;
          `
        })
        methodRule += `
          mix数是${this.selectRegulation.method.maxMix},
          分组是${this.selectRegulation.method.group},
          ${this.selectRegulation.method.defaultTest ? '默认测试' : '默认不测试'}
          ${this.selectRegulation.method.disableWith ? ', 不能With' : ''}
        `
        tipsTable.push({
          title: 'Method Rule',
          content: methodRule
        })
        tipsTable.push({
          title: 'SubClause Rule',
          content: ''
        })
        _.forIn(this.selectRegulation.subclause, subclause=>{
          let subclauseRule = ''
          if (!_.isEmpty(subclause.condition)) {
            subclauseRule = '满足以下所有条件:  '
            _.forIn(subclause.condition, (condition, index)=>{
              subclauseRule += `
                ${+index+1}. 
                ${this.conditionObj[condition.id]}
                ${condition.logic == 'no' ? '不' : ''}
                ${condition.valueLogic == 'all' && condition.value.length > 1 ? '同时' : ''}
                是
                ${condition.id == 'icmethod' ? condition.value.map(v=>this.methodObj[v]).join(', ') : condition.value.join(', ')}
                ${condition.valueLogic == 'or' && condition.value.length > 1 ? '其中之一' : ''}
                ;
              `
              subclauseRule += condition.maxMix ? `, mix数是${condition.maxMix}` : ''
            })
          }
          tipsTable.push({
            title: subclause.name,
            content: subclauseRule
          })
        })
        return tipsTable
      } else {
        return []
      }
    },
    pointListPropList () {
      let PARTCONDITION = '_a12VsWvQ'
      let ACCESSCONDITION = '1yrtsYdd12'
      let MATERIALCONDTION = 'material'
      return _(
        this.pointList.map(p=>_.get(p, ['condition', PARTCONDITION]))
        .concat(this.pointList.map(p=>_.get(p, ['condition', ACCESSCONDITION])))
        .concat(this.pointList.map(p=>_.get(p, ['condition', MATERIALCONDTION], [])))
      ).flatten().compact().uniq().map(p=>({label: _.truncate(p, {length: 16}), value: p})).value()
    }
  },
  mounted () {
    this.loadConditionList()
    this.loadMaterialList()
    this.loadComplexList()
    this.loadMethodList()
    .then(()=>{
      if (this.caseNumber) {
        this.preLoad()
        .then(()=>{
          if (_.isEmpty(this.methodBaseData)) {
            this.geneMethodList()
          }
        })
      }
    })
  },
  methods: {
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
    loadMethodList () {
      return this.$http.get('/data/getMethodList')
      .then(res=>{
        this.methodList = _.sortBy(res.data.methodList, 'name')
      })
    },
    loadComplexList () {
      return this.$http.get('/data/getComplexList')
      .then(res=>{
        this.complexList = _.sortBy(res.data.complexList, 'name')
      })
    },
    preLoad () {
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
    },
    loadTasklist () {
      this.loadTasklistLoading = true
      return this.$http.post('/data/getCaseData', {
        caseNumber: this.caseNumber,
        list: ['methodBaseData', 'pointList', 'caseCondition', 'caseTestitem']
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
            if (this.selectMethod.id) {
              this.handleSelectMethod(this.selectMethod.id)
            }
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
              point.style = foundSourcePoint.style
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
            regulationListBackup: _.cloneDeep(regulationList),
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
          this.hideEmptyMethod = false
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
      return _.assign(_.cloneDeep(point), {elements: []})
    },
    findMinIndex (array) {
      return (_(array).map(e=>parseInt(e)).sortBy().pop() || 0) + 1
    },
    addGroup (count = 1) {
      for (let i = 0; i < count; i++) {
        let index = this.findMinIndex(this.pointGroupList.map(e=>e.index))
        let id = _id()
        this.pointGroupList.push({
          id: id,
          index: index,
          list: []
        })
        this.selectRegulation.list.push(id)
      }
    },
    reSortGroupList () {
      this.pointGroupList = _.sortBy(this.pointGroupList, 'index')
      _.forIn(this.pointGroupList, (group, index)=>{
        group.index = + index + 1
      })
      _.forIn(this.selectMethod.regulationList, regulation=>{
        regulation.list = _.filter(this.pointGroupList.map(g=>g.id), id=>regulation.list.includes(id))
      })
    },
    splitGroup (id) {
      let foundGroup = _.find(this.pointGroupList, {id: id})
      let foundGroupIndex = _.findIndex(this.pointGroupList, {id: id})
      let newId = _id()
      let index = this.findMinIndex(this.pointGroupList.map(e=>e.index))
      this.pointGroupList.splice(foundGroupIndex + 1, 0, {
        id: newId,
        index: index,
        list: []
      })
      _.forIn(this.selectMethod.regulationList, regulation=>{
        if (regulation.list.includes(id)) {
          regulation.list.push(newId)
          regulation.subclauseVal[newId] = regulation.subclauseVal[id]
        }
      })
    },
    removeGroup (id) {
      let foundGroup = _.findIndex(this.pointGroupList, {id: id})
      if (foundGroup != -1) {
        this.pointGroupList.splice(foundGroup, 1)
        _.forIn(this.selectMethod.regulationList, regulation=>{
          let foundId = _.findIndex(regulation.list, o=>o == id)
          if (foundId != -1) {
            regulation.list.splice(foundId, 1)
          }
        })
      }
    },
    showSolveDialog () {
      this.dialogVisible = true
    },
    confirmAutoSolve () {
      _.forIn(this.methodBaseData, methodGroup=>{
        _.forIn(methodGroup.regulationListForClient, regulation=>{
          if ( (_.difference(this.selectClient, regulation.client).length < this.selectClient.length) || regulation.switchTo ) {
            let foundGeneralRegulationIndex = _.findIndex(methodGroup.regulationList, {code: regulation.code})
            foundGeneralRegulationIndex != -1 ? methodGroup.regulationList.splice(foundGeneralRegulationIndex, 1, regulation) : methodGroup.regulationList.push(regulation)
          }
        })
      })
      this.autoSolve()
      this.dialogVisible = false
    },
    autoSolve () {
      let startTime = new Date()
      const MATERIALCONDTION = 'material'
      let pointList = this.resolvePointList(_.sortBy(_.cloneDeep(this.pointList), p=>parseInt(p.index)))
      let pointHashObj = {}
      let pointPicked = {}
      _.forIn(this.methodBaseData, methodObj=>{
        let filterByMethodList = this.pointFilterByConditionList(pointList, methodObj.condition)
        let filterByRegulationList = this.pointTagRegulation(filterByMethodList, methodObj.regulationList, pointPicked, false)
        let filterPointList = _(filterByRegulationList).values().flatten().filter(point=>!_.isEmpty(point.regulation)).value()
        let groupedList = _.groupBy(filterPointList, point=>JSON.stringify(point.regulation.map(r=>r.id)))
        _.forIn(groupedList, group=>{
          _.forIn(group, point=>{
            point.groupBy = []
            let regulationList = point.regulation
            if (this.mixByStyle) {
              if (!_.isEmpty(point.style)) {
                point.groupBy.push({
                  style: _.sortBy(point.style)
                })
              }
            }
            _.forIn(regulationList, regulation=>{
              _.forIn(regulation.subclause, subclause=>{
                if (this.checkConditionListPass({point: point, conditionList:subclause.condition, methodId: regulation.method.id, group: regulation.method.group})) {
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
            point.groupBy.push({
              material: JSON.stringify(_.sortBy(point.condition[MATERIALCONDTION]))
            })
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
              if (!point.disableWith  && point.condition['weightType'] != 'Enough') {
                let inwith = false
                _.forIn(group, parentPoint=>{
                  if (parentPoint.condition['weightType'] == 'Enough' && parentPoint.elements.length < 2) {
                    parentPoint.elements.push(_.cloneDeep(point))
                    point.minorType = 'withed'
                    inwith = true
                    return false
                  }
                })
                if (!inwith) {
                  point.minorType = 'unWithed'
                }
              } else {
                point.minorType = 'main'
              }
            })
            let finalMethodGroupList = _.chunk(_.filter(group, point=>point.minorType == 'main' || point.minorType == 'unWithed'), minMix)
            // let groupByStatus = _.groupBy(_.filter(group, point=>point.minorType == 'main' || point.minorType == 'unWithed'), point=>point.condition[STATUSCONDITIONID])
            // let finalMethodGroupList = _.flatten(_.values(groupByStatus).map(g=>_.chunk(g, minMix)))
            let startIndex = (_.max(methodObj.list.map(g=>g.index)) || 0) + 1
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
                if (!['material', 'style'].includes(key)) {
                  subclauseValList[key].push({[id]: code})
                }
              })
            })
            _.forIn(regulationList, regulation=>{
              regulation.list = _.uniq(regulation.list.concat(idList))
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
            conditionGroup: _.chain(methodG2).map(e=>{return {id: e.id, condition: e.condition}}).value(),
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
            }).value(),
            regulationListBackup: _.chain(methodG2).map(e=>e.regulationListBackup).flatten().value(),
            regulationListForClient: _.chain(methodG2).map(e=>e.regulationListForClient).flatten().value()
          })
        }
      })
      this.hideEmptyMethod = true
      console.log(`used time: ${new Date() - startTime}ms`)
    },
    autoSolveInd (selectMethod, selectRegulation) {
      let startTime = new Date()
      const MATERIALCONDTION = 'material'
      let backupRegulation =_.cloneDeep(_.find(selectMethod.regulationListBackup, r=>{
        return r.code == selectRegulation.code && r.method.id == selectRegulation.method.id
      }))
      _.assign(selectRegulation, backupRegulation)
      let filterClientRegulation  = _.filter(selectMethod.regulationListForClient, r=>{
        return r.code == selectRegulation.code && r.method.id == selectRegulation.method.id
      })
      _.forIn(filterClientRegulation, regulation=>{
        if (_.difference(this.selectClient, regulation.client).length < this.selectClient.length) {
          _.assign(selectRegulation, regulation)
          return false
        }
      })
      let pointList = this.resolvePointList(_.sortBy(_.cloneDeep(this.pointList), p=>parseInt(p.index)))
      let selectCondition = selectMethod.condition ? selectMethod.condition : _.find(selectMethod.conditionGroup, {id: selectRegulation.method.id}).condition
      let filterByMethodList = this.pointFilterByConditionList(pointList, selectCondition)
      let filterByRegulationList = this.pointTagRegulation(filterByMethodList, [selectRegulation], {}, true)
      let filterPointList = _(filterByRegulationList).values().flatten().filter(point=>!_.isEmpty(point.regulation)).value()
      _.forIn(filterPointList, point=>{
        point.groupBy = []
        let regulationList = point.regulation
        if (this.mixByStyle) {
          if (!_.isEmpty(point.style)) {
            point.groupBy.push({
              style: _.sortBy(point.style)
            })
          }
        }
        _.forIn(regulationList, regulation=>{
          _.forIn(regulation.subclause, subclause=>{
            if (this.checkConditionListPass({point: point, conditionList:subclause.condition, methodId: regulation.method.id, group: regulation.method.group})) {
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
        point.groupBy.push({
          material: JSON.stringify(_.sortBy(point.condition[MATERIALCONDTION]))
        })
      })
      let groupList = _.groupBy(filterPointList, point=>{
        return JSON.stringify(
          _.sortBy(point.groupBy, o=>{
            return _.head(_.keys(o))
          })
        )
      })
      let pointHashObj = {}
      _.forIn(selectMethod.list, group=>{
        let pointHash = _.flatten(this.geneGroupId(group.list)).join('')
        pointHashObj[pointHash] = group.id
      })
      _.forIn(groupList, group=>{
        let regulationList
        let subclauseValList = {}
        let minMix = _.min(_.head(group).maxMixArray)
        _.forIn(group, point=>{
          regulationList = point.regulation
          if (!point.disableWith  && point.condition['weightType'] != 'Enough') {
            let inwith = false
            _.forIn(group, parentPoint=>{
              if (parentPoint.condition['weightType'] == 'Enough' && parentPoint.elements.length < 2) {
                parentPoint.elements.push(_.cloneDeep(point))
                point.minorType = 'withed'
                inwith = true
                return false
              }
            })
            if (!inwith) {
              point.minorType = 'unWithed'
            }
          } else {
            point.minorType = 'main'
          }
        })
        let finalMethodGroupList = _.chunk(_.filter(group, point=>point.minorType == 'main' || point.minorType == 'unWithed'), minMix)
        let startIndex = (_.max(selectMethod.list.map(g=>g.index)) || 0) + 1
        let idList = []
        _.forIn(finalMethodGroupList, pointGroup=>{
          let id
          let pointHash = _.flatten(this.geneGroupId(pointGroup)).join('')
          if (pointHashObj[pointHash]) {
            id = pointHashObj[pointHash]
          } else {
            id = _id()
            selectMethod.list.push({
              id: id,
              index: startIndex,
              list: pointGroup
            })
            startIndex += 1
          }
          idList.push(id)
          _.forIn(_.head(pointGroup).groupBy, groupObj=>{
            let key = _.head(_.keys(groupObj))
            let code = _.head(_.values(groupObj))
            if (!subclauseValList[key]) {
              subclauseValList[key] = []
            }
            if (!['material', 'style'].includes(key)) {
              subclauseValList[key].push({[id]: code})
            }
          })
        })
        _.forIn(regulationList, regulation=>{
          regulation.list = _.uniq(regulation.list.concat(idList))
          if (subclauseValList[regulation.id + '_' + regulation.method.group]) {
            regulation.subclauseVal = _.assign(regulation.subclauseVal, ...subclauseValList[regulation.id + '_' + regulation.method.group])
          }
        })
      })
      console.log(`used time: ${new Date() - startTime}ms`)
    },
    resolvePointList (pointList) {
      let tempList = []
      let groupedList = {
        ind: [],
        split: [],
        merge: []
      }
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
        _.assignWith(point.condition, ...materialValArray, (obj,src)=>{
          if (_.isArray(obj)) {
            return _.uniq(_.compact(obj.concat(src)))
          }
        })        
        tempList.push(point)
      })
      let resolveComplexGroupId = []
      _.forIn(tempList, point=>{
        if (point.complexGroupId) {
          if (!resolveComplexGroupId.includes(point.complexGroupId)) {
            let group =  _.filter(tempList, {complexGroupId: point.complexGroupId})
            let mainPart = _.find(group, {mainPart: 'main'})
            let complex = _.find(this.complexList, {id: point.complexId})
            if (mainPart && complex) {
              resolveComplexGroupId.push(point.complexGroupId)
              switch (complex.complexType) {
                case 'M-PP':
                  groupedList.merge.push(mainPart)
                  _.forIn(group, part=>{
                    if (part.mainPart != 'main') {
                      groupedList.split.push(part)
                    }
                  })
                  break
                case 'MPP-MPP':
                  groupedList.merge.push(_.assign({}, mainPart, {elements: _.without(group, mainPart)}))
                  groupedList.split = [...groupedList.split, ...group]
                  break
                case 'MPP-MPMP':
                  groupedList.merge.push(_.assign({}, mainPart, {elements: _.without(group, mainPart)}))
                  _.forIn(group, part=>{
                    if (part.mainPart != 'main') {
                      groupedList.split.push(_.assign({}, mainPart, {elements:[part]}))
                    }
                  })
                  break
              }
            }
          }
        } else {
          groupedList.ind.push(point)
        }
      })
      return groupedList
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
                  return _.difference(condition.value, pointValue).length < condition.value.length
                }
              } else if (condition.logic == 'no') {
                if (condition.valueLogic == 'and') {
                  return _.difference(condition.value, pointValue).length > 0
                } else if (condition.valueLogic == 'or') {
                  return _.difference(condition.value, pointValue).length == condition.value.length
                }
              }
              break
          }
        })
    },
    pointFilterByConditionList(pointList, conditionList) {
      let tempList = {}
      _.forIn(pointList, (group, key)=>{
        tempList[key] = _.filter(group, point=>this.checkConditionListPass({point:point, conditionList: conditionList}))
      })
      return tempList
    },
    pointTagRegulation (pointList, regulationList, pointPicked, forceTest) {
      pointList = _.cloneDeep(pointList)
      _.forIn(pointList, (group, key)=>{
        _.forIn(group, point=>{
          point.regulation = []
          point.maxMixArray = []
          point.elements ? '' : point.elements = []
          _.forIn(regulationList, regulation=>{
            if ((forceTest || regulation.method.defaultTest) && this.checkConditionListPass({point:point, conditionList: regulation.condition})) {
              let checked = true
              let forComplexCheck = true
              switch (key) {
                case 'split':
                  if (_.get(regulation, 'includeComplex', []).includes(point.complexId)) {
                    forComplexCheck = false
                  } else {
                    forComplexCheck = true
                  }
                  break
                case 'merge':
                  if (_.get(regulation, 'includeComplex', []).includes(point.complexId)) {
                    forComplexCheck = true
                  } else {
                    forComplexCheck = false
                  }
              }
              if (!_.isArray(pointPicked[point.id + _.get(point, 'elements', []).map(e=>e.id).join('_')])) {
                pointPicked[point.id + _.get(point, 'elements', []).map(e=>e.id).join('_')] = []
              }
              if (_.some(pointPicked[point.id + _.get(point, 'elements', []).map(e=>e.id).join('_')], sign=>{
                  return sign.regulationId == regulation.id &&  sign.group == regulation.method.group
                }) || !forComplexCheck
              ) {
                checked = false
              } else {
                pointPicked[point.id + _.get(point, 'elements', []).map(e=>e.id).join('_')].push({regulationId: regulation.id, group: regulation.method.group})
              }
              if (checked) {
                point.regulation.push(regulation)
                point.maxMixArray.push(regulation.method.maxMix)
                if (_.get(regulation, 'caseInfo.isIndTest')) {
                  point.maxMixArray.push(1)
                }
                if (regulation.method.disableWith) {
                  point.disableWith = true
                }
              }
            }
          })
        })
      })
      return pointList
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
      let saveData = () => {
        this.$http.post('/data/saveCaseData', {
          caseNumber: this.caseNumber,
          data: {
            methodBaseData: this.methodBaseData
          }
        })
        .then(res=>{
          this.$message({type: 'success', message: '保存成功', showClose: true})
        })
      }
      let testList = _(this.methodBaseData).map(m=>m.list).flatten().compact().value()
      if (_.isEmpty(testList)) {
        this.confirmDialog(saveData, {question: '测试列表为空，继续保存?', success: '操作完成', cancel: '已取消'})
      }  else {
        saveData()
      }
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
      this.copyedList = _.cloneDeep(sourceList)
      this.$message({type: 'success', message: 'Copyed!', showClose: true})
    },
    pasteList (method) {
      method.list = method.list.concat(_.cloneDeep(this.copyedList).map(
        g=>{
          g.id = _id()
          g.list = g.list.map(p=>_.omit(p, 'regulation'))
          return g
        }
      ))
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
  height: 100vh
.pointlist-searchstring
  margin: 1px 1px 0 0
  width: 100%
.group-function .batch-subclause
  width: 100%
.ol-point-list
  height: calc(100vh - 4em - 2px)
.point-list-item, .method-list-item
  margin: 1px
  padding: 6px
  border: solid 1px rgba(0,0,0,0.125)
  border-radius: 4px
  background-color: #fbfbfb
  font-size: 15px
.point-list-item
  cursor: move
.method-function
  margin: 1px
.method-list-item
  padding: 8px 6px
  cursor: inherit
  .method-name
    display: inline-block
    width: 16em
.method-icon
  float: right
  margin: 0 3px
  cursor: pointer

.regulation-point-count
  max-height: 90vh
.regulation-tips
  max-height: 80vh
.regulation-tips-button
  font-weight: bold
.isSelectedGroup
  box-shadow: 0px 0px 2px 2px rgba(0,128,255,0.6)
.add-group-card
  height: 6em
  display: inline-block
  margin: 4px 6px
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
  z-index: 10

.solve-option
  .card-line
    margin: 4px 10px
.regulation-select-pane
  max-height: 72vh
</style>

<style lang="stylus">
.count-table
  margin-bottom: 10px
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
      display: inline-block
      vertical-align: top
    .el-card__header
      padding: 6px 10px
      .group-index
        display: inline-block
        width: 3.2em
        top: 1px
        .el-input__inner
          padding: 0 5px
          text-align: center
          font-weight: bold
          font-size: 14px
      .close-circle-button
        padding: 2px
        margin: 3px 0
        float: right
    .el-card__body
      padding: 6px
.regulation-tips-dialog
  .el-dialog__body
    padding-top: 10px
    padding-bottom: 10px
</style>