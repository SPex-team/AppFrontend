'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSelector, shallowEqual } from 'react-redux'
import { RootState } from '@/store'
import store from '@/store'
import { setRootData } from '@/store/modules/loan'

function useLoading() {
  const loading = useSelector((state: RootState) => state.root.loading, shallowEqual)

  const setLoading = useCallback((status: boolean) => {
    store.dispatch(setRootData({ loading: true }))
  }, [])

  return { loading, setLoading }
}

export default useLoading
