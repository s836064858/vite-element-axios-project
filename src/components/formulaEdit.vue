<template>
  <div :class="`input-inner ${readonly && 'readonly'}`" @click="showFormulaDialog" v-html="showStr || '请输入'"></div>
  <el-dialog v-model="isShowDialog">
    <template #header>
      <div class="formula-container-title">
        公式编辑
        <span class="formula-container-title-sub">使用数学运算符编辑公式</span>
      </div>
    </template>
    <div class="formula-container">
      <!-- 公式编辑区域 -->
      <div
        class="formula-container-view"
        ref="formulaView"
        contentEditable="true"
        @click="recordPosition"
        @keyup="editEnter($event)"
        @paste="paste($event)"
      ></div>
      <div class="formula-container-tabs">
        <div class="formula-container-tab border-gray">
          <div class="tit">字段列表</div>
          <ul>
            <li @click="addItem($event, 1)" v-for="item in props.fields" :key="item.id" :field-id="item.id">{{ item.name }}</li>
          </ul>
          <span v-if="!props.fields.length">没有匹配的字段</span>
        </div>
        <div class="formula-container-tab border-gray">
          <div class="tit">公式列表</div>
          <ul>
            <li @click="addItem($event, 2)" v-for="item in props.formulaArr" :key="item.formula" :formula-id="item.id" @mouseover="showHelp(item)">
              {{ item.formula }}
            </li>
          </ul>
          <span v-if="!props.formulaArr.length">没有匹配的公式</span>
        </div>
        <div class="formula-container-tab-des border-gray">
          <template v-if="helpTip.formula">
            <div class="tit">{{ helpTip.formula }}</div>
            <ul>
              <li v-for="item in helpTip.desc">{{ item }}</li>
            </ul>
          </template>
          <template v-else>
            <ul>
              <li>请从左侧面板选择字段名和函数，或者输入函数</li>
            </ul>
          </template>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="getFormula">确认</el-button>
        <el-button @click="isShowDialog = false">取消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup>
import { watch, ref, onMounted } from 'vue'
const emits = defineEmits(['update:modelValue'])

const props = defineProps({
  modelValue: {
    type: String,
    default: [],
  },
  fields: {
    type: Array,
    default: [],
  },
  formulaArr: {
    type: Array,
    default: [],
  },
  readonly: {
    type: Boolean,
    default: false,
  },
})

onMounted(() => {
  parsingFormula(props.modelValue)
})

watch(
  () => props.modelValue,
  (val) => {
    parsingFormula(val)
  }
)

let isShowDialog = ref(false)
let showStr = ref(null)

function showFormulaDialog() {
  if (props.readonly) return
  isShowDialog.value = true
  nextTick(() => {
    setInnerHtml(showStr.value)
  })
}

//公式编辑器 Dom
let formulaView = ref(null)
// 公式编辑器最后光标位置
let formulaLastRange = null
/**
 * @description: 输入回车
 * @param {*} e
 * @return {*}
 */
function editEnter(e) {
  e.preventDefault()
  if (e.keyCode == 13) {
    // 获取标签内容 并把多个换行替换成1个
    let content = formulaView.value.innerHTML.replace(/(<div><br><\/div>){2,2}/g, '<div><br></div>')
    // 记录是否第一行回车
    const divCount = formulaView.value.querySelectorAll('div')
    // 获取当前元素内全部子节点
    const childNodes = formulaView.value.childNodes
    // 记录当前光标子节点位置
    let rangeIndex = 0
    for (let i = 0; i < childNodes.length; i++) {
      const one = childNodes[i]
      if (one.nodeName == 'DIV') {
        rangeIndex = i
      }
    }
    // 若是有替换则进行光标复位
    if (divCount.length >= 1) {
      // 替换回车插入的div标签
      content = content.replace(/<div>|<\/div>/g, function (word) {
        if (word == '<div>') {
          // 若是是第一行不在替换br
          return divCount.length > 1 ? ' ' : ' <br>'
        } else if (word == '</div>') {
          return ' '
        }
      })
      // 更新替换内容，光标复位
      formulaView.value.innerHTML = content
      // 建立新的光标对象
      var range = document.createRange()
      // 光标对象的范围界定为新建的表情节点
      range.selectNodeContents(formulaView.value)
      // 光标位置定位在表情节点的最大长度
      range.setStart(formulaView.value, rangeIndex + (divCount.length > 1 ? 0 : 1))
      // 使光标开始和光标结束重叠
      range.collapse(true)
      // 清除选定对象的全部光标对象
      window.getSelection().removeAllRanges()
      // 插入新的光标对象
      window.getSelection().addRange(range)
    }
  }
  // 保存最后光标点
  recordPosition()
}

/**
 * @description: 禁止粘贴事件
 * @param {*} e
 * @return {*}
 */
function paste(e) {
  e.preventDefault()
  return ''
}

/**
 * @description: 添加字段
 * @param {*} e
 * @param {*} type1 字段  2 公式
 * @return {*}
 */
function addItem(e, type) {
  // 当前元素全部子节点
  let nodes = formulaView.value.childNodes
  // 当前子元素偏移量
  let offset = formulaLastRange && formulaLastRange.startOffset
  // 当前光标后的元素
  let nextEl = formulaLastRange && formulaLastRange.endContainer
  // 建立节点片断
  let fd = document.createDocumentFragment()

  // 建立字段节点 公式节点
  let spanEl = document.createElement('span')
  spanEl.setAttribute('contentEditable', false)
  // 标识为新添加元素 用于定位光标
  spanEl.setAttribute('new-el', true)
  spanEl.innerHTML = e.target.innerHTML
  if (type === 1) {
    spanEl.className = 'field'
    //添加字段ID标识
    spanEl.setAttribute('field-id', e.target.getAttribute('field-id'))
  } else {
    spanEl.className = 'formula'
    //添加公式ID标识
    spanEl.setAttribute('formula-id', e.target.getAttribute('formula-id'))
  }
  let empty = document.createTextNode(' ')
  let bracketEl = document.createTextNode('()')
  // 区分文本节点替换 仍是父节点插入
  if (nextEl && nextEl.className != 'formula-container-view') {
    // 获取文本节点内容
    let content = nextEl.data
    // 添加前段文本
    fd.appendChild(document.createTextNode(content.substr(0, offset) + ' '))
    //添加字段/公式 span DOM
    fd.appendChild(spanEl)
    //公式添加括号
    if (type === 2) fd.appendChild(bracketEl)
    // 添加后段文本
    fd.appendChild(document.createTextNode(' ' + content.substr(offset)))
    // 替换节点
    formulaView.value.replaceChild(fd, nextEl)
  } else {
    // 添加前段文本
    fd.appendChild(empty)
    //添加字段/公式 span DOM
    fd.appendChild(spanEl)
    //公式添加括号
    if (type === 2) fd.appendChild(bracketEl)
    fd.appendChild(empty)
    // 若是有偏移元素且不是最后节点  中间插入节点  最后添加节点
    if (nodes.length && nodes.length > offset) {
      formulaView.value.insertBefore(fd, nextEl && nextEl.className != 'formula-container-view' ? nextEl : nodes[offset])
    } else formulaView.value.appendChild(fd)
  }
  // 遍历光标偏移数据 删除标志
  let elOffSet = 0
  for (let i = 0; i < nodes.length; i++) {
    let el = nodes[i]
    if (el.nodeName == 'SPAN' && el.getAttribute('new-el')) {
      elOffSet = i
      el.removeAttribute('new-el')
    }
  }
  // 建立新的光标对象
  let range = document.createRange()
  if (type === 1) {
    range.selectNodeContents(formulaView.value)
    range.setStart(formulaView.value, elOffSet + 1)
  } else {
    //公式添加后光标移至括号内
    range.selectNodeContents(bracketEl)
    range.setStart(bracketEl, 1)
  }
  // 使光标开始和光标结束重叠
  range.collapse(true)
  // 清除选定对象的全部光标对象
  window.getSelection().removeAllRanges()
  // 插入新的光标对象
  window.getSelection().addRange(range)
  // 保存新光标
  recordPosition()
}

/**
 * @description: 记录光标的位置
 * @return {*}
 */
function recordPosition() {
  formulaLastRange = window.getSelection().getRangeAt(0)
}

/**
 * @description: 获取公式
 * @return {*}
 */
function getFormula() {
  const nodes = formulaView.value.childNodes
  let str = ''
  for (let i = 0; i < nodes.length; i++) {
    const el = nodes[i]
    if (el.className == 'field') {
      str += '#' + el.getAttribute('field-id') + '#'
    } else if (el.className == 'formula') {
      str += '!' + el.getAttribute('formula-id') + '!'
    } else {
      str += el.data ? el.data.trim() : ''
    }
  }
  showStr.value = formulaView.value.innerHTML
  isShowDialog.value = false
  emits('update:modelValue', str)
}

/**
 * @description: 公式反解析
 * @param {*} formulaStr
 * @return {*}
 */
function parsingFormula(formulaStr) {
  if (!formulaStr) return
  const str = formulaStr
    .replace(/#(\d+)#/g, function (word, $1) {
      let label = null
      props.fields.forEach((item) => {
        if (item.id.toString() === $1) label = item.name
      })
      return `<span contentEditable='false' class="field" field-id='${$1}'>${label}</span>`
    })
    .replace(/\!(\d+)\!/g, function (word, $1) {
      let label = null
      props.formulaArr.forEach((item) => {
        if (item.id.toString() === $1) label = item.formula
      })
      return `<span contentEditable='false' class="formula" formula-id='${$1}'>${label}</span>`
    })

  showStr.value = str
}

/**
 * @description: 设置innerHTML
 * @param {*} str
 * @return {*}
 */
function setInnerHtml(str) {
  formulaView.value.innerHTML = str
  // 建立新的光标对象
  const range = document.createRange()
  // 光标对象的范围界定为新建的表情节点
  range.selectNodeContents(formulaView.value)
  // 光标位置定位在表情节点的最大长度
  range.setStart(formulaView.value, formulaView.value.childNodes.length)
  // 使光标开始和光标结束重叠
  range.collapse(true)
  // 清除选定对象的全部光标对象
  window.getSelection().removeAllRanges()
  // 插入新的光标对象
  window.getSelection().addRange(range)
  // 保存新光标
  recordPosition()
}

let helpTip = ref({})
/**
 * @description: 显示提示
 * @param {*} item
 * @return {*}
 */
function showHelp(item) {
  helpTip.value = item
}
</script>
<style lang="scss">
.formula-container-view {
  .field,
  .formula {
    user-select: none;
    display: inline-block;
    border-radius: 2px;
    padding: 0 5px;
    margin: 1px;
    color: #fff;
    font-size: 12px;
    line-height: 20px;
  }
  .field {
    background: #178cdf;
    color: #fff;
  }
  .formula {
    color: #708;
  }
}
</style>
<style lang="scss" scoped>
ul {
  list-style: none;
}
.border-gray {
  border: 1px solid rgba(17, 31, 44, 0.08);
  border-radius: 5px;
}

.formula-container {
  padding: 0 16px;
  &-title {
    padding: 20px 0 10px;
    font-size: 16px;
    color: rgba(0, 0, 0, 0.8);
    &-sub {
      color: #91a1b7;
      font-size: 12px;
      margin-left: 10px;
    }
  }
  &-view {
    margin-top: 20px;
    min-height: 100px;
    width: 100%;
    padding: 5px;
    resize: both;
    overflow: auto;
    line-height: 25px;
    border: 1px solid rgba(17, 31, 44, 0.08);
    border-radius: 5px;
    span {
      user-select: none;
      display: inline-block;
      margin: 0 3px;
      height: 20px;
      line-height: 20px;
      letter-spacing: 2px;
      background: #aaa;
      border-radius: 3px;
      white-space: nowrap;
      color: red;
      &:first-child {
        margin-left: 0;
      }
    }
  }
  &-tabs {
    display: flex;
    margin-top: 15px;
    font-size: 12px;
    height: 200px;
    .tit {
      line-height: 30px;
      padding: 3px 10px;
      font-weight: bold;
      border-bottom: 1px solid rgba(17, 31, 44, 0.08);
    }
  }
  &-tab {
    flex: 1.5;
    margin-right: 15px;
    overflow: auto;
    ul {
      li {
        cursor: pointer;
        padding: 0 5px 0 22px;
        font-size: 12px;
        line-height: 32px;
        height: 32px;
        color: #171a1d;
      }
      li:hover {
        background: rgba(126, 134, 142, 0.08);
      }
    }
    span {
      line-height: 32px;
    }
  }
  &-tab-des {
    flex: 2;
    li {
      padding: 0 5px 0 10px;
      font-size: 12px;
      line-height: 20px;
      height: 20px;
      color: #171a1d;
    }
  }
}
::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
}
.input-inner {
  height: 32px;
  line-height: 30px;
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  color: #606266;
  padding: 1px 11px;
  overflow: hidden;
}
.readonly {
  background: #f5f7fa;
  color: #a8abb2;
}
</style>
