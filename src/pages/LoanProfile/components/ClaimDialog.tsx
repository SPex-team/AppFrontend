import { Dialog, Transition } from '@headlessui/react'
import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react'
import Tip, { message } from '../../../components/Tip'
import { useMetaMask } from '@/hooks/useMetaMask'
import DetailColDesc from '@/components/DetailColDesc'
import NumberInput from '@/components/NumberInput'
import { handleError } from '@/components/ErrorHandler'
import { isIndent, numberWithCommas, getValueMultiplied, getValueDivide } from '@/utils'
import { config } from '@/config'
import BigNumber from 'bignumber.js'
import Button from '@/components/Button'
import { LoanMinerInfo, LoanOrderInfo } from '@/types'
import { patchLoanById, patchLoanMiners } from '@/api/modules/loan'

import DigitalCoinURL from '@/assets/images/digital_coin.png'

interface IProps {
  open: boolean
  data?: LoanMinerInfo & LoanOrderInfo
  setOpen: (bol: boolean) => void
  updateList?: () => void
}

export default function ClaimDialog(props: IProps) {
  const { open = false, data, setOpen, updateList } = props
  const { currentAccount, loanContract } = useMetaMask()

  const [amount, setAmount] = useState<number | null>()
  const [loading, setLoading] = useState<boolean>(false)

  const maxClaimAmount = useMemo(() => {
    return BigNumber(data?.current_principal_human || 0)
      .plus(data?.current_interest_human || 0)
      .decimalPlaces(6, 1)
      .toNumber()
  }, [data])

  const info = [
    {
      title: 'Your Principle',
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
      title: 'Miner Available Balance',
      value: `${numberWithCommas(data?.available_balance_human || 0)} FIL`
    }
  ]

  const onClose = () => {
    setOpen(false)
  }

  const handleMaxBtnClick = () => {
    setAmount(maxClaimAmount)
  }

  const handleClaim = async () => {
    try {
      setLoading(true)
      const isMax = BigNumber(amount || 0).gte(maxClaimAmount)

      const checkRes = await loanContract.getCurrentAmountOwedToLender(currentAccount, data?.miner_id)
      const totalAmountOwned = isMax ? getValueDivide(checkRes[0]) : amount
      const totalClaimAmount = isMax
        ? BigNumber(totalAmountOwned || 0)
            .times(1 + (data?.annual_interest_rate || 0) / 365 / 48)
            .decimalPlaces(6, 1)
            .toNumber()
        : amount

      console.log('totalClaimAmount ==> ', totalClaimAmount, 'totalAmountOwned ==>', totalAmountOwned)

      const tx = await loanContract.withdrawRepayment(
        currentAccount,
        data?.miner_id,
        getValueMultiplied(totalClaimAmount || 0)
      )
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
        if (BigNumber(data?.current_interest_human || 0).lte(totalAmountOwned || 0)) {
          params.current_interest_human = 0
          params.current_principal_human = Math.max(
            BigNumber(data?.current_principal_human || 0)
              .minus(BigNumber(totalAmountOwned || 0).minus(data?.current_interest_human || 0))
              .toNumber(),
            0
          )
        }
        if (BigNumber(data?.current_interest_human || 0).gt(totalAmountOwned || 0)) {
          params.current_interest_human = Math.max(
            BigNumber(data?.current_interest_human || 0)
              .minus(totalAmountOwned || 0)
              .toNumber(),
            0
          )
        }

        await patchLoanById({
          ...params,
          id: data?.id
        })

        const minerPatchParams: any = {
          miner_id: data?.miner_id
        }

        if (BigNumber(data?.current_interest_human || 0).lte(totalAmountOwned || 0)) {
          const principleTaken = BigNumber(totalAmountOwned || 0)
            .minus(data?.current_interest_human || 0)
            .toNumber()
          minerPatchParams.current_total_interest_human = Math.max(
            BigNumber(data?.current_total_interest_human || 0)
              .minus(data?.current_interest_human || 0)
              .toNumber(),
            0
          )
          minerPatchParams.current_total_principal_human = Math.max(
            BigNumber(data?.current_total_principal_human || 0)
              .minus(principleTaken || 0)
              .toNumber(),
            0
          )
        }

        if (BigNumber(data?.current_interest_human || 0).gt(totalAmountOwned || 0)) {
          minerPatchParams.current_total_interest_human = Math.max(
            BigNumber(data?.current_total_interest_human || 0)
              .minus(totalAmountOwned || 0)
              .toNumber(),
            0
          )
        }

        minerPatchParams.current_total_debt_human = BigNumber(minerPatchParams.current_total_interest_human || 0)
          .plus(minerPatchParams.current_total_interest_human || 0)
          .toNumber()

        await patchLoanMiners(minerPatchParams)
        onClose()
        if (updateList) {
          updateList()
        }
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
                          <div className='text-2xl font-semibold text-[#0077FE]'>{`${BigNumber(
                            data?.current_interest_human || 0
                          )
                            .decimalPlaces(6, 1)
                            .toNumber()} FIL`}</div>
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
                                BigNumber(maxClaimAmount || 0)
                                  .minus(BigNumber(amount || 0))
                                  .toNumber()
                              )} FIL`}</span>
                            </div>
                            <div className='text-center'>
                              <Button
                                width={256}
                                loading={loading}
                                disabled={Number(amount) <= 0}
                                onClick={handleClaim}
                              >
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
