<template>
  <div class="point-card component-card" 
    :class="[shadow ? 'is-' + shadow + '-shadow' : 'is-always-shadow', {'select-point-card': isSelected}]"
    :style="{width: width}"
  >
    <div
      class="point-card__header"
      @click="handlePointCard($event)"
    >
      <slot name="header"></slot>
      <el-button type="danger" class="mini-circle-btn" icon="el-third-icon-close" circle @click="handleDeleteButton"></el-button>
      <el-button type="success" class="mini-circle-btn" icon="el-third-icon-file-copy" circle></el-button>
    </div>
    <div class="point-card__body">
      <el-input
        type="textarea"
        placeholder="英文描述"
        class="point-description"
        v-model="data['englishDescription']"
        :autosize="{ minRows: 2, maxRows: 4}"
        @focus="$emit('focus-point')"
        @blur="$emit('blur-point')"
      ></el-input>
      <el-input
        type="textarea"
        placeholder="中文描述"
        class="point-description"
        v-model="data['chineseDescription']"
        :autosize="{ minRows: 2, maxRows: 4}"
        @focus="$emit('focus-point')"
        @blur="$emit('blur-point')"
      ></el-input>
      <NameFormItem class="point-option"
        v-for="indForm in formList"
        :key="indForm.key"
      >
        <template #prepend>{{indForm.description}}</template>
        <template #default>
          <el-select
            v-model="data[indForm.key]"
            filterable
            @focus="$emit('focus-point')"
            @blur="$emit('blur-point')"
          >
            <el-option
              v-for="op in indForm.optionList"
              :key="op.value"
              :label="op.label"
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
  name: 'PointCard',
  components: {
    NameFormItem
  },
  props: {
    shadow: String,
    width: String,
    formList: Array,
    data: {
      type: Object,
      default: ()=>{return {}}
    },
    isSelected: Boolean
  },
  methods:{
    handleDeleteButton () {
      this.$emit('delete-point')
    },
    handlePointCard (e) {
      if (e.target.classList.contains('point-card__header')){
        this.$emit('select-point')
      }
    }
  }
}
</script>

<style lang="stylus" scoped>
.point-card
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
.select-point-card
  box-shadow: 0 2px 12px 0 rgba(0, 128, 255, 0.8)
.point-card__header
  padding: 8px 16px
  border-bottom: 1px solid #EBEEF5
  box-sizing: border-box
.mini-circle-btn
  padding: 0
  float: right
  margin: 0 2px
.point-card__body
  padding: 8px 16px
.point-card__body .point-description, .point-card__body .point-option
  margin: 2px 0
</style>