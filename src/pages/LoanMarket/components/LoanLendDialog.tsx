import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import Tip, { message } from '../../../components/Tip'
import { useMetaMask } from '@/hooks/useMetaMask'
import DetailColDesc from '@/components/DetailColDesc'
import NumberInput from '@/components/NumberInput'
import Button from '@/components/Button'
import { LoanMarketListItem, LoanMinerInfo } from '@/types'
import { isIndent, numberWithCommas, getValueMultiplied, getContinuousProfile } from '@/utils'
import dayjs from 'dayjs'
import { config } from '@/config'
import { handleError } from '@/components/ErrorHandler'
import BigNumber from 'bignumber.js'
import debounce from 'lodash/debounce'
import { patchLoanMiners, postLoanList, patchLoanById, getLoanList } from '@/api/modules/loan'

interface IProps {
  open: boolean
  loading?: boolean
  minerInfo: (LoanMinerInfo & LoanMarketListItem) | undefined
  setOpen: (bol: boolean) => void
  getList: () => void
}

export default function LoanLendDialog(props: IProps) {
  const { open = false, minerInfo, setOpen, getList } = props
  const { currentAccount, loanContract } = useMetaMask()

  const [amount, setAmount] = useState<number | null>()
  const [loading, setLoading] = useState<boolean>(false)
  const debouncedAmount = debounce(setAmount, 800)
  const minLenAmount = useMemo(() => {
    return BigNumber(minerInfo?.min_lend_amount_human || 0)
      .decimalPlaces(2, BigNumber.ROUND_CEIL)
      .toNumber()
  }, [minerInfo?.min_lend_amount_human])

  const minerDetail = useMemo(() => {
    return [
      {
        title: 'Miner Total Value',
        value: `${numberWithCommas(minerInfo?.total_balance_human)} FIL`
      },
      {
        title: 'Miner Pledge Amount',
        value: `${numberWithCommas(minerInfo?.initial_pledge_human)} FIL`
      },
      {
        title: 'Miner Locked Reward',
        value: `${numberWithCommas(minerInfo?.locked_rewards_human)} FIL`
      },
      {
        title: 'Miner Available Balance',
        value: `${numberWithCommas(minerInfo?.available_balance_human || 0)} FIL`
      }
    ]
  }, [minerInfo])

  const loanDetail = useMemo(() => {
    return [
      {
        title: 'Collateral Rate',
        value: `${BigNumber(minerInfo?.collateral_rate || 0).decimalPlaces(2)}%`
      },
      {
        title: 'Amount request to borrow',
        value: `${numberWithCommas(minerInfo?.max_debt_amount_human)} FIL`
      },
      {
        title: 'Commit APY',
        value: `${BigNumber(minerInfo?.annual_interest_rate_human || 0).toFixed(2)}%`
      },
      {
        title: 'Approximate Interest / year',
        value: `${getContinuousProfile(
          minerInfo?.max_debt_amount_human || 0,
          minerInfo?.annual_interest_rate_human || 0
        )} FIL`
      }
    ]
  }, [minerInfo])

  const orderDetail = useMemo(() => {
    return [
      {
        title: 'Amount has been borrowed for this order',
        value: `${numberWithCommas(minerInfo?.current_total_principal_human)} FIL`
      },
      {
        title: 'Order completed',
        value: `${
          Number(minerInfo?.max_debt_amount_human) <= 0
            ? 0
            : BigNumber(minerInfo?.current_total_principal_human || 0)
                .dividedBy(BigNumber(minerInfo?.max_debt_amount_human || 0))
                .multipliedBy(100)
                .toFixed(2)
        } %`
      },
      {
        title: 'Lending Quota left',
        value: `${numberWithCommas(
          BigNumber(minerInfo?.max_debt_amount_human || 0).minus(
            BigNumber(minerInfo?.current_total_principal_human || 0)
          )
        )} FIL`
      }
    ]
  }, [minerInfo])

  const maxAmount = useMemo(() => {
    return BigNumber(minerInfo?.max_debt_amount_human || 0)
      .minus(BigNumber(minerInfo?.current_total_principal_human || 0))
      .decimalPlaces(6, 1)
      .toNumber()
  }, [minerInfo])

  const lendInfoByAmount = useMemo(() => {
    return {
      quota: BigNumber(amount || 0)
        .dividedBy(BigNumber(minerInfo?.max_debt_amount_human || 0))
        .multipliedBy(100)
        .decimalPlaces(2),
      interest: getContinuousProfile(amount || 0, minerInfo?.annual_interest_rate_human || 0)
    }
  }, [amount, minerInfo])

  const onClose = () => {
    setOpen(false)
  }

  const handleMaxBtnClick = () => {
    setAmount(maxAmount)
  }

  const handleConfirm = async () => {
    if (!currentAccount) {
      return message({
        title: 'TIP',
        type: 'warning',
        content: 'Please connect you wallet first'
      })
    }
    if (!amount) {
      return message({
        title: 'TIP',
        type: 'warning',
        content: 'Please enter the amount you would like to lend'
      })
    }
    try {
      setLoading(true)

      const tx = await loanContract.lendToMiner(
        minerInfo?.miner_id,
        getValueMultiplied(minerInfo?.annual_interest_rate_human || 0, 4),
        {
          value: getValueMultiplied(amount)
        }
      )
      const result = await tx.wait()
      /* 
        blockHash: "0xbc70c8b143268b0e38be2ded6ed1ccb8e42a44d5bcd1411b55a7301dbb932782"
        blockNumber: 989424
        contractAddress: null
        cumulativeGasUsed: 0n
        from: "0xA1151D1821704a4beB63e3f7dF6135327E9208e1"
        gasPrice: 1874068663n
        gasUsed: 15702298n
        hash: "0xa8ea8292dcd0bc82c484101a12ad5163d00ad792a5f80a7b6e5c498134f587f6"
        index: 8
        provider: BrowserProvider {#subs: Map(0), #plugins: Map(0), #pausedState: null, #destroyed: false, #networkPromise: Promise, …}
        root: "0x0000000000000000000000000000000000000000000000000000000000000000"
        status: 1
        to: "0x3f8A5C01063f4061f84beCFBA2D3056523407eE5"
        type: 2
      */
      if (result) {
        // update the miner
        patchLoanMiners({
          miner_id: minerInfo?.miner_id,
          current_total_principal_human: (minerInfo?.current_total_principal_human || 0) + amount,
          last_debt_amount_human: (minerInfo?.last_debt_amount_human || 0) + amount,
          collateral_rate: BigNumber(minerInfo?.total_balance_human || 0)
            .dividedBy((minerInfo?.current_total_principal_human || 0) + amount || 0)
            .times(100)
            .decimalPlaces(2)
            .toNumber()
        })
        // Update or add lendlist
        const res = await getLoanList({
          page: 1,
          page_size: 1000,
          user_address: currentAccount,
          miner_id: minerInfo?.miner_id
        })
        if (!res?.results?.length) {
          const params = {
            ...minerInfo,
            annual_interest_rate: minerInfo?.annual_interest_rate_human,
            current_total_principal_human: (minerInfo?.current_total_principal_human || 0) + amount,
            miner_total_balance_human: minerInfo?.total_balance_human,
            current_principal_human: amount,
            user_address: currentAccount,
            transaction_hash: result?.hash
          }
          postLoanList(params)
        } else {
          const target = res.results?.find((item) => item.miner_id === minerInfo?.miner_id)
          patchLoanById({
            id: target.id,
            current_principal_human: BigNumber(target.current_principal_human || 0)
              .plus(amount)
              .toNumber()
          })
        }

        message({
          title: 'TIP',
          type: 'success',
          content: tx.hash,
          closeTime: 4000
        })
        setOpen(false)
        getList()
      }
    } catch (error) {
      handleError(error)
    } finally {
      // dispatch(setRootData({ loading: false }))
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
                          <div className='grid grid-cols-3 gap-2'>
                            {minerDetail.map((item, index) => (
                              <DetailColDesc
                                className={index === 0 ? 'col-span-3' : ''}
                                key={item.title}
                                title={item.title}
                                desc={item.value}
                                type='green'
                              />
                            ))}
                          </div>
                          <p className='pb-2 pt-2 font-semibold'>Loan Detail</p>
                          <div className='grid grid-cols-2 gap-2'>
                            {loanDetail.map((item) => (
                              <DetailColDesc key={item.title} title={item.title} desc={item.value} type='blue' />
                            ))}
                          </div>
                          <div className='grid grid-cols-2 gap-2 pt-2'>
                            {orderDetail.map((item, index) => (
                              <DetailColDesc
                                key={item.title}
                                className={index === 0 ? 'col-span-2' : ''}
                                title={item.title}
                                desc={item.value}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className='w-1/2'>
                        <p className='text-xl font-semibold'>{`Miner ${config.address_zero_prefix}0${minerInfo?.miner_id}`}</p>
                        <p className='text-sm'>
                          Order listed:
                          <span className='ml-1 text-[#0077FE]'>
                            {minerInfo?.create_time && dayjs(minerInfo.create_time).format('YYYY-MM-DD hh:mm:ss')}
                          </span>
                        </p>
                        <p className='text-sm'>
                          Published By:{' '}
                          <span className='text-[#0077FE]'>
                            {minerInfo?.delegator_address && isIndent(minerInfo.delegator_address)}
                          </span>
                        </p>
                        <div className='mt-[30px] rounded-[10px] border border-[#ACCEF1] p-[20px]'>
                          <label>Amount you wound like to lend</label>
                          <NumberInput
                            max={maxAmount}
                            min={minLenAmount}
                            maxButton
                            prefix='FIL'
                            placeholder={
                              minerInfo?.min_lend_amount_human ? `Min. lend amount is ${minLenAmount} FIL` : ''
                            }
                            value={amount}
                            onChange={(val: number) => debouncedAmount(val)}
                            onMaxButtonClick={handleMaxBtnClick}
                          />
                          <div className='mt-[30px] flex justify-between'>
                            <span>% Quota of the loan</span>
                            <span className='font-medium'>{`${lendInfoByAmount.quota}%`}</span>
                          </div>
                          <div className='mt-[12px] flex justify-between'>
                            <span className='max-w-[200px]'>Approximate Interest you would earn / year</span>
                            <span className='font-medium'>{`${lendInfoByAmount.interest} FIL`}</span>
                          </div>
                        </div>
                        <Button className='mt-5' loading={loading} onClick={() => handleConfirm()}>
                          Confirm
                        </Button>
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
