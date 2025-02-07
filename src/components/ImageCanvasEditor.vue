<template>
  <div class="editor-wrapper">
    <div class="canvas-wrapper">
      <!-- 添加旋转和缩放控制按钮 -->
      <div class="control-buttons">
        <div class="button-group">
          <button class="control-btn" @click="handleZoom('in')" title="放大">+</button>
          <button class="control-btn" @click="handleZoom('out')" title="缩小">-</button>
        </div>
        <div class="button-group">
          <button class="control-btn" @click="handleRotate('left')" title="逆时针旋转90度">↺</button>
          <button class="control-btn" @click="handleRotate('right')" title="顺时针旋转90度">↻</button>
        </div>
        <div class="button-group">
          <button class="control-btn aspect-btn" @click="setAspectRatio('16:9')" title="16:9">16:9</button>
          <button class="control-btn aspect-btn" @click="setAspectRatio('4:3')" title="4:3">4:3</button>
        </div>
      </div>

      <div
        class="canvas-container"
        :style="{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        }"
      >
        <!-- 透明背景层 -->
        <div class="transparent-bg"></div>
        <!-- Canvas画布 -->
        <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight" @mousedown="startDragImage"></canvas>
      </div>

      <!-- 拖拽手柄 -->
      <div class="resize-handle top" @mousedown="startResize('top')"></div>
      <div class="resize-handle right" @mousedown="startResize('right')"></div>
      <div class="resize-handle bottom" @mousedown="startResize('bottom')"></div>
      <div class="resize-handle left" @mousedown="startResize('left')"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'

const props = defineProps({
  src: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
    default: 800,
  },
  height: {
    type: Number,
    default: 600,
  },
})

const emit = defineEmits(['update:width', 'update:height', 'export'])

// Canvas相关
const canvasRef = ref(null)
const canvasWidth = ref(props.width)
const canvasHeight = ref(props.height)
let ctx = null

// 图片相关
const image = new Image()
let imageX = 0
let imageY = 0
let imageScale = 1
let isDraggingImage = false
let lastMouseX = 0
let lastMouseY = 0

// 添加旋转角度变量
let rotationAngle = 0

/**
 * @description: 初始化Canvas画布
 */
function initCanvas() {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  // 使用传入的props作为初始画布大小
  canvasWidth.value = props.width
  canvasHeight.value = props.height

  loadImage()
}

/**
 * @description: 加载图片并处理跨域
 */
function loadImage() {
  image.crossOrigin = 'anonymous'
  image.src = props.src
  image.onerror = () => {
    console.error('Image load failed, trying with proxy...')
    image.src = props.src + '?crossorigin'
  }
  image.onload = () => {
    centerImage()
    drawImage()
  }
}

/**
 * @description: 计算并设置图片在画布中的居中位置和缩放比例
 */
function centerImage() {
  // 计算适合的缩放比例
  const scaleX = canvasWidth.value / image.width
  const scaleY = canvasHeight.value / image.height
  imageScale = Math.min(scaleX, scaleY, 1) // 取最小值，且不超过原始大小
  // 只在首次加载时居中图片
  const scaledWidth = image.width * imageScale
  const scaledHeight = image.height * imageScale
  imageX = (canvasWidth.value - scaledWidth) / 2
  imageY = (canvasHeight.value - scaledHeight) / 2
}

/**
 * @description: 在画布上绘制图片，应用旋转和缩放
 */
function drawImage() {
  if (!ctx) return
  // 清空画布
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)
  // 绘制图片
  ctx.save()
  // 移动到图片中心点
  ctx.translate(imageX + (image.width * imageScale) / 2, imageY + (image.height * imageScale) / 2)
  // 应用旋转
  ctx.rotate((rotationAngle * Math.PI) / 180)
  // 应用缩放
  ctx.scale(imageScale, imageScale)
  // 绘制图片，注意从中心点偏移
  ctx.drawImage(image, -image.width / 2, -image.height / 2)
  ctx.restore()
}

/**
 * @description: 开始拖动图片
 * @param {MouseEvent} event - 鼠标事件对象
 */
function startDragImage(event) {
  isDraggingImage = true
  lastMouseX = event.clientX
  lastMouseY = event.clientY

  document.addEventListener('mousemove', dragImage)
  document.addEventListener('mouseup', stopDragImage)
}

/**
 * @description: 处理图片拖动
 * @param {MouseEvent} event - 鼠标事件对象
 */
function dragImage(event) {
  if (!isDraggingImage) return
  const deltaX = event.clientX - lastMouseX
  const deltaY = event.clientY - lastMouseY
  imageX += deltaX
  imageY += deltaY
  lastMouseX = event.clientX
  lastMouseY = event.clientY
  drawImage()
}

/**
 * @description: 结束图片拖动
 */
function stopDragImage() {
  isDraggingImage = false
  document.removeEventListener('mousemove', dragImage)
  document.removeEventListener('mouseup', stopDragImage)
}

/**
 * @description: 处理图片缩放
 * @param {'in' | 'out'} type - 缩放类型，'in'表示放大，'out'表示缩小
 */
function handleZoom(type) {
  const scaleAmount = type === 'in' ? 1.1 : 0.9
  imageScale *= scaleAmount

  // 限制缩放范围
  imageScale = Math.max(0.1, Math.min(5, imageScale))

  // 重新绘制
  drawImage()
}

/**
 * @description: 处理图片旋转
 * @param {'left' | 'right'} direction - 旋转方向，'left'表示逆时针，'right'表示顺时针
 */
function handleRotate(direction) {
  // 更新旋转角度
  rotationAngle += direction === 'right' ? 90 : -90
  // 标准化角度到0-360范围
  rotationAngle = ((rotationAngle % 360) + 360) % 360
  // 重新绘制
  drawImage()
}

// 拖拽调整大小相关代码
let isResizing = false
let currentHandle = ''
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0

/**
 * @description: 开始调整画布大小
 * @param {'top' | 'right' | 'bottom' | 'left'} handle - 拖拽手柄位置
 */
function startResize(handle) {
  isResizing = true
  currentHandle = handle

  const canvas = document.querySelector('.canvas-container')
  startWidth = canvas.offsetWidth
  startHeight = canvas.offsetHeight

  startX = event.clientX
  startY = event.clientY

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

/**
 * @description: 处理画布大小调整
 * @param {MouseEvent} event - 鼠标事件对象
 */
function handleResize(event) {
  if (!isResizing) return

  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY
  const parentElement = document.querySelector('.editor-wrapper')
  const maxWidth = parentElement?.offsetWidth || 800

  switch (currentHandle) {
    case 'right':
      canvasWidth.value = Math.min(startWidth + deltaX, maxWidth)
      break
    case 'left':
      const widthDiff = startWidth - deltaX - canvasWidth.value
      canvasWidth.value = Math.min(startWidth - deltaX, maxWidth)
      imageX -= widthDiff
      break
    case 'bottom':
      canvasHeight.value = startHeight + deltaY
      break
    case 'top':
      const heightDiff = startHeight - deltaY - canvasHeight.value
      canvasHeight.value = startHeight - deltaY
      imageY -= heightDiff
      break
  }

  // 确保最小尺寸和最大尺寸
  canvasWidth.value = Math.max(200, Math.min(canvasWidth.value, maxWidth))
  canvasHeight.value = Math.max(200, canvasHeight.value)
}

/**
 * @description: 结束画布大小调整
 */
function stopResize() {
  isResizing = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

/**
 * @description: 调整图片位置确保不会完全超出画布
 */
function adjustImagePosition() {
  // 获取图片的实际显示尺寸
  const scaledWidth = image.width * imageScale
  const scaledHeight = image.height * imageScale

  // 只处理边界情况，确保图片不会完全超出画布
  if (imageX < -scaledWidth + 50) {
    imageX = -scaledWidth + 50
  }
  if (imageX > canvasWidth.value - 50) {
    imageX = canvasWidth.value - 50
  }
  if (imageY < -scaledHeight + 50) {
    imageY = -scaledHeight + 50
  }
  if (imageY > canvasHeight.value - 50) {
    imageY = canvasHeight.value - 50
  }
}

/**
 * @description: 设置画布宽高比
 * @param {'16:9' | '4:3'} ratio - 目标宽高比
 */
function setAspectRatio(ratio) {
  const parentElement = document.querySelector('.editor-wrapper')
  const maxWidth = parentElement?.offsetWidth || 800

  if (ratio === '16:9') {
    canvasWidth.value = maxWidth
    canvasHeight.value = maxWidth * (9 / 16)
  } else if (ratio === '4:3') {
    canvasWidth.value = maxWidth
    canvasHeight.value = maxWidth * (3 / 4)
  }

  nextTick(() => {
    adjustImagePosition()
    drawImage()
  })
}

/**
 * @description: 导出画布为PNG格式的base64字符串
 * @returns {string} 图片的base64编码
 */
function exportImage() {
  if (!canvasRef.value) return ''
  return canvasRef.value.toDataURL('image/png')
}

// Watchers
watch([canvasWidth, canvasHeight], () => {
  emit('update:width', canvasWidth.value)
  emit('update:height', canvasHeight.value)

  nextTick(() => {
    // 只调整边界，不改变图片位置
    adjustImagePosition()
    drawImage()
  })
})

watch(
  () => props.src,
  () => {
    loadImage()
  }
)

// Lifecycle hooks
onMounted(() => {
  initCanvas()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('mousemove', dragImage)
  document.removeEventListener('mouseup', stopDragImage)
})

// Expose methods
defineExpose({
  exportImage,
})
</script>

<style lang="scss" scoped>
.editor-wrapper {
  width: 100%;
  margin: 0 auto;
  display: flex;
  align-content: center;
  justify-content: center;
}
// 画布包装器，用于定位拖拽手柄
.canvas-wrapper {
  position: relative;
  display: inline-block;
  margin-top: 60px; // 为顶部按钮留出空间
}

// 画布容器样式
.canvas-container {
  position: relative;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  // 透明背景层
  .transparent-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(45deg, #f5f5f5 25%, transparent 25%), linear-gradient(-45deg, #f5f5f5 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f5f5f5 75%), linear-gradient(-45deg, transparent 75%, #f5f5f5 75%);
    background-size: 20px 20px;
    background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
    background-color: white;
    pointer-events: none; // 允许点击穿透到Canvas
  }

  canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

// 拖拽手柄基础样式
.resize-handle {
  position: absolute;
  background: #d4d4d4;

  // 上下拖拽手柄样式
  &.top,
  &.bottom {
    height: 6px;
    width: calc(100% - 26px);
    left: 13px;
    cursor: ns-resize; // 南北方向的调整光标
  }

  // 左右拖拽手柄样式
  &.left,
  &.right {
    width: 6px;
    height: calc(100% - 26px);
    top: 13px;
    cursor: ew-resize; // 东西方向的调整光标
  }

  // 四角圆形手柄样式
  &.corner {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  // 各个手柄的位置设置
  &.top {
    top: -11px;
  }
  &.right {
    right: -11px;
  }
  &.bottom {
    bottom: -11px;
  }
  &.left {
    left: -11px;
  }
}

// 修改控制按钮样式
.control-buttons {
  position: absolute;
  top: -50px; // 移动到画布上方
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 20px;
  z-index: 10;

  .button-group {
    display: flex;
    gap: 5px;
  }

  .control-btn {
    width: 36px;
    height: 36px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background: white;
    color: #333;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    &:hover {
      background: #f5f5f5;
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(1px);
    }

    &.aspect-btn {
      width: auto;
      padding: 0 10px;
      font-size: 14px;
    }
  }
}
</style>
