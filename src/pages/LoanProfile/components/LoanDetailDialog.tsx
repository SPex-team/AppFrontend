import { Dialog, Transition } from '@headlessui/react'
import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react'
import { ethers, parseEther, ZeroAddress } from 'ethers'
import { config } from '@/config'
import { postBuildMessage, postMiner, postPushMessage, transferInCheck } from '@/api/modules'
import { List, Skeleton, Divider, Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import Tip, { message } from '../../../components/Tip'
import { useMetaMask } from '@/hooks/useMetaMask'
import DetailColDesc from '@/components/DetailColDesc'
import NumberInput from '@/components/NumberInput'
import { isIndent } from '@/utils'
import './loanDetail.scss'
import { LoanMarketListItem } from '@/types'
import dayjs from 'dayjs'

interface IProps {
  open: boolean
  data?: LoanMarketListItem | null
  type?: 'borrow' | 'lend'
  setOpen: (bol: boolean) => void
}

interface DataType {
  address: string
  range: number
  principle: number
}

export default function LoanDetailDialog(props: IProps) {
  const { open = false, data, type = 'lend', setOpen } = props
  const { currentAccount, contract } = useMetaMask()

  const [stepNum, setStepNum] = useState(0)

  const columns: ColumnsType<DataType> = [
    {
      title: 'Lender Address',
      dataIndex: 'address',
      align: 'left',
      width: 150,
      render: (text) => <span className='whitespace-nowrap'>{isIndent(text)}</span>
    },
    {
      title: 'Days',
      dataIndex: 'days'
    },
    {
      title: 'Principle',
      dataIndex: 'Principle'
    }
  ]

  const borrowDetail = useMemo(() => {
    return [
      {
        title: 'Amount request to borrow',
        value: `15000 FIL`
      },
      {
        title: 'Colletral Rate',
        value: `50%`
      },
      {
        title: 'Commit APY',
        value: `20%`
      },
      {
        title: 'Approximate Interest',
        value: '3000 FIL / year'
      }
    ]
  }, [])

  const orderDetail = useMemo(() => {
    return type === 'lend'
      ? [
          {
            title: 'Amount you lend',
            value: `50000 FIL`
          },
          {
            title: '% of Total Loan',
            value: `33.3%`
          },
          {
            title: 'Approximate interest you would earn / year',
            value: `10000 FIL`
          }
        ]
      : [
          {
            title: 'Amount has been borrowed for this order',
            value: `50000 FIL`
          },
          {
            title: 'Order completed',
            value: `33.3%`
          },
          {
            title: 'Lending Quota left',
            value: `10000 FIL`
          }
        ]
  }, [])

  const lendDetail = useMemo(() => {
    return [
      {
        title: 'Amount has been borrowed for this order',
        value: '50000 FIL'
      },
      {
        title: 'Order completed',
        value: '33.33%'
      },
      {
        title: 'Lending Quota left',
        value: '100000 FIL'
      }
    ]
  }, [])

  const list = useMemo(() => {
    return [
      {
        address: '0xA1151D1821704a4beB63e3f7dF6135327E9208e1',
        range: 60,
        principle: 2000
      },
      {
        address: '0xA1151D1821704a2beB63e3f7dF6135327E9208e1',
        range: 60,
        principle: 2000
      },
      {
        address: '0xA1151D1321704a4beB63e3f7dF6135327E9208e1',
        range: 60,
        principle: 2000
      },
      {
        address: '0xA115121821704a4beB63e3f7dF6135327E9208e1',
        range: 60,
        principle: 2000
      },
      {
        address: '0xA1151D1121704a4beB63e3f7dF6135327E9208e1',
        range: 60,
        principle: 2000
      },
      {
        address: '0xA1154D1821704a4beB63e3f7dF6135327E9208e1',
        range: 60,
        principle: 2000
      }
    ]
  }, [])

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
                        <div className='rounded-[10px] border border-gray-300 p-[20px]'>
                          <p className='font-semibold'>Miner Detail</p>
                          {borrowDetail.map((item) => (
                            <div className='my-[10px] flex justify-between' key={item.title}>
                              <span>{item.title}</span>
                              <span className='font-medium'>{item.value}</span>
                            </div>
                          ))}
                          <Divider className='my-[12px] border-gray-300' />
                          <div className='my-[10px] flex justify-between'>
                            <span>Miner Total Value</span>
                            <span className='font-medium'>30000 FIL</span>
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
                                  dataSource={list}
                                  pagination={false}
                                  rowKey='address'
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
                            {data?.list_time && dayjs(data.list_time * 1000).format('YYYY-MM-DD hh:mm:ss')}
                          </span>
                        </p>
                        <p className='text-sm'>
                          Published By: <span className='text-[#0077FE]'>{data?.owner && isIndent(data.owner)}</span>
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
