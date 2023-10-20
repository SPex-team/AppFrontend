import { ReactComponent as DetailIcon } from '@/assets/images/detail.svg'
import BasicTable from '@/components/BasicTable'
import { config } from '@/config'
import { useMemo, useEffect } from 'react'
import HistoryClass from '@/models/history'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { formatListTime } from '@/utils/date'
import { isEmpty } from '@/utils/index'
import clsx from 'clsx'
import MinerIDRow from '@/pages/components/MinerIDRow'
import { useMetaMask } from '@/hooks/useMetaMask'

const isDevEnv = process.env.NODE_ENV === 'development' || window.location.origin.includes('calibration')

const History = () => {
  const { currentAccount } = useMetaMask()
  const historyClass = useMemo(() => new HistoryClass(), [])
  const { transactionHistoryList, transactionHistoryPage, transactionHistoryCount, tableLoading } = useSelector(
    (state: RootState) => ({
      transactionHistoryList: state.root.transactionHistoryList,
      transactionHistoryPage: state.root.transactionHistoryPage,
      transactionHistoryCount: state.root.transactionHistoryCount,
      tableLoading: state.root.tableLoading2
    })
  )
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
              const url = `${isDevEnv ? 'https://calibration.filfox.info/en' : config.filescanOrigin}/message/${
                row.transaction_hash
              }`
              window.open(url)
            }}
          >
            Transaction
            <DetailIcon className='ml-2 inline-block w-[14px]' />
          </button>
          <button
            className='whitespace-nowrap break-words hover:text-[#0077FE]'
            onClick={() => {
              const url = `${config.filescanOrigin}/address/${config.address_zero_prefix}0${row.miner_id}`
              window.open(url)
            }}
          >
            Miner
            <DetailIcon className='ml-2 inline-block w-[14px]' />
          </button>
        </div>
      )
    }
  ]

  const page = {
    pageNum: Math.ceil(transactionHistoryCount / historyClass.page_size),
    currentPage: transactionHistoryPage,
    onChange: (page) => historyClass.selectTransactionPage(page, currentAccount)
  }

  useEffect(() => {
    historyClass.initTransaction(currentAccount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className='container mx-auto px-2 pb-[60px] pt-[20px] sm:pt-[40px]'>
      <div className='flex justify-between'>
        <div className='mb-3 sm:mb-10'>
          <h2 className='mb-[13px] text-[32px] font-semibold leading-[61px] sm:text-[56px]'>Transaction History</h2>
          <p className='w-[360px] text-sm text-[#57596C] sm:w-[490px] sm:text-lg'>
            Below to see the history of your deal transactions
          </p>
        </div>
      </div>

      <BasicTable columns={columns} data={transactionHistoryList} page={page} loading={tableLoading} />
    </section>
  )
}

export default History
