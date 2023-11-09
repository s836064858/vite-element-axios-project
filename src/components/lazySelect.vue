<template>
  <el-select v-model="selectValue" v-bind="props" @focus="handleFocus">
    <el-option v-for="item in showOptions" :key="item[props.optionValue]" :label="item[props.optionLabel]" :value="item[props.optionValue]" />
  </el-select>
</template>
<script setup>
import { onMounted, ref, watch } from 'vue'
const props = defineProps({
  modelValue: {
    type: Number,
    default: null,
  },
  options: {
    type: Array,
    default: [],
  },
  optionValue: {
    type: String,
    default: 'value',
  },
  optionLabel: {
    type: String,
    default: 'label',
  },
})

//监听父组件的modelValue以及监听子组件selectValue 相互赋值
onMounted(() => {
  selectValue.value = props.modelValue
})
watch(
  () => props.modelValue,
  (val) => {
    selectValue.value = val
  }
)
let selectValue = ref(null)
const emits = defineEmits(['update:modelValue'])
watch(
  selectValue,
  (val) => {
    emits('update:modelValue', val)
  },
  { deep: true }
)
//仅聚焦是渲染下拉框内容
let showOptions = ref([])
function handleFocus() {
  showOptions.value = props.options
}
</script>
<style lang="scss" scoped></style>
