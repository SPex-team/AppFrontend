import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useMemo, useState } from 'react'
import { config } from '@/config'
import { patchLoanById, patchLoanMiners, getLoanListByMiner } from '@/api/modules/loan'
import { Table, Radio } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { RadioChangeEvent } from 'antd'
import { RootState } from '@/store'
import Tip, { message } from '../../../components/Tip'
import { useMetaMask } from '@/hooks/useMetaMask'
import { useSelector } from 'react-redux'
import NumberInput from '@/components/NumberInput'
import SpinWrapper from '@/components/SpinWrapper'
import { getValueMultiplied, isIndent } from '@/utils'
import ProfileClass from '@/models/profile-class'
import { LoanMarketListItem } from '@/types'
import dayjs from 'dayjs'
import BigNumber from 'bignumber.js'
import Button from '@/components/Button'
import { handleError } from '@/components/ErrorHandler'

import DigitalCoinURL from '@/assets/images/digital_coin.png'

interface IProps {
  open: boolean
  miner?: LoanMarketListItem
  type?: 'borrow' | 'lend'
  setOpen: (bol: boolean) => void
  updateList: () => void
}

interface DataType {
  user_address: string
  current_principal_human: number
  total_interest_human: number
}

export default function RepayDialog(props: IProps) {
  const { open = false, miner, setOpen, updateList } = props
  const { currentAccount, loanContract } = useMetaMask()
  const profileClasss = useMemo(() => new ProfileClass({ currentAccount }), [currentAccount])

  const [loading, setLoading] = useState(false)
  const [repayMethod, setRepayMethod] = useState(1)
  const [repayAmount, setRepayAmount] = useState<number | null>(null)
  const [maxRepayAmount, setMaxRepayAmount] = useState<number>(0)
  const [selectedAddress, setSelectedAddress] = useState<any>()
  const [selectedLender, setSelectedLender] = useState<any>()
  const [payoff, setPayoff] = useState<boolean>(false)

  const { lendListByMiner, tableLoading } = useSelector((state: RootState) => ({
    lendListByMiner: state.loan.lendListByMiner,
    tableLoading: state.root.tableLoading2
  }))

  const totalInterestToRepay = useMemo(() => {
    return (lendListByMiner || []).reduce((c, R) => {
      return c + R.total_interest_human
    }, 0)
  }, [lendListByMiner])

  const columns: ColumnsType<DataType> = [
    {
      title: 'Lender Address',
      dataIndex: 'user_address',
      align: 'left',
      width: 150,
      render: (text) => <span className='whitespace-nowrap'>{isIndent(text)}</span>
    },
    {
      title: 'Lending Days',
      dataIndex: 'create_time',
      align: 'center',
      render: (text) => `${dayjs(new Date()).diff(text, 'd')} Days`
    },
    {
      title: 'Principle',
      dataIndex: 'current_principal_human',
      align: 'center',
      render: (text) => `${text} FIL`
    },
    {
      title: 'Interest Owed',
      dataIndex: 'total_interest_human',
      align: 'center',
      render: (text) => `${text} FIL`
    }
  ]

  const onClose = () => {
    setOpen(false)
  }

  const onRadioChange = (e: RadioChangeEvent) => {
    setRepayMethod(e.target.value)
  }

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      // console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
      setSelectedAddress(selectedRowKeys[0])
      setSelectedLender(selectedRows[0])
      setMaxRepayAmount(
        BigNumber(selectedRows[0].current_principal_human).plus(selectedRows[0].total_interest_human).toNumber()
      )
    },
    getCheckboxProps: (record: DataType) => ({
      name: record?.user_address
    })
  }

  const getList = () => {
    if (miner?.miner_id) {
      profileClasss.getLendListByMiner(miner.miner_id)
    }
  }

  const handleRepayment = async () => {
    try {
      setLoading(true)
      let tx: any
      if (repayMethod === 1) {
        const params = [selectedAddress, miner?.miner_id]
        tx = await loanContract?.repayment(...params, {
          value: getValueMultiplied(repayAmount || 0)
        })
      }

      if (repayMethod === 2) {
        const params = [selectedAddress, miner?.miner_id, getValueMultiplied(repayAmount || 0)]
        tx = await loanContract?.withdrawRepayment(...params)
      }

      const result = await tx.wait()

      if (result && miner?.miner_id) {
        message({
          title: 'TIP',
          type: 'success',
          content: result.hash,
          closeTime: 10000
        })
        const params: any = {
          id: selectedLender.id,
          miner_id: miner?.miner_id,
          user_address: miner.delegator_address,
          transaction_hash: result.hash
        }
        if (BigNumber(repayAmount || 0).lte(selectedLender?.total_interest_human || 0)) {
          params.total_interest_human = BigNumber(selectedLender?.total_interest_human)
            .minus(repayAmount || 0)
            .toNumber()
        }
        if (BigNumber(repayAmount || 0).gt(selectedLender?.total_interest_human || 0)) {
          const leftRepayment = BigNumber(repayAmount || 0)
            .minus(selectedLender?.total_interest_human || 0)
            .toNumber()

          params.total_interest_human = 0
          params.current_principal_human = BigNumber(selectedLender.current_principal_human || 0)
            .minus(leftRepayment)
            .toNumber()
        }

        await patchLoanById(params)

        const res = await getLoanListByMiner({
          page: 1,
          page_size: 1000,
          miner_id: miner?.miner_id
        })
        const lenListWithDebt = res?.results?.filter(
          (item) => !(item.current_principal_human <= 0 && item.total_interest_human <= 0)
        )
        if (lenListWithDebt?.length) {
          onClose()
        }
        if (lenListWithDebt?.length === 0) {
          setPayoff(true)
        }
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getList()
    if (!open) {
      setRepayAmount(null)
      setMaxRepayAmount(0)
      setRepayMethod(1)
      setSelectedAddress(null)
      setSelectedLender(null)
      setPayoff(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleUnlist = async () => {
    setLoading(true)
    try {
      const tx = await loanContract.changeMinerDisabled(miner?.miner_id, true)
      await tx.await()
      if (miner?.miner_id) {
        patchLoanMiners({
          miner_id: miner.miner_id,
          disabled: true
        }).then(() => {
          updateList()
        })
      }
    } catch (error) {
      handleError(error)
    } finally {
      setLoading(false)
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
                  <Dialog.Panel className='flex min-h-[400px] w-full max-w-[900px] transform flex-col overflow-hidden rounded-2xl bg-white p-[30px] text-left shadow-xl transition-all'>
                    <div className='mb-4'>
                      <Dialog.Title as='h3' className='flex items-center justify-between text-2xl font-medium'>
                        {`Miner ${config.address_zero_prefix}0${miner?.miner_id} Loan Repay`}
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
                    {payoff ? (
                      <div className='pt-[50px]'>
                        <p className='mb-[20px] text-center'>🎉 Congrats! You've succeed repaid your loan!</p>
                        <p className='text-center font-semibold'>
                          Do you want to continue borrowing, or you want to unlist the loan from the market?
                        </p>
                        <div className='mt-[40px] flex justify-center gap-[40px]'>
                          <Button width={200} loading={loading} onClick={handleUnlist}>
                            Unlist the Loan
                          </Button>
                          <Button width={200} onClick={onClose}>
                            Continue Borrowing
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className='px-[20px]'>
                        <div className='common-tips mb-[20px]'>
                          If you don't want to borrow anymore, don't forget to close the loan
                        </div>
                        <div className='mb-[20px] flex justify-between'>
                          <p className='text-2xl font-semibold'>Total Interest to Repay</p>

                          <div className='flex items-center gap-[10px]'>
                            <img width={24} src={DigitalCoinURL} alt='coin' />
                            <div className='text-2xl font-semibold text-[#0077FE]'>{`${totalInterestToRepay} FIL`}</div>
                          </div>
                        </div>
                        <p className='mb-[10px]'>Choose the lender you want to repay now</p>
                        <SpinWrapper loading={tableLoading}>
                          <Table
                            columns={columns}
                            dataSource={lendListByMiner || []}
                            rowKey='user_address'
                            pagination={false}
                            scroll={{ y: 200 }}
                            rowSelection={{ type: 'radio', ...rowSelection }}
                          />
                        </SpinWrapper>
                        {selectedAddress ? (
                          <>
                            <div className='grid grid-cols-2 gap-[30px] pt-[20px]'>
                              <div>
                                <div className='flex flex-row items-center gap-x-[10px]'>
                                  <p className='text-xl font-semibold'>Repayment Amount</p>
                                  <div className='w-[300px]'>
                                    <NumberInput
                                      maxButton
                                      onMaxButtonClick={() => setRepayAmount(maxRepayAmount)}
                                      max={maxRepayAmount}
                                      prefix='FIL'
                                      value={repayAmount}
                                      onChange={(val: number) => setRepayAmount(val)}
                                    />
                                  </div>
                                </div>
                                <p className='text-sm text-gray-400'>
                                  **If not repay in full, the rest of unpaid amount will keep counting interet in the
                                  daily basis with committed APY
                                </p>
                              </div>
                              <div>
                                <div className='flex flex-row items-center gap-x-[10px]'>
                                  <p className='text-xl font-semibold'>Repayment Method</p>
                                  <Radio.Group onChange={onRadioChange} value={repayMethod}>
                                    <Radio value={1}>Wallet</Radio>
                                    <Radio
                                      value={2}
                                    >{`Miner Available Balance: ${miner?.available_balance_human} FIL`}</Radio>
                                  </Radio.Group>
                                </div>
                              </div>
                            </div>
                            <div className='text-center'>
                              <Button width={256} loading={loading} onClick={handleRepayment}>
                                Repay
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className='pb-[30px]' />
                        )}
                      </div>
                    )}
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
