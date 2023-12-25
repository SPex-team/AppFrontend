import { Dialog, Transition } from '@headlessui/react'
import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react'
import { config } from '@/config'
import { postLoanMiners, patchLoanMiners } from '@/api/modules/loan'
import { Input } from 'antd'
import Tip, { message } from '../../../components/Tip'
import { useMetaMask } from '@/hooks/useMetaMask'
import NumberInput from '@/components/NumberInput'
import Button from '@/components/Button'
import { getValueMultiplied, isIndent, numberWithCommas } from '@/utils'
import { handleError } from '@/components/ErrorHandler'
import { LoanMarketListItem } from '@/types'
import BigNumber from 'bignumber.js'

import DigitalCoinURL from '@/assets/images/digital_coin.png'

const { TextArea } = Input

interface IProps {
  open: boolean
  data?: LoanMarketListItem | null
  setOpen: (bol: boolean) => void
  updateList: () => void
}

export default function LoanEditDialog(props: IProps) {
  const { open = false, data, setOpen, updateList } = props
  const { currentAccount, loanContract } = useMetaMask()

  const [borrowAmount, setBorrowAmount] = useState<number | null>()
  const [APY, setAPY] = useState<number | null>()
  const [depositAddress, setDepositAddress] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const onClose = () => {
    setOpen(false)
  }

  const handleDepositAddressChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value: inputValue } = e.target
    setDepositAddress(inputValue)
  }

  const handleConfirm = async () => {
    if (!currentAccount) {
      return message({
        title: 'TIP',
        type: 'warning',
        content: 'Please connect you wallet first'
      })
    }
    try {
      setLoading(true)
      const params = [
        data?.miner_id,
        data?.delegator_address,
        getValueMultiplied(borrowAmount || 0),
        getValueMultiplied(
          BigNumber(APY || 0)
            .dividedBy(100)
            .precision(6)
            .toNumber(),
          6
        ),
        depositAddress,
        data?.disabled,
        data?.max_lender_count,
        data?.min_lend_amount_raw
      ]

      const tx = await loanContract.changeMinerBorrowParameters(...params)
      const result = await tx.wait()

      if (result) {
        message({
          title: 'TIP',
          type: 'success',
          content: tx.hash,
          closeTime: 4000
        })
        await patchLoanMiners({
          miner_id: data?.miner_id,
          receive_address: depositAddress,
          max_debt_amount_human: borrowAmount,
          annual_interest_rate_human: APY
        })
        setOpen(false)
        updateList()
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  const clear = () => {
    setBorrowAmount(null)
    setAPY(null)
    setDepositAddress('')
  }

  useEffect(() => {
    if (open) {
      setBorrowAmount(data?.max_debt_amount_human || null)
      setAPY(
        BigNumber(data?.annual_interest_rate_human || 0)
          .decimalPlaces(6, 1)
          .toNumber() || null
      )
      setDepositAddress(data?.receive_address || '')
    }
  }, [data?.max_debt_amount_human, data?.receive_address, data, open])

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
                        {`Miner ${config.address_zero_prefix}0${data?.miner_id} Loan Edit`}
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
                          <p className='flex items-center gap-[12px] text-xl font-semibold text-[#0077FE]'>
                            <img width={24} height={24} src={DigitalCoinURL} alt='coin' />
                            <span className='pr-5'>{`${numberWithCommas(data?.max_debt_amount_human)} FIL`}</span>
                          </p>
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
                          <div className='flex items-center justify-between'>
                            <p className='text-sm'>Already completed</p>
                            <p className='font-medium'>{`${numberWithCommas(data?.last_debt_amount_human)} FIL`}</p>
                          </div>
                        </div>
                      </div>

                      <div className='relative mb-[30px] grid grid-cols-3 gap-[20px]'>
                        <div className='flex flex-col'>
                          <p className='text-xl font-semibold'>Interest</p>
                          <p className='text-sm text-gray-500'>
                            Available to change only when there is no amount has been borrowed.
                          </p>
                        </div>
                        <div className='flex flex-col items-center'>
                          <p className='text-xl font-semibold'>{`APY ${numberWithCommas(
                            data?.annual_interest_rate_human,
                            2
                          )} %`}</p>
                        </div>
                        <div>
                          <NumberInput
                            prefix='%'
                            value={APY}
                            disabled={Number(data?.last_debt_amount_human) > 0}
                            onChange={(val: number) => setAPY(val)}
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
                          <p className='font-medium'>{isIndent(data?.receive_address ?? '')}</p>
                        </div>
                        <div>
                          <TextArea
                            className='h-[49px]'
                            autoSize={false}
                            value={depositAddress}
                            onChange={handleDepositAddressChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className='mt-10 text-center'>
                      <Button width={256} loading={loading} onClick={() => handleConfirm()}>
                        Confirm
                      </Button>
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
