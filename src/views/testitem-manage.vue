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
          <el-menu-item index="client-request">
            <i class="el-icon-user"></i>
            <span slot="title">客户要求</span>
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
          <el-tab-pane label="文本" name="text">

          </el-tab-pane>
          <el-tab-pane label="测试项目" name="testitem">
            <div class="inner-tabs-list">
              <ConditionCardTestitem
                v-for="condition in testitemConditionList"
                :key="condition.id"
                :data="condition"
                width="48%"
                :regulationOptionList="regulationList"
              >
              </ConditionCardTestitem>
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
              >
              </ConditionCardAfterward>
            </div>
          </el-tab-pane>
        </el-tabs>
        <div class="bottom-function-btn">
          <el-button type="primary" class="bigicon" icon="el-third-icon-plus" circle @click="addCondition" title="新增"></el-button>
          <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="saveCondition" title="保存"></el-button>
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
          <el-button type="primary" class="bigicon" icon="el-third-icon-plus" circle @click="addMaterial" title="新增"></el-button>
          <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="saveMaterial" title="保存"></el-button>
        </div>
      </el-main>
      <el-main v-if="activePage === 'method'" class="method-pane">
        <div class="inner-tabs-list">
          <MethodCard
            v-for="method in methodList"
            :key="method.id"
            :data="method"
            :conditionOptionList="conditionOptionList"
            width="48%"
          ></MethodCard>
        </div>
        <div class="bottom-function-btn">
          <el-button type="primary" class="bigicon" icon="el-third-icon-plus" circle @click="addMethod" title="新增"></el-button>
          <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="saveMethod" title="保存"></el-button>
        </div>
      </el-main>
      <el-main v-else-if="activePage === 'testitem'" class="testitem-pane">
        <el-row>
          <el-col :span="6">
            <div class="testitem-filter">
              <el-input
                v-model="searchName"
                clearable
                class="card-line"
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
                  >
                    <el-option
                      v-for="op in testitemGroupList"
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
                    ({{regulation.code}}) {{regulation.name}}
                    <span class="modify-remark" v-if="regulation.modify === 'add'">(新增)</span>
                    <span class="modify-remark" v-if="regulation.modify === 'modify'">(已修改)</span>
                    <span class="modify-remark" v-if="regulation.modify === 'delete'">(将要删除)</span>
                  </ul>
                </li>
              </overlay-scrollbars>
              <el-pagination
                :current-page.sync="pageTable"
                :page-size="100"
                layout="total, prev, pager, next"
                :total="displayRegulationCount"
                class="regulation-table-pagination"
              ></el-pagination> 
            </div>
          </el-col>
          <el-col :span="18">
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
                  <NameFormItem class="card-line" prependWidth="60px">
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
                </div>
              </el-tab-pane>
              <el-tab-pane label="方法" name="method">
                <div class="inner-tabs-list">
                  <MethodCard
                    v-for="(method, index) in selectRegulation.method"
                    :key="method.id + index"
                    :data="method"
                    :conditionOptionList="conditionOptionList"
                    width="48%"
                    @delete-method="removeInnerMethod(index)"
                    @method-change="updateRegulationStatus"
                  >
                    <template #default>
                      <div class="card-line">
                        <label class="card-label">Mix数: <span>{{method.maxMix}}</span></label>
                      </div>
                      <div class="card-line">
                        <label class="card-label">分组: <span>{{method.group}}</span></label>
                      </div>
                    </template>
                    <template #edit-area="scopeProp">
                      <NameFormItem class="card-line" prependWidth="60px">
                        <template #prepend>Mix数</template>
                        <template #default>
                          <el-input-number v-model="scopeProp.dialogData.maxMix" :precision="0" :step="1" :max="20" :min="1"/>
                        </template>
                      </NameFormItem>
                      <NameFormItem class="card-line" prependWidth="60px">
                        <template #prepend>分组</template>
                        <template #default>
                          <el-select v-model="scopeProp.dialogData.group">
                            <el-option
                              v-for="op in methodGroup"
                              :key="op"
                              :value="op"
                              :label="op"
                            ></el-option>
                          </el-select>
                        </template>
                      </NameFormItem>
                    </template>
                  </MethodCard>
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
          <el-button type="primary" class="bigicon" icon="el-third-icon-plus" circle @click="addRegulation" title="新增项目"></el-button>
          <el-button type="primary" class="bigicon" icon="el-third-icon-edit" circle @click="addInnerCard" title="添加方法或条件"></el-button>
          <el-button type="danger" class="bigicon" icon="el-third-icon-delete" circle @click="deleteRegulation" title="删除项目"></el-button>
          <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="saveRegulation" title="保存"></el-button>
        </div>
      </el-main>
      <el-main v-else-if="activePage === 'client-request'" class="client-request-pane">

      </el-main>
    </el-container>
  </el-container>
</template>

<script>

import BaseHeader from '@/components/BaseHeader.vue'
import ConditionCardSingle from '@/components/ConditionCardSingle.vue'
import ConditionCardTestitem from '@/components/ConditionCardTestitem.vue'
import ConditionCardAfterward from '@/components/ConditionCardAfterward.vue'
import MaterialCard from '@/components/MaterialCard.vue'
import MaterialConditionCard from '@/components/MaterialConditionCard.vue'
import MethodCard from '@/components/MethodCard.vue'
import NameFormItem from '@/components/NameFormItem.vue'
import InnerConditionCard from '@/components/InnerConditionCard.vue'

import { generate as _id } from 'shortid'

export default {
  name: 'TestitemManage',
  components: {
    BaseHeader,
    ConditionCardSingle,
    ConditionCardTestitem,
    ConditionCardAfterward,
    MaterialCard,
    MaterialConditionCard,
    MethodCard,
    NameFormItem,
    InnerConditionCard
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
      pageTable: 1,
      activeTestitemTab: 'info',
      selectRegulation: {},
      selectRegulationId: undefined,
      dialogConditionVisible: false,
      dialogConditionId: undefined,
      dialogMethodVisible: false,
      dialogMethodId: undefined,
      methodGroup: [1,2,3,4,5,6,7,8,9]
    }
  },
  computed: {
    singleConditionList () {
      return this.conditionList['single']
    },
    multipleConditionList () {
      return this.conditionList['multiple']
    },
    testitemConditionList () {
      return this.conditionList['testitem']
    },
    afterwardConditionList () {
      return this.conditionList['afterward']
    },
    specialMaterialCondition () {
      return _.find(this.conditionList['special'], {id: 'material'})
    },
    displayRegulationList () {
      return this.regulationList
        .filter(data => !this.searchName || (data.code + data.name).toLowerCase().includes(this.searchName.toLowerCase()))
        .filter(data => _.isEmpty(this.searchGroup) || _.isEmpty(_.difference(this.searchGroup, data.group)))
    },
    displayRegulationCount () {
      return this.displayRegulationList.length
    },
    displaySlicedRegultionList () {
      return _.chunk(this.displayRegulationList, 100)[this.pageTable-1]
    },
    materialList () {
      return this.materialObj.material
    },
    materialConditionList () {
      return this.materialObj.materialCondition
    },
    materialOptionList () {
      return {
        status: _.chain(this.materialList.map(m=>m.status)).flatten().uniq().sortBy().map(e=>({value: e})).value(),
        element: _.chain(this.materialList.map(m=>m.element)).flatten().uniq().sortBy().map(e=>({value: e})).value(),
        digestion: _.chain(this.materialList.map(m=>m.digestion)).flatten().uniq().sortBy().map(e=>({value: e})).value(),
        other: _.chain(this.materialList.map(m=>m.other)).flatten().uniq().sortBy().map(e=>({value: e})).value()
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
      return tempArr
    },
    testitemGroupList () {
      return _.chain(this.regulationList).map(t=>t.group).flatten().compact().uniq().sortBy().value()
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
        this.methodList = res.data.methodList
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
        cancelButtonText: '取消'
      }).then(({ value }) => {
        this.conditionList[this.activeConditionTab].push({
          cat: this.activeConditionTab,
          modify: 'add',
          id: _id(),
          name: value
        })
      }).catch(() => {
        this.$message({type: 'info', message: '已取消'})
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
          this.$message({type: 'success', message: res.data.info})
          this.loadConditionList()
        } else {
          this.$message({type: 'warning', message: res.data.info})
        }
      })
      .catch(() => {
        this.$message({type: 'warning', message: '未知错误'})
      })
    },
    addMaterial () {
      this.$prompt('请输入材质/材质条件名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        this.materialObj[this.activeMaterialTab].push({
          name: value,
          id: _id(),
          modify: 'add'
        })
      }).catch(() => {
        this.$message({type: 'info', message: '已取消'})
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
          this.$message({type: 'success', message: res.data.info})
          this.loadMaterialList()
        } else {
          this.$message({type: 'warning', message: res.data.info})
        }
      })
      .catch(() => {
        this.$message({type: 'warning', message: '未知错误'})
      })
    },
    addMethod () {
      this.$prompt('请输入方法名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        this.methodList.push({
          name: value,
          id: _id(),
          modify: 'add',
          condition: []
        })
      }).catch(() => {
        this.$message({type: 'info', message: '已取消'})
      })
    },
    saveMethod () {
      this.$http.post('/data/saveMethodList', {
        methodList: _.filter(this.methodList, 'modify')
      })
      .then(res=>{
        if(res.data.success){
          this.$message({type: 'success', message: res.data.info})
          this.loadMethodList()
        } else {
          this.$message({type: 'warning', message: res.data.info})
        }
      })
      .catch(() => {
        this.$message({type: 'warning', message: '未知错误'})
      })
    },
    addRegulation () {
      this.$prompt('请输入法规名称', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(({ value }) => {
        let geneId = _id()
        this.regulationList.unshift({
          name: value,
          id: geneId,
          modify: 'add'
        })
        this.handleSelectRegulation(geneId)
      }).catch(() => {
        this.$message({type: 'info', message: '已取消'})
      })
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
      })
      this.$http.post('/data/saveRegulation', {
        regulationList: tempList
      })
      .then(res=>{
        if(res.data.success){
          this.$message({
            type: 'success',
            message: res.data.info
          })
          this.loadRegulationList()
          .then(()=>{
            this.handleSelectRegulation(this.selectRegulationId)
          })
        } else {
          this.$message({type: 'warning', message: res.data.info})
        }
      })
      .catch(() => {
        this.$message({type: 'warning', message: '未知错误'})
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
      }
    },
    confirmAddInnerMethod () {
      if (this.dialogMethodId) {
        this.selectRegulation.method.push(
          _.merge(_.cloneDeep(this.methodList.find(e=>e.id == this.dialogMethodId)), {group: 1})
        )
        this.updateRegulationStatus()
        this.dialogMethodId = undefined
        this.dialogMethodVisible = false
      }
    },
    removeInnerMethod (index) {
      this.selectRegulation.method.splice(index, 1)
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
  border-right: solid 1px rgb(220, 223, 230)
.condition-pane, .testitem-pane, .material-pane
  padding: 0
.condition-pane .el-tabs, .material-pane .el-tabs, .testitem-pane .el-tabs
  height: calc(100vh - 2px)
  border-left: none
.card-line:first-child
  margin: 6px 0
.card-line:not(:first-child)
  margin-bottom: 6px
.bottom-function-btn
  position: absolute
  bottom: 1em
  right: 1.5em
.inner-tabs-list
  overflow: auto
  height: 85vh

.testitem-filter
  height: 13vh
.testitem-filter-prepend
  padding: 0 2px
.regulation-list
  border: solid 1px rgb(220, 223, 230)
  height: calc(87vh - 35px)
.regulation-list .list
  display: block
.regulation-list .regulation-ul
  margin: 0
  padding: 10px 8px
  border-bottom: solid 1px lightgrey
.regulation-ul.active-regulation
  background-color: #FFCC66
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
  width: 60px
.one-line-select
  width: 100%
</style>
