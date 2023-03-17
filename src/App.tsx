import router from '@/router'
import { RouterProvider } from 'react-router-dom'

const App = () => {
  return (
    <div className='App'>
      <h1 className='text-3xl font-bold underline'>Hello world!</h1>
      <RouterProvider router={router} />
    </div>
  )
}
export default App

// import router from '@/router';
// import { useRoutes } from 'react-router-dom';
// const App = () =>{
//     return useRoutes(router)
// }
// export default App;
