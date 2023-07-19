import { postReq, putReq, getReq, delReq, patchReq } from '../../abstract'

export function getSaleHistoryList(params?: {}): Promise<any> {
  return getReq({
    url: '/api/v1/spex/miners',
    params
  })
}

export function getTransactionHistory(params?: {}, account?: string): Promise<any> {
  if (account) {
    return getReq({
      url: `api/v1/spex/orders?seller_or_buyer=${account}`,
      params
    })
  }
  return getReq({
    url: '/api/v1/spex/orders',
    params
  })
}
