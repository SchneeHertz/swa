<template>
  <el-container>
    <BaseHeader activeIndex="test-arrange" :isCollapse="isCollapse"/>
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
