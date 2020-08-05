<template>
  <el-container class="user-manage">
    <BaseHeader activeIndex="user-manage"/>
    <el-main></el-main>
  </el-container>
</template>

<script>
import BaseHeader from '@/components/BaseHeader.vue'

export default {
  name: 'UserManage',
  components: {
    BaseHeader,
  },
}
</script>

<style lang="stylus" scoped>

</style>