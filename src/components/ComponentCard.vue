<template>
  <div class="point-card component-card" 
    :class="[shadow ? 'is-' + shadow + '-shadow' : 'is-always-shadow']"
    :style="{width: width}"
  >
    <div class="point-card__header">
      <span class="title-index">{{data.index ? data.index: nextIndex}}</span>
      <el-select
        v-model="data.mainPart"
        placeholder=""
        size="mini"
        class="title-main-select"
        :disabled="!enableMainPartSelect"
      >
        <el-option label="" :value="undefined"></el-option>
        <el-option label="主体" value="main"></el-option>
      </el-select>
      <slot name="header"></slot>
      <div class="mini-circle-btn">
        <el-button type="success" icon="el-third-icon-file-copy" circle plain @click="handleCopyButton"></el-button>
        <el-button type="danger" icon="el-third-icon-close" circle @click="handleDeleteButton" plain></el-button>
      </div>
    </div>
    <div class="point-card__body">
      <overlay-scrollbars
        :options="{overflowBehavior: {x: 'hidden'}}"
        class="point-form-body"
      >
        <el-input
          type="textarea"
          placeholder="英文描述"
          class="point-description"
          v-model="data['englishDescription']"
          :autosize="{ minRows: 2, maxRows: 4}"
          :id="`input-${data.id}`"
          ref="pointDescriptionEnglish"
          @blur="fixAreaComplete"
        ></el-input>
        <el-input
          type="textarea"
          placeholder="中文描述"
          class="point-description"
          v-model="data['chineseDescription']"
          :autosize="{minRows: 2, maxRows: 4}"
        ></el-input>
        <NameFormItem class="point-option" prependWidth="4em" v-show="useStyle">
          <template #prepend>Style</template>
          <template #default>
            <el-select
              v-model="data['style']"
              allow-create
              filterable
              multiple
              size="mini"
            >
              <el-option
                v-for="op in styleList"
                :key="op"
                :value="op"
              ></el-option>
            </el-select>
          </template>
        </NameFormItem>
        <NameFormItem class="point-option"
          v-for="indForm in simpleConditionList"
          :key="indForm.id"
        >
          <template #prepend>{{indForm.name}}</template>
          <template #default>
            <el-select
              v-model="data.condition[indForm.id]"
              filterable
              size="mini"
              :multiple="indForm.cat == 'multiple'"
            >
              <el-tooltip 
                effect="dark"
                :content="op.remark"
                placement="right"
                v-for="op in indForm.list"
                :key="op.value"
                :open-delay="500"
              >
                <el-option
                  :label="op.value"
                  :value="op.value"
                ></el-option>
              </el-tooltip>
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
              size="mini"
              :multiple="indForm.cat == 'multiple'"
            >
              <el-tooltip 
                effect="dark"
                :content="op.remark"
                placement="right"
                v-for="op in indForm.list"
                :key="op.value"
                :open-delay="500"
              >
                <el-option
                  :label="op.value"
                  :value="op.value"
                ></el-option>
              </el-tooltip>
            </el-select>
          </template>
        </NameFormItem>
        <slot></slot>
      </overlay-scrollbars>
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
    data: {
      type: Object,
      default: ()=>({})
    },
    materialObj: Object,
    useStyle: Boolean,
    styleList: Array,
    wordList: Array,
    nextIndex: String,
    enableMainPartSelect: Boolean
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
            case 'icenglish':
              if (innerCd.logic == 'yes') {
                if (innerCd.valueLogic == 'and') {
                  return _.every(innerCd.value, (word)=>{ return (this.data.englishDescription + '').toLowerCase().includes(word.toLowerCase()) })
                } else if (innerCd.valueLogic == 'or') {
                  return _.some(innerCd.value, (word)=>{ return (this.data.englishDescription + '').toLowerCase().includes(word.toLowerCase()) })
                }
              } else if (innerCd.logic == 'no') {
                if (innerCd.valueLogic == 'and') {
                  return !_.every(innerCd.value, (word)=>{ return (this.data.englishDescription + '').toLowerCase().includes(word.toLowerCase()) })
                } else if (innerCd.valueLogic == 'or') {
                  return !_.some(innerCd.value, (word)=>{ return (this.data.englishDescription + '').toLowerCase().includes(word.toLowerCase()) })
                }
              }
              break
            case 'icchinese':
              if (innerCd.logic == 'yes') {
                if (innerCd.valueLogic == 'and') {
                  return _.every(innerCd.value, (word)=>{ return (this.data.chineseDescription + '').includes(word) })
                } else if (innerCd.valueLogic == 'or') {
                  return _.some(innerCd.value, (word)=>{ return (this.data.chineseDescription + '').includes(word) })
                }
              } else if (innerCd.logic == 'no') {
                if (innerCd.valueLogic == 'and') {
                  return !_.every(innerCd.value, (word)=>{ return (this.data.chineseDescription + '').includes(word) })
                } else if (innerCd.valueLogic == 'or') {
                  return !_.some(innerCd.value, (word)=>{ return (this.data.chineseDescription + '').includes(word) })
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
  mounted () {
    let that = this
    $(`#input-${that.data.id}`).areacomplete({
      wordCount: 1,
      mode: 'outer',
      on: {
        query (text, cb) {
          if(/[A-Z]/.test(text[0])){
            cb(_.filter(that.wordList, word=>word.toLowerCase().indexOf(text.toLowerCase()) == 0).map(word=>_.upperFirst(word)))
          } else {
            cb(_.filter(that.wordList, word=>word.toLowerCase().indexOf(text.toLowerCase()) == 0))
          }
        }
      }
    })
  },
  beforeDestroy () {
    $(`#input-${this.data.id}`).destroyAreacomplete(`input-${this.data.id}`)
  },
  methods:{
    handleDeleteButton () {
      this.$emit('delete-point')
    },
    handleCopyButton () {
      this.$emit('copy-point')
    },
    fixAreaComplete () {
      this.$set(this.data, 'englishDescription', _.upperFirst($(`#input-${this.data.id}`)[0].value))
    },
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
  white-space: normal
.is-always-shadow, .is-hover-shadow:focus, .is-hover-shadow:hover
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1)
.point-card__header
  padding: 4px 10px
  border-bottom: 1px solid #EBEEF5
  box-sizing: border-box
  .title-index
    margin-right: 10px
  .mini-circle-btn
    float: right
    margin: 4px 0
    .el-button
      padding: 1px
      margin: 0 1px
.point-card__body
  padding: 8px 16px
  .point-form-body
    height: 29vh
.point-card__body .point-description, .point-card__body .point-option
  margin: 2px 0
</style>

<style lang="stylus">
.point-option .el-select--mini
  width: 100%
</style>