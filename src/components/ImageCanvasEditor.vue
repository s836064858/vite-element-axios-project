<template>
  <div class="editor-wrapper">
    <div class="canvas-wrapper">
      <!-- 添加旋转和缩放控制按钮 -->
      <div class="control-buttons">
        <div class="button-group">
          <button class="control-btn" :class="{ active: currentTool === 'move' }" @click="setTool('move')" title="移动">↔</button>
          <button class="control-btn" :class="{ active: currentTool === 'draw' }" @click="setTool('draw')" title="涂色">✏</button>
          <button class="control-btn" @click="clearDrawingLayer" title="重置涂色">↺</button>
        </div>
        <div class="button-group">
          <button class="control-btn" @click="handleZoom('in')" title="放大">+</button>
          <button class="control-btn" @click="handleZoom('out')" title="缩小">-</button>
        </div>
        <div class="button-group">
          <button class="control-btn aspect-btn" @click="setAspectRatio('16:9')" title="16:9">16:9</button>
          <button class="control-btn aspect-btn" @click="setAspectRatio('4:3')" title="4:3">4:3</button>
        </div>
      </div>

      <div
        class="canvas-container"
        :style="{
          width: `${state.canvas.width.value}px`,
          height: `${state.canvas.height.value}px`,
        }"
      >
        <!-- 透明背景层 -->
        <div class="transparent-bg"></div>
        <!-- Canvas画布 -->
        <canvas
          ref="canvasRef"
          :width="state.canvas.width.value"
          :height="state.canvas.height.value"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
        ></canvas>
        <!-- 绘制层画布 -->
        <canvas
          ref="drawingCanvasRef"
          :width="state.canvas.width.value"
          :height="state.canvas.height.value"
          :style="{
            pointerEvents: currentTool === 'draw' ? 'auto' : 'none',
          }"
          @mousedown="handleMouseDown"
          @mousemove="handleMouseMove"
          @mouseup="handleMouseUp"
          @mouseleave="handleMouseUp"
        ></canvas>
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

const emit = defineEmits(['update:width', 'update:height'])

// Canvas refs
const canvasRef = ref(null)
const drawingCanvasRef = ref(null)

// 整合 canvas、图片和拖拽调整大小相关状态
const state = {
  canvas: {
    width: ref(props.width),
    height: ref(props.height),
    ctx: null,
  },
  drawing: {
    ctx: null,
    isDrawing: false,
    lastX: 0,
    lastY: 0,
  },
  image: {
    element: new Image(),
    x: 0,
    y: 0,
    scale: 1,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
  },
  resize: {
    isActive: false,
    handle: '',
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  },
}

// 当前工具状态
const currentTool = ref('move')

/**
 * @description: 初始化Canvas画布
 */
function initCanvas() {
  if (!canvasRef.value) return
  state.canvas.ctx = canvasRef.value.getContext('2d')
  state.canvas.ctx.imageSmoothingEnabled = true
  state.canvas.ctx.imageSmoothingQuality = 'high'

  state.canvas.width.value = props.width
  state.canvas.height.value = props.height

  loadImage()
}

/**
 * @description: 加载图片并处理跨域
 */
function loadImage() {
  state.image.element.crossOrigin = 'anonymous'
  state.image.element.src = props.src
  state.image.element.onerror = () => {
    console.error('Image load failed, trying with proxy...')
    state.image.element.src = props.src + '?crossorigin'
  }
  state.image.element.onload = () => {
    centerImage()
    drawImage()
  }
}

/**
 * @description: 计算并设置图片在画布中的居中位置和缩放比例
 */
function centerImage() {
  // 计算适合的缩放比例
  const scaleX = state.canvas.width.value / state.image.element.width
  const scaleY = state.canvas.height.value / state.image.element.height
  state.image.scale = Math.min(scaleX, scaleY, 1) // 取最小值，且不超过原始大小
  // 只在首次加载时居中图片
  const scaledWidth = state.image.element.width * state.image.scale
  const scaledHeight = state.image.element.height * state.image.scale
  state.image.x = (state.canvas.width.value - scaledWidth) / 2
  state.image.y = (state.canvas.height.value - scaledHeight) / 2
}

/**
 * @description: 在画布上绘制图片，应用旋转和缩放
 */
function drawImage() {
  if (!state.canvas.ctx) return
  // 清空画布
  state.canvas.ctx.clearRect(0, 0, state.canvas.width.value, state.canvas.height.value)
  // 绘制图片
  state.canvas.ctx.save()
  // 移动到图片中心点
  state.canvas.ctx.translate(
    state.image.x + (state.image.element.width * state.image.scale) / 2,
    state.image.y + (state.image.element.height * state.image.scale) / 2
  )
  // 应用缩放
  state.canvas.ctx.scale(state.image.scale, state.image.scale)
  // 绘制图片，注意从中心点偏移
  state.canvas.ctx.drawImage(state.image.element, -state.image.element.width / 2, -state.image.element.height / 2)
  state.canvas.ctx.restore()
}

/**
 * @description: 开始拖动图片
 * @param {MouseEvent} event - 鼠标事件对象
 */
function startDragImage(event) {
  state.image.isDragging = true
  state.image.lastMouseX = event.clientX
  state.image.lastMouseY = event.clientY
}

/**
 * @description: 处理图片拖动
 * @param {MouseEvent} event - 鼠标事件对象
 */
function dragImage(event) {
  if (!state.image.isDragging) return
  const deltaX = event.clientX - state.image.lastMouseX
  const deltaY = event.clientY - state.image.lastMouseY
  state.image.x += deltaX
  state.image.y += deltaY
  state.image.lastMouseX = event.clientX
  state.image.lastMouseY = event.clientY
  drawImage()
}

/**
 * @description: 结束图片拖动
 */
function stopDragImage() {
  state.image.isDragging = false
  document.removeEventListener('mousemove', dragImage)
  document.removeEventListener('mouseup', stopDragImage)
}

/**
 * @description: 处理图片缩放
 * @param {'in' | 'out'} type - 缩放类型，'in'表示放大，'out'表示缩小
 */
function handleZoom(type) {
  const scaleAmount = type === 'in' ? 1.1 : 0.9
  state.image.scale *= scaleAmount

  // 限制缩放范围
  state.image.scale = Math.max(0.1, Math.min(5, state.image.scale))

  // 重新绘制
  drawImage()
}

/**
 * @description: 开始调整画布大小
 * @param {'top' | 'right' | 'bottom' | 'left'} handle - 拖拽手柄位置
 */
function startResize(handle) {
  state.resize.isActive = true
  state.resize.handle = handle

  const canvas = document.querySelector('.canvas-container')
  state.resize.startWidth = canvas.offsetWidth
  state.resize.startHeight = canvas.offsetHeight

  state.resize.startX = event.clientX
  state.resize.startY = event.clientY

  document.addEventListener('mousemove', handleResize)
  document.addEventListener('mouseup', stopResize)
}

/**
 * @description: 处理画布大小调整
 * @param {MouseEvent} event - 鼠标事件对象
 */
function handleResize(event) {
  if (!state.resize.isActive) return

  const deltaX = event.clientX - state.resize.startX
  const deltaY = event.clientY - state.resize.startY
  const parentElement = document.querySelector('.editor-wrapper')
  const maxWidth = parentElement?.offsetWidth || 800

  switch (state.resize.handle) {
    case 'right':
      state.canvas.width.value = Math.min(state.resize.startWidth + deltaX, maxWidth)
      break
    case 'left':
      const widthDiff = state.resize.startWidth - deltaX - state.canvas.width.value
      state.canvas.width.value = Math.min(state.resize.startWidth - deltaX, maxWidth)
      state.image.x -= widthDiff
      break
    case 'bottom':
      state.canvas.height.value = state.resize.startHeight + deltaY
      break
    case 'top':
      const heightDiff = state.resize.startHeight - deltaY - state.canvas.height.value
      state.canvas.height.value = state.resize.startHeight - deltaY
      state.image.y -= heightDiff
      break
  }

  // 确保最小尺寸和最大尺寸
  state.canvas.width.value = Math.max(200, Math.min(state.canvas.width.value, maxWidth))
  state.canvas.height.value = Math.max(200, state.canvas.height.value)
}

/**
 * @description: 结束画布大小调整
 */
function stopResize() {
  state.resize.isActive = false
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
}

/**
 * @description: 调整图片位置确保不会完全超出画布
 */
function adjustImagePosition() {
  // 获取图片的实际显示尺寸
  const scaledWidth = state.image.element.width * state.image.scale
  const scaledHeight = state.image.element.height * state.image.scale

  // 只处理边界情况，确保图片不会完全超出画布
  if (state.image.x < -scaledWidth + 50) {
    state.image.x = -scaledWidth + 50
  }
  if (state.image.x > state.canvas.width.value - 50) {
    state.image.x = state.canvas.width.value - 50
  }
  if (state.image.y < -scaledHeight + 50) {
    state.image.y = -scaledHeight + 50
  }
  if (state.image.y > state.canvas.height.value - 50) {
    state.image.y = state.canvas.height.value - 50
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
    state.canvas.width.value = maxWidth
    state.canvas.height.value = maxWidth * (9 / 16)
  } else if (ratio === '4:3') {
    state.canvas.width.value = maxWidth
    state.canvas.height.value = maxWidth * (3 / 4)
  }

  nextTick(() => {
    adjustImagePosition()
    drawImage()
  })
}

/**
 * @description: 设置当前工具（移动/涂色）
 * @param {'move' | 'draw'} tool - 工具类型
 */
function setTool(tool) {
  currentTool.value = tool
}

/**
 * @description: 处理鼠标按下事件，根据当前工具执行相应操作
 * @param {MouseEvent} event - 鼠标事件对象
 */
function handleMouseDown(event) {
  if (currentTool.value === 'move') {
    startDragImage(event)
  } else if (currentTool.value === 'draw') {
    state.drawing.isDrawing = true
    const rect = drawingCanvasRef.value.getBoundingClientRect()
    const scaleX = drawingCanvasRef.value.width / rect.width
    const scaleY = drawingCanvasRef.value.height / rect.height

    state.drawing.lastX = (event.clientX - rect.left) * scaleX
    state.drawing.lastY = (event.clientY - rect.top) * scaleY

    //重新定义画笔
    state.drawing.ctx.globalCompositeOperation = 'source-over'
    state.drawing.ctx.strokeStyle = '#FF0000'
    state.drawing.ctx.fillStyle = '#FF0000'
    state.drawing.ctx.lineWidth = 30
    state.drawing.ctx.lineCap = 'round'
    state.drawing.ctx.lineJoin = 'round'
    state.drawing.ctx.globalAlpha = 1
    state.drawing.ctx.imageSmoothingEnabled = true
    state.drawing.ctx.imageSmoothingQuality = 'high'

    state.drawing.ctx.beginPath()
    state.drawing.ctx.moveTo(state.drawing.lastX, state.drawing.lastY)
  }
}

/**
 * @description: 处理鼠标移动事件，根据当前工具执行相应操作
 * @param {MouseEvent} event - 鼠标事件对象
 */
function handleMouseMove(event) {
  if (currentTool.value === 'move' && state.image.isDragging) {
    dragImage(event)
  } else if (currentTool.value === 'draw' && state.drawing.isDrawing) {
    const rect = drawingCanvasRef.value.getBoundingClientRect()
    const scaleX = drawingCanvasRef.value.width / rect.width
    const scaleY = drawingCanvasRef.value.height / rect.height

    const x = (event.clientX - rect.left) * scaleX
    const y = (event.clientY - rect.top) * scaleY

    state.drawing.ctx.lineTo(x, y)
    state.drawing.ctx.stroke()

    state.drawing.ctx.beginPath()
    state.drawing.ctx.moveTo(x, y)

    state.drawing.lastX = x
    state.drawing.lastY = y
  }
}

/**
 * @description: 处理鼠标松开和离开事件，根据当前工具执行相应操作
 */
function handleMouseUp() {
  if (currentTool.value === 'move') {
    stopDragImage()
  } else if (currentTool.value === 'draw') {
    state.drawing.isDrawing = false
    state.drawing.ctx.beginPath()
  }
}

/**
 * @description: 初始化涂色画布的上下文配置
 */
function initDrawingCanvas() {
  if (!drawingCanvasRef.value) return
  state.drawing.ctx = drawingCanvasRef.value.getContext('2d', { willReadFrequently: true })
}

/**
 * @description: 清除涂色图层
 */
function clearDrawingLayer() {
  if (!drawingCanvasRef.value) return
  state.drawing.ctx.clearRect(0, 0, state.canvas.width.value, state.canvas.height.value)
}

// 分离导出函数
/**
 * @description: 导出原始图层
 * @returns {string} 原始图层的base64编码
 */
function exportOriginalLayer() {
  if (!canvasRef.value) return ''
  return canvasRef.value.toDataURL('image/png')
}

/**
 * @description: 导出涂色图层
 * @returns {string} 涂色图层的base64编码
 */
function exportDrawingLayer() {
  if (!drawingCanvasRef.value) return ''
  return drawingCanvasRef.value.toDataURL('image/png')
}

/**
 * @description: 获取画布和图片的详细信息
 */
function getCanvasInfo() {
  return {
    canvas: {
      width: state.canvas.width.value,
      height: state.canvas.height.value,
    },
    image: {
      // 实际显示尺寸
      width: state.image.element.width * state.image.scale,
      height: state.image.element.height * state.image.scale,
      // 位置信息
      x: state.image.x,
      y: state.image.y,
      // 变换信息
      scale: state.image.scale,
      // 原始尺寸
      naturalWidth: state.image.element.width,
      naturalHeight: state.image.element.height,
    },
  }
}

// Watchers
watch([state.canvas.width, state.canvas.height], () => {
  emit('update:width', state.canvas.width.value)
  emit('update:height', state.canvas.height.value)

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
  initDrawingCanvas()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleResize)
  document.removeEventListener('mouseup', stopResize)
})

// Expose methods
defineExpose({
  exportOriginalLayer,
  exportDrawingLayer,
  clearDrawingLayer,
  getCanvasInfo,
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

    // 移除这部分样式，因为我们现在使用内联样式控制pointer-events
    &:nth-child(3) {
      transition: opacity 0.3s;
    }
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

    &.active {
      background: #e3f2fd;
      border-color: #2196f3;
      color: #2196f3;
    }
  }
}
</style>
