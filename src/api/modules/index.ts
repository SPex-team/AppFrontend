import { postReq, putReq, getReq, delReq, patchReq } from '../abstract'

// get list market page api
export function getMarketList(params?: {}): Promise<any> {
  return getReq({
    url: '/api/v1/spex/miners',
    params
  })
}

// post buy market page api
export function postBuyMessages(miner_id: number, data: { buyer: string }): Promise<any> {
  return postReq({
    url: `/api/v1/spex/list-miners/${miner_id}/buy`,
    data
  })
}

export function transferInCheck(params: { miner_id: number }): Promise<any> {
  return getReq({
    url: '/api/v1/spex/miners/transfer-in-check',
    params
  })
}

// step 1 api
export function postBuildMessage(data: { miner_id: number }): Promise<any> {
  return postReq({
    url: '/api/v1/spex/messages/build-change-owner-in',
    data
  })
}

// step 2 api
export function postPushMessage(data: { message: string; sign: string; cid: string; wait: boolean }): Promise<any> {
  return postReq({
    url: '/api/v1/spex/messages/push',
    data
  })
}

// step 3 api
export function postMiners(data?: { owner: string; miner_id: number }): Promise<any> {
  return postReq({
    url: '/api/v1/spex/miners/sync-new-miners',
    data
  })
}

// step 4 api
export function putMiners(
  miner_id: number,
  data: { owner: string; miner_id: number; price?: number; is_list?: boolean }
): Promise<any> {
  return putReq({
    url: `/api/v1/spex/miners/${miner_id}`,
    data
  })
}

// get list me page api
export function getMeList(params?: {}): Promise<any> {
  return getReq({
    url: '/api/v1/spex/miners',
    params
  })
}

export function getCommentList(params?: {}): Promise<any> {
  return getReq({
    url: '/api/v1/spex/comments',
    params
  })
}

// Transfer Out   me page api
export function postTransferOut(data?: { miner_id: number; new_owner_address: string }): Promise<any> {
  return postReq({
    url: '/api/v1/spex/messages/build-change-owner-out',
    data
  })
}

// remove Transfer me page api
// export function putTransferHidden(data: { miner_id: number; new_owner_address: string }): Promise<any> {
//   return putReq({
//     url: `spex/miners/${data.miner_id}`,
//     data
//   })
// }

export function postUpdataMiners(miner_id, data?: { miner_id: number; new_owner_address: string }): Promise<any> {
  console.log('miner_id: ', miner_id)
  return postReq({
    url: `api/v1/spex/miners/${miner_id}/update`,
    data
  })
}

export function postComment(sign, data?: { user: string; content: string; miner: number }): Promise<any> {
  return postReq({
    url: `api/v1/spex/comments?sign=${sign}`,
    data
  })
}

export function getMiner(minerId): Promise<any> {
  return getReq({
    url: `api/v1/spex/miners/${minerId}`
  })
}

// step 3 api
export function postMiner(data?: {
  owner: string | undefined
  miner_id: number
  price: number
  price_raw: number
  is_list: boolean
}): Promise<any> {
  return postReq({
    url: '/api/v1/spex/miners',
    data
  })
}

// step 4 api
export function putMiner(
  miner_id: number,
  data: { miner_id: number; owner?: string; price?: number; price_raw?: number; is_list?: boolean; timestamp?: number }
): Promise<any> {
  return putReq({
    url: `/api/v1/spex/miners/${miner_id}`,
    data
  })
}

export function deleteMiner(miner_id: number): Promise<any> {
  return delReq({
    url: `/api/v1/spex/miners/${miner_id}`
  })
}

export function patchMiner(
  miner_id: number,
  data: { miner_id?: number; owner?: string; price?: number; price_raw?: number; is_list?: boolean; timestamp?: number }
): Promise<any> {
  return patchReq({
    url: `/api/v1/spex/miners/${miner_id}`,
    data
  })
}

// miner price aggregated
export function getMinerPriceAggregated(func: 'max' | 'min'): Promise<any> {
  return getReq({
    url: `/api/v1/spex/miners/aggregation?_column=price&_func=${func}`
  })
}
