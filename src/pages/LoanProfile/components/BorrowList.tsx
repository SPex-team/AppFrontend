import { ReactComponent as DetailIcon } from '@/assets/images/detail.svg'
import BasicTable from '@/components/BasicTable'
import { config } from '@/config'
import { useMemo, useEffect, useState } from 'react'
import ProfileClass from '@/models/profile-class'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { formatListTime } from '@/utils/date'
import { isEmpty, numberWithCommas } from '@/utils/index'
import clsx from 'clsx'
import MinerIDRow from '@/pages/components/MinerIDRow'
import LoanDetailDialog from './LoanDetailDialog'
import RepayDialog from './RepayDialog'
import LoanAddDialog from '@/components/LoanAddDialog'
import LoanEditDialog from './LoanEditDialog'
import { useMetaMask } from '@/hooks/useMetaMask'
import { LoanMarketListItem } from '@/types'
import { PayCircleOutlined, CloseSquareOutlined, EditOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { patchLoanMiners } from '@/api/modules/loan'
import { handleError } from '@/components/AddDialog'
import BigNumber from 'bignumber.js'

const isDevEnv = process.env.NODE_ENV === 'development' || window.location.origin.includes('calibration')

const BorrowList = () => {
  const { currentAccount, loanContract } = useMetaMask()
  const profileClasss = useMemo(() => new ProfileClass({ currentAccount }), [currentAccount])
  const { borrowList, borrowCount, borrowPage, tableLoading } = useSelector((state: RootState) => ({
    borrowList: state.loan.borrowList,
    borrowPage: state.loan.borrowPage,
    borrowCount: state.loan.borrowCount,
    tableLoading: state.loan.tableLoading
  }))

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isRepayDialogOpen, setIsRepayDialogOpen] = useState(false)
  const [isLoanAddDialogOpen, setIsLoanAddDialogOpen] = useState(false)
  const [isLoanEditDialogOpen, setIsLoanEditDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedMiner, setSelectedMiner] = useState<LoanMarketListItem>()

  const columns: ColumnsType<LoanMarketListItem> = [
    {
      title: 'Miner ID',
      key: 'miner_id',
      render: (val) => <MinerIDRow value={val} />
    },
    {
      title: 'Total Miner Value',
      key: 'total_balance_human',
      render: (val) => (!isEmpty(val) ? `${numberWithCommas(val)} FIL` : '-')
    },
    {
      title: 'Collateral Rate',
      key: 'collateral_rate',
      render: (val) => (!isEmpty(val) ? `${BigNumber(val).decimalPlaces(2)} %` : '-')
    },
    {
      title: 'APY',
      key: 'annual_interest_rate_human',
      render: (val) => (!isEmpty(val) ? `${BigNumber(val).decimalPlaces(2)} %` : '-')
    },
    {
      title: 'Listed Day',
      key: 'last_list_time',
      render: (val, row) => (val && row.disabled ? '-' : formatListTime(val))
    },
    {
      title: 'Status',
      key: 'status',
      render: (val, row) =>
        row.disabled ? (
          '-'
        ) : (
          <span
            className={clsx([
              'inline-block h-[26px] whitespace-nowrap rounded-full bg-[rgba(0,119,254,0.1)] px-2 text-center text-sm leading-[26px]'
            ])}
          >
            {row.max_debt_amount_human === row.current_total_principal_human ? 'Complete' : 'Progressing'}
          </span>
        )
    },
    {
      key: 'operation',
      width: '35%',
      render: (val, row) => (
        <div className='justify-space flex flex-wrap gap-x-7'>
          <button
            className='whitespace-nowrap break-words hover:text-[#0077FE]'
            onClick={() => {
              setSelectedMiner(row)
              // profileClasss.getLoanByMinerId(miner.miner_id)
              setIsDetailDialogOpen(true)
            }}
          >
            Detail
            <DetailIcon className='ml-2 inline-block w-[14px]' />
          </button>
          <button
            className='whitespace-nowrap break-words hover:text-[#0077FE]'
            onClick={() => {
              setSelectedMiner(row)
              setIsRepayDialogOpen(true)
            }}
          >
            Repay
            <PayCircleOutlined className='mb-[4px] ml-1 align-middle' />
          </button>
          {row.disabled ? (
            <button
              className='whitespace-nowrap break-words hover:text-[#0077FE]'
              onClick={() => {
                setSelectedMiner(row)
                setIsLoanAddDialogOpen(true)
              }}
            >
              List
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                className='mb-[4px] ml-1 inline-block w-[16px]'
              >
                <path
                  fillRule='evenodd'
                  d='M2 3.75A.75.75 0 012.75 3h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.166a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          ) : (
            <button
              className='whitespace-nowrap break-words hover:text-[#0077FE]'
              disabled={loading}
              onClick={async () => {
                try {
                  if (loading) return
                  setLoading(true)
                  const tx = await loanContract.changeMinerDisabled(row.miner_id, true)
                  await tx.wait()
                  if (row.miner_id) {
                    patchLoanMiners({
                      miner_id: row.miner_id,
                      disabled: true
                    }).then(() => {
                      updateBorrowList()
                    })
                  }
                } catch (error) {
                  handleError(error)
                } finally {
                  setLoading(false)
                }
              }}
            >
              Unlist
              <CloseSquareOutlined className='mb-[4px] ml-1 align-middle' />
            </button>
          )}
          <button
            className='whitespace-nowrap break-words hover:text-[#0077FE]'
            onClick={() => {
              setSelectedMiner(row)
              setIsLoanEditDialogOpen(true)
            }}
          >
            Edit
            <EditOutlined className='mb-[4px] ml-1 align-middle' />
          </button>
        </div>
      )
    }
  ]

  const page = {
    pageNum: Math.ceil(borrowCount / profileClasss.page_size),
    currentPage: borrowPage,
    onChange: (page) => profileClasss.selectPage(page)
  }

  const updateBorrowList = () => {
    profileClasss.updateBorrowList()
  }

  useEffect(() => {
    profileClasss.initBorrow()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileClasss])

  return (
    <section className='container mx-auto pb-[60px]'>
      <BasicTable columns={columns} data={borrowList} page={page} loading={tableLoading} />
      <LoanDetailDialog open={isDetailDialogOpen} setOpen={setIsDetailDialogOpen} data={selectedMiner} type='borrow' />
      <RepayDialog
        open={isRepayDialogOpen}
        miner={selectedMiner}
        setOpen={setIsRepayDialogOpen}
        updateList={updateBorrowList}
      />
      <LoanAddDialog
        open={isLoanAddDialogOpen}
        miner={selectedMiner}
        setOpen={setIsLoanAddDialogOpen}
        updateList={updateBorrowList}
      />
      <LoanEditDialog
        open={isLoanEditDialogOpen}
        setOpen={setIsLoanEditDialogOpen}
        data={selectedMiner}
        updateList={updateBorrowList}
      />
    </section>
  )
}

export default BorrowList
