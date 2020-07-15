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
      <div class="item">{{ el.englishDescription }}<el-button icon="el-icon-close" @click="removePoint(realValue, index)"/></div>
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
        group: "description",
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

<style lang="stylus">
.item-container
  .item-container {
    max-width: 20rem;
    margin: 0;
  }
  .item {
    padding: 1rem;
    border: solid 1px rgba(0,0,0,0.125);
    background-color: #fefefe;
  }
  .item-sub {
    margin: 0 0 0 1rem;
  }
</style>