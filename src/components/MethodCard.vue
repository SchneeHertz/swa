<template>
  <div class="method-card component-card" 
    :class="[shadow ? 'is-' + shadow + '-shadow' : 'is-always-shadow']"
    :style="{width: width}"
  >
    <div class="method-card__header">
      <span>{{data.name}}</span>
      <slot name="header"></slot>
      <span class="modify-remark" v-if="data.modify === 'add'">(新增)</span>
      <span class="modify-remark" v-if="data.modify === 'modify'">(已修改)</span>
      <span class="modify-remark" v-if="data.modify === 'delete'">(将要删除)</span>
      <el-button style="float: right; margin: -4px 0px" type="danger" size="mini" @click="deleteMethod">删除</el-button>
      <el-button style="float: right; margin: -4px 18px" type="primary" size="mini" @click="modifyMethod">编辑</el-button>
    </div>
    <div class="method-card__body">
      <div class="card-line">
        <label class="card-label">描述: <span>{{data.description}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">OTS编号: <span>{{data.code}}</span></label>
      </div>
      <div
        v-for="condition in data.condition"
        :key="condition.id"
        class="method-condition-display"
      >
        <div class="card-line">
          <label class="card-label">条件名: <span>{{conditionOptionList[condition.id].name}}</span></label>
        </div>
        <div class="card-line">
          <label class="card-label">逻辑关系: <span>{{condition.logic}}</span></label>
        </div>
        <div class="card-line">
          <label class="card-label">值: <span>{{condition.value.join(', ')}}</span></label>
        </div>
      </div>
      <slot></slot>
    </div>
    <el-dialog
      title="编辑方法"
      :visible.sync="dialogVisible"
      width="75%"
      top="10vh"
      class="edit-dialog"
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
      <div class="method-condition">
        <InnerConditionCard
          v-for="condition in dialogData.condition"
          :key="condition.id"
          width="48%"
          :data="condition"
          :option="conditionOptionList[condition.id]"
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
      default: ()=>{return {}}
    },
    conditionOptionList: Object
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
        value: []
      })
      this.dialogConditionVisible = false
    },
    confirmEdit () {
      _.assign(this.data, this.dialogData, {modify: 'modify'})
      this.dialogVisible = false
    },
    deleteMethod () {
      switch (this.data.modify){
        case 'delete':
          this.$set(this.data, 'modify', undefined)
          break
        default:
          this.$set(this.data, 'modify', 'delete')
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
  background-color: #fff
  overflow: hidden
  color: #303133
  transition: 0.3s
.is-always-shadow, .is-hover-shadow:focus, .is-hover-shadow:hover
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1)
.method-card__header
  padding: 12px 16px
  border-bottom: 1px solid #EBEEF5
  box-sizing: border-box
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
.method-condition-display
  border: solid 1px #DCDFE6
  border-radius: 4px
  padding: 2px 8px
  margin: 2px 0
.method-condition
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
  min-width: 60px
</style>