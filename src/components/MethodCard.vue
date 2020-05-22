<template>
  <div class="method-card" 
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
      <!-- <div class="card-line">
        <label class="card-label">状态: <span>{{displayLine('status')}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">含有物质: <span>{{displayLine('element')}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">消解液: <span>{{displayLine('digestion')}}</span></label>
      </div>
      <div class="card-line">
        <label class="card-label">其他: <span>{{displayLine('other')}}</span></label>
      </div> -->
      <slot></slot>
    </div>
    <el-dialog
      title="编辑材质"
      :visible.sync="dialogVisible"
      width="45%"
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
      <!-- <NameFormItem class="card-line" prependWidth="60px">
        <template #prepend>状态</template>
        <template #default>
          <el-select
            v-model="dialogData.status"
            multiple
            allow-create
            filterable
          >
            <el-option
              v-for="op in methodOptionList.status"
              :key="op"
              :value="op"
              :label="op"
            />
          </el-select>
        </template>
      </NameFormItem>
      <NameFormItem class="card-line" prependWidth="60px">
        <template #prepend>含有物质</template>
        <template #default>
          <el-select
            v-model="dialogData.element"
            multiple
            allow-create
            filterable
          >
            <el-option
              v-for="op in methodOptionList.element"
              :key="op"
              :value="op"
              :label="op"
            />
          </el-select>
        </template>
      </NameFormItem>
      <NameFormItem class="card-line" prependWidth="60px">
        <template #prepend>消解液</template>
        <template #default>
          <el-select
            v-model="dialogData.digestion"
            multiple
            allow-create
            filterable
          >
            <el-option
              v-for="op in methodOptionList.digestion"
              :key="op"
              :value="op"
              :label="op"
            />
          </el-select>
        </template>
      </NameFormItem>
      <NameFormItem class="card-line" prependWidth="60px">
        <template #prepend>其他</template>
        <template #default>
          <el-select
            v-model="dialogData.other"
            multiple
            allow-create
            filterable
          >
            <el-option
              v-for="op in methodOptionList.other"
              :key="op"
              :value="op"
              :label="op"
            />
          </el-select>
        </template>
      </NameFormItem> -->
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
      default: ()=>{return {}}
    },
    methodOptionList: Object
  },
  data () {
    return {
      dialogVisible: false,
      dialogData: {}
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
.card-line .el-select
  width: 100%
</style>

<style lang="stylus">
.method-card .card-line .el-input-group__prepend
  text-align: center
  min-width: 60px
</style>