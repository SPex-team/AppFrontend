import router from '@/router'
import { RouterProvider } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loading from './components/Loading'
import { RootState } from './store'

const App = () => {
  const loading = useSelector((state: RootState) => state.root.loading)
  return (
    <div className='App h-full w-full'>
      {loading && <Loading />}
      <RouterProvider router={router} />
    </div>
  )
}
export default App
