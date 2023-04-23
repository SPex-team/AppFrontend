import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ethers } from 'ethers'

interface IState {
  metaMaskAccount?: string

  provider?: ethers.BrowserProvider
  signer?: any

  marketList: any[]
  marketPage: number
  marketCount: number

  meList: any[]
  mePage: number
  meCount: number

  loading: boolean
}

const initialState: IState = {
  marketList: [],
  marketPage: 1,
  marketCount: 0,

  meList: [],
  mePage: 1,
  meCount: 0,

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
