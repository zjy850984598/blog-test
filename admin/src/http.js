import axios from 'axios'
import Vue from 'vue'
import router from './router'

const http = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/admin/api',
  // baseURL: 'http://localhost:3000/admin/api'
})

http.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = 'Bearer ' + token
    }
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  }
)
http.interceptors.response.use(
  (res) => {
    const { ok, message } = res.data || {}
    if (!ok) Vue.prototype.$message({ type: 'error', message })
    return res.data
  },
  (err) => {
    if (err.response.data.message) {
      Vue.prototype.$message({
        type: 'error',
        message: err.response.data.message,
      })

      if (err.response.status === 401) {
        router.push('/login')
      }
    }

    return Promise.reject(err)
  }
)

export default http
