import { RootState } from '@/store'
import { setRootData } from '@/store/modules/root'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ethers } from 'ethers'
import { LAST_WALLET, config } from '@/config'

import MetaMaskURL from '@/assets/images/MetaMask.png'

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

interface IProps {
  title?: string
}

export default function WalletConnectBtn({ title = '' }: IProps) {
  const { ethereum } = window
  let provider = ethereum

  const metaMaskAccount = useSelector((state: RootState) => state.root.metaMaskAccount)
  const dispatch = useDispatch()
  const [currentChain, setCurrentChain] = useState()
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const net = config.net
  const isMultiWallets = !!ethereum?.providers
  const ifMetaMaskNotInstalled = !ethereum || ethereum?.isMetaMask === false

  let [isOpen, setIsOpen] = useState(false)
  let isMounted = true

  const addChain = (params) => {
    ethereum.request({
      method: 'wallet_addEthereumChain', // Metamask的api名称
      params: params
    })
  }

  const fetchAccount = async () => {
    const accounts = await ethereum?.request({ method: 'eth_accounts' })
    handleAccountsChanged(accounts)
  }

  const clear = () => {
    localStorage.removeItem(LAST_WALLET)
    setCurrentChain(undefined)
    dispatch(setRootData({ metaMaskAccount: undefined }))
  }

  const initEthers = async () => {
    localStorage.setItem(LAST_WALLET, 'MetaMask')

    // handle chain (network)
    const chainId = await provider.request({ method: 'eth_chainId' })
    if (isMounted) {
      setCurrentChain(chainId)
    }

    // handle provider
    const signer = await new ethers.BrowserProvider(provider).getSigner()
    dispatch(setRootData({ provider, signer }))
  }

  const detectWallet = () => {
    //Detect the MetaMask Ethereum provider
    if (ifMetaMaskNotInstalled) {
      closeDialog()
      return window.open('https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en')
    }

    // If user has multiple wallets, find MetaMask Provider
    if (isMultiWallets) {
      ethereum.providers.forEach(async (p) => {
        if (p.isMetaMask) provider = p
      })
      ethereum?.setSelectedProvider(provider)
    }
  }

  const onConnectWallet = async () => {
    detectWallet()
    if (provider) {
      provider
        .request({ method: 'eth_requestAccounts' })
        .then((accounts: string[]) => {
          handleAccountsChanged(accounts)
          closeDialog()
        })
        .catch((error) => {
          if (error?.code === 4001) {
            setErrorMsg('Please connect to your wallet.')
          }
          if (error?.code === -32002) {
            setErrorMsg('Please connect to your wallet on the MetaMask extension.')
          }
        })
    }
  }

  const onConnectWalletBtnClick = () => {
    if (metaMaskAccount) return
    openDialog()
  }

  const openDialog = () => {
    setErrorMsg('')
    setIsOpen(true)
  }

  const closeDialog = () => {
    if (isOpen) {
      setIsOpen(false)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    const account = accounts && accounts[0]
    if (accounts?.length === 0) {
      console.log('No accounts.')
      clear()
    } else if (account !== metaMaskAccount) {
      dispatch(setRootData({ metaMaskAccount: account }))
      initEthers()
    }
  }

  const handleChainChanged = (chainId) => {
    setCurrentChain(chainId)
  }

  useEffect(() => {
    ethereum?.on('accountsChanged', handleAccountsChanged)
    ethereum?.on('chainChanged', handleChainChanged)
    ;(async () => {
      const wallet_type = localStorage.getItem(LAST_WALLET)
      if (wallet_type === 'MetaMask') {
        if (isMultiWallets) {
          onConnectWallet()
        } else {
          fetchAccount()
        }
      }
    })()

    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  window.onfocus = () => {
    if (ifMetaMaskNotInstalled) {
      window.location.reload()
    }
  }

  return (
    <div className='inline-block'>
      {currentChain !== undefined && currentChain !== config.chainIdBinary && (
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
        className='bg-gradient-common ml-8 hidden h-11 rounded-full px-4 text-white md:block'
        onClick={onConnectWalletBtnClick}
        disabled={!!metaMaskAccount}
      >
        {metaMaskAccount
          ? metaMaskAccount.slice(0, 6) +
            '...' +
            metaMaskAccount.slice(metaMaskAccount.length - 4, metaMaskAccount.length)
          : title ?? 'Connect Wallet'}
      </button>

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
                    closeDialog()
                  }}
                >
                  <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                </svg>
                <div className='flex flex-col items-center justify-center'>
                  <div className='mb-3 text-[36px] font-medium text-[#111029] sm:text-[45px]'>Select a Wallet</div>
                  <div className='mb-12 text-[18px] text-[#57596C]'>Connect your wallet to sign in.</div>
                  <div
                    className='flex w-full cursor-pointer justify-between rounded-[10px] border border-[#eaeaef] py-4 hover:border-[#0077fe]'
                    onClick={onConnectWallet}
                  >
                    <div className='flex'>
                      <img className='mx-4 h-[32px] w-[35px]' src={MetaMaskURL} alt='MetaMask' />
                      <span className='text-[24px] font-medium text-[#111029]'>Metamask</span>
                    </div>
                    {loading && (
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
    </div>
  )
}
