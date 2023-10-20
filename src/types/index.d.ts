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
  delegator_address?: string
  max_debt_amount_raw?: string
  max_debt_amount_human?: number
  receive_address?: string
  daily_interest_rate?: number
  annual_interest_rate?: number
  annual_interest_rate_human?: number
  last_debt_amount_raw?: string
  last_debt_amount_human?: number
  last_update_timestamp?: number
  disabled?: boolean
  collateral_rate?: number
  total_balance_human?: number
  available_balance_human?: number
  initial_pledge_human?: number
  locked_rewards_human?: number
  create_time?: string
  update_time?: string
}

interface LoanMinerInfo {
  miner_id: number
  delegator_address: string
  max_debt_amount_raw: string
  max_debt_amount_human: number
  receive_address: string
  daily_interest_rate: number
  annual_interest_rate: number
  annual_interest_rate_human: number
  last_debt_amount_raw: string
  last_debt_amount_human: number
  last_update_timestamp: number
  disabled: boolean
  total_balance_human: number
  available_balance_human: number
  initial_pledge_human: number
  locked_rewards_human: number
  create_time: string
  update_time: string
}

interface LoanOrderInfo {
  id: number
  miner_id: number
  miner_total_balance_human: number
  user_address: string
  daily_interest_rate: number
  annual_interest_rate: number
  current_principal_human: number
  total_interest_human: number
  last_amount_raw: string
  last_amount_human: number
  last_update_timestamp: number
  create_time: string
  update_time: string
  transaction_hash: string
}

interface MinerBalance {
  total_balance_human: number
  available_balance_human: number
  pledge_balance_human: number
  locked_balance_human: number
}
