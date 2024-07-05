/*
 * @Author: your name
 * @Date: 2021-12-16 09:15:44
 * @LastEditTime: 2023-12-05 18:09:43
 * @LastEditors: 荛子
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /vite-element-axios-project/src/api/index.js
 */
import axios from './axios'
/**
 * @description: 获取版本号
 * @param {type} params
 */
export const getVersionList = (data) =>
  axios({
    url: '/back/log/selectProjectLog',
    method: 'post',
    data,
  })
