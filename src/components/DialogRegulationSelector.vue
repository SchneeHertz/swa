<template>
  <div class="dialog-regulation"
    :style="{width: width}"
  >
    <div class="dialog-regulation__header">
      <span>{{data.name}}</span>
      <slot name="header"></slot>
    </div>
    <div class="dialog-regulation__body">
      <el-switch
        v-for="regulation in data.regulationList"
        :key="regulation.id + regulation.method.id + regulation.method.group"
        class="regulation-switch"
        v-model="regulation.method.defaultTest"
        :active-text="regulation.grouped ? `${regulation.name} - ${regulation.method.name}` : regulation.name"
      ></el-switch>
      <el-divider v-if="showDivider"></el-divider>
      <el-tooltip effect="dark" content="开启即代替默认测试项目" placement="top">
        <el-switch
          v-for="regulation in data.regulationListForClient"
          :key="regulation.id"
          class="regulation-switch"
          v-model="regulation.switchTo"
          :active-text="`${regulation.client.join(',')} - ${regulation.name}`"
        ></el-switch>
      </el-tooltip>
      <slot></slot>
    </div>
  </div>
</template>

<script>

export default {
  name: 'RegulationTask',
  components: {
  },
  props: {
    width: String,
    data: {
      type: Object,
      default: ()=>({})
    }
  },
  computed: {
    showDivider () {
      return !_.isEmpty(this.data.regulationListForClient)
    }
  },
  methods:{
  }
}
</script>

<style lang="stylus" scoped>
.dialog-regulation
  display: inline-block
  margin: 2px
  border-radius: 4px
  border: 2px solid rgba(0,0,0,0.125)
  transition: 0.3s
.dialog-regulation__header
  padding:  4px
  border-bottom: 1px solid #dddddd
  box-sizing: border-box
  font-size: 15px
  background-color: #f6f6f6
.dialog-regulation__body
  padding: 6px
.regulation-switch
  width: 100%
  margin: 4px 0
</style>

<style lang="stylus">
.dialog-regulation__body
  .el-switch__core
    min-width: 40px
  .el-divider
    margin: 10px 0
  .el-switch
    height: auto
    line-height: normal
  .el-switch__label
    height: auto
</style>