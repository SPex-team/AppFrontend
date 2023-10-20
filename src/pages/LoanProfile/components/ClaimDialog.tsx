import { Dialog, Transition } from '@headlessui/react'
import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react'
import { RootState } from '@/store'
import Tip, { message } from '../../../components/Tip'
import { useMetaMask } from '@/hooks/useMetaMask'
import { useSelector } from 'react-redux'
import DetailColDesc from '@/components/DetailColDesc'
import NumberInput from '@/components/NumberInput'
import { handleError } from '@/components/ErrorHandler'
import { isIndent, numberWithCommas, getValueMultiplied } from '@/utils'
import { config } from '@/config'
import dayjs from 'dayjs'
import BigNumber from 'bignumber.js'
import { useDispatch } from 'react-redux'
import { setRootData } from '@/store/modules/root'
import Button from '@/components/Button'
import { LoanMinerInfo, LoanOrderInfo } from '@/types'
import { postLoanMiners, patchLoanMiners } from '@/api/modules/loan'

import DigitalCoinURL from '@/assets/images/digital_coin.png'

interface IProps {
  open: boolean
  data?: LoanMinerInfo & LoanOrderInfo
  setOpen: (bol: boolean) => void
}

export default function ClaimDialog(props: IProps) {
  const { open = false, data, setOpen } = props
  const { currentAccount, loanContract } = useMetaMask()
  const dispatch = useDispatch()

  const [amount, setAmount] = useState<number | null>()
  const [loading, setLoading] = useState<boolean>(false)

  const maxClaimAmount = useMemo(() => {
    return BigNumber(data?.total_interest_human || 0)
      .plus(data?.current_principal_human || 0)
      .toNumber()
  }, [data])

  const info = [
    {
      title: 'Principle',
      value: `${numberWithCommas(data?.current_principal_human)} FIL`
    },
    // {
    //   title: 'Lending Days',
    //   value: `${dayjs(new Date()).diff(data?.update_time, 'd')} Days`
    // },
    {
      title: 'Commit APY',
      value: `${(data?.annual_interest_rate_human || 0).toFixed(2)}%`
    },
    {
      title: 'Interest Owed',
      value: `${numberWithCommas(data?.total_interest_human)} FIL`
    },
    {
      title: 'Miner Available Balance',
      value: `${numberWithCommas((data?.available_balance_human || 0).toFixed(6))} FIL`
    }
  ]

  console.log('data ==> ', data)

  const onClose = () => {
    setOpen(false)
  }

  const handleMaxBtnClick = () => {
    setAmount(maxClaimAmount)
  }

  const handleClaim = async () => {
    try {
      setLoading(true)
      console.log(currentAccount, data?.miner_id, amount)

      const tx = await loanContract.withdrawRepayment(currentAccount, data?.miner_id, getValueMultiplied(amount || 0))
      const result = await tx.wait()
      if (result) {
        message({
          title: 'TIP',
          type: 'success',
          content: tx.hash,
          closeTime: 4000
        })
        const params: any = {
          miner_id: data?.miner_id
        }
        if (BigNumber(data?.total_interest_human || 0).lt(amount || 0)) {
          params.total_interest_human = 0
          params.current_principal_human = BigNumber(data?.current_principal_human || 0)
            .minus(BigNumber(amount || 0).minus(data?.total_interest_human || 0))
            .toNumber()
        }
        if (BigNumber(data?.total_interest_human || 0).eq(amount || 0)) {
          params.total_interest_human = 0
        }
        if (BigNumber(data?.total_interest_human || 0).gt(amount || 0)) {
          params.total_interest_human = BigNumber(data?.total_interest_human || 0)
            .minus(amount || 0)
            .toNumber()
        }
        console.log('params ==> ', params)

        await patchLoanMiners(params)
        onClose()
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) {
      setAmount(null)
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
                        {`Miner ${config.address_zero_prefix}0${data?.miner_id} Claim Repayment`}
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
                      <div className='mb-[30px] flex justify-between'>
                        <p className='text-2xl font-semibold'>Total Interest You Earn</p>
                        <div className='flex items-center gap-[10px]'>
                          <img width={24} src={DigitalCoinURL} alt='coin' />
                          <div className='text-2xl font-semibold text-[#0077FE]'>{`${data?.total_interest_human} FIL`}</div>
                        </div>
                      </div>
                      {/* <div className='mb-[20px] flex justify-between'>
                        <p className='text-lg font-semibold'>The Miner Current Available Balance</p>
                        <div className='flex items-center gap-[10px]'>
                          <img width={24} src={DigitalCoinURL} alt='coin' />
                          <div className='text-lg font-semibold text-[#0077FE]'>{`${(
                            data?.available_balance_human || 0
                          ).toFixed(6)} FIL`}</div>
                        </div>
                      </div> */}

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
                            <NumberInput
                              maxButton
                              prefix='FIL'
                              value={amount}
                              max={maxClaimAmount}
                              onChange={(val: number) => setAmount(val)}
                              onMaxButtonClick={handleMaxBtnClick}
                            />
                            <div className='flex justify-between pt-[20px]'>
                              <span className='font-semibold'>Amount left to withdraw</span>
                              <span>{`${numberWithCommas(
                                BigNumber(data?.current_principal_human || 0)
                                  .plus(data?.total_interest_human || 0)
                                  .minus(BigNumber(amount || 0))
                                  .toNumber()
                              )} FIL`}</span>
                            </div>
                            <div className='text-center'>
                              <Button width={256} loading={loading} onClick={handleClaim}>
                                Claim
                              </Button>
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
