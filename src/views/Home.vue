<!--
 * @Author: your name
 * @Date: 2021-12-16 09:18:47
 * @LastEditTime: 2023-11-09 16:23:20
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

<!-- <template>
  <lazy-select v-model="selectData" :options="options" placeholder="请选择店铺" @change="handleChange"></lazy-select>

</template>
<script setup>
import { onMounted, ref } from 'vue'
import lazySelect from '@components/lazySelect.vue'

let selectData = ref(null)
let options = ref([
  {
    label: '字段1',
    value: 1,
  },
  {
    label: '字段2',
    value: 2,
  },
  {
    label: '字段3',
    value: 3,
  },
  {
    label: '字段4',
    value: 4,
  },
])

function handleChange() {
  console.log('handleChange')
}
</script>
<style lang="scss" scoped></style> -->

<!-- <template>
  <image-upload v-model="imgUrl"></image-upload>
</template>
<script setup>
import { ref } from 'vue'
import ImageUpload from '@components/ImageUpload.vue'

let imgUrl = ref([])
</script>
<style lang="scss" scoped></style> -->

<template>
  <drag-tree-table></drag-tree-table>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import DragTreeTable from '@components/dragTreeTable.vue'
</script>
<style lang="scss" scoped></style>
