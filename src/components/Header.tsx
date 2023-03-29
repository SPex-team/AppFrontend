import { RootState } from '@/store'
import { setRootData } from '@/store/modules/root'
import { Menu, Popover, Transition } from '@headlessui/react'
import { Fragment, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ethers } from 'ethers'

const links = [
  {
    name: 'Home',
    href: 'https://www.spex.website/'
  },
  {
    name: 'Maket',
    href: '/maket'
  },
  // {
  //   name: 'History',
  //   href: '/history'
  // },
  {
    name: 'Me',
    href: '/me'
  }
]

const networks = [
  {
    name: 'HyperSpace'
  }
]

export default function Header() {
  const metaMaskAccount = useSelector((state: RootState) => state.root.metaMaskAccount)
  const dispatch = useDispatch()

  const fetchSetAccount = () => {
    window.ethereum.request({ method: 'eth_accounts' }).then((accounts) => {
      console.log(accounts)
      initEthers(accounts[0])

      dispatch(setRootData({ metaMaskAccount: accounts[0] }))
    })
  }

  const initEthers = async (account: string) => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    // const signer = await provider.getSigner()

    // FIXME: contract cannot exist redux
    // const contract = new Contract(config.contractAddress, abi, signer)

    // console.log('initEthers', provider, contract)

    dispatch(setRootData({ metaMaskAccount: account, provider }))
  }

  useEffect(() => {
    window.ethereum.on('connect', (connectInfo) => {
      console.log('connect')

      if (window.ethereum.isConnected()) {
        fetchSetAccount()
      }
    })

    window.ethereum.on('accountsChanged', function (accounts) {
      console.log('accountsChanged')
      // Time to reload your interface with accounts[0]!
      fetchSetAccount()
    })

    window.ethereum.on('disconnect', (error) => {
      console.log('disconnect')
      if (!window.ethereum.isConnected()) {
        fetchSetAccount()
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onConnectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      console.log('MetaMask is installed!')
    } else {
      console.log('MetaMask not installed; using read-only defaults')
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const account = accounts[0]

    initEthers(account)
    // const provider = new ethers.BrowserProvider(window.ethereum)
    // const signer = await provider.getSigner()
    // const contract = new Contract(config.contractAddress, abi, signer)

    // dispatch(setRootData({ metaMaskAccount: account, provider, contract }))
  }

  return (
    <header className='fixed top-0 z-20 w-screen bg-transparent backdrop-blur-lg [font-family:GeneralSansVariable]'>
      <div className='container mx-auto flex items-center justify-between py-6 px-2'>
        <div className='flex'>
          <a href='/'>
            <img width={104} height={38} src='/logo.svg' alt='SPex' />
          </a>
          <div className='hidden items-center text-base md:flex'>
            {links.map((item) => (
              <a key={item.name} href={item.href}>
                <div className='ml-[33px]'>
                  <p className='text-sm font-medium text-gray-900'>{item.name}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div className='flex items-center'>
          <div className='text-right'>
            <Menu as='div' className='relative inline-block text-left'>
              <div>
                <Menu.Button className='inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-gray-900'>
                  {networks[0].name}
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                    strokeWidth={1.5}
                    stroke='currentColor'
                    className='ml-2 w-[14px]'
                  >
                    <path strokeLinecap='round' strokeLinejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' />
                  </svg>
                </Menu.Button>
              </div>
              <Transition
                as={Fragment}
                enter='transition ease-out duration-100'
                enterFrom='transform opacity-0 scale-95'
                enterTo='transform opacity-100 scale-100'
                leave='transition ease-in duration-75'
                leaveFrom='transform opacity-100 scale-100'
                leaveTo='transform opacity-0 scale-95'
              >
                <Menu.Items className='absolute right-0 mt-2 w-40 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
                  {networks.map((network) => (
                    <div className='p-1' key={network.name}>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${
                              active ? 'bg-[#0077FE] text-white' : 'text-gray-900'
                            } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                          >
                            {network.name}
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          <button
            className='ml-8 hidden h-11 w-40 rounded-full bg-gradient-to-r from-[#0077FE] to-[#3BF4BB] text-white md:block'
            onClick={onConnectWallet}
            disabled={!!metaMaskAccount}
          >
            {metaMaskAccount
              ? metaMaskAccount.slice(0, 6) +
                '...' +
                metaMaskAccount.slice(metaMaskAccount.length - 4, metaMaskAccount.length)
              : 'Connect Wallet'}
          </button>
        </div>

        <Popover className='md:hidden'>
          {({ open }) => (
            <>
              <Popover.Button
                className={`
                ${open ? '' : 'text-opacity-90'}
                focus:outline-none 
                `}
                // group inline-flex items-center rounded-md bg-orange-700 px-3 py-2 text-base font-medium text-white hover:text-opacity-100 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='32'
                  height='32'
                  fill='currentColor'
                  className='bi bi-list md:hidden'
                  viewBox='0 0 16 16'
                >
                  <path
                    fillRule='evenodd'
                    d='M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z'
                  />
                </svg>
              </Popover.Button>
              <Popover.Overlay className='fixed inset-0 h-screen backdrop-blur-xl' />
              <Transition
                as={Fragment}
                enter='transition ease-out duration-200'
                enterFrom='opacity-0 translate-x-1'
                enterTo='opacity-100 translate-x-0'
                leave='transition ease-in duration-150'
                leaveFrom='opacity-100 translate-x-0'
                leaveTo='opacity-0 translate-x-1'
              >
                <Popover.Panel className='fixed right-0 top-0 z-30 h-screen w-4/5 transform bg-white backdrop-blur-md'>
                  <div className='overflow-hidden'>
                    <div className='relative grid gap-8 p-7 lg:grid-cols-2'>
                      {links.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className='-m-3 flex items-center rounded-lg py-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50'
                        >
                          <div className='ml-4'>
                            <p className='text-sm font-medium text-gray-900'>{item.name}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </header>
  )
}
