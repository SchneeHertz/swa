<template>
  <el-container class="test-arrange-page">
    <BaseHeader activeIndex="test-arrange"/>
    <div style="height:100vh;width:100vw;">
      <el-row>
        <el-col :span="4" style="height:100vh; border-right: solid 1px lightgrey;">
          <draggable
            class="point-list-group"
            :group="{ name: 'point', pull: 'clone', put: false }"
            :clone="clonePoint"
            v-model="pointList"
            v-bind="dragOptions"
            @start="drag = true"
            @end="drag = false"
          >
            <transition-group type="transition" :name="!drag ? 'flip-list' : null">
              <div 
                v-for="point in pointList"
                :key="point.id"
                class="point-list-item"
              >
                {{point.englishDescription}}
              </div>
            </transition-group>
          </draggable>
        </el-col>
        <el-col :span="14" style="height:100vh; border-right: solid 1px lightgrey;">
          <el-card
            class="group-card"
            v-for="group in pointGroupList"
            :key="group.id"
          >
            <group-nest v-model="group.list" />
          </el-card>
        </el-col>
        <el-col :span="6"><div style="height:100vh;"></div></el-col>
      </el-row>
    </div>
  </el-container>
</template>

<script>

import BaseHeader from '@/components/BaseHeader.vue'
import GroupNest from '@/components/GroupNest.vue'
import draggable from 'vuedraggable'

function geneVuexValue (property) {
  return {
    get () { return this.$store.state[property] },
    set (newVal) { this.$store.commit('updateValue', {key: property, value: newVal}) }
  }
}

export default {
  name: 'TestArrange',
  display: "Transitions",
  components: {
    BaseHeader,
    GroupNest,
    draggable
  },
  data () {
    return {
      pointGroupList: [{
        "id": 1,
        "list": []
      }],
      dragOptions: {
        animation: 200,
        disabled: false,
        ghostClass: "ghost"
      },
      drag: false
    }
  },
  computed: {
    pointList: geneVuexValue('valueList'),
    pointRelation: geneVuexValue('konvaRelation'),
    caseNumber: geneVuexValue('caseNumber'),
    caseTestitemList: geneVuexValue('caseTestitemList'),
  },
  mounted () {

  },
  methods: {
    clonePoint (point) {
      return _.merge(_.cloneDeep(point), {elements: []})
    }
  }
}
</script>

<style lang="stylus" scoped>
.flip-list-move
  transition: transform 0.5s
.no-move
  transition: transform 0s
.ghost
  opacity: 0.5
  background: #ffffff
</style>

<style lang="stylus">
.test-arrange-page
  .point-list-item
    margin: 0
    padding: 10px 8px
    border: solid 1px rgba(0,0,0,0.125)
    border-right-width: 0
  .point-list-item+.point-list-item
    border-top-width: 0
  .group-card  
    width: 48%

</style>