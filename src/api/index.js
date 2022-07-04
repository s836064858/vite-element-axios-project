/*
 * @Author: your name
 * @Date: 2021-12-16 09:15:44
 * @LastEditTime: 2021-12-16 10:45:16
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /vite-element-axios-project/src/api/index.js
 */
import axios from './axios'
/**
 * @description: 获取版本号
 * @param {type} params
 */
export const getVersionList = (params) =>
  axios({
    url: '/back/log/selectProjectLog',
    method: 'get',
    params
  })
