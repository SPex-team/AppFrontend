import { Dialog, Transition } from '@headlessui/react'
import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { config } from '@/config'
import { postBuildMessage, postMiner, postPushMessage, transferInCheck } from '@/api/modules'
import { Table, Radio } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { RadioChangeEvent } from 'antd'
import { RootState } from '@/store'
import Tip, { message } from '../../../components/Tip'
import { useMetaMask } from '@/hooks/useMetaMask'
import { useSelector } from 'react-redux'
import DetailColDesc from '@/components/DetailColDesc'
import NumberInput from '@/components/NumberInput'
import SpinWrapper from '@/components/SpinWrapper'
import { isIndent } from '@/utils'

import DigitalCoinURL from '@/assets/images/digital_coin.png'

interface IProps {
  open: boolean
  data?: any
  type?: 'borrow' | 'lend'
  setOpen: (bol: boolean) => void
}

interface DataType {
  address: string
  range: number
  principle: number
}

export default function RepayDialog(props: IProps) {
  const { open = false, data, type = 'lend', setOpen } = props
  const { currentAccount, contract } = useMetaMask()

  const [stepNum, setStepNum] = useState(0)
  const [loading, setLoading] = useState(false)
  const [repayMethod, setRepayMethod] = useState(1)
  const [repayAmount, setRepayAmount] = useState<number | null>(null)
  const [selectedAddress, setSelectedAddress] = useState<any>()

  const { transactionHistoryList, transactionHistoryPage, transactionHistoryCount, tableLoading } = useSelector(
    (state: RootState) => ({
      transactionHistoryList: state.root.transactionHistoryList,
      transactionHistoryPage: state.root.transactionHistoryPage,
      transactionHistoryCount: state.root.transactionHistoryCount,
      tableLoading: state.root.tableLoading2
    })
  )

  const columns: ColumnsType<DataType> = [
    {
      title: 'Lender Address',
      dataIndex: 'address',
      align: 'left',
      width: 150,
      render: (text) => <span className='whitespace-nowrap'>{isIndent(text)}</span>
    },
    {
      title: 'Lending Days',
      dataIndex: 'days'
    },
    {
      title: 'Principle',
      dataIndex: 'principle'
    },
    {
      title: 'Interest Owed',
      dataIndex: 'interest'
    }
  ]

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

  const onRadioChange = (e: RadioChangeEvent) => {
    console.log('radio checked', e.target.value)
    setRepayMethod(e.target.value)
  }

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: DataType[]) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows)
      setSelectedAddress(selectedRowKeys)
    },
    getCheckboxProps: (record: DataType) => ({
      name: record?.address
    })
  }

  useEffect(() => {
    if (!open) {
      setStepNum(0)
      setSelectedAddress(null)
    }
  }, [open])

  return (
    <>
      <Transition
        className='z-40'
        appear
        show={!!data?.tx}
        as='div'
        leave='ease-in duration-200'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <Tip className='z-40 max-w-[1102px]' title='TIP' content={data?.tx?.hash} />
      </Transition>
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
                        Miner f0123123 Loan Repay
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
                      <div className='mb-[20px] flex justify-between'>
                        <p className='text-2xl font-semibold'>Total Interest to Repay</p>

                        <div className='flex items-center gap-[10px]'>
                          <img width={24} src={DigitalCoinURL} alt='coin' />
                          <div className='text-2xl font-semibold text-[#0077FE]'>1225.34 FIL</div>
                        </div>
                      </div>
                      <p className='mb-[10px]'>Choose the lender you want to repay now</p>
                      <SpinWrapper loading={tableLoading}>
                        <Table
                          columns={columns}
                          dataSource={list}
                          rowKey='address'
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
                                  <Radio value={2}>Miner Available Balance: 10000 FIL</Radio>
                                </Radio.Group>
                              </div>
                            </div>
                          </div>
                          <div className='text-center'>
                            <button
                              onClick={() => {}}
                              className='bg-gradient-common mx-auto my-10 h-11 w-[200px] rounded-full px-4 text-white md:mb-0'
                            >
                              Repay
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className='pb-[30px]' />
                      )}
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
