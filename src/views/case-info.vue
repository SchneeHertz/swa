<template>
  <el-container>
    <BaseHeader activeIndex="case-info"/>
    <el-main>
      <el-row style="height: 100vh;">
        <el-col :span="10" class="case-testitem-list">
          <div class="case-testitem-header">
            <el-input v-model="caseNumber" class="case-number" size="small">
              <template #prepend>Case:</template>
            </el-input>
            <el-button size="mini" type="primary"  @click="loadCaseTestitem" :loading="loadOTSTestitemLoading">从OTS导入测试项目</el-button>
          </div>
          <overlay-scrollbars
            :options="{scrollbars: {autoHide: 'scroll'}}"
            class="case-testitem"
          >
            <el-card
              v-for="testitem in caseTestitemList"
              :key="testitem.CaseTestItemID"
              class="testitem-card"
            >
              <template #header>({{testitem.TestItemID}}) {{testitem.TestItemDescription}}</template>
              <p class="testitem-info">{{testitem.ReportNumber}} - {{testitem.JobNumber}}</p>
              <el-checkbox v-model="testitem.selected">Lab in</el-checkbox>
              <el-checkbox v-model="testitem.isIndTest">Ind test</el-checkbox>
            </el-card>
          </overlay-scrollbars>
        </el-col>
        <el-col :span="14">
          <overlay-scrollbars
            class="case-condition"
          >
            <el-card
              v-for="condition in simpleCaseConditionList"
              :key="condition.id"
              class="condition-card"
            >
              <template #header>{{condition.name}}</template>
              <div v-if="condition.cat === 'single'">
                <el-radio 
                  v-for="op in condition.list" 
                  :key="op.value" 
                  v-model="condition.value" 
                  :label="op.value"
                  border
                >{{op.value}}{{op.remark ? ` (${op.remark})` : ''}}</el-radio>
              </div>
              <div v-else-if="condition.cat === 'multiple'">
                <el-checkbox-group v-model="condition.value">
                  <el-checkbox
                    v-for="op in condition.list"
                    :key="op.value"
                    :label="op.value"
                    border
                  >{{op.value}}{{op.remark ? ` (${op.remark})` : ''}}</el-checkbox>
                </el-checkbox-group>
              </div>
            </el-card>
            <el-card
              v-for="condition in afterwardCaseConditionList"
              :key="condition.id"
              class="condition-card"
              v-show="condition.visible"
            >
              <template #header>{{condition.name}}</template>
              <div v-if="condition.aftercat === 'single'">
                <el-radio 
                  v-for="op in condition.list" 
                  :key="op.value" 
                  v-model="condition.value" 
                  :label="op.value"
                  border
                >{{op.value}}{{op.remark ? ` (${op.remark})` : ''}}</el-radio>
              </div>
              <div v-else-if="condition.aftercat === 'multiple'">
                <el-checkbox-group v-model="condition.value">
                  <el-checkbox
                    v-for="op in condition.list"
                    :key="op.value"
                    :label="op.value"
                    border
                  >{{op.value}}{{op.remark ? ` (${op.remark})` : ''}}</el-checkbox>
                </el-checkbox-group>
              </div>
            </el-card>
          </overlay-scrollbars>
          <div class="bottom-function-btn">
            <el-tooltip effect="dark" content="载入所有数据" placement="top">
              <el-button type="primary" class="bigicon" icon="el-third-icon-cloud-sync" circle @click="loadAllData"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="载入Case信息" placement="top">
              <el-button type="primary" class="bigicon" icon="el-third-icon-cloud-download" circle @click="loadExistCaseData"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="保存Case信息" placement="top">
              <el-button type="success" class="bigicon" icon="el-third-icon-save" circle @click="saveCaseInfo"></el-button>
            </el-tooltip>
            <el-tooltip effect="dark" content="下一步" placement="top">
              <el-button type="primary" class="bigicon" icon="el-third-icon-right" circle @click="toNextPage"></el-button>
            </el-tooltip>
          </div>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import BaseHeader from '@/components/BaseHeader.vue'

const PROTOCOL = 'http'
// const OTSHOST = 'cnots-uat.sgs.net/OTS_UAT'
// const OTSHOST = '10.168.136.40:8001'
const OTSHOST = 'cnots.sgs.net/OTS'

function geneVuexValue (property) {
  return {
    get () { return this.$store.state[property] },
    set (newVal) { this.$store.commit('updateValue', {key: property, value: newVal}) }
  }
}

export default {
  name: 'CaseInfo',
  components: {
    BaseHeader
  },
  props: {
    case: String
  },
  data () {
    return {
      loadOTSTestitemLoading: false,
      selectedTestitemList: {}
    }
  },
  computed: {
    conditionList: geneVuexValue('conditionList'),
    caseNumber: geneVuexValue('caseNumber'),
    caseTestitemList: geneVuexValue('caseTestitemList'),
    existCaseInfo: geneVuexValue('existCaseInfo'),
    pointList: geneVuexValue('pointList'),
    methodBaseData: geneVuexValue('methodBaseData'),
    simpleCaseConditionList () {
      return _.chain(this.conditionList).pick(['single', 'multiple', 'special']).values().flatten().filter('caseRank').sortBy('rank').value()
    },
    afterwardCaseConditionList () {
      let tempList = _.chain(this.conditionList['afterward']).filter('caseRank').value()
      _.forIn(tempList, condition=>{
        let isCheck = _.every(condition.condition, innerCd=>{
          let foundMap = _.find(this.simpleCaseConditionList.concat(tempList), {id: innerCd.id})
          if (foundMap) {
            let foundMapValue = _.flatten([foundMap.value])
            if (innerCd.logic == 'yes') {
              if (innerCd.valueLogic == 'and') {
                return _.difference(innerCd.value, foundMapValue).length == 0
              } else if (innerCd.valueLogic == 'or') {
                return _.difference(innerCd.value, foundMapValue).length < innerCd.value.length
              }
            } else if (innerCd.logic == 'no') {
              if (innerCd.valueLogic == 'and') {
                return _.difference(innerCd.value, foundMapValue).length > 0
              } else if (innerCd.valueLogic == 'or') {
                return _.difference(innerCd.value, foundMapValue).length == innerCd.value.length
              }
            }
          } else {
            return false
          }
        })
        if (isCheck) {
          this.$set(condition, 'visible', true)
        } else {
          this.$set(condition, 'visible', false)
          this.$set(condition, 'value', [])
        }
      })
      return _.sortBy(tempList, 'rank')
    }
  },
  mounted () {
    this.loadConditionList()
    .then(()=>{
      if (this.case) {
        this.caseNumber = this.case
        this.loadAllData()
      } else {
        if (this.caseNumber) {
          this.loadExistCaseData()
        }
      }
    })
  },
  methods: {
    loadExistCaseData () {
      return this.$http.post('/data/getCaseData', {
        caseNumber: this.caseNumber,
        list: ['caseCondition', 'caseTestitem']
      })
      .then(res=>{
        if (res.data.success) {
          let result = res.data.result
          if (_.isArray(result.caseTestitem) && !_.isEmpty(result.caseTestitem)) {
            this.caseTestitemList = result.caseTestitem
          }
          if (result.caseCondition) {
            _.forIn(result.caseCondition['simpleCaseConditionList'], condition=>{
              this.$set(_.find(this.simpleCaseConditionList, {id: condition.id}), 'value', condition.value)
            })
            _.forIn(result.caseCondition['afterwardCaseConditionList'], condition=>{
              this.$set(_.find(this.afterwardCaseConditionList, {id: condition.id}), 'value', condition.value)
            })
          }
        } else {
          this.$message({type: 'error', message: res.data.info, showClose: true})
        }
      })
    },
    loadAllData () {
      return this.$http.post('/data/getCaseData', {
        caseNumber: this.caseNumber,
        list: ['caseCondition', 'caseTestitem', 'pointList', 'methodBaseData']
      })
      .then(res=>{
        if (res.data.success) {
          let result = res.data.result
          if (_.isArray(result.caseTestitem) && !_.isEmpty(result.caseTestitem)) {
            this.caseTestitemList = result.caseTestitem
          }
          if (result.caseCondition) {
            _.forIn(result.caseCondition['simpleCaseConditionList'], condition=>{
              this.$set(_.find(this.simpleCaseConditionList, {id: condition.id}), 'value', condition.value)
            })
            _.forIn(result.caseCondition['afterwardCaseConditionList'], condition=>{
              this.$set(_.find(this.afterwardCaseConditionList, {id: condition.id}), 'value', condition.value)
            })
            _.forIn(result.caseCondition, group=>{
              _.forIn(group, indCondition=>{
                this.$set(this.existCaseInfo, indCondition.id, indCondition.value)
              })
            })
          }
          if (_.isArray(result.pointList) && !_.isEmpty(result.pointList)) {
            this.pointList = result.pointList
          }
          if (_.isArray(result.methodBaseData) && !_.isEmpty(result.methodBaseData)) {
            this.methodBaseData = result.methodBaseData
            this.refreshDescription(this.methodBaseData)
          }
        } else {
          this.$message({type: 'error', message: res.data.info, showClose: true})
        }
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
            }
          })
        })
      })
    },
    loadCaseTestitem () {
      this.loadOTSTestitemLoading = true
      $.ajax({
        type: 'POST',
        url: `${PROTOCOL}://${OTSHOST}/Services/CaseService.asmx/GetTestItemListByCaseNumber`,
        data: {CaseNumber: this.caseNumber}
      })
      .done(res=>{
        this.caseTestitemList = JSON.parse($(res).find('string').html())
        this.caseTestitemList = _.filter(this.caseTestitemList, item=>/CM/ig.test(item.JobNumber))
        _.forIn(this.caseTestitemList, testitem=>{
          this.$set(testitem, 'selected', true)
          this.$set(testitem, 'isIndTest', false)
        })
        this.caseTestitemList = _.sortBy(this.caseTestitemList, ['JobNumber', 'TestItemID'])
        this.$http.post('/data/getRegulation', {
          idList: this.caseTestitemList.map(e=>e.TestItemID.toString())
        })
        .then(({data})=>{
          _.forIn(this.caseTestitemList, testitem=>{
            let foundRegulation = _.filter(data.regulationList, {code: testitem.TestItemID.toString()})
            this.$set(testitem, 'regulation', foundRegulation)
            if (_.isEmpty(foundRegulation)) {
              this.$set(testitem, 'selected', false)
            }
          })
        })
      })
      .always(()=>{
        this.loadOTSTestitemLoading = false
      })
    },
    loadConditionList () {
      return this.$http.get('/data/getCondition')
      .then(res=>{
        this.conditionList = res.data.conditionList
      })
    },
    saveCaseInfo () {
      this.$http.post('/data/saveCaseData', {
        caseNumber: this.caseNumber,
        data: {
          caseTestitem: this.caseTestitemList,
          caseCondition: {
            simpleCaseConditionList: _.filter(this.simpleCaseConditionList, 'caseRank').map(e=>_.pick(e, ['id', 'value'])),
            afterwardCaseConditionList: _.filter(this.afterwardCaseConditionList, 'visible').map(e=>_.pick(e, ['id', 'value']))
          }
        }
      })
      .then(res=>{
        this.$message({type: 'success', message: '保存成功', showClose: true})
      })
    },
    toNextPage () {
      this.$msgbox({
        title: '提示',
        message: '即将跳转，请确认是否需要保存当前数据？',
        showCancelButton: true,
        confirmButtonText: '下一步',
        cancelButtonText: '保存',
        distinguishCancelAndClose: true,
        beforeClose: (action, instance, done) => {
          if (action == 'cancel'){
            this.saveCaseInfo()
          } else {
            done()
          }
        }
      })
      .then(action=>{
        if (action == 'confirm') {
          this.$router.push('/point-list')
        }
      })
    },
  }
}
</script>

<style lang="stylus" scoped>
.el-main
  padding: 0
.case-testitem-list
  border-right: solid 1px rgba(0,0,0,0.125)
.case-testitem-header
  .case-number
    width: 17em
    margin: 0 1px
  .el-button
    margin: 0 2px

.case-testitem
  height: calc(100vh - 2em)

.case-condition
  height: calc(100vh - 5em)

.testitem-card, .condition-card
  margin: 6px 4px
  .testitem-info
    margin: 0 0 6px
    color: #999999
    font-size: 12px

.bottom-function-btn
  position: absolute
  bottom: 1em
  right: 1.5em
</style>

<style lang="stylus">
.testitem-card, .condition-card
  .el-card__header
    padding: 10px
.testitem-card, .condition-card
  .el-card__body
    padding: 10px
.case-condition
  .el-checkbox.is-bordered, .el-radio.is-bordered
    margin: 6px 8px
</style>
