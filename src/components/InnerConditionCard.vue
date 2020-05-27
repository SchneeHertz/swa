<template>
  <div class="inner-condition-card component-card" 
    :class="[shadow ? 'is-' + shadow + '-shadow' : 'is-always-shadow']"
    :style="{width: width}"
  >
    <div class="inner-condition-card__header">
      <span>{{option.name}}</span>
      <slot name="header"></slot>
      <el-button type="danger" class="mini-circle-btn" icon="el-third-icon-close" circle @click="handleDeleteButton"></el-button>
    </div>
    <div class="inner-condition-card__body">
      <NameFormItem class="card-line" prependWidth="60px">
        <template #prepend>条件判断</template>
        <template #default>
          <el-select v-model="data.logic"
            @change="$emit('select-change')"
          >
            <el-option value="yes" label="yes"></el-option>
            <el-option value="no" label="no"></el-option>
          </el-select>
        </template>
      </NameFormItem>
      <NameFormItem class="card-line" prependWidth="60px">
        <template #prepend>逻辑关系</template>
        <template #default>
          <el-select v-model="data.valueLogic"
            @change="$emit('select-change')"
          >
            <el-option value="and" label="and"></el-option>
            <el-option value="or" label="or"></el-option>
          </el-select>
        </template>
      </NameFormItem>
      <NameFormItem class="card-line" prependWidth="60px">
        <template #prepend>值</template>
        <template #default>
          <el-select 
            v-model="data.value"
            multiple
            @change="$emit('select-change')"
          >
            <el-option
              v-for="op in option.list"
              :key="op.value"
              :label="op.value"
              :value="op.value"
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
  name: 'InnerConditionCard',
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
    option: Object
  },
  methods:{
    handleDeleteButton () {
      this.$emit('delete-point')
    }
  }
}
</script>

<style lang="stylus" scoped>
.inner-condition-card
  display: inline-block
  margin: 4px
  border-radius: 4px
  border: 1px solid #EBEEF5
  overflow: hidden
  color: #303133
  transition: 0.3s
.is-always-shadow, .is-hover-shadow:focus, .is-hover-shadow:hover
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1)
.inner-condition-card__header
  padding: 8px 16px
  border-bottom: 1px solid #EBEEF5
  box-sizing: border-box
.mini-circle-btn
  padding: 0
  float: right
  margin: 0 2px
.inner-condition-card__body
  padding: 8px 16px
.card-line
  margin: 6px 0
.card-line .el-select
  width: 100%
</style>