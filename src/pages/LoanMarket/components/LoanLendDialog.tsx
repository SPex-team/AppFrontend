import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { postBuildMessage, postMiner, postPushMessage, transferInCheck } from '@/api/modules'
import Tip, { message } from '../../../components/Tip'
import { useMetaMask } from '@/hooks/useMetaMask'
import DetailColDesc from '@/components/DetailColDesc'
import NumberInput from '@/components/NumberInput'
import { LoanMarketListItem } from '@/types'
import { isIndent } from '@/utils'
import dayjs from 'dayjs'
import { config } from '@/config'
import { setRootData } from '@/store/modules/loan'
import { useDispatch, useSelector } from 'react-redux'
import MarketClass from '@/models/loan-market-class'
import { handleError } from '@/components/ErrorHandler'

interface IProps {
  open: boolean
  data?: LoanMarketListItem
  setOpen: (bol: boolean) => void
}

export default function LoanLendDialog(props: IProps) {
  const { open = false, data, setOpen } = props
  const { currentAccount, contract } = useMetaMask()
  const dispatch = useDispatch()

  const [amount, setAmount] = useState<number | null>()

  const minerDetail = useMemo(() => {
    return [
      {
        title: 'Miner Available Balance',
        value: `10000 FIL`
      },
      {
        title: 'Miner Pledge Amount',
        value: `20000 FIL`
      },
      {
        title: 'Miner Locked Reward',
        value: `900 FIL`
      },
      {
        title: 'Miner Total Value',
        value: '3000 FIL'
      }
    ]
  }, [])

  const loanDetail = useMemo(() => {
    return [
      {
        title: 'Colletral Rate',
        value: `20%`
      },
      {
        title: 'Amount request to borrow',
        value: `20000 FIL`
      },
      {
        title: 'Commit APY',
        value: `30%`
      },
      {
        title: 'Approximate Interest / year',
        value: '3000 FIL'
      }
    ]
  }, [])

  const onClose = () => {
    setOpen(false)
  }

  const handleMaxBtnClick = () => {
    // to do: lending quota left
    // setAmount()
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
                        Loan Order Detail
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
                    <div className='flex flex-row space-x-[30px]'>
                      <div className='w-1/2'>
                        <div className='rounded-[10px] border border-gray-300 p-[12px]'>
                          <p className='pb-2 font-semibold'>Miner Detail</p>
                          <div className='grid grid-cols-2 gap-2'>
                            {minerDetail.map((item) => (
                              <DetailColDesc key={item.title} title={item.title} desc={item.value} type='green' />
                            ))}
                          </div>
                          <p className='pb-2 pt-2 font-semibold'>Loan Detail</p>
                          <div className='grid grid-cols-2 gap-2'>
                            {loanDetail.map((item) => (
                              <DetailColDesc key={item.title} title={item.title} desc={item.value} type='blue' />
                            ))}
                          </div>
                          <DetailColDesc
                            className='my-2'
                            title='Amount has been borrowed for this order'
                            desc='50000 FIL'
                          />
                          <div className='grid grid-cols-2 gap-2'>
                            <DetailColDesc title='Order completed' desc='33.3%' />
                            <DetailColDesc title='Lending Quota left' desc='50000 FIL' />
                          </div>
                        </div>
                      </div>
                      <div className='w-1/2'>
                        <p className='text-xl font-semibold'>{`Miner ${config.address_zero_prefix}0${data?.miner_id}`}</p>
                        <p className='text-sm'>
                          Order listed:
                          <span className='ml-1 text-[#0077FE]'>
                            {data?.list_time && dayjs(data.list_time * 1000).format('YYYY-MM-DD hh:mm:ss')}
                          </span>
                        </p>
                        <p className='text-sm'>
                          Published By: <span className='text-[#0077FE]'>{data?.owner && isIndent(data.owner)}</span>
                        </p>
                        <div className='mt-[30px] rounded-[10px] border border-[#ACCEF1] p-[20px]'>
                          <label>Amount you wound like to lend</label>
                          <NumberInput
                            maxButton
                            prefix='FIL'
                            value={amount}
                            onChange={(val: number) => setAmount(val)}
                            onMaxButtonClick={handleMaxBtnClick}
                          />
                          <div className='mt-[30px] flex justify-between'>
                            <span>% Quota of the loan</span>
                            <span className='font-medium'>13.33%</span>
                          </div>
                          <div className='mt-[12px] flex justify-between'>
                            <span className='max-w-[200px]'>Approximate Interest you would earn / year</span>
                            <span className='font-medium'>{`4000 FIL`}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleConfirm()}
                          className='bg-gradient-common my-10 flex h-11 w-full items-center justify-center rounded-full px-4 text-white md:mb-0'
                        >
                          Confirm
                        </button>
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
