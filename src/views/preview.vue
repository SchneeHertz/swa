<template>
<el-container class="preview-page">
  <BaseHeader activeIndex="preview"/>
  <el-main>
    <el-row>
      <el-col :span="6" style="height:100vh;border-right: solid 1px lightgrey">
        <el-input v-model="caseNumber" class="case-number" size="small">
          <template #prepend>Case:</template>
        </el-input>
      </el-col>
      <el-col :span="13" style="height:100vh;border-right: solid 1px lightgrey"></el-col>
    </el-row>
  </el-main>
</el-container>
</template>

<script>
import BaseHeader from '@/components/BaseHeader.vue'

import {generate as _id } from 'shortid'

function geneVuexValue (property) {
  return {
    get () { return this.$store.state[property] },
    set (newVal) { this.$store.commit('updateValue', {key: property, value: newVal}) }
  }
}
export default {
  name: 'Preview',
  components: {
    BaseHeader
  },
  data () {
    return {

    }
  },
  computed: {
    caseNumber: geneVuexValue('caseNumber'),
    methodBaseData: geneVuexValue('methodBaseData'),

  },
  mounted () {
    if (this.caseNumber && _.isEmpty(this.methodBaseData)) {
      this.loadTasklist()
    }
    window.resolvePointTree = this.resolvePointTree
  },
  methods: {
    loadTasklist () {
      return this.$http.post('/data/getCaseData', {
        caseNumber: this.caseNumber,
        list: ['methodBaseData']
      })
      .then(({data: {result}})=>{
        if (_.isArray(result.methodBaseData) && !_.isEmpty(result.methodBaseData)) {
          this.methodBaseData = result.methodBaseData
        }
      })
    },
    genePreviewList () {
      _.forIn(this.methodBaseData, methodGroup=>{
        let mainGroupList = []
        _.forIn(methodGroup.list, group=>{
          let pointList = []
          _.forIn(group.list, point=>{
            pointList.push(
              _.mergeWith(_.flattenDeep(this.resolvePointTree(point)), (obj, src)=>{
                return {
                  englishDescription: obj.englishDescription + ' w/ ' + src.englishDescription,
                  chineseDescription: obj.chineseDescription + ' w/ ' + src.chineseDescription
                }
              })
            )
          })
          _.mergeWith(pointList, (obj, src)=>{
            return {
              englishDescription: obj.englishDescription + ' + ' + src.englishDescription,
              chineseDescription: obj.chineseDescription + ' + ' + src.chineseDescription
            }
          })
        })
        _.forIn(methodGroup.regulationList, regulation=>{

        })
      })
    },
    resolvePointTree (point) {
      let innerArray = []
      if (!_.isEmpty(point.elements)) {
        _.forIn(point.elements, innerPoint=>{
          innerArray.push(this.resolvePointTree(innerPoint))
        })
      }
      return [{englishDescription: point.englishDescription, chineseDescription: point.chineseDescription}, innerArray]
    }
  }
  
}
</script>

<style lang="stylus" scoped>
.el-main
  padding: 0
</style>