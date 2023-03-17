import Maket from '@/pages/Maket'
// import { lazy, ReactNode, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'

// const Error = lazy(() => import('@/404'))

// const lazyLoad = (children: ReactNode): ReactNode => {
//   return <Suspense fallback={<>loading...</>}>{children}</Suspense>
// }

const router = createBrowserRouter([
  {
    path: '/',
    element: <Maket />,
    children: [
      // { path: '', element: lazyLoad(<Home />) },
      // { path: RouterPath.home, element: lazyLoad(<Home />) },
      // { path: RouterPath.detail, element: lazyLoad(<Detail />) },
      // { path: RouterPath.error, element: lazyLoad(<Error />) }
    ]
  }
  // { path: RouterPath.auth, element: lazyLoad(<Auth />) }
])

export default router
