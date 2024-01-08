import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useEffect, useMemo } from 'react'
import { config } from '@/config'
import { Divider, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useMetaMask } from '@/hooks/useMetaMask'
import DetailColDesc from '@/components/DetailColDesc'
import { getContinuousProfile, isIndent, numberWithCommas } from '@/utils'
import './loanDetail.scss'
import dayjs from 'dayjs'
import BigNumber from 'bignumber.js'
import ProfileClass from '@/models/profile-class'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

interface IProps {
  open: boolean
  data?: any
  type?: 'borrow' | 'lend'
  setOpen: (bol: boolean) => void
}

interface DataType {
  user_address: string
  current_principal_human: number
  total_interest_human: number
}

export default function LoanDetailDialog(props: IProps) {
  const { open = false, data, type = 'lend', setOpen } = props
  const { currentAccount } = useMetaMask()
  const profileClasss = useMemo(() => new ProfileClass({ currentAccount }), [currentAccount])
  const { lendListByMiner, tableLoading } = useSelector((state: RootState) => ({
    lendListByMiner: state.loan.lendListByMiner,
    tableLoading: state.root.tableLoading2
  }))

  const columns: ColumnsType<DataType> = [
    {
      title: 'Lender Address',
      dataIndex: 'user_address',
      align: 'left',
      width: 150,
      render: (text) => <span className='whitespace-nowrap'>{isIndent(text)}</span>
    },
    {
      title: 'Total Amount',
      dataIndex: 'current_total_amount_human',
      align: 'center',
      render: (text) => `${numberWithCommas(BigNumber(text).decimalPlaces(2, BigNumber.ROUND_DOWN))} FIL`
    },
    {
      title: 'Principle',
      dataIndex: 'current_principal_human',
      align: 'center',
      render: (text) => `${numberWithCommas(BigNumber(text).decimalPlaces(2, BigNumber.ROUND_DOWN))} FIL`
    }
  ]

  const getList = async () => {
    if (data?.miner_id) {
      profileClasss.getLendListByMiner(data.miner_id)
    }
  }

  useEffect(() => {
    if (open) {
      getList()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const borrowDetail = useMemo(() => {
    return [
      {
        title: 'Requested Loan Amount',
        value: `${numberWithCommas(data?.max_debt_amount_human)} FIL`
      },
      {
        title: 'Collateral Ratio',
        value: `${BigNumber(data?.collateral_rate || 0).decimalPlaces(2)}%`
      },
      {
        title: 'Est. APY',
        value: `${numberWithCommas(
          BigNumber(data?.annual_interest_rate_human || 0).decimalPlaces(2, BigNumber.ROUND_DOWN)
        )}%`
      },
      {
        title: 'Approximate Interest',
        value: `${getContinuousProfile(data?.max_debt_amount_human || 0, data?.annual_interest_rate_human)} FIL / year`
      }
    ]
  }, [data])

  const minerDetail = useMemo(() => {
    return [
      {
        title: 'SP ID',
        value: `${config.address_zero_prefix}0${data?.miner_id}`
      },
      {
        title: 'Available Balance',
        value: `${numberWithCommas((data?.available_balance_human || 0).toFixed(6))} FIL`
      },
      {
        title: 'Locked Reward',
        value: `${numberWithCommas(data?.locked_rewards_human)} FIL`
      },
      {
        title: 'Pledge Amount',
        value: `${numberWithCommas(data?.initial_pledge_human)} FIL`
      }
    ]
  }, [data])

  const lendDetail = useMemo(() => {
    return [
      {
        title: 'Amount has been borrowed for this order',
        value: `${numberWithCommas(data?.current_total_principal_human)} FIL`
      },
      {
        title: 'Order completed',
        value: `${numberWithCommas(
          Number(data?.max_debt_amount_human) <= 0
            ? 0
            : BigNumber(data?.current_principal_human || data?.current_total_principal_human || 0)
                .dividedBy(BigNumber(data?.max_debt_amount_human || 0))
                .multipliedBy(100)
                .decimalPlaces(2, BigNumber.ROUND_DOWN)
        )} %`
      },
      {
        title: 'Lending Quota left',
        value: `${numberWithCommas(
          BigNumber(data?.max_debt_amount_human || 0).minus(BigNumber(data?.current_total_principal_human || 0))
        )} FIL`
      }
    ]
  }, [data])

  const orderDetail = useMemo(() => {
    return type === 'lend'
      ? [
          {
            title: 'Amount you lend',
            value: `${numberWithCommas(data?.current_principal_human)} FIL`
          },
          {
            title: '% of Total Loan',
            value: `${numberWithCommas(
              BigNumber(data?.current_principal_human || 0)
                .dividedBy(BigNumber(data?.max_debt_amount_human || 0))
                .multipliedBy(100)
                .decimalPlaces(2, BigNumber.ROUND_DOWN)
            )}%`
          },
          {
            title: 'Est. interest earned per year',
            value: `${getContinuousProfile(
              data?.current_principal_human || 0,
              data?.annual_interest_rate_human || 0
            )} FIL`
          }
        ]
      : lendDetail
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const onClose = () => {
    setOpen(false)
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
                        Loan Details
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
                        <div className='rounded-[10px] border border-gray-300 p-[20px]'>
                          {minerDetail.map((item) => (
                            <div className='my-[10px] flex justify-between' key={item.title}>
                              <span>{item.title}</span>
                              <span className='font-medium'>{item.value}</span>
                            </div>
                          ))}
                          <Divider className='my-[12px] border-gray-300' />
                          <div className='my-[10px] flex justify-between'>
                            <span>Total Value</span>
                            <span className='font-medium'>{`${numberWithCommas(data?.total_balance_human)} FIL`}</span>
                          </div>
                          <div>
                            {type === 'lend' ? (
                              <div className='mt-[20px] grid grid-cols-2 gap-2'>
                                {lendDetail.map((item, index) => (
                                  <DetailColDesc
                                    key={item.title}
                                    className={index === 0 ? 'col-span-2' : ''}
                                    title={item.title}
                                    desc={item.value}
                                  />
                                ))}
                              </div>
                            ) : (
                              <>
                                <p className='pb-1 font-semibold'>Lender List</p>
                                <Table
                                  columns={columns}
                                  dataSource={lendListByMiner}
                                  loading={tableLoading}
                                  pagination={false}
                                  rowKey='user_address'
                                  scroll={{ y: 150 }}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className='w-1/2'>
                        <p className='text-xl font-semibold'>{`Miner ${config.address_zero_prefix}0${data?.miner_id}`}</p>
                        <p className='text-sm'>
                          Order listed:{' '}
                          <span className='text-[#0077FE]'>
                            {data?.create_time && dayjs(data.create_time).format('YYYY-MM-DD hh:mm:ss')}
                          </span>
                        </p>
                        <p className='text-sm'>
                          Published By:{' '}
                          <span className='text-[#0077FE]'>
                            {data?.delegator_address && isIndent(data.delegator_address)}
                          </span>
                        </p>
                        <div className='mt-[20px] grid grid-cols-3 gap-2'>
                          {borrowDetail.map((item, index) => (
                            <DetailColDesc
                              key={item.title}
                              className={index === 0 ? 'col-span-3' : ''}
                              title={item.title}
                              desc={item.value}
                              type='blue'
                            />
                          ))}
                        </div>
                        <div className='mt-[20px] grid grid-cols-2 gap-2'>
                          {orderDetail.map((item, index) => (
                            <DetailColDesc
                              key={item.title}
                              className={index === (type === 'borrow' ? 0 : 2) ? 'col-span-3' : ''}
                              title={item.title}
                              desc={item.value}
                              type='green'
                            />
                          ))}
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
