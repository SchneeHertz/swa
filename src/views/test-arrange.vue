<template>
  <el-container>
    <BaseHeader activeIndex="test-arrange"/>
    <div style="height:100vh;width:100vw;"></div>
  </el-container>
</template>

<script>

import BaseHeader from '@/components/BaseHeader.vue'

export default {
  name: 'TestArrange',
  components: {
    BaseHeader
  },
  data () {
    return {
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
