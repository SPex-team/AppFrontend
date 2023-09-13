import { ReactComponent as DetailIcon } from '@/assets/images/detail.svg'
import BasicTable from '@/components/BasicTable'
import { config } from '@/config'
import { useMemo, useEffect, useState } from 'react'
import ProfileClass from '@/models/profile-class'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { formatListTime } from '@/utils/date'
import { isEmpty } from '@/utils/index'
import clsx from 'clsx'
import MinerIDRow from '@/pages/components/MinerIDRow'
import LoanDetailDialog from './LoanDetailDialog'
import RepayDialog from './RepayDialog'
import ClaimDialog from './ClaimDialog'
import LoanAddDialog from '@/components/LoanAddDialog'
import LoanEditDialog from './LoanEditDialog'
import { useMetaMask } from '@/hooks/useMetaMask'
import { LoanMarketListItem } from '@/types'
import { PayCircleOutlined, CloseSquareOutlined, EditOutlined } from '@ant-design/icons'

const isDevEnv = process.env.NODE_ENV === 'development' || window.location.origin.includes('calibration')

const BorrowList = () => {
  const { currentAccount } = useMetaMask()
  const profileClasss = useMemo(() => new ProfileClass({ currentAccount }), [])
  const { borrowList, borrowCount, borrowPage, tableLoading } = useSelector((state: RootState) => ({
    borrowList: state.loan.borrowList,
    borrowPage: state.loan.borrowPage,
    borrowCount: state.loan.borrowCount,
    tableLoading: state.loan.tableLoading
  }))

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [isRepayDialogOpen, setIsRepayDialogOpen] = useState(false)
  const [isLoanAddDialogOpen, setLoanAddDialogOpen] = useState(false)
  const [isLoanEditDialogOpen, setIsLoanEditDialogOpen] = useState(false)
  const [selectedMiner, setSelectedMiner] = useState<LoanMarketListItem | null>()

  const columns = [
    {
      title: 'Miner ID',
      key: 'miner_id',
      minWidth: 160,
      render: (val) => <MinerIDRow value={val} />
    },
    {
      title: 'Total Miner Value',
      key: 'balance_human',
      render: (val) => (!isEmpty(val) ? `${val} FIL` : '-')
    },
    {
      title: 'Collateral Rate',
      key: 'power_human',
      render: (val) => (!isEmpty(val) ? `${val} TiB` : '-')
    },
    {
      title: 'APY',
      key: 'apy',
      render: (val) => (!isEmpty(val) ? `${val} TiB` : '-')
    },
    {
      title: 'Listed Day',
      key: 'time',
      render: (val, row) => (val ? formatListTime(val) : '-')
    },
    {
      title: 'Status',
      key: 'tatus',
      render: (val, row) => (
        <span
          className={clsx([
            'inline-block h-[26px] w-[85px] rounded-full bg-[rgba(0,119,254,0.1)] text-center text-sm leading-[26px]',
            row.buyer?.toLowerCase() !== currentAccount?.toLowerCase() ? 'text-[#0077fe]' : 'text-[#909399]'
          ])}
        >
          {row.buyer?.toLowerCase() === currentAccount?.toLowerCase() ? 'Purchase' : 'Sold'}
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
          <button
            className='whitespace-nowrap break-words hover:text-[#0077FE]'
            onClick={() => {
              setSelectedMiner(row)
              setIsRepayDialogOpen(true)
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
          <button
            className='whitespace-nowrap break-words hover:text-[#0077FE]'
            onClick={() => {
              setSelectedMiner(row)
              setIsRepayDialogOpen(true)
            }}
          >
            Unlist
            <CloseSquareOutlined className='mb-[4px] ml-1 align-middle' />
          </button>
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
          <button
            className='whitespace-nowrap break-words hover:text-[#0077FE]'
            onClick={() => {
              const url = `${isDevEnv ? 'https://calibration.filfox.info/en' : config.filescanOrigin}/message/${
                row.transaction_hash
              }`
              window.open(url)
            }}
          >
            Transaction
            <DetailIcon className='ml-2 inline-block w-[14px]' />
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

  useEffect(() => {
    profileClasss.initBorrow()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className='container mx-auto pb-[60px]'>
      <BasicTable columns={columns} data={borrowList} page={page} loading={tableLoading} />
      <LoanDetailDialog open={isDetailDialogOpen} setOpen={setIsDetailDialogOpen} data={selectedMiner} type='borrow' />
      <RepayDialog open={isRepayDialogOpen} setOpen={setIsRepayDialogOpen} />
      <LoanAddDialog open={isLoanAddDialogOpen} setOpen={setLoanAddDialogOpen} updateList={() => {}} />
      <LoanEditDialog open={isLoanEditDialogOpen} setOpen={setIsLoanEditDialogOpen} />
    </section>
  )
}

export default BorrowList
