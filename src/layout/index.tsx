import Header from '@/components/Header'
import Footer from '@/components/Footer'

const Layout = (props) => {
  const { children } = props
  return (
    <>
      <Header />
      {/* {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          className: `${child.props.className} img-special-class`
        })
      )} */}
      {children}
      <Footer />
    </>
  )
}

export default Layout
