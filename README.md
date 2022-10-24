# vite-element-axios-project

这个工程是个人基于 vite,element,axios 搭建的基本项目“地基”，用于快速开启一个新项目使用。持续更新

# 使用文档

## axios 请求

1. token 存于 vuex 中（localstorage），拦截请求后将 token 添加进去

```js
/**
 * 请求拦截
 * @type {[type]}
 */
instance.interceptors.request.use(
  (config) => {
    const userInfo = store.getters.userInfo
    config.headers['token'] = userInfo && userInfo.token
    return config
  },
  (error) => {
    return Promise.reject(new Error(error))
  }
)
```

2. 请求成功后做响应拦截，抛出为`response.data.data`，不包含`code`与`Message`

```js
/**
 * 响应拦截
 * @type {[type]}
 */
instance.interceptors.response.use(
  (response) => {
    const data = response.data.data
    const code = response.data.code
    const message = response.data.message
    if (code === 200) {
      return data
    } else if (code === 401) {
      //身份校验失败，跳至登陆页面
      ElMessage.error(message)
      router.push('/login')
      return Promise.reject(new Error(message))
    } else {
      ElMessage.error(message)
      return Promise.reject(new Error(message))
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)
```

3. API 调用方法

（一）统一封装 axios,在 api 文件中定义接口,然后在页面中使用

```js
/**
 * @description: 获取版本号
 * @param {type} params
 */
export const getVersionList = (params) =>
  axios({
    url: '/back/log/selectProjectLog',
    method: 'get',
    params,
  })
//使用
//接口请求事例
import { onMounted } from 'vue'
import { getVersionList } from '@api'

onMounted(() => {
  getList()
})

async function getList() {
  const res = await getVersionList({ page: 1, pageSize: 10 })
  console.log(res)
}
```

## 生产环境与开发环境区分

1. 生产环境，根目录下创建.env.production 文件

```js
NODE_ENV = 'production'
VUE_APP_API_URL = 'https://localhost:3000/' //线上地址
```

2. 开发环境，使用 webpack 中`devServer`进行接口转发，同时可支持跨域

```js
server: {
    cors: true,
    proxy: {
      '^/api': {
        target: 'https://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
```

## 规范

1. 缩进: `空格:2` 在 Vscode 中设置

2. eslint 与 vetur 插件配置项采取如下(在 Vscode 中配置文件设置)

\*建议 vscode 添加 eslint，vetur，Prettier - Code formatter

```json
{
  "eslint.run": "onSave",
  "eslint.debug": true,
  "eslint.alwaysShowStatus": true,
  "eslint.format.enable": true,
  //保存自动格式化
  "editor.formatOnSave": true,
  "editor.tabSize": 2,
  //使用单引号
  "prettier.singleQuote": true,
  //结尾不加分号
  "prettier.semi": false,
  "prettier.printWidth": 160,
  //.vue文件template格式化支持，并使用js-beautify-html插件
  "vetur.format.defaultFormatter.html": "js-beautify-html",
  "vetur.format.defaultFormatter.js": "vscode-typescript",
  "vetur.format.defaultFormatterOptions": {
    "js-beautify-html": {
      "wrap_attributes": "auto", //vue组件中html代码格式化样式
      "end_with_newline": false
    }
  },
  "fileheader.configObj": {
    "autoAdd": false
  },
  //根据文件后缀名定义vue文件类型
  "files.associations": {
    "*.vue": "vue"
  }
}
```

3. eslint 常用配置

```js
module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: ['plugin:vue/essential', 'standard'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  plugins: ['vue'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },
}
```

4. .gitignore 配置（主要忽略.zip、/dist、node_modules、.rar 文件,如有其它另加）

5. css className 单词之间使用-连接，js 变量函数名使用驼峰

6. git 提交使用 fix(修改),feat(新增功能),perf(优化)

   \*先允许`npm run prepare`安装husky

   \*使用 commitlint 限制 git 提交 规范例如（fix: ‘message’）

## UI 框架

[element-ui](https://element-plus.org/#/zh-CN/component/installation)

## VSCode 新建代码片段

1. 入口:首选项->配置用户代码片段->新建用户代码片段

2. 

```json
{
	"vue3-template":{
		"scope": "vue",
		"prefix": "<template> vue3-scss.vue",
		"body": [
			"<template>\n</template>"
			"<script setup>\nimport { onMounted, ref } from 'vue'\n\n</script>"
			"<style lang='scss' scoped>\n\n</style>"
		],
		"description": "vue3 javascript sass 模版文件结构"
	}
}
```

3. 使用：新建文件输入 `<template> vue3-scss.vue`选择该项即可
