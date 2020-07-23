<template>
  <div class="regulation-task-card"
    :style="{width: width}"
    :class="{selected: selected}"
    @click="$emit('regulation-select')"
  >
    <div class="regulation-task-card__header">
      <span>{{data.name}}</span>
      <slot name="header"></slot>
    </div>
    <div class="regulation-task-card__body">
      <el-select
        class="group-select"
        size="mini"
        v-model="data.list"
        multiple
      >
        <el-option
          v-for="group in pointGroupList"
          :key="group.id"
          :value="group.id"
          :label="group.index"
        ></el-option>
      </el-select>
      <el-button-group class="function-button-group">
        <el-button size="mini" @click="selectAll">全选</el-button>
        <el-button size="mini" @click="selectNone">清空</el-button>
      </el-button-group>
      <el-switch
        class="share-switch"
        v-model="data.shareSolution"
        active-text="share"
      ></el-switch>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import NameFormItem from '@/components/NameFormItem.vue'

export default {
  name: 'RegulationTask',
  components: {
    NameFormItem
  },
  props: {
    width: String,
    data: {
      type: Object,
      default: ()=>({})
    },
    pointGroupList: Array,
    selected: Boolean
  },
  methods:{
    selectAll () {
      this.data.list = this.pointGroupList.map(e=>e.id)
    },
    selectNone () {
      this.data.list = []
    }
  }
}
</script>

<style lang="stylus" scoped>
.regulation-task-card
  display: inline-block
  margin: 2px
  border-radius: 4px
  border: 2px solid rgba(0,0,0,0.125)
  overflow: hidden
  transition: 0.3s
.regulation-task-card.selected
  border: 2px solid #FFCC66
.regulation-task-card__header
  padding:  4px
  border-bottom: 1px solid #dddddd
  box-sizing: border-box
  font-size: 14px
  background-color: #f6f6f6
  cursor: move
.regulation-task-card__body
  padding: 6px
.group-select
  width:100%
.function-button-group
  margin-top: 1px
.share-switch
  margin-top: 5px
  float: right
</style>