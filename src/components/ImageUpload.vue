<template>
  <ul class="file-box">
    <li v-for="(item, index) in imageURL" :key="index">
      <div class="file-list">
        <el-image :src="item" fit="fill" :id="`image-id-${index}`" :preview-teleported="true" :preview-src-list="[item]" style="display: none"></el-image>
        <img :src="item" alt="" />
        <div class="mask">
          <Icon name="Delete" @click="deleteImg(index)"></Icon>
          <Icon name="Delete" @click="showPreview(index)"></Icon>
        </div>
      </div>
    </li>
    <li v-if="imageURL.length < props.limit">
      <el-upload
        :auto-upload="false"
        accept="image/png,image/jpg,image/jpeg,.pdf"
        class="drag-upload"
        drag
        action="#"
        :show-file-list="false"
        :on-change="cropperImage"
      >
        <Icon name="Plus"></Icon>
        <span>请点击或拖动图片到此处上传</span>
      </el-upload>
    </li>
  </ul>
  <div class="paste" @paste="handlePaste" v-if="imageURL.length < props.limit">截图或聊天软件的图片可先点击此处，然后使用 Ctrl+V 直接上传</div>
</template>

<script setup>
import { ref, watch, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import OSS from 'ali-oss'

const props = defineProps({
  modelValue: {
    type: Array,
    default: [],
  },
  limit: {
    type: Number,
    default: 4,
  },
})

watch(
  () => props.modelValue,
  (val) => {
    imageURL.value = val
  }
)

let imageURL = ref([])
onMounted(() => {
  imageURL.value = props.modelValue
})
const emits = defineEmits(['update:modelValue'])
watch(
  imageURL,
  (val) => {
    emits('update:modelValue', val)
  },
  { deep: true }
)

/**
 * @description: 点击/拖拽上传
 * @param {*} file
 * @return {*}
 */
function cropperImage(file) {
  uploadFile(file.raw)
}

/**
 * @description: 复制上传
 * @param {*} event
 * @return {*}
 */
function handlePaste(event) {
  const items = (event.clipboardData || window.clipboardData).items
  let file = null
  if (!items || items.length === 0) return ElMessage.warning('您的剪切板里没有内容, 无法粘贴')
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      file = items[i].getAsFile()
      break
    }
  }
  if (!file) return ElMessage.warning('您没有复制图片, 请先复制图片')
  uploadFile(file.raw)
}

/**
 * @description: 图片上传至oss
 * @param {*} file
 * @return {*}
 */
async function uploadFile(file) {
  const res = window.URL.createObjectURL(file)
  console.log(res)
  if (imageURL.value.length < props.limit) imageURL.value.push(res)
  // const client = new OSS({
  //   accessKeyId: '*',
  //   accessKeySecret: '*',
  //   endpoint: '*',
  //   bucket: '*',
  // })
  // let uploadFileName = file.name.replace(/(\.[a-zA-z0-9]+$)/g, `_${new Date().getTime()}$1`)
  // const res = await client.put(`/folder/${uploadFileName}`, file)
  // if (imageURL.value.length < props.limit) imageURL.value.push(res.url)
}
/**
 * @description: 删除图片
 * @param {*} i
 * @return {*}
 */
function deleteImg(i) {
  imageURL.value.splice(i, 1)
}

function showPreview(i) {
  document.querySelector(`#image-id-${i}`).click()
}
</script>

<style lang="scss" scoped>
.file-box {
  display: flex;
  flex-wrap: wrap;

  li {
    list-style: none;
    flex-shrink: 0;
    width: 50%;
    min-height: 150px;
    box-sizing: border-box;
    padding: 5px 10px 5px 0;
  }

  .file-list {
    position: relative;
    overflow: hidden;
    background-color: #fff;
    border: 1px solid #c0ccda;
    border-radius: 6px;
    width: 100%;
    height: 100%;
    display: inline-block;
    list-style: none;
    box-sizing: border-box;
    animation: showFile 0.75s;

    &:hover .mask {
      opacity: 1;
    }

    .mask {
      display: flex;
      align-items: center;
      justify-content: space-around;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: opacity 0.25s;
      color: #fff;
      font-size: 20px;
      text-align: center;
      z-index: 249;
      padding: 0 20px;

      i {
        cursor: pointer;
      }
    }

    img {
      width: 100%;
      vertical-align: middle;
    }
  }
  .drag-upload {
    width: 100%;
    height: 100%;

    ::v-deep(.el-upload) {
      display: block;
      height: 100%;
    }

    ::v-deep(.el-upload-dragger) {
      display: flex;
      align-items: center;
      flex-direction: column;
      justify-content: center;
      background-color: #fbfdff;
      border: 1px dashed #c0ccda;
      border-radius: 6px;
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      cursor: pointer;
      span {
        color: #999;
        font-size: 12px;
      }
      &:hover {
        border-color: #696cff;
      }
    }
  }
}
.paste {
  text-align: center;
  height: 40px;
  line-height: 40px;
  border: 1px dashed #ccc;
  background: #f5f5f5;
  font-size: 12px;
  border-radius: 5px;
  color: #888;
  margin-top: 10px;
  cursor: pointer;
  transition: 0.15s;

  &:active {
    transform: translate3d(0, 5px, 0);
  }
}
</style>
