import React from 'react'
import 'react-toastify/dist/ReactToastify.css'
import { Slide, ToastContainer } from 'react-toastify'

import { Provider } from 'react-redux'
import store from './store'
import { MetaMaskContextProvider } from './hooks/useMetaMask'
import { createRoot } from 'react-dom/client'

import './index.css'
import App from './App'

const container = document.getElementById('root')
const root = createRoot(container)

root.render(
  <React.StrictMode>
    <MetaMaskContextProvider>
      <Provider store={store}>
        <App />
        <ToastContainer draggable={false} transition={Slide} hideProgressBar />
      </Provider>
    </MetaMaskContextProvider>
  </React.StrictMode>
)
