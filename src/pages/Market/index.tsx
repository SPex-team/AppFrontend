import { ReactComponent as BuyIcon } from '@/assets/images/buy.svg'
import { ReactComponent as DetailIcon } from '@/assets/images/detail.svg'
import { ReactComponent as CommentIcon } from '@/assets/images/comment.svg'
import { useEffect, useMemo, useState, Fragment } from 'react'
import MarketClass from '@/models/market-class'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import AddDialog, { handleError } from '@/components/AddDialog'
import { ZeroAddress } from 'ethers'
import { config } from '@/config'
import { putMiner } from '@/api/modules'
import { setRootData } from '@/store/modules/root'
import { message } from '@/components/Tip'
import { NavLink } from 'react-router-dom'
import SortDropdown from '@/components/Dropdown'
import { formatListTime } from '@/utils/date'
import debounce from 'lodash/debounce'
import { isEmpty } from '@/utils'
import BasicTable from '@/components/BasicTable'
import MinerIDRow from '@/pages/components/MinerIDRow'
import { useMetaMask } from '@/hooks/useMetaMask'
import useLocalStorage from '@/hooks/useLocalStorage'
import Joyride from 'react-joyride'
import { joyrideSteps, sortOptions } from './constants'
import { Popover, Transition } from '@headlessui/react'

import DigitalCoinURL from '@/assets/images/digital_coin.png'
import PrivatePoolIcon from '@/assets/images/privatePoolIcon.png'

const Market = (props) => {
  const dispatch = useDispatch()
  const { currentAccount, contract } = useMetaMask()
  const marketClass = useMemo(() => new MarketClass(), [])

  const [isFirstVisit, setIsFirstVisit] = useLocalStorage('isFirstVisit-spec', true)
  const [run, setRun] = useState<boolean>(false)
  const [open, setOpen] = useState(false)

  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null)

  const [sortKey, setSortKey] = useState<string>()
  const [searchText, setSearchText] = useState('')
  const data = useSelector((state: RootState) => ({
    marketCount: state.root.marketCount,
    marketPage: state.root.marketPage,
    marketList: state.root.marketList,
    signer: state.root.signer,
    minerPriceCeiling: state.root.minerPriceCeiling,
    minerPriceFloor: state.root.minerPriceFloor
  }))
  const tableLoading = useSelector((state: RootState) => state.root.tableLoading)

  const columns = [
    {
      title: 'Miner ID',
      key: 'miner_id',
      render: (val, row) => <MinerIDRow value={val} />
    },
    {
      title: 'Balance',
      key: 'balance_human',
      render: (val) => `${val ?? '0'} FIL`
    },
    {
      title: 'Power',
      key: 'power_human',
      render: (val) => (!isEmpty(val) ? `${val} TiB` : '-')
    },
    {
      title: 'Price',
      key: 'price',
      render: (val) => `${val ?? '0'} FIL`
    },
    {
      title: 'List Time',
      key: 'list_time',
      render: (val) => (val ? formatListTime(val) : '-')
    },
    {
      title: (
        <Popover className='relative'>
          {({ open }) => (
            <>
              <Popover.Button
                className='focus:outline-none'
                ref={setButtonRef}
                onMouseEnter={() => buttonRef && buttonRef.click()}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth='1.5'
                  stroke='currentColor'
                  className='h-5 w-5'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z'
                  />
                </svg>
              </Popover.Button>
              <Transition
                as={Fragment}
                enter='transition ease-out duration-200'
                enterFrom='opacity-0 translate-y-1'
                enterTo='opacity-100 translate-y-0'
                leave='transition ease-in duration-150'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 translate-y-1'
              >
                <Popover.Panel static className='absolute z-10 max-w-sm bg-white'>
                  {({ close }) => (
                    <div className='overflow-hidden rounded-lg px-4 py-2 shadow-lg' onMouseLeave={() => close()}>
                      <div className='mb-4'>
                        <p className='text-sm font-medium text-gray-900'>Detail</p>
                        <p className='text-sm font-normal text-gray-500'>View full info on a miner account</p>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>Comments</p>
                        <p className='text-sm font-normal text-gray-500'>Discuss or negotiate with the seller</p>
                      </div>
                    </div>
                  )}
                </Popover.Panel>
              </Transition>
            </>
          )}
        </Popover>
      ),
      key: 'operation',
      width: '35%',
      render: (val, row) => {
        const isPrivate = row.buyer !== ZeroAddress
        const cannotBuy = !(row.buyer.toLowerCase() === currentAccount?.toLowerCase() || row.buyer === ZeroAddress)
        return (
          <div>
            {cannotBuy ? (
              <span>The buyer has been designated</span>
            ) : (
              <div className='justify-space flex flex-wrap gap-x-7'>
                <button
                  className='hover:text-[#0077FE]'
                  onClick={() => {
                    const url = `${config.filescanOrigin}/miner/${config.address_zero_prefix}0${row.miner_id}`
                    window.open(url)
                  }}
                >
                  Detail
                  <DetailIcon className='ml-2 inline-block w-[14px]' />
                </button>
                <button className='hover:text-[#0077FE]' onClick={() => onBuy(row.miner_id, row.price_raw)}>
                  Buy
                  <BuyIcon className='ml-2 inline-block w-[14px]' />
                </button>
                <NavLink to={'/comment/' + row.miner_id.toString()}>
                  <button className='hover:text-[#0077FE]'>
                    Comments
                    <CommentIcon className='ml-2 inline-block' width={14} height={14} />
                  </button>
                </NavLink>
              </div>
            )}
            {isPrivate && (
              <img className='absolute -right-[7px] -top-[7px]' src={PrivatePoolIcon} alt='private_pool_pic' />
            )}
          </div>
        )
      }
    }
  ]

  const page = {
    pageNum: Math.ceil(data.marketCount / marketClass.page_size),
    currentPage: data.marketPage,
    onChange: (page) => marketClass.selectPage(page)
  }

  const onBuy = async (miner_id: number, price_raw: string) => {
    if (!currentAccount) {
      message({
        title: 'TIP',
        type: 'warning',
        content: 'Please connect you wallet first'
      })
      return
    }
    try {
      dispatch(setRootData({ loading: true }))

      const tx = await contract.buyMiner(miner_id, {
        value: price_raw,
        gasLimit: 100000
      })

      message({
        title: 'TIP',
        type: 'success',
        content: tx.hash,
        closeTime: 4000
      })

      const result = await tx.wait()
      console.log('result', result)

      await putMiner(miner_id, { miner_id, owner: currentAccount, price: 0, price_raw: 0, is_list: false })

      marketClass.removeDataOfList(miner_id)
      dispatch(setRootData({ loading: false }))
    } catch (error) {
      handleError(error)
      dispatch(setRootData({ loading: false }))
    }
  }

  const onSortChange = (val: string) => {
    setSortKey(val)
  }

  const onSearchTextChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    setSearchText(event.target.value.trim())
  }

  const onSearch = () => {
    const seachTxt = searchText.replace('t0', '').replace('f0', '')
    marketClass.searchList(seachTxt)
  }

  const renderFloorAndCeilingMarketPrices = () => (
    <div className='lg:gap-21 mb-4 flex flex-row gap-12'>
      <div className='flex flex-col items-center'>
        <div className='flex items-center gap-[10px]'>
          <img width={24} src={DigitalCoinURL} alt='coin' />
          <span className='text-4xl font-medium text-primary'>{`${data.minerPriceFloor} FIL`}</span>
        </div>
        <span className='text-[#57596C]'>Floor</span>
      </div>
      <div className='-mt-[30px] inline-block h-[120px] min-h-[1em] w-0.5 self-stretch bg-neutral-100 opacity-100 dark:opacity-50'></div>
      <div className='flex flex-col items-center'>
        <div className='flex items-center gap-[10px]'>
          <img width={24} src={DigitalCoinURL} alt='coin' />
          <span className='text-4xl font-medium text-primary'>{`${data.minerPriceCeiling} FIL`}</span>
        </div>
        <span className='text-[#57596C]'>Ceiling</span>
      </div>
    </div>
  )

  useEffect(() => {
    marketClass.init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (isFirstVisit) {
      setRun(true)
      setIsFirstVisit(false)
    }
  }, [isFirstVisit, setIsFirstVisit])

  useEffect(() => {
    // sort by keys
    if (sortKey) {
      marketClass.sortList(sortKey)
    }
  }, [marketClass, sortKey])

  useEffect(onSearch, [marketClass, searchText])

  return (
    <>
      <section className='container mx-auto pb-[60px] pt-[190px]'>
        <div className='flex flex-col justify-between sm:flex-row'>
          <div className='mb-5 xl:mb-20'>
            <h2 className='jr-market mb-[13px] text-[30px] font-semibold leading-[61px] sm:text-[56px]'>
              Miner Account Market
            </h2>
            <p className='w-[420px] text-lg text-[#57596C] sm:w-[620px]'>
              Allowing Storage Providers to implement securely trustless account trading, optimize capital efficiency,
              select special ID numbers, etc.
            </p>
          </div>
          <div className='mx-5 hidden pt-5 xl:block'>{renderFloorAndCeilingMarketPrices()}</div>
          <button
            onClick={() => {
              if (currentAccount) {
                setOpen(true)
              } else {
                message({
                  title: 'TIP',
                  type: 'warning',
                  content: 'Please connect you wallet first'
                })
              }
            }}
            className='bg-gradient-common jr-add-miner mb-10 flex h-11 w-[119px] items-center justify-center rounded-full text-white md:mb-0'
          >
            Add
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='ml-2 h-[20px] w-[20px]'
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
            </svg>
          </button>
        </div>

        <div className='my-10 xl:hidden'>{renderFloorAndCeilingMarketPrices()}</div>

        <div className='mb-5 flex flex-row justify-between'>
          <div className='relative w-[255px] text-gray-600'>
            <input
              type='search'
              name='search'
              placeholder='Search'
              className='h-10 w-[250px] rounded-full bg-white px-5 pr-10 text-sm focus:outline-none'
              onChange={debounce(onSearchTextChange, 800)}
            />
            <button type='submit' className='absolute right-0 top-0 mr-4 mt-3' onClick={onSearch}>
              <svg className='h-4 w-4 fill-current' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 56.966 56.966'>
                <path d='M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z' />
              </svg>
            </button>
          </div>
          <SortDropdown options={sortOptions} onChange={onSortChange} />
        </div>
        <BasicTable
          columns={columns}
          data={data.marketList}
          page={page}
          loading={tableLoading}
          joyGuide='jr-market-list'
        />
      </section>
      <AddDialog open={open} setOpen={setOpen} updataList={() => marketClass.removeDataOfList(1)} />
      <Joyride
        steps={joyrideSteps}
        styles={{
          options: {
            textColor: '#57596C',
            primaryColor: '#0077fe',
            overlayColor: 'rgba(0, 0, 0, 0.25)'
          }
        }}
        floaterProps={{
          disableAnimation: true
        }}
        run={run}
        continuous
        hideBackButton
        scrollOffset={200}
        showProgress
        locale={{
          last: 'OK'
        }}
      />
    </>
  )
}

export default Market
