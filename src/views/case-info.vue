<template>
  <el-container>
    <BaseHeader activeIndex="case-info"/>
    <div style="width:100vw;">
      <el-row>
        <el-col :span="8" style="border-right: solid 1px lightgrey;">
          <el-input v-model="caseNumber" class="form-line" size="small">
            <template #prepend>Case No.</template>
            <template #append>
              <el-button type="primary" @click="loadExistCaseData" :loading="loadExistCaseDataLoading">载入已有数据</el-button>
            </template>
          </el-input>
          <div  class="testitem-import-button">
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
              <el-checkbox v-model="testitem.selected">Lab in</el-checkbox>
              <el-checkbox v-model="testitem.isIndTest">Ind test</el-checkbox>
            </el-card>
          </overlay-scrollbars>
        </el-col>
        <el-col :span="16">
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
            <el-button type="success" class="bigicon" icon="el-third-icon-save" circle title="保存" @click="saveCaseInfo"></el-button>
            <el-button type="primary" class="bigicon" icon="el-third-icon-right" circle title="下一步" @click="toNextPage"></el-button>
          </div>
        </el-col>
      </el-row>
    </div>
  </el-container>
</template>

<script>

import BaseHeader from '@/components/BaseHeader.vue'

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
  data () {
    return {
      loadExistCaseDataLoading: false,
      loadOTSTestitemLoading: false,
      selectedTestitemList: {},
      conditionList: {}
    }
  },
  computed: {
    caseNumber: geneVuexValue('caseNumber'),
    caseTestitemList: geneVuexValue('caseTestitemList'),
    simpleCaseConditionList () {
      return _.chain(this.conditionList).pick(['single', 'multiple', 'special']).values().flatten().filter('caseRank').sortBy('rank').value()
    },
    afterwardCaseConditionList () {
      let tempList = _.chain(this.conditionList['afterward']).filter('caseRank').value()
      _.forIn(tempList, condition=>{
        this.$set(
          condition,
          'visible',
          _.every(condition.condition, innerCd=>{
            let foundMap = _.find(this.simpleCaseConditionList.concat(tempList), {id: innerCd.id})
            if (foundMap) {
              if (foundMap.cat == 'single' || (foundMap.cat == 'afterward' && foundMap.aftercat == 'single') ){
                if (innerCd.logic == 'yes') {
                  // console.log('single,yes', _.some(innerCd.value, e=>foundMap.value == e))
                  return _.some(innerCd.value, e=>foundMap.value == e)
                } else if (innerCd.logic == 'no') {
                  // console.log('single,no', !_.some(innerCd.value, e=>foundMap.value == e))
                  return !_.some(innerCd.value, e=>foundMap.value == e)
                }
              } else if (foundMap.cat == 'multiple' || (foundMap.cat == 'afterward' && foundMap.aftercat == 'multiple') ) {
                if (innerCd.logic == 'yes') {
                  if (innerCd.valueLogic == 'and') {
                    // console.log('multiple,yes,and', _.difference(innerCd.value, foundMap.value).length == 0)
                    return _.difference(innerCd.value, foundMap.value).length == 0
                  } else if (innerCd.valueLogic == 'or') {
                    // console.log('multiple,yes,or', _.uniq(innerCd.value.concat(foundMap.value)).length < innerCd.value.length + foundMap.value.length)
                    return _.uniq(innerCd.value.concat(foundMap.value)).length < innerCd.value.concat(foundMap.value).length
                  }
                } else if (innerCd.logic == 'no') {
                  if (innerCd.valueLogic == 'and') {
                    // console.log('multiple,no,and', _.difference(innerCd.value, foundMap.value).length > 0)
                    return _.difference(innerCd.value, foundMap.value).length > 0
                  } else if (innerCd.valueLogic == 'or') {
                    // console.log('multiple,no,or', !(_.difference(innerCd.value, foundMap.value).length == 0))
                    return !(_.difference(innerCd.value, foundMap.value).length == 0)
                  }
                }
              }
            } else {
              return false
            }
          })
        )
      })
      return _.sortBy(tempList, 'rank')
    }
  },
  mounted () {
    this.loadConditionList()
  },
  methods: {
    loadExistCaseData () {
      this.loadExistCaseDataLoading = true
      return this.$http.post('/data/getCaseData', {
        caseNumber: this.caseNumber,
        list: ['caseCondition', 'caseTestitem']
      })
      .then(({data: {result}})=>{
        if (_.isArray(result.caseTestitem) && !_.isEmpty(result.caseTestitem)) {
          this.caseTestitemList = result.caseTestitem
        }
        _.forIn(result.caseCondition['simpleCaseConditionList'], condition=>{
          this.$set(_.find(this.simpleCaseConditionList, {id: condition.id}), 'value', condition.value)
        })
        _.forIn(result.caseCondition['afterwardCaseConditionList'], condition=>{
          this.$set(_.find(this.afterwardCaseConditionList, {id: condition.id}), 'value', condition.value)
        })
      })
      .finally(()=>{
        this.loadExistCaseDataLoading = false
      })
    },
    loadCaseTestitem () {
      this.loadOTSTestitemLoading = true
      $.ajax({
        type: 'POST',
        url: 'http://10.168.128.44/OTS_UAT/Services/CaseService.asmx/GetTestItemListByCaseNumber',
        data: {CaseNumber: this.caseNumber}
      })
      .done(res=>{
        this.caseTestitemList = JSON.parse($(res).find('string').html())
        _.forIn(this.caseTestitemList, testitem=>{
          this.$set(testitem, 'selected', true)
          this.$set(testitem, 'isIndTest', false)
        })
        this.caseTestitemList = _.sortBy(this.caseTestitemList, 'JobNumber')
        this.$http.post('/data/getRegulation', {
          idList: this.caseTestitemList.map(e=>e.TestItemID.toString())
        })
        .then(({data})=>{
          _.forIn(this.caseTestitemList, testitem=>{
            let foundRegulation = _.find(data.regulationList, {code: testitem.TestItemID.toString()})
            if (foundRegulation) {
              this.$set(testitem, 'regulation', foundRegulation)
            } else {
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
        this.$message({type: 'success', message: '保存成功'})
      })
    },
    toNextPage () {
      this.$router.push('/point-list')
    },
  }
}
</script>

<style lang="stylus" scoped>
.form-line
  margin: 2px 1px
  width: -webkit-fill-available
.case-testitem
  height: calc(100vh - 4em)
.testitem-import-button
  text-align: right
  margin-right: 2px
.case-condition
  height: calc(100vh - 5em)
.testitem-card, .condition-card
  margin: 6px 4px
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
.bottom-function-btn .bigicon [class^="el-third-icon"]
  font-size: 25px
</style>
