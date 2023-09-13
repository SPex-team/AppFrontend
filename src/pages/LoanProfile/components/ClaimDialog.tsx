import { Dialog, Transition } from '@headlessui/react'
import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react'
import { RootState } from '@/store'
import Tip, { message } from '../../../components/Tip'
import { useMetaMask } from '@/hooks/useMetaMask'
import { useSelector } from 'react-redux'
import DetailColDesc from '@/components/DetailColDesc'
import NumberInput from '@/components/NumberInput'
import { isIndent } from '@/utils'

import DigitalCoinURL from '@/assets/images/digital_coin.png'

interface IProps {
  open: boolean
  data?: any
  setOpen: (bol: boolean) => void
}

export default function ClaimDialog(props: IProps) {
  const { open = false, data, setOpen } = props
  const { currentAccount, contract } = useMetaMask()

  const [stepNum, setStepNum] = useState(0)
  const [amount, setAmount] = useState<number | null>()

  const { transactionHistoryList, transactionHistoryPage, transactionHistoryCount, tableLoading } = useSelector(
    (state: RootState) => ({
      transactionHistoryList: state.root.transactionHistoryList,
      transactionHistoryPage: state.root.transactionHistoryPage,
      transactionHistoryCount: state.root.transactionHistoryCount,
      tableLoading: state.root.tableLoading2
    })
  )

  const info = [
    {
      title: 'Principle',
      value: '20000 FIL'
    },
    {
      title: 'Lending Days',
      value: '60 Days'
    },
    {
      title: 'Commit APY',
      value: '20%'
    },
    {
      title: 'Interest Owed',
      value: '122.43 FIL'
    },
    {
      title: 'Withdrawable Balance',
      value: '21222.43 FIL'
    }
  ]

  const onClose = () => {
    setOpen(false)
  }

  useEffect(() => {
    if (!open) {
      setStepNum(0)
    }
  }, [open])

  return (
    <>
      {open && (
        <Transition appear show={open} as={Fragment}>
          <Dialog as='div' className='relative z-30' onClose={onClose}>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
            >
              <div className='fixed inset-0 bg-black bg-opacity-25' />
            </Transition.Child>

            <div className='fixed inset-0 overflow-y-auto'>
              <div className='flex min-h-full items-center justify-center p-4 text-center'>
                <Transition.Child
                  as={Fragment}
                  enter='ease-out duration-300'
                  enterFrom='opacity-0 scale-95'
                  enterTo='opacity-100 scale-100'
                  leave='ease-in duration-200'
                  leaveFrom='opacity-100 scale-100'
                  leaveTo='opacity-0 scale-95'
                >
                  <Dialog.Panel className='flex min-h-[400px] w-full max-w-[900px] transform flex-col justify-between overflow-hidden rounded-2xl bg-white p-[30px] text-left shadow-xl transition-all'>
                    <div className='mb-4'>
                      <Dialog.Title as='h3' className='flex items-center justify-between text-2xl font-medium'>
                        Miner f0123123 Claim Repayment
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          strokeWidth={2}
                          stroke='currentColor'
                          className='h-6 w-6 cursor-pointer'
                          onClick={onClose}
                        >
                          <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </Dialog.Title>
                    </div>
                    <div className='px-[20px]'>
                      <div className='mb-[10px] flex justify-between'>
                        <p className='text-2xl font-semibold'>Total Interest You Earn</p>
                        <div className='flex items-center gap-[10px]'>
                          <img width={24} src={DigitalCoinURL} alt='coin' />
                          <div className='text-2xl font-semibold text-[#0077FE]'>1225.34 FIL</div>
                        </div>
                      </div>
                      <div className='mb-[20px] flex justify-between'>
                        <p className='text-lg font-semibold'>The Miner Current Available Balance</p>
                        <div className='flex items-center gap-[10px]'>
                          <img width={24} src={DigitalCoinURL} alt='coin' />
                          <div className='text-lg font-semibold text-[#0077FE]'>1225.34 FIL</div>
                        </div>
                      </div>

                      <div className='flex justify-between space-x-[30px]'>
                        <div className='w-1/2'>
                          <div className='grid grid-cols-2 gap-[12px]'>
                            {info.map((item, index) => (
                              <DetailColDesc
                                key={item.title}
                                className={index === info.length - 1 ? 'col-span-2' : ''}
                                title={item.title}
                                desc={item.value}
                                type='blue'
                              />
                            ))}
                          </div>
                        </div>
                        <div className='w-1/2'>
                          <div className='rounded-[10px] border border-[#ACCEF1] p-[20px]'>
                            <label>Request Withdraw Amount</label>
                            <NumberInput maxButton prefix='FIL' onChange={(val: number) => setAmount(val)} />
                            <div className='flex justify-between pt-[20px]'>
                              <span className='font-semibold'>Amount left to withdraw</span>
                              <span>20000 FIL</span>
                            </div>
                            <div className='text-center'>
                              <button
                                onClick={() => {}}
                                className='bg-gradient-common mx-auto my-10 h-11 w-[200px] rounded-full px-4 text-white md:mb-0'
                              >
                                Claim
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </>
  )
}
