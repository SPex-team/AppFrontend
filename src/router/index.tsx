import Market from '@/pages/Market/index'
import History from '@/pages/History'
import Me from '@/pages/Me/index'
import Comment from '@/pages/Comment'

// import { lazy, ReactNode, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
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
        path: '/market',
        element: lazyLoad(<Market />)
      },
      {
        path: '/history',
        element: lazyLoad(<History />)
      },
      {
        path: '/me',
        element: lazyLoad(<Me />)
      },
      {
        path: '/comment/:minerId',
        element: lazyLoad(<Comment />)
      }
    ]
  }
])

export default router
