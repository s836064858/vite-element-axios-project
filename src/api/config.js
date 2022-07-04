/*
 * @Author: your name
 * @Date: 2021-12-16 09:11:15
 * @LastEditTime: 2021-12-16 09:11:15
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: /vite-element-axios-project/src/api/config.js
 */

let baseUrl = import.meta.env.VITE_API_URL
const config = {
  baseURL: baseUrl,
  timeout: 30000
}
export default config
