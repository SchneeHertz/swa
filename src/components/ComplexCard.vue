<template>
  <div class="complex-card component-card" 
    :class="[shadow ? 'is-' + shadow + '-shadow' : 'is-always-shadow']"
    :style="{width: width}"
  >
    <div class="complex-card__header">
      <span>{{data.name}}</span>
      <slot name="header"></slot>
      <span class="modify-remark" v-if="data.modify === 'add'">(新增)</span>
      <span class="modify-remark" v-if="data.modify === 'modify'">(已修改)</span>
      <span class="modify-remark" v-if="data.modify === 'delete'">(将要删除)</span>
      <el-button-group class="header-button-group">
        <el-button type="primary" size="mini" icon="el-icon-edit" @click="modifyComplex"></el-button>
        <el-button type="danger" size="mini" icon="el-icon-delete" @click="deleteComplex"></el-button>
      </el-button-group>
    </div>
    <div class="complex-card__body">
      <div class="card-line">
        <label class="card-label">id: <span>{{data.id}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">描述: <span>{{data.description}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">类型: <span>{{data.complexType}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">同材质: <span>{{data.sameMaterial ? '是' : '否'}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">合并描述: <span>{{data.mergeDescription}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">拆分描述: <span>{{data.splitDescription}}</span></label>
      </div>
      <slot></slot>
    </div>
    <el-dialog
      title="编辑复合类型"
      :visible.sync="dialogVisible"
      width="45%"
      class="edit-dialog"
      :close-on-click-modal="false"
    >
      <el-input
        v-model="dialogData.name"
        class="card-line"
      >
        <template #prepend>简称</template>
      </el-input>
      <el-input
        v-model="dialogData.description"
        class="card-line"
      >
        <template #prepend>描述</template>
      </el-input>
      <NameFormItem class="card-line" prependWidth="60px">
        <template #prepend>类型</template>
        <template #default>
          <el-select
            v-model="dialogData.complexType"
          >
            <el-option
              v-for="op in complexTypeList"
              :key="op.label"
              :value="op.value"
              :label="op.label"
            />
          </el-select>
        </template>
      </NameFormItem>
      <NameFormItem class="card-line" prependWidth="60px">
        <template #prepend>同材质</template>
        <template #default>
          <el-select
            v-model="dialogData.sameMaterial"
          >
            <el-option label="是" :value="true"></el-option>
            <el-option label="否" :value="false"></el-option>
          </el-select>
        </template>
      </NameFormItem>
      <el-input
        v-model="dialogData.mergeDescription"
        class="card-line"
      >
        <template #prepend>合并描述</template>
      </el-input>
      <el-input
        v-model="dialogData.splitDescription"
        class="card-line"
      >
        <template #prepend>拆分描述</template>
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
  name: 'ComplexCard',
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
      default: ()=>{return {}}
    }
  },
  data () {
    return {
      dialogVisible: false,
      dialogData: {},
      complexTypeList: [{
        label: '印染色系布型 M (P1,P2)',
        value: 'M-PP'
      }, {
        label: '底材涂层型 Mw/P1w/P2 (M,P1,P2)',
        value: 'MPP-MPP'
      }, {
        label: '底布刺绣型 Mw/P1w/P2 (Mw/P1,Mw/P2)',
        value: 'MPP-MPMP'
      }]
    }
  },
  methods: {
    modifyComplex () {
      this.dialogData = _.cloneDeep(this.data)
      this.dialogVisible = true
    },
    confirmEdit () {
      _.assign(this.data, this.dialogData, {modify: 'modify'})
      this.dialogVisible = false
    },
    deleteComplex () {
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
.complex-card
  display: inline-block
  margin: 4px
  border-radius: 4px
  border: 1px solid #EBEEF5
  overflow: hidden
  color: #303133
  transition: 0.3s
.is-always-shadow, .is-hover-shadow:focus, .is-hover-shadow:hover
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1)
.complex-card__header
  padding: 12px 16px
  border-bottom: 1px solid #EBEEF5
  box-sizing: border-box
.header-button-group
  float: right
  margin: -4px 0
.modify-remark
  color: red
.complex-card__body
  padding: 8px 16px
.card-line
  margin: 6px 0
.card-label
  color: grey
.card-label span 
  color #2c3e50
.card-line .el-select
  width: 100%
</style>

<style lang="stylus">
.complex-card .card-line .el-input-group__prepend
  text-align: center
  min-width: 60px
</style>