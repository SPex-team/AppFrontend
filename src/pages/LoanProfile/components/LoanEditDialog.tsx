import { Dialog, Transition } from '@headlessui/react'
import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react'
import { config } from '@/config'
import { postBuildMessage, postMiner, postPushMessage, transferInCheck } from '@/api/modules'
import { Input } from 'antd'
import { RootState } from '@/store'
import Tip, { message } from '../../../components/Tip'
import { useMetaMask } from '@/hooks/useMetaMask'
import { useSelector, useDispatch } from 'react-redux'
import NumberInput from '@/components/NumberInput'
import { isIndent } from '@/utils'
import { handleError } from '@/components/ErrorHandler'
import { setRootData } from '@/store/modules/loan'

interface IProps {
  open: boolean
  data?: any
  setOpen: (bol: boolean) => void
}

export default function LoanEditDialog(props: IProps) {
  const { open = false, data, setOpen } = props
  const { currentAccount, contract } = useMetaMask()
  const dispatch = useDispatch()

  const [borrowAmount, setBorrowAmount] = useState<number | null>(null)
  const [depositAddress, setDepositAddress] = useState<string>()

  const { transactionHistoryList, transactionHistoryPage, transactionHistoryCount, tableLoading } = useSelector(
    (state: RootState) => ({
      transactionHistoryList: state.root.transactionHistoryList,
      transactionHistoryPage: state.root.transactionHistoryPage,
      transactionHistoryCount: state.root.transactionHistoryCount,
      tableLoading: state.root.tableLoading2
    })
  )

  const onClose = () => {
    setOpen(false)
  }

  const handleDepositAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: inputValue } = e.target
    setDepositAddress(inputValue)
  }

  const handleConfirm = async (miner_id?: number, price_raw?: string) => {
    if (!currentAccount) {
      return message({
        title: 'TIP',
        type: 'warning',
        content: 'Please connect you wallet first'
      })
    }
    try {
      dispatch(setRootData({ loading: true }))
      const tx = await contract.buyMiner(miner_id, {
        value: price_raw
        // gasLimit: 100000
      })
      message({
        title: 'TIP',
        type: 'success',
        content: tx.hash,
        closeTime: 4000
      })
      const result = await tx.wait()

      // await putMiner(miner_id, { miner_id, owner: currentAccount, price: 0, price_raw: 0, is_list: false })

      // MarketClass.removeDataOfList(miner_id)
    } catch (error) {
      handleError(error)
    } finally {
      dispatch(setRootData({ loading: false }))
    }
  }

  const clear = () => {
    setDepositAddress('')
  }

  useEffect(() => {
    if (!open) {
      clear()
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
                        Miner f0123123 Loan Edit
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
                    <div className='mt-[30px] px-[20px]'>
                      <div className='relative mb-[30px] grid grid-cols-3 gap-[20px]'>
                        <div className='flex flex-col'>
                          <p className='text-xl font-semibold'>Borrow Amount</p>
                          <p className='text-sm text-gray-500'>
                            Change the borrow amount, the order will be closed when the new amount reached.
                          </p>
                        </div>
                        <div className='flex flex-col items-center'>
                          <p className='absolute -top-[50px] text-lg font-semibold'>Current</p>
                          <p className='text-xl font-semibold text-[#0077FE]'>15000 FIL</p>
                          <p className='text-sm font-medium'>Already completed</p>
                          <p className='font-medium'>10000 FIL</p>
                        </div>
                        <div>
                          <p className='absolute -top-[50px] right-[80px] text-center text-lg font-semibold'>
                            Change to
                          </p>
                          <NumberInput
                            prefix='FIL'
                            value={borrowAmount}
                            onChange={(val: number) => setBorrowAmount(val)}
                          />
                        </div>
                      </div>

                      <div className='grid grid-cols-3 gap-[20px]'>
                        <div className='flex flex-col'>
                          <p className='text-xl font-semibold'>Deposit Address</p>
                          <p className='text-sm text-gray-500'>
                            After change the deposit address, the new borrow amount will be distributed to the new
                            address.
                          </p>
                        </div>
                        <div className='flex flex-col items-center'>
                          <p className='font-medium'>123123123123123</p>
                        </div>
                        <div>
                          <Input className='h-[49px]' value={depositAddress} onChange={handleDepositAddressChange} />
                        </div>
                      </div>
                    </div>
                    <div className='text-center'>
                      <button
                        onClick={() => handleConfirm()}
                        className='bg-gradient-common mx-auto my-10 h-11 w-[200px] rounded-full px-4 text-white md:mb-0'
                      >
                        Confirm
                      </button>
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
