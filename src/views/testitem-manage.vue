<template>
  <el-container>
    <BaseHeader activeIndex="testitem-manage"/>
    <el-container class="testitem-manage">
      <el-aside width="132px" class="nav-aside">
        <el-menu
          class="menu"
          @select="handleMenuSelect"
          :default-active="activePage"
        >
          <el-menu-item index="condition">
            <i class="el-icon-document-checked"></i>
            <span slot="title">条件</span>
          </el-menu-item>
          <el-menu-item index="material">
            <i class="el-third-icon-gold"></i>
            <span slot="title">材质</span>
          </el-menu-item>
          <el-menu-item index="method">
            <i class="el-third-icon-experiment"></i>
            <span slot="title">测试方法</span>
          </el-menu-item>
          <el-menu-item index="testitem">
            <i class="el-icon-document"></i>
            <span slot="title">测试项目</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main v-if="activePage === 'condition'" class="condition-pane">
        <el-tabs type="border-card" v-model="activeConditionTab">
          <el-tab-pane label="单选" name="single">
            <div class="inner-tabs-list">
              <ConditionCardSingle
                v-for="condition in singleConditionList"
                :key="condition.id"
                :data="condition"
                width="48%"
              >
              </ConditionCardSingle>
            </div>
          </el-tab-pane>
          <el-tab-pane label="多选" name="multiple">
            <div class="inner-tabs-list">
              <ConditionCardSingle
                :data="specialMaterialCondition"
                width="48%"
              >
                <template #header>
                  <el-button class="special-refresh-button" type="primary" size="mini" icon="el-icon-refresh" @click="refreshSpecialMaterialConditionOption"></el-button>
                </template>
              </ConditionCardSingle>
              <ConditionCardSingle
                v-for="condition in multipleConditionList"
                :key="condition.id"
                :data="condition"
                width="48%"
              >
              </ConditionCardSingle>
            </div>
          </el-tab-pane>
          <el-tab-pane label="附加" name="afterward">
            <div class="inner-tabs-list">
              <ConditionCardAfterward
                v-for="condition in afterwardConditionList"
                :key="condition.id"
                :data="condition"
                width="48%"
                :conditionOptionList="conditionOptionList"
                :method_regulationMap="method_regulationMap"
              >
              </ConditionCardAfterward>
            </div>
          </el-tab-pane>
        </el-tabs>
        <div class="bottom-function-btn">
          <el-tooltip effect="dark" content="新增" placement="top">
            <el-button type="primary" class="bigicon" icon="el-third-icon-plus" circle @click="addCondition"></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="保存" placement="top">
            <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="saveCondition"></el-button>
          </el-tooltip>
        </div>
      </el-main>
      <el-main v-if="activePage === 'material'" class="material-pane">
        <el-tabs type="border-card" v-model="activeMaterialTab">
          <el-tab-pane label="材质" name="material">
            <div class="inner-tabs-list">
              <MaterialCard
                v-for="material in materialList"
                :key="material.id"
                :data="material"
                :materialOptionList="materialOptionList"
                width="48%"
              ></MaterialCard>
            </div>
          </el-tab-pane>
          <el-tab-pane label="材质条件" name="materialCondition">
            <div class="inner-tabs-list">
              <MaterialConditionCard
                v-for="condition in materialConditionList"
                :key="condition.id"
                :data="condition"
                :materialOptionList="materialOptionList"
                width="48%"
              ></MaterialConditionCard>
            </div>
          </el-tab-pane>
        </el-tabs>
        <div class="bottom-function-btn">
          <el-tooltip effect="dark" content="新增" placement="top">
            <el-button type="primary" class="bigicon" icon="el-third-icon-plus" circle @click="addMaterial"></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="保存" placement="top">
            <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="saveMaterial"></el-button>
          </el-tooltip>
        </div>
      </el-main>
      <el-main v-if="activePage === 'method'" class="method-pane">
        <div class="inner-tabs-list inner-tabs-list-method">
          <MethodCard
            v-for="method in methodList"
            :key="method.id"
            :data="method"
            :conditionOptionList="conditionOptionList"
            :methodGroupList="methodGroupList"
            width="48%"
          ></MethodCard>
        </div>
        <div class="bottom-function-btn">
          <el-tooltip effect="dark" content="新增" placement="top">
            <el-button type="primary" class="bigicon" icon="el-third-icon-plus" circle @click="addMethod"></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="保存" placement="top">
            <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="saveMethod"></el-button>
          </el-tooltip>
        </div>
      </el-main>
      <el-main v-else-if="activePage === 'testitem'" class="testitem-pane">
        <el-row>
          <el-col :span="7">
            <div class="testitem-filter">
              <el-input
                v-model="searchName"
                clearable
                class="card-line"
                size="small"
              >
                <template #prepend><span class="testitem-filter-prepend">筛选</span></template>
              </el-input>
              <NameFormItem class="card-line" prependWidth="32px">
                <template #prepend>分组</template>
                <template #default>
                  <el-select
                    v-model="searchGroup"
                    multiple
                    clearable
                    class="testitem-filter-select"
                    size="small"
                  >
                    <el-option
                      v-for="op in testitemGroupList"
                      :key="op"
                      :value="op"
                    ></el-option>
                  </el-select>
                </template>
              </NameFormItem>
              <NameFormItem class="card-line" prependWidth="32px">
                <template #prepend>客户</template>
                <template #default>
                  <el-select
                    v-model="searchGroupClient"
                    multiple
                    clearable
                    class="testitem-filter-select"
                    size="small"
                  >
                    <el-option value="Null"></el-option>
                    <el-option
                      v-for="op in clientGroupList"
                      :key="op"
                      :value="op"
                    ></el-option>
                  </el-select>
                </template>
              </NameFormItem>
            </div>
            <div>
              <overlay-scrollbars :options="{scrollbars: {autoHide: 'scroll'}}" class="regulation-list">
                <li class="list">
                  <ul
                    class="regulation-ul"
                    :class="{'active-regulation': selectRegulation.id == regulation.id}"
                    v-for="regulation in displaySlicedRegultionList"
                    :key="regulation.id"
                    @click="handleSelectRegulation(regulation.id)"
                  >
                    <span>({{regulation.code}})</span>
                    <span> {{regulation.name}}</span>
                    <span class="regulation-client">
                       {{regulation.client != undefined && regulation.client.length != 0 ? `(${regulation.client.join(', ')})` : ''}}
                    </span>
                    <span class="modify-remark" v-if="regulation.modify === 'add'"> (新增)</span>
                    <span class="modify-remark" v-if="regulation.modify === 'modify'"> (已修改)</span>
                    <span class="modify-remark" v-if="regulation.modify === 'delete'"> (将要删除)</span>
                  </ul>
                </li>
              </overlay-scrollbars>
              <el-pagination
                :current-page.sync="pageTable"
                :page-size="pageSize"
                :pagerCount="5"
                layout="total, prev, pager, next"
                small
                :total="displayRegulationCount"
                class="regulation-table-pagination"
              ></el-pagination> 
            </div>
          </el-col>
          <el-col :span="17">
            <el-tabs type="border-card" v-model="activeTestitemTab">
              <el-tab-pane label="信息" name="info" class="regulation-info-pane">
                <div class="inner-tabs-list">
                  <el-input
                    v-model="selectRegulation.name"
                    class="card-line"
                    @change="updateRegulationStatus"
                  >
                    <template #prepend>名称</template>
                  </el-input>
                  <el-input
                    v-model="selectRegulation.shortname"
                    class="card-line"
                    @change="updateRegulationStatus"
                  >
                    <template #prepend>缩写</template>
                  </el-input>
                  <el-input 
                    v-model="selectRegulation.code"
                    class="card-line"
                    @change="updateRegulationStatus"
                  >
                    <template #prepend>OTS 编号</template>
                  </el-input>
                  <NameFormItem class="card-line" prependWidth="80px">
                    <template #prepend>分组</template>
                    <template #default>
                      <el-select
                        v-model="selectRegulation.group"
                        allow-create
                        filterable
                        multiple
                        class="one-line-select"
                        @change="updateRegulationStatus"
                      >
                        <el-option
                          v-for="op in testitemGroupList"
                          :key="op"
                          :value="op"
                        ></el-option>
                      </el-select>
                    </template>
                  </NameFormItem>
                  <NameFormItem class="card-line" prependWidth="80px">
                    <template #prepend>客户</template>
                    <template #default>
                      <el-select
                        v-model="selectRegulation.client"
                        allow-create
                        filterable
                        multiple
                        class="one-line-select"
                        @change="updateRegulationStatus"
                      >
                        <el-option
                          v-for="op in clientGroupList"
                          :key="op"
                          :value="op"
                        ></el-option>
                      </el-select>
                    </template>
                  </NameFormItem>
                  <NameFormItem class="card-line" prependWidth="80px">
                    <template #prepend><span title="涂层与底材分开测试">按状态分开</span></template>
                    <template #default>
                      <el-select
                        v-model="selectRegulation.splitByStatus"
                        class="one-line-select"
                        @change="updateRegulationStatus"
                      >
                        <el-option label="是" :value="true"></el-option>
                        <el-option label="否" :value="false"></el-option>
                      </el-select>
                    </template>
                  </NameFormItem>
                </div>
              </el-tab-pane>
              <el-tab-pane label="方法" name="method">
                <div class="inner-tabs-list">
                  <InnerMethodCard
                    v-for="(method, index) in selectRegulation.method"
                    :key="method.id + index"
                    :data="method"
                    :methodList="methodList"
                    :conditionOptionList="conditionOptionList"
                    width="48%"
                    @delete-method="removeInnerMethod(index)"
                    @method-change="updateRegulationStatus"
                  >
                  </InnerMethodCard>
                </div>
              </el-tab-pane>
              <el-tab-pane label="条件" name="condition">
                <div class="inner-tabs-list">
                  <InnerConditionCard
                    v-for="(condition, index) in selectRegulation.condition"
                    :key="condition.id + index"
                    width="48%"
                    :data="condition"
                    :option="conditionOptionList[condition.id]"
                    @select-change="updateRegulationStatus"
                    @delete-point="removeInnerCondition(index)"
                  ></InnerConditionCard>
                </div>
              </el-tab-pane>
              <el-tab-pane label="Sub Clause" name="subclause">
                <div class="inner-tabs-list">
                  <SubClauseCard
                    v-for="(subclause, index) in selectRegulation.subclause"
                    :key="subclause.id + index"
                    :data="subclause"
                    :conditionOptionList="conditionOptionList"
                    :method_regulationMap="method_regulationMap"
                    width="48%"
                    @delete-subclause="removeInnerSubClause(index)"
                    @subclause-change="updateRegulationStatus"
                  >
                  </SubClauseCard>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-col>
        </el-row>
        <el-dialog
          title="添加方法"
          :visible.sync="dialogMethodVisible"
          width="30%"
        >
          <el-select
            v-model="dialogMethodId"
            class="one-line-select"            
          >
            <el-option
              v-for="method in methodList"
              :key="method.id"
              :label="`(${method.code}) ${method.name}`"
              :value="method.id"
            ></el-option>
          </el-select>
          <span slot="footer" class="dialog-footer">
            <el-button type="info" @click="dialogMethodVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmAddInnerMethod">确定</el-button>
          </span>
        </el-dialog>
        <el-dialog
          title="添加条件"
          :visible.sync="dialogConditionVisible"
          width="30%"
          :close-on-click-modal="false"
        >
          <el-select
            v-model="dialogConditionId"
            class="one-line-select"            
          >
            <el-option
              v-for="condition in conditionOptionList"
              :key="condition.id"
              :label="`${condition.name} (${condition.cat})`"
              :value="condition.id"
            ></el-option>
          </el-select>
          <span slot="footer" class="dialog-footer">
            <el-button type="info" @click="dialogConditionVisible = false">取消</el-button>
            <el-button type="primary" @click="confirmAddInnerCondition">确定</el-button>
          </span>
        </el-dialog>
        <div class="bottom-function-btn">
          <el-tooltip effect="dark" content="新增项目" placement="top">
            <el-button type="primary" class="bigicon" icon="el-third-icon-plus" circle @click="addRegulation"></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="复制项目" placement="top">
            <el-button type="primary" class="bigicon" icon="el-third-icon-file-copy" circle @click="copyRegulation"></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="添加方法或条件" placement="top">
            <el-button type="primary" class="bigicon" icon="el-third-icon-edit" circle @click="addInnerCard"></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="删除项目" placement="top">
            <el-button type="danger" class="bigicon" icon="el-third-icon-delete" circle @click="deleteRegulation"></el-button>
          </el-tooltip>
          <el-tooltip effect="dark" content="保存" placement="top">
            <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="saveRegulation"></el-button>
          </el-tooltip>
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>

import BaseHeader from '@/components/BaseHeader.vue'
import ConditionCardSingle from '@/components/ConditionCardSingle.vue'
import ConditionCardAfterward from '@/components/ConditionCardAfterward.vue'
import MaterialCard from '@/components/MaterialCard.vue'
import MaterialConditionCard from '@/components/MaterialConditionCard.vue'
import MethodCard from '@/components/MethodCard.vue'
import SubClauseCard from '@/components/SubClauseCard.vue'
import NameFormItem from '@/components/NameFormItem.vue'
import InnerConditionCard from '@/components/InnerConditionCard.vue'
import InnerMethodCard from '@/components/InnerMethodCard.vue'

import { generate as _id } from 'shortid'

export default {
  name: 'TestitemManage',
  components: {
    BaseHeader,
    ConditionCardSingle,
    ConditionCardAfterward,
    MaterialCard,
    MaterialConditionCard,
    MethodCard,
    SubClauseCard,
    NameFormItem,
    InnerConditionCard,
    InnerMethodCard
  },
  data () {
    return {
      materialObj: {},
      conditionList: {},
      methodList: [],
      regulationList: [],
      activePage: 'condition',
      activeConditionTab: 'single',
      activeMaterialTab: 'material',
      searchName: undefined,
      searchGroup: [],
      searchGroupClient: [],
      pageTable: 1,
      pageSize: 100,
      activeTestitemTab: 'info',
      selectRegulation_: {},
      selectRegulationId: undefined,
      dialogConditionVisible: false,
      dialogConditionId: undefined,
      dialogMethodVisible: false,
      dialogMethodId: undefined,
    }
  },
  computed: {
    selectRegulation: {
      get () {
        return this.selectRegulation_ || {}
      },
      set (val) {
        this.selectRegulation_ = val
      }
    },
    singleConditionList () {
      return this.conditionList['single']
    },
    multipleConditionList () {
      return this.conditionList['multiple']
    },
    afterwardConditionList () {
      return this.conditionList['afterward']
    },
    specialMaterialCondition () {
      return _.find(this.conditionList['special'], {id: 'material'})
    },
    displayRegulationList () {
      return this.regulationList
        // .filter(data => !this.searchName || (data.code + JSON.stringify(data.client) + data.name).toLowerCase().includes(this.searchName.toLowerCase()))
        .filter(data => !this.searchName || JSON.stringify(data).toLowerCase().includes(this.searchName.toLowerCase()))
        .filter(data => _.isEmpty(this.searchGroup) || _.isEmpty(_.difference(this.searchGroup, data.group)))
        .filter(data =>{
          if (_.isEmpty(this.searchGroupClient)) {
            return true
          } else if (_.includes(this.searchGroupClient, 'Null') && _.isEmpty(data.client)) {
            return true
          } else if (_.isEmpty(_.difference(this.searchGroupClient, data.client))) {
            return true
          } else {
            return false
          }
        })
    },
    displayRegulationCount () {
      return this.displayRegulationList.length
    },
    displaySlicedRegultionList () {
      return _.chunk(this.displayRegulationList, this.pageSize)[this.pageTable-1]
    },
    materialList () {
      return _.sortBy(this.materialObj.material, 'name')
    },
    materialConditionList () {
      return this.materialObj.materialCondition
    },
    materialOptionList () {
      return {
        status: _.chain(this.materialList.map(m=>m.status)).flatten().compact().uniq().sortBy().map(e=>({value: e})).value(),
        element: _.chain(this.materialList.map(m=>m.element)).flatten().compact().uniq().sortBy().map(e=>({value: e})).value(),
        digestion: _.chain(this.materialList.map(m=>m.digestion)).flatten().compact().uniq().sortBy().map(e=>({value: e})).value(),
        other: _.chain(this.materialList.map(m=>m.other)).flatten().compact().uniq().sortBy().map(e=>({value: e})).value()
      }
    },
    conditionOptionList () {
      let tempArr = {}
      _.forIn(this.conditionList, group=>{
        group.map(e=>{
          tempArr[e.id] = _.cloneDeep(e)
        })
      })
      _.forIn(this.materialConditionList, e=>{
        tempArr[e.id] = _.assign({cat: 'material', list: this.materialOptionList[e.property]},e)
      })
      tempArr['ictestitem'] = {
        caseRank: false,
        cat: 'testitem',
        description: '测试项目列表',
        id:'ictestitem',
        list: this.regulationList.map(e=>{
          return {
            value: e.id,
            label: `(${e.code}) ${e.name}`
          }
        }),
        name: '测试项目',
        rank: 1
      }
      tempArr['icmethod'] = {
        caseRank: false,
        cat: 'method',
        description: '测试方法列表',
        id:'icmethod',
        list: this.methodList.map(e=>{
          return {
            value: e.id,
            label: `(${e.code}) ${e.name}`
          }
        }),
        name: '测试方法',
        rank: 1
      }
      tempArr['icgroup'] = {
        caseRank: false,
        cat: 'group',
        description: '分组',
        id:'icgroup',
        list: [...Array(20).keys()].map(e=>({value: e+1})),
        name: '分组',
        rank: 1
      }
      tempArr['icenglish'] = {
        caseRank: false,
        cat: 'description',
        description: '英文描述',
        id:'icenglish',
        list: [],
        name: '英文描述',
        rank: 1
      }
      tempArr['icchinese'] = {
        caseRank: false,
        cat: 'description',
        description: '中文描述',
        id:'icchinese',
        list: [],
        name: '中文描述',
        rank: 1
      }
      return tempArr
    },
    testitemGroupList () {
      return _.chain(this.regulationList).map(t=>t.group).flatten().compact().uniq().sortBy().value()
    },
    method_regulationMap () {
      return _.fromPairs(this.methodList.concat(this.regulationList).map(e=>[e.id, e.name]))
    },
    clientGroupList () {
      return _.chain(this.regulationList).map(t=>t.client).flatten().compact().uniq().sortBy().value()
    },
    methodGroupList () {
      return _.chain(this.methodList).map(m=>m.methodGroup).compact().uniq().sortBy().value()
    }
  },
  mounted () {
    this.loadMaterialList()
    this.loadMethodList()
    this.loadRegulationList()
    this.loadConditionList()
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
    loadRegulationList () {
      return this.$http.get('/data/getRegulation')
      .then(res=>{
        this.regulationList = _.sortBy(res.data.regulationList, e=>+e['code'])
      })
    },
    handleMenuSelect (index) {
      this.activePage = index
    },
    addCondition () {
      this.$prompt('请输入条件名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.conditionList[this.activeConditionTab].push({
          cat: this.activeConditionTab,
          modify: 'add',
          id: _id(),
          name: value
        })
      }).catch(() => {
        this.$message({type: 'info', message: '已取消', showClose: true})
      })
    },
    refreshSpecialMaterialConditionOption () {
      this.$set(
        this.specialMaterialCondition,
        'list',
        this.materialList.map(m=>{
          return {
            value: m.name,
            remark: m.description
          }
        })
      )
      this.$set(this.specialMaterialCondition, 'modify', 'modify')
    },
    saveCondition () {
      let tempConditionList = {}
      _.forIn(this.conditionList, (group, cat)=>{
        tempConditionList[cat] = _.filter(group, 'modify')
      })
      this.$http.post('/data/saveCondition', {
        conditionList: tempConditionList
      })
      .then(res=>{
        if(res.data.success){
          this.$message({type: 'success', message: res.data.info, showClose: true})
          this.loadConditionList()
        } else {
          this.$message({type: 'warning', message: res.data.info, showClose: true})
        }
      })
      .catch(() => {
        this.$message({type: 'warning', message: '未知错误', showClose: true})
      })
    },
    addMaterial () {
      this.$prompt('请输入材质/材质条件名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.materialObj[this.activeMaterialTab].push({
          name: value,
          id: _id(),
          modify: 'add'
        })
      }).catch(() => {
        this.$message({type: 'info', message: '已取消', showClose: true})
      })
    },
    saveMaterial () {
      let tempMaterialObj = {}
      _.forIn(this.materialObj, (group, type)=>{
        tempMaterialObj[type] = _.filter(group, 'modify')
      })
      this.$http.post('/data/saveMaterialList', {
        materialList: tempMaterialObj
      })
      .then(res=>{
        if(res.data.success){
          this.$message({type: 'success', message: res.data.info, showClose: true})
          this.loadMaterialList()
        } else {
          this.$message({type: 'warning', message: res.data.info, showClose: true})
        }
      })
      .catch(() => {
        this.$message({type: 'warning', message: '未知错误', showClose: true})
      })
    },
    addMethod () {
      this.$prompt('请输入方法名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false
      }).then(({ value }) => {
        this.methodList.push({
          name: value,
          id: _id(),
          modify: 'add',
          condition: []
        })
      }).catch(() => {
        this.$message({type: 'info', message: '已取消', showClose: true})
      })
    },
    saveMethod () {
      this.$http.post('/data/saveMethodList', {
        methodList: _.filter(this.methodList, 'modify')
      })
      .then(res=>{
        if(res.data.success){
          this.$message({type: 'success', message: res.data.info, showClose: true})
          this.loadMethodList()
        } else {
          this.$message({type: 'warning', message: res.data.info, showClose: true})
        }
      })
      .catch(() => {
        this.$message({type: 'warning', message: '未知错误', showClose: true})
      })
    },
    addRegulation () {
      this.$prompt('请输入法规名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        closeOnClickModal: false
      }).then(({ value }) => {
        let geneId = _id()
        this.regulationList.unshift({
          name: value,
          id: geneId,
          modify: 'add'
        })
        this.handleSelectRegulation(geneId)
      }).catch(() => {
        this.$message({type: 'info', message: '已取消', showClose: true})
      })
    },
    copyRegulation () {
      let geneId = _id()
      this.regulationList.unshift(
        _.assign(_.cloneDeep(this.selectRegulation), {
          id: geneId,
          followId: this.selectRegulation.id,
          modify: 'add'
        })
      )
      this.handleSelectRegulation(geneId)
    },
    deleteRegulation () {
      switch (this.selectRegulation.modify){
        case 'delete':
          this.$set(this.selectRegulation, 'modify', undefined)
          break
        default:
          this.$set(this.selectRegulation, 'modify', 'delete')
      }
    },
    saveRegulation () {
      let tempList = _.filter(this.regulationList, 'modify')
      _.forIn(tempList, regulation=>{
        _.forIn(regulation.method, m=>{
          m.modify = undefined
        })
        _.forIn(regulation.subclause, m=>{
          m.modify = undefined
        })
      })
      this.$http.post('/data/saveRegulation', {
        regulationList: tempList
      })
      .then(res=>{
        if(res.data.success){
          this.$message({
            type: 'success',
            message: res.data.info,
            showClose: true
          })
          this.loadRegulationList()
          .then(()=>{
            this.handleSelectRegulation(this.selectRegulationId)
          })
        } else {
          this.$message({type: 'warning', message: res.data.info, showClose: true})
        }
      })
      .catch(() => {
        this.$message({type: 'warning', message: '未知错误', showClose: true})
      })
    },
    handleSelectRegulation (id) {
      this.selectRegulation = _.find(this.regulationList, {id: id})
      this.selectRegulationId = id
    },
    updateRegulationStatus () {
      this.$set(this.selectRegulation, 'modify', 'modify')
    },
    addInnerCard () {
      if (this.activeTestitemTab == 'condition') {
        if (!_.isArray(this.selectRegulation.condition)) this.$set(this.selectRegulation, 'condition', [])
        this.dialogConditionVisible = true
      } else if (this.activeTestitemTab == 'method') {
        if (!_.isArray(this.selectRegulation.method)) this.$set(this.selectRegulation, 'method', [])
        this.dialogMethodVisible = true
      } else if (this.activeTestitemTab == 'subclause') {
        if (!_.isArray(this.selectRegulation.subclause)) this.$set(this.selectRegulation, 'subclause', [])
        this.selectRegulation.subclause.push({
          id: _id(),
          condition: []
        })
        this.updateRegulationStatus()
      }
    },
    confirmAddInnerMethod () {
      if (this.dialogMethodId) {
        this.selectRegulation.method.push({
          id: this.dialogMethodId, 
          modify: 'add', 
          group: 1, 
          defaultTest: true, 
          maxMix: 1
        })
        this.updateRegulationStatus()
        this.dialogMethodId = undefined
        this.dialogMethodVisible = false
      }
    },
    removeInnerMethod (index) {
      this.selectRegulation.method.splice(index, 1)
      this.updateRegulationStatus()
    },
    removeInnerSubClause (index) {
      this.selectRegulation.subclause.splice(index, 1)
      this.updateRegulationStatus()
    },
    confirmAddInnerCondition () {
      if (this.dialogConditionId) {
        this.selectRegulation.condition.push({
          id: this.dialogConditionId,
          logic: 'yes',
          valueLogic: 'or',
          value: []
        })
        this.updateRegulationStatus()
        this.dialogConditionId = undefined
        this.dialogConditionVisible = false
      }
    },
    removeInnerCondition (index) {
      this.selectRegulation.condition.splice(index, 1)
      this.updateRegulationStatus()
    }
  }
}
</script>

<style lang="stylus" scoped>
.nav-aside
  border-right: solid 1px rgba(0,0,0,0.125)
  .el-menu
    border-right-width: 0
.condition-pane, .testitem-pane, .material-pane
  padding: 0
.condition-pane .el-tabs, .material-pane .el-tabs, .testitem-pane .el-tabs
  height: 100vh
  border-top: none
  border-bottom: none
  border-left: solid 1px rgba(0,0,0,0.125)
  box-shadow: none
.card-line
  margin-bottom: 6px
.bottom-function-btn
  position: absolute
  bottom: 1em
  right: 1.5em
.inner-tabs-list
  overflow: auto
  height: 85vh
.inner-tabs-list-method
  height: 90vh
.testitem-filter
  height: 15vh
  .testitem-filter-prepend
    padding: 0 2px
    font-size: 14px
  .testitem-filter-select
    width:100%
.regulation-list
  height: calc(85vh - 35px)
.regulation-list .list
  display: block
.regulation-list .regulation-ul
  margin: 0
  padding: 10px 8px
  border-bottom: solid 1px rgba(0,0,0,0.125)
.regulation-ul.active-regulation
  background-color: #FFCC66
.regulation-client
  color: blue
.modify-remark
  color: red

.special-refresh-button
  float: right;
  margin: -4px 4px 0 0
</style>

<style lang="stylus">
.el-menu-item [class^="el-third-icon"]
  margin: 0 8px 0 3px
  width: 24px
  text-align: center
  font-size: 18px
  vertical-align: middle
.testitem-manage .component-card
  vertical-align: top
.regulation-info-pane .el-input-group__prepend
  text-align: center
  width: 80px
.one-line-select
  width: 100%
</style>
