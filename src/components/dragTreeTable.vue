<template>
  <div style="width: 100vw">
    <el-table :data="tableData" ref="taskTableRef" class="tree-table-drag" :row-class-name="tableRowClassName" row-key="id" height="100vh" default-expand-all>
      <el-table-column prop="date" label="Date" min-width="200px" />
      <el-table-column prop="name" label="Name" min-width="200px" />
      <el-table-column prop="address" label="Address" min-width="200px" />
      <el-table-column min-width="200px">
        <template #default="{ row }">
          <el-button :icon="Rank" class="drag-mark" type="primary" size="small" @mousedown="dragID = row.id"></el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { nextTick, onMounted, ref } from 'vue'
import { Rank } from '@element-plus/icons-vue'
import { cloneDeep, throttle } from 'lodash'
import Sortable from 'sortablejs'

const taskTableRef = ref() // Table Dom
let tableData = ref([
  {
    id: 1,
    date: '2016-05-01',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    id: 2,
    date: '2016-05-02',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles',
  },
  {
    id: 3,
    date: '2016-05-03',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles',
    children: [
      {
        id: 31,
        date: '2016-05-05',
        name: 'wangxiaohu',
        address: 'No. 189, Grove St, Los Angeles',
      },
      {
        id: 32,
        date: '2016-05-06',
        name: 'wangxiaohu',
        address: 'No. 189, Grove St, Los Angeles',
        children: [
          {
            id: 33,
            date: '2016-05-07',
            name: 'wangxiaohu',
            address: 'No. 189, Grove St, Los Angeles',
          },
        ],
      },
    ],
  },
  {
    id: 4,
    date: '2016-05-04',
    name: 'wangxiaohu',
    address: 'No. 189, Grove St, Los Angeles',
  },
])
let sortableObj = ref() // 拖动实例化对象
let relatedDom = ref() // 拖动到的dom
let dragID = ref() // 拖动DOM的数据ID

// 多维数组扁平化
function treetoarray(treeData, childrenKey = 'children', parentID = 0) {
  const tempTreeData = cloneDeep(treeData)
  let cacheData = []
  for (const iterator of tempTreeData) {
    iterator.parentID = parentID
    cacheData.push(iterator)
    if (iterator[childrenKey]) cacheData = cacheData.concat(treetoarray(iterator[childrenKey], childrenKey, iterator.id))
  }
  return cacheData
}
// 一维数组组装
function arraytotree(onearray) {
  let nodeMap = new Map()
  let tempArray = []
  for (const iterator of onearray) {
    iterator.children = []
    nodeMap.set(iterator.id, iterator)
  }
  for (const iterator of nodeMap.values()) {
    const nodeData = nodeMap.get(iterator.parentID)
    if (nodeData) {
      nodeData.children?.push(iterator)
    } else {
      tempArray.push(iterator)
    }
  }
  return tempArray
}

// 表格行样式
const tableRowClassName = ({ row }) => {
  return `table-row drag-class-${row.id}`
}

// 清除拖动效果
const clearDragAnimation = () => {
  if (!relatedDom.value) {
    console.error('未获取到替换DOM')
    return
  }
  const tempRelated = relatedDom.value.querySelector('.drag-animation')
  tempRelated && relatedDom.value.removeChild(tempRelated)
  relatedDom.value.classList.remove('son-drag-animation')
}
/**
 * 表格拖动开始的处理函数
 * @param event 事件对象，包含了拖动相关的数据和操作
 */
const tableStart = (event) => {
  // 当Sortable的onMove事件返回false时，被拖动的元素不会触发onMove事件，这里通过手动添加dragover事件来弥补这一行为
  event.item.addEventListener(
    'dragover',
    throttle(() => {
      // 如果存在相关的DOM元素，则清除拖动动画，并重置相关DOM元素的值
      if (relatedDom.value) {
        clearDragAnimation()
        relatedDom.value = undefined
      }
    }, 300) // 使用节流函数来限制事件处理函数的执行频率，这里为300ms
  )
}
/**
 * 处理表格拖动时的动画效果。
 * @param {Event} evt - 触发事件的事件对象。
 * @param {OriginalEvent} originalEvent - 原始的拖动事件对象。
 * @returns {boolean} 总是返回false，用于阻止默认行为。
 */
const tableMove = (evt, originalEvent) => {
  if (relatedDom.value && !evt.related.isEqualNode(relatedDom.value)) {
    // 如果当前相关的DOM节点与之前的不同，则清除原有拖动动画，并更新相关DOM
    clearDragAnimation()
    relatedDom.value = evt.related
  } else if (!relatedDom.value) {
    // 如果还没有相关DOM，则设置当前拖动的DOM为相关DOM
    relatedDom.value = evt.related
  }
  // 根据拖动时鼠标位置的不同，添加不同的动画效果
  if (originalEvent.offsetY > 2 && originalEvent.offsetY <= 10) {
    // 如果在目标DOM上方一定区域拖动，添加前置动画效果
    clearDragAnimation()
    const div = document.createElement('div')
    div.className = 'before drag-animation'
    evt.related.appendChild(div)
  } else if (originalEvent.offsetY > 10 && originalEvent.offsetY <= 20) {
    // 如果在目标DOM内部一定区域拖动，添加子级动画效果
    clearDragAnimation()
    evt.related.classList.add('son-drag-animation')
  } else if (originalEvent.offsetY > 20) {
    // 如果在目标DOM下方一定区域拖动，添加后置动画效果
    clearDragAnimation()
    const div = document.createElement('div')
    div.className = 'after drag-animation'
    evt.related.appendChild(div)
  }
  return false // 阻止默认行为
}
/**
 * 表格拖动结束时的处理函数，主要负责处理拖动后表格的数据变化。
 * 该函数不接受任何参数，也不返回任何值。
 */
const tableEnd = () => {
  // 初始化请求对象，用于记录拖动相关的信息
  let tempRequest = {
    DragID: dragID.value, // 被拖动项的ID
    DropID: 0, // 目标放置项的ID，默认为0
    DropType: '', // 拖入方式，默认为空
  }

  // 将表格数据转换为数组形式，便于处理
  const oneArray = treetoarray(taskTableRef.value?.data || [])

  // 判断是否有相关DOM元素被拖动
  if (relatedDom.value) {
    // 获取临时相关DOM元素，并判断是否为子元素拖动
    const tempRelated = relatedDom.value.querySelector('.drag-animation')
    const isChild = relatedDom.value.className.includes('son-drag-animation')

    // 根据拖动的相关DOM元素，确定拖入的方式（before、after或inner）
    if (tempRelated) {
      tempRequest.DropType = Array.from(tempRelated.classList).includes('before') ? 'before' : 'after'
    } else if (isChild) {
      tempRequest.DropType = 'inner'
    }

    // 从相关DOM元素的类名中获取拖入的ID
    relatedDom.value?.classList.forEach((item) => {
      if (item.includes('drag-class')) {
        tempRequest.DropID = Number(item.split('drag-class-')[1])
      }
    })

    // 打印拖动的相关信息
    console.log(`DragID:${tempRequest.DragID},DropID:${tempRequest.DropID},DropType:${tempRequest.DropType}`)

    // 获取拖动项和拖入项在数组中的索引及其数据
    const dragIndex = oneArray.findIndex((item) => item.id === tempRequest.DragID)
    const dragData = oneArray.find((item) => item.id === tempRequest.DragID)
    const dropIndex = oneArray.findIndex((item) => item.id === tempRequest.DropID)
    const dropData = oneArray.find((item) => item.id === tempRequest.DropID)

    // 如果找到了拖动项和拖入项，则进行数据处理
    if (dragIndex !== -1 && dragData && dropIndex !== -1 && dropData) {
      oneArray.splice(dragIndex, 1) // 从原位置移除拖动项
      // 根据拖入的方式，重新插入拖动项到新位置
      switch (tempRequest.DropType) {
        case 'before':
          dragData.parentID = dropData.parentID
          oneArray.splice(dropIndex, 0, dragData)
          break
        case 'after':
          dragData.parentID = dropData.parentID
          oneArray.splice(dropIndex + 1, 0, dragData)
          break
        case 'inner':
          dragData.parentID = dropData.id
          oneArray.splice(dropIndex, 0, dragData)
          break
        default:
          dragData.parentID = dropData.parentID
          oneArray.splice(dropIndex + 1, 0, dragData)
          break
      }
    }
  }

  // 重置表格数据，并在下一帧重新渲染表格布局
  tableData.value = []
  nextTick(() => {
    tableData.value = arraytotree(oneArray) // 将处理后的数组转换回树状结构
    taskTableRef.value?.doLayout() // 重新布局表格
  })

  // 清除拖动动画
  clearDragAnimation()
}
// 设置拖动排序
const setDragSort = () => {
  // 获取容器元素
  const el = taskTableRef.value?.$el.querySelector('.el-table__body-wrapper tbody')
  if (!el) return
  sortableObj.value = new Sortable(el, {
    handle: '.drag-mark',
    forceFallback: false,
    onMove: tableMove,
    onStart: tableStart,
    onEnd: tableEnd,
  })
}

onMounted(() => {
  setDragSort()
})
</script>
<style scoped lang="scss">
:deep(.tree-table-drag) {
  .el-table td .cell {
    height: 32px;
  }

  .el-table td .cell,
  .el-table th .cell {
    position: relative;
    display: flex;
    align-items: center;
    font-size: 13px;

    .hidden-date-picker {
      width: 100%;
      visibility: hidden;
      position: absolute;
      top: 0px;
    }
  }

  .el-table [class*='el-table__row--level'] .el-table__expand-icon {
    height: 24px;
    width: 24px;
    margin-right: 0px;
  }

  .el-table__expand-icon > .el-icon {
    height: 24px;
    width: 24px;
  }

  .el-table .el-table__placeholder {
    width: 24px;
  }

  .table-row {
    cursor: pointer;
    position: relative;

    .show-button {
      display: none;
    }

    &:hover .show-button {
      display: initial;
    }
  }

  .drag-mark {
    padding: 10px;
    cursor: move;
  }
}

// 拖动效果
:deep(.drag-animation) {
  width: 100%;
  height: 0px;
  border-bottom: 2px solid #009688;
  position: absolute;
  left: 0px;
  z-index: 10;
  background-color: #009688;

  &::before {
    content: '';
    position: absolute;
    top: -4px;
    left: 0px;
    width: 10px;
    height: 10px;
    z-index: 10;
    border-radius: 50%;
    background-color: #009688;
  }
}

:deep(.before) {
  top: 0px;
}

:deep(.after) {
  bottom: 0px;
}

:deep(.son-drag-animation) {
  background-color: #009688;
  color: #ffffff;

  td {
    background-color: #009688 !important;
  }

  &:hover {
    color: #606266;
  }
}
</style>
