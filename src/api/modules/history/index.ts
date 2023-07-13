import { postReq, putReq, getReq, delReq, patchReq } from '../../abstract'

export function getSaleHistoryList(params?: {}): Promise<any> {
  return getReq({
    url: '/api/v1/spex/miners',
    params
  })
}
