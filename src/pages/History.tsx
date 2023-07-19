import { ReactComponent as DetailIcon } from '@/assets/images/detail.svg'
import { ReactComponent as CommentIcon } from '@/assets/images/comment.svg'
import BasicTable from '@/components/BasicTable'
import { NavLink } from 'react-router-dom'
import { config } from '@/config'
import { useState, useMemo, useEffect } from 'react'
import HistoryClass from '@/models/history'
import { RootState } from '@/store'
import { useSelector } from 'react-redux'
import { formatListTime } from '@/utils/date'
import { isEmpty } from '@/utils/index'

const isDevEnv = process.env.NODE_ENV === 'development' || window.location.origin.includes('calibration')

const columns = [
  {
    title: 'Sold Miner ID',
    key: 'miner_id',
    minWidth: 160,
    render: (val) => (!isEmpty(val) ? `${config.address_zero_prefix}0${val}` : '-')
  },
  {
    title: 'Balance',
    key: 'balance_human',
    width: 200,
    render: (val) => (!isEmpty(val) ? `${val} FIL` : '-')
  },
  {
    title: 'Power',
    key: 'power_human',
    render: (val) => (!isEmpty(val) ? `${val} TiB` : '-')
  },
  {
    title: 'Sold Price',
    key: 'price_human',
    minWidth: 100,
    render: (val) => (!isEmpty(val) ? `${val} FIL` : '-')
  },
  {
    title: 'Transaction time',
    key: 'time',
    render: (val) => {
      console.log(val, isEmpty(val))

      return !isEmpty(val) ? formatListTime(val) : '-'
    }
  },
  {
    key: 'operation',
    width: '35%',
    render: (val, row) => (
      <div className='justify-space flex flex-wrap gap-4'>
        <button
          className='whitespace-nowrap break-words hover:text-[#0077FE]'
          onClick={() => {
            const url = `${isDevEnv ? 'https://calibration.filfox.info/en' : config.filescanOrigin}/message/${
              row.transaction_hash
            }`
            window.open(url)
          }}
        >
          Transaction Detail
          <DetailIcon className='ml-2 inline-block w-[14px]' />
        </button>
        <NavLink to={'/comment/' + row.miner_id?.toString()}>
          <button className='whitespace-nowrap break-words hover:text-[#0077FE]'>
            Comments
            <CommentIcon className='ml-2 inline-block' width={14} height={14} />
          </button>
        </NavLink>
        <button
          className='whitespace-nowrap break-words hover:text-[#0077FE]'
          onClick={() => {
            const url = `${config.filescanOrigin}/address/miner?address=${config.address_zero_prefix}0${row.miner_id}`
            window.open(url)
          }}
        >
          Miner Detail
          <DetailIcon className='ml-2 inline-block w-[14px]' />
        </button>
      </div>
    )
  }
]

const History = () => {
  const historyClass = useMemo(() => new HistoryClass(), [])

  const { transactionHistoryList, transactionHistoryPage, transactionHistoryCount, tableLoading } = useSelector(
    (state: RootState) => ({
      transactionHistoryList: state.root.transactionHistoryList,
      transactionHistoryPage: state.root.transactionHistoryPage,
      transactionHistoryCount: state.root.transactionHistoryCount,
      tableLoading: state.root.tableLoading2
    })
  )

  const page = {
    pageNum: Math.ceil(transactionHistoryCount / historyClass.page_size),
    currentPage: transactionHistoryPage,
    onChange: (page) => historyClass.selectTransactionPage(page)
  }

  useEffect(() => {
    historyClass.initTransaction()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className='container mx-auto px-2 pb-[60px] pt-[100px] sm:pt-[190px]'>
      <div className='flex justify-between'>
        <div className='mb-5 sm:mb-20'>
          <h2 className='mb-[13px] text-[32px] font-semibold leading-[61px] sm:text-[56px]'>Market Sales History</h2>
          <p className='w-[360px] text-sm text-[#57596C] sm:w-[490px] sm:text-lg'>
            Here you could track the Market Sales History of Miner IDs
          </p>
        </div>
      </div>

      <BasicTable columns={columns} data={transactionHistoryList} loading={tableLoading} page={page} />
    </section>
  )
}

export default History
