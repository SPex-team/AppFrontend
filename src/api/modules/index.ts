import { postReq, putReq, getReq } from '../abstract'

// get list maket page api
export function getMaketList(params?: {}): Promise<any> {
  return getReq({
    url: '/api/v1/spex/miners',
    params
  })
}

// post buy maket page api
export function postBuyMessages(miner_id: number, data: { buyer: string }): Promise<any> {
  return postReq({
    url: `/api/v1/spex/list-miners/${miner_id}/buy`,
    data
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
export function postMiners(data: { owner: string; miner_id: number }): Promise<any> {
  return postReq({
    url: '/api/v1/spex/miners',
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
  return postReq({
    url: `api/v1/spex/miners/${miner_id}/update`,
    data
  })
}
