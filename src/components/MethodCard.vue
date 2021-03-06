<template>
  <div 
    class="method-card component-card" 
    :class="[shadow ? 'is-' + shadow + '-shadow' : 'is-always-shadow']"
    :style="{width: width}"
  >
    <div class="method-card__header">
      <div class="header-title">
      <span>{{data.name}}</span>
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
    <div class="method-card__body">
      <div class="card-line">
        <label class="card-label">id: <span>{{data.id}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">描述: <span>{{data.description}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">OTS编号: <span>{{data.code}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">共溶液组: <span>{{data.methodGroup}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">共溶液组内排序: <span>{{data.methodGroupRank}}</span></label>
      </div>
      <slot :data="data"></slot>
      <div
        v-for="condition in data.condition"
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
      width="75%"
      top="10vh"
      class="edit-dialog"
      :close-on-click-modal="false"
    >
      <el-input
        v-model="dialogData.name"
        class="card-line"
      >
        <template #prepend>方法名</template>
      </el-input>
      <el-input
        v-model="dialogData.description"
        class="card-line"
      >
        <template #prepend>描述</template>
      </el-input>
      <el-input
        v-model="dialogData.code"
        class="card-line"
      >
        <template #prepend>OTS编号</template>
      </el-input>
      <NameFormItem class="card-line" prependWidth="100px">
        <template #prepend>共溶液组</template>
        <template #default>
          <el-select
            v-model="dialogData.methodGroup"
            allow-create
            filterable
          >
            <el-option
              v-for="op in methodGroupList"
              :key="op"
              :value="op"
            ></el-option>
          </el-select>
        </template>
      </NameFormItem>
      <el-input
        v-model.number="dialogData.methodGroupRank"
        class="card-line"
      >
        <template #prepend>共溶液组内排序</template>
      </el-input>
      <slot name="edit-area" :dialogData="dialogData"></slot>
      <div class="frame-condition">
        <InnerConditionCard
          v-for="(condition, index) in dialogData.condition"
          :key="condition.id"
          width="48%"
          :data="condition"
          :option="conditionOptionList[condition.id]"
          @delete-point="removeCondition(index)"
        ></InnerConditionCard>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" @click="addCondition">添加条件</el-button>
        <el-button type="info" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">确定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="添加条件"
      :visible.sync="dialogConditionVisible"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-select
        v-model="dialogConditionId"
        class="dialog-add-condition"
      >
        <el-option
          v-for="condition in conditionOptionList"
          :key="condition.id"
          :label="`${condition.name} (${condition.cat})`"
          :value="condition.id"
        ></el-option>
      </el-select>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="dialogConditionVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAddCondition">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import NameFormItem from '@/components/NameFormItem.vue'
import InnerConditionCard from '@/components/InnerConditionCard.vue'

export default {
  name: 'MethodCard',
  components: {
    NameFormItem,
    InnerConditionCard
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
    conditionOptionList: Object,
    methodGroupList: {
      type: Array,
      default: ()=>[]
    }
  },
  data () {
    return {
      dialogVisible: false,
      dialogData: {},
      dialogConditionVisible: false,
      dialogConditionId: undefined
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
    addCondition () {
      this.dialogConditionId = undefined
      this.dialogConditionVisible = true
    },
    confirmAddCondition () {
      this.dialogData.condition.push({
        id: this.dialogConditionId,
        logic: 'yes',
        valueLogic: 'or',
        value: []
      })
      this.dialogConditionVisible = false
    },
    removeCondition (index) {
      this.dialogData.condition.splice(index, 1)
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
.method-card
  display: inline-block
  margin: 4px
  border-radius: 4px
  border: 1px solid #EBEEF5
  overflow: hidden
  color: #303133
  transition: 0.3s
.is-always-shadow, .is-hover-shadow:focus, .is-hover-shadow:hover
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1)
.method-card__header
  padding: 12px 16px
  border-bottom: 1px solid #EBEEF5
  box-sizing: border-box
.header-button-group
  float: right
  margin: -4px 0
.method-card__header .header-title
  width: 67%
  display: inline-block
.modify-remark
  color: red
.method-card__body
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
.frame-condition
  width: 100%
  min-height: 20vh
  max-height: 45vh
  overflow: auto
  border: solid 1px #DCDFE6
  border-radius: 4px
.dialog-add-condition
  width:100%
</style>

<style lang="stylus">
.method-card .card-line .el-input-group__prepend
  text-align: center
  min-width: 100px
</style>