<template>
  <draggable
    :group="{name: 'point'}"
    v-bind="dragOptions"
    tag="div"
    class="item-container"
    :list="list"
    :value="value"
    @input="emitter"
  >
    <div class="item-group" :key="el.id" v-for="(el, index) in realValue">
      <div class="item">
        <div class="item-description">{{el.index}}. {{el.englishDescription}}</div>
        <el-button type="text" class="close-circle-button" icon="el-third-icon-close" @click="removePoint(realValue, index)" plain />
      </div>
      <group-nest class="item-sub" :list="el.elements" />
    </div>
  </draggable>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: "group-nest",
  components: {
    draggable
  },
  props: {
    value: {
      required: false,
      type: Array,
      default: null
    },
    list: {
      required: false,
      type: Array,
      default: null
    }
  },
  computed: {
    dragOptions() {
      return {
        animation: 0,
        disabled: false,
        ghostClass: "ghost"
      }
    },
    realValue() {
      return this.value ? this.value : this.list
    }
  },
  methods: {
    emitter(value) {
      this.$emit("input", value)
    },
    removePoint (list, index) {
      list.splice(index, 1)
    }
  }
}
</script>

<style lang="stylus" scoped>
.ghost
  opacity: 0.5
.close-circle-button
  padding: 1px
  margin: -2px -2px
  float: right
</style>

<style lang="stylus">
.item-container:not(.item-sub)
  min-height: 2em
.item-container
  .item-container
    max-width: 20em
  .item
    font-size: 15px
    padding: 6px
    margin: 1px 0
    border: solid 1px rgba(0,0,0,0.125)
    background-color: #f5f5f5
    border-radius: 4px
    cursor: move
    .item-description
      width: calc(100% - 22px)
      display: inline-block
  .item-sub 
    margin: 0 0 0 2em
.item-group+.item-group
  margin-top: 4px
</style>