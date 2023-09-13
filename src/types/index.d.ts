export declare global {
  interface IObject {
    [key: string]: any
  }

  interface Window {
    ethereum: any
  }
}

// load market
export interface LoanMarketListItem {
  miner_id: number
  owner: string
  is_list: boolean
  price: number
  price_raw: string
  balance_human: number
  power_human: number
  list_time: number
  buyer: string
  is_submitted_transfer_out: boolean
  number_comments: number
  create_time: string
  update_time: string
}
