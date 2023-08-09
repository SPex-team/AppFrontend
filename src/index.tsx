import React from 'react'
import ReactDOM from 'react-dom'
import 'react-toastify/dist/ReactToastify.css'
import { Slide, ToastContainer } from 'react-toastify'

import { Provider } from 'react-redux'
import store from './store'
import { MetaMaskContextProvider } from '@/hooks/useMetaMask'

import './index.css'
import App from './App'

ReactDOM.render(
  <React.StrictMode>
    <MetaMaskContextProvider>
      <Provider store={store}>
        <App />
        <ToastContainer draggable={false} transition={Slide} hideProgressBar />
      </Provider>
    </MetaMaskContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
)
