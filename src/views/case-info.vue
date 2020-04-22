<template>
  <el-container>
    <BaseHeader activeIndex="case-info" :isCollapse="isCollapse"/>
    <div style="height:100vh;width:100vw;"></div>
  </el-container>
</template>

<script>

import BaseHeader from '@/components/BaseHeader.vue'

export default {
  name: 'CaseInfo',
  components: {
    BaseHeader
  },
  data () {
    return {
      isCollapse: true,
      materialList: []
    }
  },
  mounted () {
    this.$http.get('/data/getMaterialList')
    .then(res=>{
      this.materialList = res.data.materialList
    })
  }
}
</script>
