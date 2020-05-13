<template>
  <div>
    <div class="name-select__prepend" v-if="$slots.prepend">
      <slot name="prepend"></slot>
    </div>
    <div class="name-select__body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NameFormItem'
}
</script>

<style lang="stylus" scoped>
.name-select__prepend
  background-color: #F5F7FA
  color: #909399
  vertical-align: middle
  text-align: center
  display: table-cell
  position: relative
  border: 1px solid #DCDFE6
  border-radius: 4px
  border-right: 0
  border-top-right-radius: 0
  border-bottom-right-radius: 0
  padding: 0 20px
  min-width: 50px
  white-space: nowrap
.name-select__body
  display: table-cell
</style>