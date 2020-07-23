<template>
  <div 
    class="inner-method-card component-card" 
    :class="[shadow ? 'is-' + shadow + '-shadow' : 'is-always-shadow']"
    :style="{width: width}"
  >
    <div class="inner-method-card__header">
      <div class="header-title">
      <span>{{methodData.name}}</span>
        <slot name="header"></slot>
        <span class="modify-remark" v-if="data.modify === 'add'">(新增)</span>
        <span class="modify-remark" v-if="data.modify === 'modify'">(已修改)</span>
        <span class="modify-remark" v-if="data.modify === 'delete'">(将要删除)</span>
      </div>
      <el-button-group class="header-button-group">
        <el-button type="primary" size="mini" icon="el-icon-edit" @click="modifyMethod"></el-button>
        <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteMethod"></el-button>
      </el-button-group>
    </div>
    <div class="inner-method-card__body">
      <div class="card-line">
        <label class="card-label">描述: <span>{{methodData.description}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">OTS编号: <span>{{methodData.code}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">Mix数: <span>{{data.maxMix}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">分组: <span>{{data.group}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">默认测试: <span>{{data.defaultTest ? '是' : '否'}}</span></label>
      </div>
      <div
        v-for="condition in methodData.condition"
        :key="condition.id"
        class="frame-condition-display"
      >
        <div class="card-line">
          <label class="card-label">条件判断: <span>{{condition.logic}}</span></label>
        </div>
        <div class="card-line">
          <label class="card-label">条件名: <span>{{conditionOptionList[condition.id] ? conditionOptionList[condition.id].name : '已删除的条件'}}</span></label>
        </div>
        <div class="card-line">
          <label class="card-label">逻辑关系: <span>{{condition.valueLogic}}</span></label>
        </div>
        <div class="card-line">
          <label class="card-label">值: <span>{{condition.value.join(', ')}}</span></label>
        </div>
      </div>
    </div>
    <el-dialog
      title="编辑方法"
      :visible.sync="dialogVisible"
      width="30%"
      top="10vh"
      class="edit-dialog"
    >
      <NameFormItem class="card-line" prependWidth="60px">
        <template #prepend>Mix数</template>
        <template #default>
          <el-input-number v-model="dialogData.maxMix" :precision="0" :step="1" :max="20" :min="1"/>
        </template>
      </NameFormItem>
      <NameFormItem class="card-line" prependWidth="60px">
        <template #prepend>分组</template>
        <template #default>
          <el-input-number v-model="dialogData.group" :precision="0" :step="1" :max="20" :min="1"/>
        </template>
      </NameFormItem>
      <NameFormItem class="card-line" prependWidth="60px">
        <template #prepend>默认测试</template>
        <template #default>
          <el-select v-model="dialogData.defaultTest">
            <el-option :value="true" label="是"></el-option>
            <el-option :value="false" label="否"></el-option>
          </el-select>
        </template>
      </NameFormItem>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import NameFormItem from '@/components/NameFormItem.vue'

export default {
  name: 'MethodCard',
  components: {
    NameFormItem
  },
  props: {
    shadow: String,
    width: {
      type: String,
      default: ()=>'48%'
    },
    data: {
      type: Object,
      default: ()=>({})
    },
    methodList: Array,
    conditionOptionList: Object
  },
  data () {
    return {
      dialogVisible: false,
      dialogData: {}
    }
  },
  computed: {
    methodData () {
      return _.find(this.methodList, {id: this.data.id})
    }
  },
  methods: {
    displayLine (property) {
      if (_.isArray(this.data[property])) {
        return this.data[property].join(', ')
      } else if (_.isString(this.data[property]) || _.isNumber(this.data[property])) {
        return this.data[property]
      }
    },
    modifyMethod () {
      this.dialogData = _.cloneDeep(this.data)
      this.dialogVisible = true
    },
    confirmEdit () {
      _.assign(this.data, this.dialogData, {modify: 'modify'})
      this.$emit('method-change')
      this.dialogVisible = false
    },
    deleteMethod () {
      switch (this.data.modify){
        case 'delete':
          this.$set(this.data, 'modify', undefined)
          break
        default:
          this.$set(this.data, 'modify', 'delete')
          this.$emit('delete-method')
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.inner-method-card
  display: inline-block
  margin: 4px
  border-radius: 4px
  border: 1px solid #EBEEF5
  overflow: hidden
  color: #303133
  transition: 0.3s
.is-always-shadow, .is-hover-shadow:focus, .is-hover-shadow:hover
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1)
.inner-method-card__header
  padding: 12px 16px
  border-bottom: 1px solid #EBEEF5
  box-sizing: border-box
.header-button-group
  float: right
  margin: -4px 0
.inner-method-card__header .header-title
  width: 67%
  display: inline-block
.modify-remark
  color: red
.inner-method-card__body
  padding: 8px 16px
.card-line
  margin: 6px 0
.card-label
  color: grey
.card-label span 
  color #2c3e50
.frame-condition-display
  border: solid 1px #DCDFE6
  border-radius: 4px
  padding: 2px 8px
  margin: 2px 0
</style>

<style lang="stylus">
.inner-method-card .card-line .el-input-group__prepend
  text-align: center
  min-width: 60px
</style>