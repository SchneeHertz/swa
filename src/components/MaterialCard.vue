<template>
  <div class="material-card" 
    :class="[shadow ? 'is-' + shadow + '-shadow' : 'is-always-shadow']"
    :style="{width: width}"
  >
    <div class="material-card__header">
      <span>{{data.name}}</span>
      <slot name="header"></slot>
      <el-button style="float: right; margin: -3px 0px" type="danger" size="mini">删除</el-button>
      <el-button style="float: right; margin: -3px 18px" type="primary" size="mini">编辑</el-button>
    </div>
    <div class="material-card__body">
      
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MaterialCard',
  props: {
    shadow: String,
    width: {
      type: String,
      default: ()=>'48%'
    },
    data: {
      type: Object,
      default: ()=>{return {}}
    }
  }
}
</script>

<style lang="stylus" scoped>
.material-card
  display: inline-block
  margin: 4px
  border-radius: 4px
  border: 1px solid #EBEEF5
  background-color: #fff
  overflow: hidden
  color: #303133
  transition: 0.3s
.is-always-shadow, .is-hover-shadow:focus, .is-hover-shadow:hover
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1)
.material-card__header
  padding: 8px 16px
  border-bottom: 1px solid #EBEEF5
  box-sizing: border-box
.material-card__body
  padding: 8px 16px
</style>

<style lang="stylus">

</style>