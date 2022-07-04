/*
 * @Author: your name
 * @Date: 2021-12-16 09:10:53
 * @LastEditTime: 2021-12-16 10:37:01
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /vite-element-axios-project/src/api/axios.js
 */
import axios from 'axios'
import config from './config'
import { ElMessage } from 'element-plus'
import router from '../router'
export default function $axios(options) {
  return new Promise((resolve, reject) => {
    const instance = axios.create(config)
    /**
     * 请求拦截
     * @type {[type]}
     */
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token')
        if (token) config.headers['token'] = token
        return config
      },
      (error) => {
        return Promise.reject(new Error(error))
      }
    )
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
        if (error && error.response) {
          switch (error.response.status) {
            case 400:
              error.message = '请求错误'
              break
            case 401:
              error.message = '未授权，请登录'
              break
            case 403:
              error.message = '拒绝访问'
              break
            case 404:
              error.message = `请求地址出错: ${error.response.config.url}`
              break
            case 408:
              error.message = '请求超时'
              break
            case 500:
              error.message = '服务器内部错误'
              break
            case 501:
              error.message = '服务未实现'
              break
            case 502:
              error.message = '网关错误'
              break
            case 503:
              error.message = '服务不可用'
              break
            case 504:
              error.message = '网关超时'
              break
            case 505:
              error.message = 'HTTP版本不受支持'
              break
            default:
              break
          }
        }
        ElMessage.error(error)
        return Promise.reject(error)
      }
    )

    instance(options)
      .then((res) => resolve(res))
      .catch((error) => reject(error))
  })
}
