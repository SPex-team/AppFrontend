import Maket from '@/pages/Maket'
import History from '@/pages/History'
import Me from '@/pages/Me'
// import { lazy, ReactNode, Suspense } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { getMaketList } from '@/api/modules'
import { ReactNode, Suspense } from 'react'
import Layout from '@/layout'

// const Error = lazy(() => import('@/404'))

const lazyLoad = (children: ReactNode): ReactNode => {
  return <Suspense fallback={<>loading...</>}>{children}</Suspense>
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/maket',
        element: lazyLoad(<Maket />)
      },
      {
        path: '/history',
        element: lazyLoad(<History />)
      },
      {
        path: '/me',
        element: lazyLoad(<Me />)
      }
    ]
  }
])

export default router
