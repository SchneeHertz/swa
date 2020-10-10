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
    <div class="item-group" :key="el.id" v-for="(el, index) in realValue" @dblclick.stop="handleDbClick(el.id)">
      <div class="item">
        <div class="item-description">{{el.index}}. {{language ? el[language] : el.englishDescription}} {{el.style ? el.style.length > 0 ? `(${el.style.join(', ')})` : '' : ''}}</div>
        <el-button type="text" class="close-circle-button" icon="el-third-icon-close" @click="removePoint(realValue, index)" plain />
      </div>
      <group-nest class="item-sub" :sub="true" :list="el.elements" :language="language" @dbl-children="handleDblChildren"/>
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
    },
    language: String,
    sub: {
      required: false,
      type: Boolean,
      default: false
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
    },
    handleDbClick (id) {
      if (this.sub) {
        this.$emit('dbl-children', id)
      } else {
        let findGroup = _.findIndex(this.realValue, {id: id})
        if (findGroup > 0) {
          let group = this.realValue.splice(findGroup, 1)
          this.realValue[findGroup - 1].elements.push(...group)
        }
      }
    },
    handleDblChildren (id) {
      _.forIn(this.realValue, (group, index)=>{
        let findElement = _.findIndex(group.elements, {id: id})
        if (findElement != -1) {
          let element = group.elements.splice(findElement, 1)
          this.realValue.splice(+ index + 1, 0, ...element)
          return false
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.ghost
  opacity: 0.5
.close-circle-button
  padding: 2px
  margin: -1px -2px
  float: right
</style>

<style lang="stylus">
.item-container:not(.item-sub)
  min-height: 2em
.item-container
  // .item-container
  //   max-width: 20em
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
</style>