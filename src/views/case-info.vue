<template>
  <el-container>
    <BaseHeader activeIndex="case-info"/>
    <div style="width:100vw;">
      <el-row>
        <el-col :span="8" style="border-right: solid 1px lightgrey;">
          <el-input v-model="caseNumber" class="form-line">
            <template #prepend>Case No.</template>
            <template #append>
              <el-button type="primary" @click="loadCaseTestitem" :loading="loadButtonLoading">载入</el-button>
            </template>
          </el-input>
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
        <el-col :span="16"></el-col>
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
      loadButtonLoading: false,
      selectedTestitemList: {}
    }
  },
  computed: {
    caseNumber: geneVuexValue('caseNumber'),
    caseTestitemList: geneVuexValue('caseTestitemList')
  },
  mounted () {

  },
  methods: {
    loadCaseTestitem () {
      this.loadButtonLoading = true
      $.ajax({
        type:'POST',
        url:'http://10.168.128.44/OTS_UAT/Services/CaseService.asmx/GetTestItemListByCaseNumber',
        data:{CaseNumber: this.caseNumber}
      })
      .done(res=>{
          this.caseTestitemList = JSON.parse($(res).find('string').html())
          _.forIn(this.caseTestitemList, testitem=>{
            this.$set(testitem, 'selected', true)
            this.$set(testitem, 'isIndTest', false)
        })
      })
      .always(()=>{
        this.loadButtonLoading = false
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.form-line
  margin: 2px 1px
  width: -webkit-fill-available
.case-testitem
  height: calc(100vh - 44px)
.testitem-card
  margin: 10px 4px
  
</style>

<style lang="stylus">
.testitem-card .el-card__header
  padding: 10px
.testitem-card .el-card__body
  padding: 10px
</style>
