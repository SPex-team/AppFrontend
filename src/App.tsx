import router from '@/router'
import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loading from './components/Loading'
import { RootState } from './store'

const App = () => {
  const loading = useSelector((state: RootState) => state.root.loading)

  useEffect(() => {
    // 链更改时重新加载页面
    window.ethereum.on('chainChanged', (_chainId) => window.location.reload())
  }, [])

  return (
    <div className='App'>
      {loading && <Loading />}
      <RouterProvider router={router} />
    </div>
  )
}
export default App
