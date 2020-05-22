<template>
  <div class="condition-card" :class="shadow ? 'is-' + shadow + '-shadow' : 'is-always-shadow'" :style="{width: width}">
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
      <div class="card-line" v-for="(answer, i) in materialOptionList[data.property]" :key="answer">
        <label class="card-label">选项{{i+1}}: <span>{{answer}}</span></label>
      </div>
      <slot></slot>
    </div>
    <el-dialog
      title="编辑条件"
      :visible.sync="dialogVisible"
      width="65%"
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
      <NameFormItem class="card-line" prependWidth="50px">
        <template #prepend>排序</template>
        <template #default>
          <el-input-number v-model="dialogData.rank" />
        </template>
      </NameFormItem>
      <el-input
        v-model="dialogData.property"
        class="card-line"
      >
        <template #prepend>关联属性</template>
      </el-input>
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
  name: 'MaterialConditionCard',
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
    materialOptionList: Object
  },
  data () {
    return {
      dialogVisible: false,
      dialogData: {}
    }
  },
  methods: {
    modifyCondition () {
      this.dialogData = _.cloneDeep(this.data)
      this.dialogVisible = true
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
  background-color: #fff
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
</style>

<style lang="stylus">
.condition-card .card-line .el-input-group__prepend
  text-align: center
  min-width: 50px
</style>