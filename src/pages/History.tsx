import { ReactComponent as DetailIcon } from '@/assets/images/detail.svg'
import { ReactComponent as CommentIcon } from '@/assets/images/comment.svg'
import BasicTable from '@/components/BasicTable'
import { NavLink } from 'react-router-dom'
import { config } from '@/config'
import { useState, useMemo, useEffect } from 'react'
import HistoryClass from '@/models/history'

const columns = [
  {
    title: 'Sold Miner ID',
    key: 'soldMinerID',
    minWidth: 160
  },
  {
    title: 'Balance',
    key: 'balance',
    width: 200
  },
  {
    title: 'Power',
    key: 'power'
  },
  {
    title: 'Sold Price',
    key: 'price',
    minWidth: 100
  },
  {
    title: 'Transaction time',
    key: 'transactionTime'
  },
  {
    key: 'operation',
    width: '35%',
    render: (val, row) => (
      <div className='justify-space flex flex-wrap gap-4'>
        <button
          className='whitespace-nowrap break-words hover:text-[#0077FE]'
          onClick={() => {
            const url = `${config.filescanOrigin}/address/miner?address=${config.address_zero_prefix}0${row.soldMinerID}`
            window.open(url)
          }}
        >
          Transaction Detail
          <DetailIcon className='ml-2 inline-block w-[14px]' />
        </button>
        <NavLink to={'/comment/' + row.soldMinerID.toString()}>
          <button className='whitespace-nowrap break-words hover:text-[#0077FE]'>
            Comments
            <CommentIcon className='ml-2 inline-block' width={14} height={14} />
          </button>
        </NavLink>
        <button
          className='whitespace-nowrap break-words hover:text-[#0077FE]'
          onClick={() => {
            const url = `${config.filescanOrigin}/address/miner?address=${config.address_zero_prefix}0${row.soldMinerID}`
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

const data: any = [
  {
    soldMinerID: 'aaaa',
    balance: '0x2ebd277c069e7ccacdde2cead2d9aab549561c2f',
    is_list: true,
    price: 2,
    list_time: 1677742302277
  },
  {
    soldMinerID: 'f124422',
    balance: 'ddd',
    is_list: true,
    price: 3,
    list_time: 1675307260654
  },
  {
    soldMinerID: 'f0807366',
    balance: '3233',
    is_list: true,
    price: 1,
    list_time: 1675243760733
  },
  {
    soldMinerID: 'f08071366',
    balance: '3233',
    is_list: true,
    price: 1,
    list_time: 1675243760733
  },
  {
    soldMinerID: 'f08027366',
    balance: '3233',
    is_list: true,
    price: 1,
    list_time: 1675243760733
  },
  {
    soldMinerID: 'f08307366',
    balance: '3233',
    is_list: true,
    price: 1,
    list_time: 1675243760733
  }
]

const History = () => {
  const [pageNum, setPageNum] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchText, setSearchText] = useState('')
  const historyClass = useMemo(() => new HistoryClass(), [])

  const onPageChange = () => {}

  const page = {
    pageNum: Math.ceil(data.marketCount / historyClass.page_size),
    currentPage,
    onChange: onPageChange
  }

  const onSearchTextChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setSearchText(event.target.value)
  }

  useEffect(() => {
    // historyClass.init()
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
      <div className='relative w-[255px] text-gray-600'>
        <input
          type='search'
          name='search'
          placeholder='Search'
          className='h-10 w-[250px] rounded-full bg-white px-5 pr-10 text-sm focus:outline-none'
          onChange={onSearchTextChange}
        />
        <button type='submit' className='absolute right-0 top-0 mr-4 mt-3'>
          <svg className='h-4 w-4 fill-current' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56.966 56.966'>
            <path d='M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z' />
          </svg>
        </button>
      </div>
      <BasicTable columns={columns} data={data} page={page} />
    </section>
  )
}

export default History
