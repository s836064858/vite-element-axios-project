import { h } from 'vue'
import * as elIcon from '@element-plus/icons-vue'
import { isNumber } from 'lodash'

const Icon = (props) => {
  let { name, size, color } = props
  let style = {}
  if (size) {
    if (isNumber(size) || /^\d+$/.test(size)) style.fontSize = size + 'px'
    else style.fontSize = size
  }
  if (color) style.color = color
  return h('i', { class: 'el-icon', style }, [h(elIcon[name])])
}

export default Icon
