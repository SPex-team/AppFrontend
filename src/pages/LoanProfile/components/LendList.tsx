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
import { useMetaMask } from '@/hooks/useMetaMask'
import ClaimDialog from './ClaimDialog'
import LoanDetailDialog from './LoanDetailDialog'
import { LoanMarketListItem } from '@/types'
import { PayCircleOutlined } from '@ant-design/icons'

const isDevEnv = process.env.NODE_ENV === 'development' || window.location.origin.includes('calibration')

const History = () => {
  const { currentAccount } = useMetaMask()
  const profileClass = useMemo(() => new ProfileClass({ currentAccount }), [])
  const { borrowList, borrowCount, borrowPage, tableLoading } = useSelector((state: RootState) => ({
    borrowList: state.loan.borrowList,
    borrowPage: state.loan.borrowPage,
    borrowCount: state.loan.borrowCount,
    tableLoading: state.root.tableLoading2
  }))

  const [selectedMiner, setSelectedMiner] = useState<LoanMarketListItem | null>()
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const columns = [
    {
      title: 'Miner ID',
      key: 'miner_id',
      minWidth: 160,
      render: (val) => <MinerIDRow value={val} />
    },
    {
      title: 'Balance',
      key: 'balance_human',
      render: (val) => (!isEmpty(val) ? `${val} FIL` : '-')
    },
    {
      title: 'Power',
      key: 'power_human',
      render: (val) => (!isEmpty(val) ? `${val} TiB` : '-')
    },
    {
      title: 'Transaction Time',
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
      title: 'Price',
      key: 'price_human',
      minWidth: 100,
      render: (val) => (!isEmpty(val) ? `${val} FIL` : '-')
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
              setIsClaimDialogOpen(true)
            }}
          >
            Claim Repayment
            <PayCircleOutlined className='mb-[4px] ml-1 align-middle' />
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
    pageNum: Math.ceil(borrowCount / profileClass.page_size),
    currentPage: borrowPage,
    onChange: (page) => profileClass.selectPage(page)
  }

  useEffect(() => {
    profileClass.initLend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className='container mx-auto'>
      <BasicTable columns={columns} data={borrowList} page={page} loading={tableLoading} />
      <ClaimDialog open={isClaimDialogOpen} setOpen={setIsClaimDialogOpen} />
      <LoanDetailDialog open={isDetailDialogOpen} setOpen={setIsDetailDialogOpen} data={selectedMiner} type='lend' />
    </section>
  )
}

export default History
