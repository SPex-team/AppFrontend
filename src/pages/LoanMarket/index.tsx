import { ReactComponent as DetailIcon } from '@/assets/images/detail.svg'
import { ReactComponent as CommentIcon } from '@/assets/images/comment.svg'
import { useEffect, useMemo, useState, Fragment } from 'react'
import MarketClass from '@/models/market-class'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import LoanAddDialog from '../../components/LoanAddDialog'
import BeneficiaryBindDialog from './components/BeneficiaryBindDialog'
import LoanLendDialog from './components/LoanLendDialog'
import { ZeroAddress } from 'ethers'
import { config } from '@/config'
import { putMiner } from '@/api/modules'
import { setRootData } from '@/store/modules/root'
import { message } from '@/components/Tip'
import { NavLink } from 'react-router-dom'
import { isEmpty } from '@/utils'
import BasicTable from '@/components/BasicTable'
import MinerIDRow from '@/pages/components/MinerIDRow'
import { useMetaMask } from '@/hooks/useMetaMask'
import { Popover, Transition } from '@headlessui/react'
import { ShoppingCartOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { LoanMarketListItem } from '@/types'

import DigitalCoinURL from '@/assets/images/digital_coin.png'
import PrivatePoolIcon from '@/assets/images/privatePoolIcon.png'

const LoanMarket = (props) => {
  const { currentAccount } = useMetaMask()
  const marketClass = useMemo(() => new MarketClass(), [])

  const [open, setOpen] = useState<boolean>(false)
  const [isBeneficiaryBindDialogOpen, setIsBeneficiaryBindDialogOpen] = useState<boolean>(false)
  const [isLendDialogOpen, setIsLendDialogOpen] = useState<boolean>(false)
  const [selectedMiner, setSelectedMiner] = useState<LoanMarketListItem>()
  // console.log('selectedMiner ==> ', selectedMiner)

  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null)

  const data = useSelector((state: RootState) => ({
    marketCount: state.root.marketCount,
    marketPage: state.root.marketPage,
    marketList: state.root.marketList,
    signer: state.root.signer,
    minerPriceCeiling: state.root.minerPriceCeiling,
    minerPriceFloor: state.root.minerPriceFloor
  }))
  const tableLoading = useSelector((state: RootState) => state.root.tableLoading)

  dayjs.extend(relativeTime)

  const columns = [
    {
      title: 'Miner ID',
      key: 'miner_id',
      render: (val, row) => <MinerIDRow value={val} />
    },
    {
      title: 'Total Miner Value',
      key: 'balance_human',
      render: (val) => `${val ?? '0'} FIL`
    },
    {
      title: 'Borrow Amount',
      key: 'power_human',
      render: (val) => (!isEmpty(val) ? `${val} FIL` : '-')
    },
    {
      title: 'APY',
      key: 'price',
      render: (val) => `${val ?? '0'} %`
    },
    {
      title: 'Listed Date',
      key: 'list_time',
      render: (val) =>
        val
          ? dayjs(new Date()).diff(val * 1000, 'day') >= 10
            ? dayjs(val * 1000).format('YYYY-MM-DD')
            : dayjs(val * 1000).fromNow()
          : '-'
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
          <div className='min-w-[140px]'>
            {cannotBuy ? (
              <span>The buyer has been designated</span>
            ) : (
              <div className='justify-space flex flex-wrap gap-x-7'>
                <button
                  className='hover:text-[#0077FE]'
                  onClick={() => {
                    const url = `${config.filescanOrigin}/address/miner?address=${config.address_zero_prefix}0${row.miner_id}`
                    window.open(url)
                  }}
                >
                  Detail
                  <DetailIcon className='ml-2 inline-block w-[14px]' />
                </button>
                <button className='hover:text-[#0077FE]' onClick={() => onLendButtonClick(row)}>
                  Lend
                  <ShoppingCartOutlined className='ml-1 align-middle' />
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

  const onLendButtonClick = (miner: LoanMarketListItem) => {
    setSelectedMiner(miner)
    setIsLendDialogOpen(true)
  }

  const onLoanCreate = () => {
    setOpen(true)
    setIsBeneficiaryBindDialogOpen(false)
  }

  const renderInterestTotal = () => (
    <div className='lg:gap-21 mb-4 flex flex-row gap-12'>
      <div className='flex flex-col items-center'>
        <div className='flex items-center gap-[10px]'>
          <img width={24} src={DigitalCoinURL} alt='coin' />
          <span className='text-4xl font-medium text-primary'>{`${data.minerPriceFloor} FIL`}</span>
        </div>
        <span className='text-[#57596C]'>Total Interest Paid</span>
      </div>
      <div className='-mt-[30px] inline-block h-[120px] min-h-[1em] w-0.5 self-stretch bg-neutral-100 opacity-100 dark:opacity-50'></div>
      <div className='flex flex-col items-center'>
        <div className='flex items-center gap-[10px]'>
          <img width={24} src={DigitalCoinURL} alt='coin' />
          <span className='text-4xl font-medium text-primary'>{`${data.minerPriceCeiling} FIL`}</span>
        </div>
        <span className='text-[#57596C]'>Total Interest Received</span>
      </div>
    </div>
  )

  useEffect(() => {
    marketClass.init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <section className='container mx-auto pb-[60px] pt-[190px]'>
        <div className='flex flex-col justify-between sm:flex-row'>
          <div className='mb-5 xl:mb-20'>
            <h2 className='jr-market mb-[13px] text-[30px] font-semibold leading-[61px] sm:text-[56px]'>Loan Market</h2>
            <div className='w-[420px] text-lg text-[#57596C] sm:w-[620px]'>
              <p>You could list your loan request order in the market to acquire</p>
              the liquidity of your pledge amount and locked rewards OR you can lend for exchange of interest.
            </div>
          </div>
          <div className='mx-5 hidden pt-5 xl:block'>{renderInterestTotal()}</div>
          <button
            onClick={() => {
              if (currentAccount) {
                setIsBeneficiaryBindDialogOpen(true)
              } else {
                message({
                  title: 'TIP',
                  type: 'warning',
                  content: 'Please connect you wallet first'
                })
              }
            }}
            className='bg-gradient-common mb-10 flex h-11 items-center justify-center rounded-full px-4 text-white md:mb-0'
          >
            Create Loan
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
        <BasicTable columns={columns} data={data.marketList} page={page} loading={tableLoading} />
      </section>
      <LoanAddDialog open={open} setOpen={setOpen} updateList={() => marketClass.removeDataOfList(1)} />
      <BeneficiaryBindDialog
        open={isBeneficiaryBindDialogOpen}
        setOpen={setIsBeneficiaryBindDialogOpen}
        onLoanCreate={onLoanCreate}
      />
      <LoanLendDialog open={isLendDialogOpen} setOpen={setIsLendDialogOpen} data={selectedMiner} />
    </>
  )
}

export default LoanMarket
