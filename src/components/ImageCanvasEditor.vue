<template>
  <div class="canvas-wrapper">
    <!-- 添加旋转和缩放控制按钮 -->
    <div class="control-buttons">
      <div class="zoom-controls">
        <button class="control-btn" @click="handleZoom('in')" title="放大">+</button>
        <button class="control-btn" @click="handleZoom('out')" title="缩小">-</button>
      </div>
      <div class="rotate-controls">
        <button class="control-btn" @click="handleRotate('left')" title="逆时针旋转90度">↺</button>
        <button class="control-btn" @click="handleRotate('right')" title="顺时针旋转90度">↻</button>
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

// 绘制图片
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

// 图片拖动相关
function startDragImage(event) {
  isDraggingImage = true
  lastMouseX = event.clientX
  lastMouseY = event.clientY

  document.addEventListener('mousemove', dragImage)
  document.addEventListener('mouseup', stopDragImage)
}

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

function stopDragImage() {
  isDraggingImage = false
  document.removeEventListener('mousemove', dragImage)
  document.removeEventListener('mouseup', stopDragImage)
}

/**
 * @description:  缩放图片
 * @param {*} type
 * @return {*}
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
 * @description: 添加旋转处理函数
 * @param {*} direction
 * @return {*}
 */
function handleRotate(direction) {
  // 更新旋转角度
  rotationAngle += direction === 'right' ? 90 : -90
  // 标准化角度到0-360范围
  rotationAngle = ((rotationAngle % 360) + 360) % 360
  // 重新绘制
  drawImage()
}

// Canvas初始化
function initCanvas() {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  loadImage()
}

// 监听画布尺寸变化
watch([canvasWidth, canvasHeight], () => {
  emit('update:width', canvasWidth.value)
  emit('update:height', canvasHeight.value)

  nextTick(() => {
    // 只调整边界，不改变图片位置
    adjustImagePosition()
    drawImage()
  })
})

// 监听src变化
watch(
  () => props.src,
  () => {
    loadImage()
  }
)

// 拖拽调整大小相关代码
let isResizing = false
let currentHandle = ''
let startX = 0
let startY = 0
let startWidth = 0
let startHeight = 0

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

// 添加新的辅助函数
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

function handleResize(event) {
  if (!isResizing) return

  const deltaX = event.clientX - startX
  const deltaY = event.clientY - startY

  switch (currentHandle) {
    case 'right':
      canvasWidth.value = startWidth + deltaX
      break
    case 'left':
      const widthDiff = startWidth - deltaX - canvasWidth.value
      canvasWidth.value = startWidth - deltaX
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

  // 确保最小尺寸
  canvasWidth.value = Math.max(200, canvasWidth.value)
  canvasHeight.value = Math.max(200, canvasHeight.value)
}

function stopResize() {
  isResizing = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

// 简化导出方法
function exportImage() {
  if (!canvasRef.value) return ''
  return canvasRef.value.toDataURL('image/png')
}

// 暴露方法给父组件
defineExpose({
  exportImage,
})

onMounted(() => {
  initCanvas()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
  document.removeEventListener('mousemove', dragImage)
  document.removeEventListener('mouseup', stopDragImage)
})
</script>

<style lang="scss" scoped>
// 画布包装器，用于定位拖拽手柄
.canvas-wrapper {
  position: relative;
  display: inline-block;

  // 确保子元素不会溢出
  .canvas-container {
    position: relative;
    overflow: visible;
  }
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
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 10;

  .zoom-controls,
  .rotate-controls {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .control-btn {
    width: 30px;
    height: 30px;
    border: none;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 1);
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }
  }
}
</style>
