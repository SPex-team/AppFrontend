import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ethers } from 'ethers'
import { LoanMarketListItem, LoanMinerInfo, LoanOrderInfo, MinerBalance } from '@/types'

interface IState {
  provider?: ethers.BrowserProvider
  signer?: any

  marketList: LoanMarketListItem[]
  marketPage: number
  marketCount: number

  minerInfo: LoanMinerInfo | undefined

  minerPriceCeiling: number
  minerPriceFloor: number

  minerBalance?: MinerBalance

  borrowList: LoanMarketListItem[]
  borrowPage: number
  borrowCount: number

  lendList: LoanOrderInfo[]
  lendListByMiner: LoanOrderInfo[]
  lendPage: number
  lendCount: number

  tableLoading: boolean
  tableLoading2: boolean
  loading: boolean
}

const initialState: IState = {
  marketList: [],
  marketPage: 1,
  marketCount: 0,

  minerInfo: undefined,

  minerPriceCeiling: 0,
  minerPriceFloor: 0,

  minerBalance: undefined,

  borrowList: [],
  borrowPage: 1,
  borrowCount: 0,

  lendList: [],
  lendListByMiner: [],
  lendPage: 1,
  lendCount: 0,

  tableLoading: false,
  tableLoading2: false,
  loading: false
}

const loanSlice = createSlice({
  name: 'loan',
  initialState,
  reducers: {
    setRootData(state, action: PayloadAction<Partial<IState>>) {
      const data = action.payload
      return { ...state, ...data }
    }
  }
})

export const { setRootData } = loanSlice.actions
export const selectSigner = (state: IState) => state.signer

export default loanSlice.reducer
