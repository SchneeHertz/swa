<template>
  <el-container class="user-page">
    <BaseHeader activeIndex="user-page"/>
    <el-main></el-main>
  </el-container>
</template>

<script>
import BaseHeader from '@/components/BaseHeader.vue'

export default {
  name: 'UserPage',
  components: {
    BaseHeader,
  },
}
</script>

<style lang="stylus" scoped>

</style>