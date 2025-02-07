<!--
 * @Author: your name
 * @Date: 2021-12-16 09:18:47
 * @LastEditTime: 2025-02-07 15:45:13
 * @LastEditors: 荛子
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /vite-element-axios-project/src/views/Home.vue
-->
<!-- <template>首页</template>
<script setup>
//接口请求事例
import { onMounted } from 'vue'
import { getVersionList } from '@api'

onMounted(() => {
  getList()
})

async function getList() {
  const res = await getVersionList({ page: '%', pageSize: 10 })
  console.log(res)
}
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

<!-- <template>
  <merge-table></merge-table>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import MergeTable from '@components/mergeTable.vue'
</script>
<style lang="scss" scoped></style> -->

<!-- <template>
  <univer-excel></univer-excel>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import univerExcel from '@components/univerExcel.vue'
</script>
<style lang="scss" scoped></style> -->

<!-- <template>
  <luckySheet></luckySheet>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import luckySheet from '@components/luckySheet.vue'
import univerExcel from '@components/univerExcel.vue'
</script>
<style lang="scss" scoped></style> -->

<template>
  <div class="editor-container">
    <image-canvas-editor ref="editorRef" :src="imageUrl" :width="400" :height="300" />
    <div class="button-container">
      <button @click="handleExport">导出图片</button>
      <button @click="handleGetInfo">获取图片位置</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ImageCanvasEditor from '@components/ImageCanvasEditor.vue'

const imageUrl = ref('https://picsum.photos/800/600')
const editorRef = ref(null)

const handleExport = () => {
  if (!editorRef.value) return

  // 导出原始图层
  const originalImage = editorRef.value.exportOriginalLayer()

  // 导出涂色图层
  const drawingImage = editorRef.value.exportDrawingLayer()

  // 创建下载链接
  const link = document.createElement('a')
  link.download = 'original-image.png'
  link.href = originalImage
  link.click()

  // 如果需要也可以下载涂色图层
  const drawingLink = document.createElement('a')
  drawingLink.download = 'drawing-layer.png'
  drawingLink.href = drawingImage
  drawingLink.click()
}

const handleGetInfo = () => {
  if (!editorRef.value) return

  const info = editorRef.value.getCanvasInfo()
  console.log('Canvas Info:', info)
}
</script>

<style lang="scss" scoped>
.editor-container {
  padding: 20px;
  background: #f0f0f0;
  min-height: 100vh;
}
.button-container {
  margin-top: 20px;

  button {
    padding: 8px 16px;
    background: #2196f3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background: #1976d2;
    }
  }
}
</style>
