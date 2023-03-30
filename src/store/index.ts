import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './modules/root'

const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略这些 action types
        ignoredActions: ['root/setRootData'],
        // 忽略所有 action 中的这些字段路径
        // ignoredActionPaths: ['root.loadClass`'],
        // 忽略 state 中的这些路径 paths in the state
        ignoredPaths: ['root.provider', 'root.signer']
      }
      // serializableCheck: false
    }),
  reducer: {
    root: rootReducer
  }
})

export default store

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
