<template>
  <div class="point-card component-card" 
    :class="[shadow ? 'is-' + shadow + '-shadow' : 'is-always-shadow', {'select-point-card': isSelected}]"
    :style="{width: width}"
  >
    <div
      class="point-card__header"
      @click="handlePointCard($event)"
    >
      <slot name="header"></slot>
      <div class="mini-circle-btn">
        <el-button type="success" icon="el-third-icon-file-copy" circle plain></el-button>
        <el-button type="danger" icon="el-third-icon-close" circle @click="handleDeleteButton" plain></el-button>
      </div>
    </div>
    <div class="point-card__body">
      <el-input
        type="textarea"
        placeholder="英文描述"
        class="point-description"
        v-model="data['englishDescription']"
        :autosize="{ minRows: 2, maxRows: 4}"
        @focus="$emit('focus-point')"
        @blur="$emit('blur-point')"
        :id="`input-${data.id}`"
      ></el-input>
      <el-input
        type="textarea"
        placeholder="中文描述"
        class="point-description"
        v-model="data['chineseDescription']"
        :autosize="{minRows: 2, maxRows: 4}"
        @focus="$emit('focus-point')"
        @blur="$emit('blur-point')"
      ></el-input>
      <NameFormItem class="point-option"
        v-for="indForm in simpleConditionList"
        :key="indForm.id"
      >
        <template #prepend>{{indForm.name}}</template>
        <template #default>
          <el-select
            v-model="data.condition[indForm.id]"
            filterable
            default-first-option
            @focus="$emit('focus-point')"
            @blur="$emit('blur-point')"
            size="mini"
            :multiple="indForm.cat == 'multiple'"
          >
            <el-option
              v-for="op in indForm.list"
              :key="op.value"
              :label="op.value"
              :value="op.value"
              :title="op.remark"
            ></el-option>
          </el-select>
        </template>
      </NameFormItem>
      <NameFormItem class="point-option"
        v-for="indForm in displayAfterwardConditionList"
        :key="indForm.id"
      >
        <template #prepend>{{indForm.name}}</template>
        <template #default>
          <el-select
            v-model="data.condition[indForm.id]"
            filterable
            default-first-option
            @focus="$emit('focus-point')"
            @blur="$emit('blur-point')"
            size="mini"
            :multiple="indForm.cat == 'multiple'"
          >
            <el-option
              v-for="op in indForm.list"
              :key="op.value"
              :label="op.value"
              :value="op.value"
              :title="op.remark"
            ></el-option>
          </el-select>
        </template>
      </NameFormItem>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import NameFormItem from '@/components/NameFormItem.vue'

export default {
  name: 'PointCard',
  components: {
    NameFormItem
  },
  props: {
    shadow: String,
    width: String,
    simpleConditionList: Array,
    afterwardConditionList: Array,
    testitemIdList: Array,
    focusId: String,
    data: {
      type: Object,
      default: ()=>({})
    },
    isSelected: Boolean,
    materialObj: Object,
  },
  data () {
    return {
      conditionVisible: {}
    }
  },
  computed: {
    materialCondition () {
      let materialValArray = []
      _.forIn(_.get(this.data, 'condition.material', []), material=>{
        let materialData = _.find(this.materialObj.material, {name: material})
        let mtempObj = {}
        _.forIn(materialData, (valArray, key)=>{
          let found = _.find(this.materialObj.materialCondition, {property: key})
          if (found) {
            mtempObj[found.id] = valArray
          }
        })
        materialValArray.push(mtempObj)
      })
      let result =  _.mergeWith({}, ...materialValArray, (obj,src)=>{
        if (_.isArray(obj)) {
          return _.uniq(_.compact(obj.concat(src)))
        }
      })
      return result
    },
    displayAfterwardConditionList () {
      let tempList = []
      _.forIn(this.afterwardConditionList, condition=>{
        let isCheck = _.every(condition.condition, innerCd=>{
          switch(innerCd.id){
            case 'ictestitem':
              if (innerCd.logic == 'yes') {
                if (innerCd.valueLogic == 'and') {
                  return _.difference(innerCd.value, this.testitemIdList).length == 0
                } else if (innerCd.valueLogic == 'or') {
                  return _.uniq(innerCd.value.concat(this.testitemIdList)).length < _.uniq(innerCd.value).concat(_.uniq(this.testitemIdList)).length
                }
              } else if (innerCd.logic == 'no') {
                if (innerCd.valueLogic == 'and') {
                  return _.difference(innerCd.value, this.testitemIdList).length > 0
                } else if (innerCd.valueLogic == 'or') {
                  return !(_.difference(innerCd.value, this.testitemIdList).length == 0)
                }
              }
              break
            default:
              let pointValue = _.flatten([this.data.condition[innerCd.id] || this.materialCondition[innerCd.id]])
              if (innerCd.logic == 'yes') {
                if (innerCd.valueLogic == 'and') {
                  return _.difference(innerCd.value, pointValue).length == 0
                } else if (innerCd.valueLogic == 'or') {
                  return _.uniq(innerCd.value.concat(pointValue)).length < _.uniq(innerCd.value).concat(_.uniq(pointValue)).length
                }
              } else if (innerCd.logic == 'no') {
                if (innerCd.valueLogic == 'and') {
                  return _.difference(innerCd.value, pointValue).length > 0
                } else if (innerCd.valueLogic == 'or') {
                  return !(_.difference(innerCd.value, pointValue).length == 0)
                }
              }
              break
            }
        })
        if (isCheck) {
          tempList.push(condition)
        } else {
          // if (this.data.condition[condition.id] ) this.$set(this.data.condition, condition.id, undefined)
        }
      })
      return tempList
    },
  },
  methods:{
    handleDeleteButton () {
      this.$emit('delete-point')
    },
    handlePointCard (e) {
      if (e.target.classList.contains('point-card__header')){
        this.$emit('select-point')
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.point-card
  display: inline-block
  margin: 4px
  border-radius: 4px
  border: 1px solid #EBEEF5
  overflow: hidden
  color: #303133
  transition: 0.3s
.is-always-shadow, .is-hover-shadow:focus, .is-hover-shadow:hover
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1)
.select-point-card
  box-shadow: 0 2px 12px 0 rgba(0, 128, 255, 0.8)
.point-card__header
  padding: 8px 16px
  border-bottom: 1px solid #EBEEF5
  box-sizing: border-box
.mini-circle-btn
  float: right
  .el-button
    padding: 1px
    margin: 0 1px
.point-card__body
  padding: 8px 16px
.point-card__body .point-description, .point-card__body .point-option
  margin: 2px 0
</style>

<style lang="stylus">
.point-option .el-select--mini
  width: 100%
</style>