import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ethers } from 'ethers'

interface IState {
  metaMaskAccount?: string

  provider?: ethers.BrowserProvider
  signer?: any

  maketList: any[]
  maketPage: number
  maketCount: number

  meList: any[]
  mePage: number
  meCount: number

  loading: boolean
}

const initialState: IState = {
  maketList: [],
  maketPage: 1,
  maketCount: 0,

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
