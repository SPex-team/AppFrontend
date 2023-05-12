import axios, { AxiosRequestConfig, Method } from 'axios'

interface PendingType {
  url: string | undefined
  method: Method | undefined
  params: object
  data: object
  cancel: Function
}

const pending: Array<PendingType> = []
const CancelToken = axios.CancelToken

const service = axios.create({
  withCredentials: false,
  timeout: 350000
})

const removePending = (config: AxiosRequestConfig) => {
  for (const key in pending) {
    const item: number = +key
    const list: PendingType = pending[key]
    if (
      list.url === config.url &&
      list.method === config.method &&
      JSON.stringify(list.params) === JSON.stringify(config.params) &&
      JSON.stringify(list.data) === JSON.stringify(config.data)
    ) {
      // 从数组中移除记录
      pending.splice(item, 1)
    }
  }
}

service.interceptors.request.use(
  (request) => {
    removePending(request)
    request.cancelToken = new CancelToken((c) => {
      pending.push({
        url: request.url,
        method: request.method,
        params: request.params,
        data: request.data,
        cancel: c
      })
    })
    request.baseURL = process.env['REACT_APP_BASE_URL']
    return Promise.resolve(request)
  },
  (error) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    removePending(response.config)
    // response.data.data = JSON.parse(response.data.data)
    return Promise.resolve(response)
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default service
