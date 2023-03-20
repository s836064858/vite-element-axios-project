<!--
 * @Author: your name
 * @Date: 2021-12-16 09:18:47
 * @LastEditTime: 2023-03-20 13:25:48
 * @LastEditors: 荛子
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /vite-element-axios-project/src/views/Home.vue
-->
<!-- <template>首页</template>
<script setup>
//接口请求事例
// import { onMounted } from 'vue'
// import { getVersionList } from '@api'

// onMounted(() => {
//   getList()
// })

// async function getList() {
//   const res = await getVersionList({ page: 1, pageSize: 10 })
//   console.log(res)
// }
</script> -->

<template>
  <div style="width: 800px">
    <FormulaEdit v-model="formulaStr" :fields="fields" :formulaArr="formulaArr"></FormulaEdit>
    {{ formulaStr }}
  </div>
</template>
<script setup>
import FormulaEdit from '@components/formulaEdit.vue'

let formulaStr = ref(null)
let fields = ref([
  {
    name: '字段1',
    id: 1,
  },
  {
    name: '字段2',
    id: 2,
  },
  {
    name: '字段3',
    id: 3,
  },
  {
    name: '字段4',
    id: 4,
  },
])
let formulaArr = ref([
  {
    id: 1,
    formula: 'AVERAGE',
    desc: ['AVERAGE函数可以获取一组数值的算术平均值', '用法：AVERAGE(数字1,数字2)'],
  },
])
</script>
<style lang="scss" scoped></style>
