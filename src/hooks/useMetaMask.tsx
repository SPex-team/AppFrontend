'use client'

import {
  useState,
  useEffect,
  createContext,
  PropsWithChildren,
  useContext,
  useCallback,
  Fragment,
  useMemo
} from 'react'
import detectEthereumProvider from '@metamask/detect-provider'
import { abi, config } from '@/config'
import { Dialog, Transition } from '@headlessui/react'
import { toast } from 'react-toastify'
import { ethers, Contract } from 'ethers'

import MetaMaskURL from '@/assets/images/MetaMask.png'

interface WalletState {
  accounts: any[]
  balance: string
  chainId: string
  signer: any
}

interface MetaMaskContextData {
  wallet: WalletState
  currentAccount: string
  contract: any
  hasProvider: boolean | null
  error: boolean
  errorMsg: string
  isConnecting: boolean
  connectButton: (title?: string) => React.ReactNode
  connectMetaMask: () => void
  clearError: () => void
}

const ChainCfg = {
  MainNet: {
    chainId: '0x13a',
    chainName: 'Filecoin',
    nativeCurrency: {
      name: 'FIL',
      symbol: 'FIL',
      decimals: 18
    },
    rpcUrls: ['https://api.node.glif.io'],
    blockExplorerUrls: ['https://filscan.io']
  },
  Calibration: {
    chainId: '0x4cb2f',
    chainName: 'Calibration',
    nativeCurrency: {
      name: 'tFIL',
      symbol: 'tFIL',
      decimals: 18
    },
    rpcUrls: ['https://filecoin-calibration.chainup.net/rpc/v1'],
    blockExplorerUrls: ['https://calibration.filfox.info/en']
  }
}

const disconnectedState: WalletState = { accounts: [], balance: '', chainId: '', signer: null }

export const MetaMaskContext = createContext<MetaMaskContextData>({} as MetaMaskContextData)

export const MetaMaskContextProvider = ({ children }: PropsWithChildren) => {
  const [hasProvider, setHasProvider] = useState<boolean | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  const [isOpen, setIsOpen] = useState<boolean>(false)
  const openModal = () => {
    setIsOpen(true)
  }
  const closeModal = () => {
    setIsOpen(false)
  }

  const [errorMsg, setErrorMsg] = useState('')
  const clearError = () => setErrorMsg('')

  const [wallet, setWallet] = useState(disconnectedState)
  const [currentAccount, setCurrentAccount] = useState<string>('')

  useEffect(() => {
    setCurrentAccount(wallet?.accounts[0])
  }, [wallet])

  const contract = useMemo(() => new Contract(config.contractAddress, abi, wallet.signer), [wallet.signer])

  const _updateWallet = useCallback(async (providedAccounts?: any) => {
    const accounts = providedAccounts || (await window?.ethereum.request({ method: 'eth_accounts' }))

    if (accounts.length === 0) {
      // If there are no accounts, then the user is disconnected
      setWallet(disconnectedState)
      return
    }

    const balance = await window?.ethereum.request({
      method: 'eth_getBalance',
      params: [accounts[0], 'latest']
    })
    const chainId = await window?.ethereum.request({
      method: 'eth_chainId'
    })
    const signer = await new ethers.BrowserProvider(window.ethereum).getSigner()

    setWallet({ accounts, balance, chainId, signer })
  }, [])

  const updateWalletAndAccounts = useCallback(() => _updateWallet(), [_updateWallet])
  const updateWallet = useCallback((acounts: any) => _updateWallet(acounts), [_updateWallet])

  useEffect(() => {
    const getProvider = async () => {
      let provider: any = await detectEthereumProvider({ silent: true, mustBeMetaMask: true })

      // If user has multiple wallets, find MetaMask Provider
      if (provider?.providers) {
        provider.providers.forEach(async (p: any) => {
          if (p.isMetaMask) {
            provider = p
          }
        })
        //  to do: window.ethereum is not supposed to be overwritten. try to find out a better way to deal with it.
        window.ethereum = provider
      }

      setHasProvider(Boolean(provider))

      if (provider) {
        updateWalletAndAccounts()
        window?.ethereum.on('accountsChanged', updateWallet)
        window?.ethereum.on('chainChanged', updateWalletAndAccounts)
      }
    }
    getProvider()
    return () => {
      window?.ethereum?.removeListener('accountsChanged', updateWallet)
      window?.ethereum?.removeListener('chainChanged', updateWalletAndAccounts)
    }
  }, [updateWallet, updateWalletAndAccounts])

  const connectMetaMask = async () => {
    if (!hasProvider) {
      toast.info('Please install MetaMask!', {
        position: 'top-center'
      })
      closeModal()
      return window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en')
    }
    setIsConnecting(true)
    try {
      const accounts = await window?.ethereum?.request({
        method: 'eth_requestAccounts'
      })
      clearError()
      closeModal()
      updateWallet(accounts)
    } catch (err: any) {
      setErrorMsg(err.message)
    }
    setIsConnecting(false)
  }

  const addChain = (params) => {
    window?.ethereum.request({
      method: 'wallet_addEthereumChain', // Metamask的api名称
      params: params
    })
  }

  const connectButton = (title?: string) => {
    const { chainId } = wallet
    const { net } = config
    return (
      <div className='flex items-center gap-x-4'>
        {chainId !== undefined && currentAccount && chainId !== config.chainIdBinary && (
          <span
            className='cursor-pointer text-[#E6A23C]'
            onClick={() => {
              addChain([ChainCfg[net]])
            }}
          >
            Wrong Network
          </span>
        )}
        <button
          className='bg-gradient-common jr-connect-wallet hidden h-11 rounded-full px-4 text-white md:block'
          onClick={openModal}
          disabled={Boolean(currentAccount)}
        >
          {currentAccount
            ? currentAccount.slice(0, 6) +
              '...' +
              currentAccount.slice(currentAccount.length - 4, currentAccount.length)
            : title ?? 'Connect Wallet'}
        </button>
      </div>
    )
  }

  useEffect(() => {
    if (Boolean(errorMsg)) {
      toast.error(errorMsg, {
        position: 'bottom-right'
      })
      clearError()
    }
  }, [errorMsg])

  return (
    <MetaMaskContext.Provider
      value={{
        wallet,
        currentAccount,
        hasProvider,
        contract,
        error: Boolean(errorMsg),
        errorMsg,
        isConnecting,
        connectButton,
        connectMetaMask,
        clearError
      }}
    >
      {children}

      {/* wallet connect dialog */}
      <Transition show={isOpen} as={Fragment}>
        <Dialog onClose={() => setIsOpen(false)} className='relative z-50'>
          {/* The backdrop, rendered as a fixed sibling to the panel container */}
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
          </Transition.Child>

          {/* Full-screen container to center the panel */}
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 flex items-center justify-center p-4'>
              {/* The actual dialog panel  */}
              <Dialog.Panel className='relative mx-auto box-border w-[370px] rounded-[10px] bg-white bg-[url("./assets/images/bg_small.png")] bg-cover p-[54px] sm:w-[518px]'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                  className='absolute right-9 top-5 h-6 w-6 cursor-pointer'
                  onClick={(e) => {
                    e.nativeEvent.stopImmediatePropagation()
                    closeModal()
                  }}
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                </svg>
                <div className='flex flex-col items-center justify-center'>
                  <div className='mb-3 text-[36px] font-medium text-[#111029] sm:text-[45px]'>Select a Wallet</div>
                  <div className='mb-12 text-[18px] text-[#57596C]'>Connect your wallet to sign in.</div>
                  <div
                    className='flex w-full cursor-pointer justify-between rounded-[10px] border border-[#eaeaef] py-4 hover:border-[#0077fe]'
                    onClick={connectMetaMask}
                  >
                    <div className='flex'>
                      <img className='mx-4 h-[32px] w-[35px]' src={MetaMaskURL} alt='MetaMask' />
                      <span className='text-[24px] font-medium text-[#111029]'>Metamask</span>
                    </div>
                    {isConnecting && (
                      <div role='status' className='flex h-full items-center justify-center'>
                        <svg
                          aria-hidden='true'
                          className='mr-2 h-10 w-10 animate-spin fill-blue-600 text-gray-200 dark:text-gray-600'
                          viewBox='0 0 100 101'
                          fill='none'
                          xmlns='http://www.w3.org/2000/svg'
                        >
                          <path
                            d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
                            fill='currentColor'
                          />
                          <path
                            d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
                            fill='currentFill'
                          />
                        </svg>
                        <span className='sr-only'>Loading...</span>
                      </div>
                    )}
                  </div>
                </div>
                {errorMsg && <p className='absolute pt-1 text-sm'>{errorMsg}</p>}
              </Dialog.Panel>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </MetaMaskContext.Provider>
  )
}

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext)
  if (context === undefined) {
    throw new Error('useMetaMask must be used within a "MetaMaskContextProvider"')
  }
  return context
}
