import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ethers } from 'ethers'

interface IState {
  commentList: any[]
  commentPage: number
  commentCount: number
  commentMinerOwner: string
  metaMaskAccount?: string

  provider?: ethers.BrowserProvider
  signer?: any

  marketList: any[]
  marketPage: number
  marketCount: number

  meList: any[]
  mePage: number
  meCount: number

  historyList: any[]
  historyPage: number
  historyCount: number

  loading: boolean
}

const initialState: IState = {
  marketList: [],
  marketPage: 1,
  marketCount: 0,

  meList: [],
  mePage: 1,
  meCount: 0,

  commentList: [],
  commentPage: 1,
  commentCount: 0,
  commentMinerOwner: '',

  historyList: [],
  historyPage: 1,
  historyCount: 0,

  loading: false
}

const rootSlice = createSlice({
  name: 'root',
  initialState,
  reducers: {
    setRootData(state, action: PayloadAction<Partial<IState>>) {
      const data = action.payload

      return { ...state, ...data }
    }
  }
})

export const { setRootData } = rootSlice.actions
export const selectSigner = (state: IState) => state.signer

export default rootSlice.reducer
