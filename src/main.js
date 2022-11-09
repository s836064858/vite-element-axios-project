import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
//引入路由
import router from './router'
app.use(router)
//引入element-plus
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import 'element-plus/dist/index.css'
app.use(ElementPlus, {
  locale: zhCn,
})
//引入全局Icon组件
import Icon from './components/icon'
app.component('Icon', Icon)

app.mount('#app')
