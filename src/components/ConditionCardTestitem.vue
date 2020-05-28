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
      <el-button style="float: right; margin: -4px 0px" type="danger" size="mini" @click="deleteCondition">删除</el-button>
      <el-button style="float: right; margin: -4px 18px" type="primary" size="mini" @click="modifyCondition">编辑</el-button>
    </div>
    <div class="condition-card__body">
      <div class="card-line">
        <label class="card-label">描述: <span>{{data.description}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">排序: <span>{{data.rank}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">测试项目: <span>{{displayRN(data.testitem)}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">单选/多选: <span>{{data.aftercat == 'single' ? '单选' : '多选'}}</span></label>
      </div>
      <div class="card-line" v-for="(answer, i) in data.list" :key="answer.value">
        <label class="card-label">选项{{i+1}}: <span>{{answer.value}}({{answer.remark}})</span></label>
      </div>
      <slot></slot>
    </div>
    <el-dialog
      title="编辑条件"
      :visible.sync="dialogVisible"
      width="75%"
      top="10vh"
      class="edit-dialog"
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
        <template #prepend>测试项目</template>
        <template #default>
          <el-select 
            v-model="dialogData.testitem"
            class="one-line-select"
            multiple
          >
            <el-option
              v-for="op in regulationOptionList"
              :key="op.id"
              :value="op.id"
              :label="op.name"
            ></el-option>
          </el-select>
        </template>
      </NameFormItem>
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
        <el-button type="info" @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import NameFormItem from '@/components/NameFormItem.vue'

export default {
  name: 'ConditionCardAfterward',
  components: {
    NameFormItem
  },
  props: {
    shadow: String,
    width: String,
    data: {
      type: Object,
      default: ()=>{return {}}
    },
    regulationOptionList: Array
  },
  data () {
    return {
      dialogVisible: false,
      dialogData: {}
    }
  },
  computed: {
    displayRegulationName () {
      let tempObj = {}
      _.forIn(this.regulationOptionList, regulation=>{
        tempObj[regulation.id] = regulation.name
      })
      return tempObj
    }
  },
  methods: {
    displayRN (arr) {
      if (_.isArray(arr)) {
        return arr.map(e=>this.displayRegulationName[e]).join(', ')
      }
    },
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
    confirmEdit () {
      _.assign(this.data, this.dialogData, {modify: 'modify'})
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