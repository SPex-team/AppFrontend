import Market from '@/pages/Market/index'
import LoanMarket from '@/pages/LoanMarket'
import History from '@/pages/History'
import LoanHistory from '@/pages/LoanHistory'
import Me from '@/pages/Me/index'
import Comment from '@/pages/Comment'
import Profile from '@/pages/LoanProfile'
import FAQ from '@/pages/FAQ'

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
        path: '/loanMarket',
        element: lazyLoad(<LoanMarket />)
      },
      {
        path: '/history',
        element: lazyLoad(<History />)
      },
      {
        path: '/loanHistory',
        element: lazyLoad(<LoanHistory />)
      },
      {
        path: '/me',
        element: lazyLoad(<Me />)
      },
      {
        path: '/profile',
        element: lazyLoad(<Profile />)
      },
      {
        path: '/faq',
        element: lazyLoad(<FAQ />)
      },
      {
        path: '/comment/:minerId',
        element: lazyLoad(<Comment />)
      },
      {
        path: '/loanComment/:minerId',
        element: lazyLoad(<Comment />)
      }
    ]
  }
])

export default router
