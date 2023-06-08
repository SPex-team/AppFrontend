import { AxiosRequest } from './types'
import service from './service'
import Response from '@/api/response'

import { config } from '@/config'

function _axios(_axiosRequest: AxiosRequest) {
  return new Promise((resolve, reject) => {
    console.log('config.baseUrl: ', config.baseUrl)
    service({
      baseURL: config.baseUrl,
      url: _axiosRequest.url,
      method: _axiosRequest.method,
      headers: _axiosRequest.headers,
      data: _axiosRequest.data,
      params: _axiosRequest.params,
      responseType: _axiosRequest.responseType
    })
      .then((response) => {
        // console.log("response: ", response)
        if (response.status === 200) {
          resolve(new Response(response.data))
        } else {
          /// 权限控制
          resolve(new Response(response.data))
        }
      })
      .catch((error) => {
        // console.log("error.response: ", error.response)
        const message = error?.response?.data?.detail || 'Request failed'
        reject({
          message: message,
          data: null
        })
      })
  })
}
export const postReq = (_axiosRequest: AxiosRequest) => {
  return _axios({
    url: _axiosRequest.url,
    headers: _axiosRequest.headers,
    method: 'POST',
    data: _axiosRequest.data,
    params: _axiosRequest.params
  })
}

export const getReq = (_axiosRequest: AxiosRequest) => {
  return _axios({
    url: _axiosRequest.url,
    headers: _axiosRequest.headers,
    method: 'GET',
    data: _axiosRequest.data,
    params: _axiosRequest.params
  })
}

export const putReq = (_axiosRequest: AxiosRequest) => {
  return _axios({
    url: _axiosRequest.url,
    headers: _axiosRequest.headers,
    method: 'PUT',
    data: _axiosRequest.data,
    params: _axiosRequest.params
  })
}
