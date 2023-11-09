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
// 表格拖动开始
const tableStart = (event) => {
  // 在Sortable中onMove返回false时，拖动的那个元素不会触发onMove事件，所以手动添加上事件
  event.item.addEventListener(
    'dragover',
    throttle(() => {
      if (relatedDom.value) {
        clearDragAnimation()
        relatedDom.value = undefined
      }
    }, 300)
  )
}
// 表格拖动中 主要处理拖动的动画
const tableMove = (evt, originalEvent) => {
  if (relatedDom.value && !evt.related.isEqualNode(relatedDom.value)) {
    // 如果替换的dom不一致，则删除原有的效果
    clearDragAnimation()
    relatedDom.value = evt.related
  } else if (!relatedDom.value) {
    relatedDom.value = evt.related
  }

  if (originalEvent.offsetY > 2 && originalEvent.offsetY <= 10) {
    clearDragAnimation()
    // 替换dom的前面
    const div = document.createElement('div')
    div.className = 'before drag-animation'
    evt.related.appendChild(div)
  } else if (originalEvent.offsetY > 10 && originalEvent.offsetY <= 20) {
    clearDragAnimation()
    // 替换dom的子级
    evt.related.classList.add('son-drag-animation')
  } else if (originalEvent.offsetY > 20) {
    clearDragAnimation()
    // 替换dom的后面
    const div = document.createElement('div')
    div.className = 'after drag-animation'
    evt.related.appendChild(div)
  }
  return false
}
// 表格拖动结束 主要处理拖动后表格的数据变化
const tableEnd = () => {
  let tempRequest = {
    DragID: dragID.value,
    DropID: 0,
    DropType: '',
  }

  const oneArray = treetoarray(taskTableRef.value?.data || [])
  if (relatedDom.value) {
    const tempRelated = relatedDom.value.querySelector('.drag-animation')
    const isChild = relatedDom.value.className.includes('son-drag-animation')
    // 获取拖入方式
    if (tempRelated) {
      tempRequest.DropType = Array.from(tempRelated.classList).includes('before') ? 'before' : 'after'
    } else if (isChild) {
      tempRequest.DropType = 'inner'
    }
    // 获取拖入的ID
    relatedDom.value?.classList.forEach((item) => {
      if (item.includes('drag-class')) {
        tempRequest.DropID = Number(item.split('drag-class-')[1])
      }
    })

    // 获取拖动的下标
    const dragIndex = oneArray.findIndex((item) => item.id == tempRequest.DragID)
    const dragData = oneArray.find((item) => item.id === tempRequest.DragID)
    // 获取拖入的下标
    const dropIndex = oneArray.findIndex((item) => item.id == tempRequest.DropID)
    const dropData = oneArray.find((item) => item.id == tempRequest.DropID)
    if (dragIndex != -1 && dragData && dropIndex != -1 && dropData) {
      oneArray.splice(dragIndex, 1)
      console.log(dragData)
      const childrenIndex = oneArray.findIndex((item) => item.id === dropData.id)

      switch (tempRequest.DropType) {
        case 'before':
          oneArray.splice(dropIndex - 1, 0, dragData)
          dragData.parentID = dropData.parentID
          // 模拟拖入子节点
          if (childrenIndex != -1) {
            oneArray.splice(childrenIndex, 0, dragData)
          }
          break
        case 'after':
          oneArray.splice(dropIndex, 0, dragData)
          dragData.parentID = dropData.parentID
          // 模拟拖入子节点
          if (childrenIndex != -1) {
            oneArray.splice(childrenIndex - 1, 0, dragData)
          }
          break
        case 'inner':
          oneArray.splice(dropIndex, 0, dragData)
          dragData.parentID = dropData.id
          break
        default:
          break
      }
    }
    tableData.value = []
    nextTick(() => {
      tableData.value = arraytotree(oneArray)
      taskTableRef.value?.doLayout()
    })
    clearDragAnimation()
  }
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
