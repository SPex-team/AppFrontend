import { postReq, putReq, getReq, delReq, patchReq } from '../../abstract'

export function getLoanMiners(params?: {}): Promise<any> {
  return getReq({
    url: '/api/v1/loan/miners',
    params
  })
}

export function postLoanMiners(data?: {}): Promise<any> {
  return postReq({
    url: '/api/v1/loan/miners',
    data
  })
}

export function patchLoanMiners(data?: any): Promise<any> {
  return patchReq({
    url: `/api/v1/loan/miners/${data.miner_id}`,
    data
  })
}

export function getLoanByMinerId(params): Promise<any> {
  return getReq({
    url: `/api/v1/loan/miners/${params.minerId}`
  })
}

export function getLoanList(params): Promise<any> {
  return getReq({
    url: `/api/v1/loan/loans`,
    params
  })
}

export function getLoanListByMiner(params): Promise<any> {
  return getReq({
    url: `/api/v1/loan/loans?miner_id=${params.miner_id}`,
    params
  })
}

export function postLoanList(data): Promise<any> {
  return postReq({
    url: `/api/v1/loan/loans`,
    data
  })
}

export function patchLoanById(data?: any): Promise<any> {
  return patchReq({
    url: `/api/v1/loan/loans/${data.id}`,
    data
  })
}

export function getLoanCommentList(params?: {}): Promise<any> {
  return getReq({
    url: '/api/v1/loan/comments',
    params
  })
}

export function postLoanComment(sign, data?: { user: string; content: string; miner: number }): Promise<any> {
  return postReq({
    url: `api/v1/loan/comments?sign=${sign}`,
    data
  })
}

export function getLoanMiner(minerId): Promise<any> {
  return getReq({
    url: `api/v1/loan/miners/${minerId}`
  })
}

export function postLoanUpdataMiners(miner_id, data?: { miner_id: number; new_owner_address: string }): Promise<any> {
  console.log('miner_id: ', miner_id)
  return postReq({
    url: `api/v1/loan/miners/${miner_id}/update`,
    data
  })
}

export function getMinerBalance(minerId): Promise<any> {
  return getReq({
    url: `api/v1/loan/miners/balances?miner_id=${minerId}`
  })
}
