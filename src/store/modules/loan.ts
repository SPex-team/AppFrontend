import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ethers } from 'ethers'
import { LoanMarketListItem } from '@/types'

interface IState {
  provider?: ethers.BrowserProvider
  signer?: any

  marketList: LoanMarketListItem[]
  marketPage: number
  marketCount: number

  minerPriceCeiling: number
  minerPriceFloor: number

  borrowList: any[]
  borrowPage: number
  borrowCount: number

  lendList: any[]
  lendPage: number
  lendCount: number

  tableLoading: boolean
  loading: boolean
}

const initialState: IState = {
  marketList: [],
  marketPage: 1,
  marketCount: 0,

  minerPriceCeiling: 0,
  minerPriceFloor: 0,

  borrowList: [],
  borrowPage: 1,
  borrowCount: 0,

  lendList: [],
  lendPage: 1,
  lendCount: 0,

  tableLoading: false,
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
