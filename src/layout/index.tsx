import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const Layout = (props) => {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/market', { replace: true })
    }
  })

  return (
    <>
      <Header />
      {/* {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          className: `${child.props.className} img-special-class`
        })
      )} */}
      <main className="bg-[url('./assets/images/bg.png')] bg-cover [min-height:calc(100%-279px)]">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default Layout
