<template>
  <div 
    class="condition-card component-card" 
    :class="shadow ? 'is-' + shadow + '-shadow' : 'is-always-shadow'" 
    :style="{width: width}"
  >
    <div class="condition-card__header">
      <span>{{data.name}}</span>
      <slot name="header"></slot>
      <span class="modify-remark" v-if="data.modify === 'add'">(新增)</span>
      <span class="modify-remark" v-if="data.modify === 'modify'">(已修改)</span>
      <span class="modify-remark" v-if="data.modify === 'delete'">(将要删除)</span>
      <el-button-group class="header-button-group">
        <el-button type="primary" size="mini" icon="el-icon-edit" @click="modifyCondition"></el-button>
        <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteCondition"></el-button>
      </el-button-group>
    </div>
    <div class="condition-card__body">
      <div class="card-line">
        <label class="card-label">id: <span>{{data.id}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">描述: <span>{{data.description}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">排序: <span>{{data.rank}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">case级别: <span>{{data.caseRank ? '是' : '否'}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">单选/多选: <span>{{data.aftercat == 'single' ? '单选' : '多选'}}</span></label>
      </div>
      <div class="card-line" v-for="(answer, i) in data.list" :key="answer.value">
        <label class="card-label">选项{{i+1}}: <span>{{answer.value}}({{answer.remark}})</span></label>
      </div>
      <div
        v-for="condition in data.condition"
        :key="condition.id"
        class="frame-condition-display"
      >
        <div class="card-line">
          <label class="card-label">条件判断: <span>{{condition.logic}}</span></label>
        </div>
        <div class="card-line">
          <label class="card-label">条件名: <span>{{conditionOptionList[condition.id].name}}</span></label>
        </div>
        <div class="card-line">
          <label class="card-label">逻辑关系: <span>{{condition.valueLogic}}</span></label>
        </div>
        <div class="card-line">
          <label class="card-label">值: <span>{{condition.value.map(e=>method_regulationMap[e] ? method_regulationMap[e] : e ).join(', ')}}</span></label>
        </div>
      </div>
      <slot></slot>
    </div>
    <el-dialog
      title="编辑条件"
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
        <template #prepend>条件名</template>
      </el-input>
      <el-input
        v-model="dialogData.description"
        class="card-line"
      >
        <template #prepend>描述</template>
      </el-input>
      <NameFormItem class="card-line" prependWidth="60px">
        <template #prepend>排序</template>
        <template #default>
          <el-input-number v-model="dialogData.rank" />
        </template>
      </NameFormItem>
      <NameFormItem class="card-line" prependWidth="60px">
        <template #prepend>case级别</template>
        <template #default>
          <el-select v-model="dialogData.caseRank">
            <el-option label="是" :value="true"></el-option>
            <el-option label="否" :value="false"></el-option>
          </el-select>
        </template>
      </NameFormItem>
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
      <NameFormItem class="card-line" prependWidth="60px">
        <template #prepend>单选/多选</template>
        <template #default>
          <el-select v-model="dialogData.aftercat">
            <el-option value="single" label="单选"></el-option>
            <el-option value="multiple" label="多选"></el-option>
          </el-select>
        </template>
      </NameFormItem>
      <div class="card-line" v-for="(op, i) in dialogData.list" :key="i">
        <el-input v-model="op.value" placeholder="选项值">
          <template v-slot:prepend>选项{{i+1}}:</template>
        </el-input>
        <el-input v-model="op.remark" placeholder="选项说明"/>
        <el-button type="danger" @click="removeOption(i)">删除</el-button>
      </div>
      <div class="card-line">
        <el-button type="primary" size="mini" @click="addOption">增加一个选项</el-button>
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
  name: 'ConditionCardAfterward',
  components: {
    NameFormItem,
    InnerConditionCard
  },
  props: {
    shadow: String,
    width: String,
    data: {
      type: Object,
      default: ()=>{return {}}
    },
    conditionOptionList: Object,
    method_regulationMap: Object
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
    modifyCondition () {
      this.dialogData = _.cloneDeep(this.data)
      this.dialogVisible = true
    },
    addOption () {
      !_.isArray(this.dialogData.list) ? this.$set(this.dialogData, 'list', []) : ''
      this.dialogData.list.push({})
    },
    removeOption (i) {
      this.dialogData.list.splice(i, 1)
    },
    addCondition () {
      this.dialogConditionId = undefined
      this.dialogConditionVisible = true
    },
    confirmAddCondition () {
      !_.isArray(this.dialogData.condition) ? this.$set(this.dialogData, 'condition', []) : ''
      this.dialogData.condition.push({
        id: this.dialogConditionId,
        value: []
      })
      this.dialogConditionVisible = false
    },
    removeCondition (index) {
      this.dialogData.condition.splice(index, 1)
    },
    confirmEdit () {
      _.assign(this.data, this.dialogData, {modify: 'modify'})
      if (this.data.aftercat == 'multiple') {
        this.$set(this.data, 'value', [])
      } else {
        this.$set(this.data, 'value', undefined)
      }
      this.dialogVisible = false
    },
    deleteCondition () {
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
.condition-card
  display: inline-block
  margin: 4px
  border-radius: 4px
  border: 1px solid #EBEEF5
  overflow: hidden
  color: #303133
  transition: 0.3s
.is-always-shadow, .is-hover-shadow:focus, .is-hover-shadow:hover
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1)
.condition-card__header
  padding: 12px 16px
  border-bottom: 1px solid #EBEEF5
  box-sizing: border-box
.header-button-group
  float: right
  margin: -4px 0
.modify-remark
  color: red
.condition-card__body
  padding: 8px 16px
.card-line
  margin: 6px 0
.card-label
  color: grey
.card-label span 
  color #2c3e50
.edit-dialog .card-line .el-input
  width: 28vw
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
  width: 100%
</style>

<style lang="stylus">
.condition-card .card-line .el-input-group__prepend
  text-align: center
  min-width: 60px
</style>