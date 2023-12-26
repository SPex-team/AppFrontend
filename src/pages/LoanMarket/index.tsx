import { ReactComponent as DetailIcon } from '@/assets/images/detail.svg'
import { ReactComponent as CommentIcon } from '@/assets/images/comment.svg'
import { ReactComponent as ExportIcon } from '@/assets/images/export.svg'
import { useEffect, useMemo, useState, Fragment } from 'react'
import MarketClass from '@/models/loan-market-class'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import LoanAddDialog from '../../components/LoanAddDialog'
import Progress from '../../components/Progress'
import BeneficiaryBindDialog from './components/BeneficiaryBindDialog'
import LoanLendDialog from './components/LoanLendDialog'
import { config } from '@/config'
import { message } from '@/components/Tip'
import { NavLink } from 'react-router-dom'
import { isEmpty, numberWithCommas } from '@/utils'
import BasicTable from '@/components/BasicTable'
import MinerIDRow from '@/pages/components/MinerIDRow'
import { useMetaMask } from '@/hooks/useMetaMask'
import { Popover, Transition } from '@headlessui/react'
import { ShoppingCartOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { LoanMarketListItem } from '@/types'
import BigNumber from 'bignumber.js'
import useLoading from '@/hooks/useLoading'

const LoanMarket = (props) => {
  const { currentAccount } = useMetaMask()
  const marketClass = useMemo(() => new MarketClass(), [])

  const [open, setOpen] = useState<boolean>(false)
  const [isBeneficiaryBindDialogOpen, setIsBeneficiaryBindDialogOpen] = useState<boolean>(false)
  const [isLendDialogOpen, setIsLendDialogOpen] = useState<boolean>(false)
  const [selectedMiner, setSelectedMiner] = useState<LoanMarketListItem>()
  const [createdMinerId, setCreatedMinerId] = useState<number | null>()
  const { loading, setLoading } = useLoading()

  const [buttonRef, setButtonRef] = useState<HTMLButtonElement | null>(null)

  const data = useSelector((state: RootState) => ({
    marketCount: state.loan.marketCount,
    marketPage: state.loan.marketPage,
    marketList: state.loan.marketList,
    signer: state.loan.signer,
    minerPriceCeiling: state.loan.minerPriceCeiling,
    minerPriceFloor: state.loan.minerPriceFloor,
    minerInfo: state.loan.minerInfo
  }))
  const tableLoading = useSelector((state: RootState) => state.loan.tableLoading)

  dayjs.extend(relativeTime)

  const columns = [
    {
      title: 'Miner ID',
      key: 'miner_id',
      render: (val, row) => <MinerIDRow showType={false} value={val} />
    },
    {
      title: 'Total Miner Value',
      key: 'total_balance_human',
      render: (val) => `${numberWithCommas(val) ?? '0'} FIL`
    },
    {
      title: 'Borrow Amount',
      key: 'max_debt_amount_human',
      render: (val) => (!isEmpty(val) ? `${numberWithCommas(val)} FIL` : '-')
    },
    {
      title: 'APY',
      key: 'annual_interest_rate_human',
      render: (val) => <span className='whitespace-nowrap'>{`${BigNumber(val).decimalPlaces(2) ?? '0'} %`}</span>
    },
    {
      title: 'Min. Lend Amount',
      key: 'min_lend_amount_human',
      render: (val) => `${BigNumber(val).decimalPlaces(2, BigNumber.ROUND_CEIL).toNumber() ?? '0'} FIL`
    },
    {
      title: 'Loan Progress',
      key: 'progress',
      render: (val, row) => (
        <Progress
          format={(percent) => `${percent}%`}
          percent={BigNumber(row?.current_total_principal_human || 0)
            .dividedBy(BigNumber(row?.max_debt_amount_human || 0))
            .multipliedBy(100)
            .toNumber()}
        />
      )
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
      width: '30%',
      render: (val, row) => {
        return (
          <div className='justify-space flex flex-wrap gap-x-7'>
            <button
              className='flex items-center whitespace-nowrap hover:text-[#0077FE]'
              onClick={() => {
                const url = `${config.filescanOrigin}/miner/${config.address_zero_prefix}0${row.miner_id}`
                window.open(url)
              }}
            >
              Miner Detail
              <ExportIcon className='ml-1 inline-block w-[18px]' />
            </button>
            <button
              className='flex items-center whitespace-nowrap hover:text-[#0077FE]'
              disabled={row.disabled}
              onClick={() => onLendButtonClick(row)}
            >
              Lend
              <ShoppingCartOutlined className='ml-1 align-middle' />
            </button>
            <NavLink to={'/loanComment/' + row.miner_id.toString()}>
              <button className='flex items-center whitespace-nowrap hover:text-[#0077FE]'>
                Comments
                <CommentIcon className='ml-1 inline-block' width={14} height={14} />
              </button>
            </NavLink>
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
    marketClass.getLoanByMinerId(miner.miner_id)
    setIsLendDialogOpen(true)
  }

  const onLoanCreate = (minerId: number) => {
    setCreatedMinerId(minerId)
    setOpen(true)
    setIsBeneficiaryBindDialogOpen(false)
  }

  const getList = () => {
    marketClass.init()
  }

  useEffect(() => {
    getList()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <section className='common-container'>
        <div className='flex flex-col justify-between sm:flex-row'>
          <div className='mb-5 xl:mb-20'>
            <h2 className='jr-market mb-[13px] text-[32px] font-semibold leading-[61px] sm:text-[56px]'>Loan Market</h2>
            <div className='w-[360px] text-[#57596C] md:w-[500px] md:text-lg'>
              You could list your loan request order in the market to acquire the liquidity of your pledge amount and
              locked rewards OR you can lend for exchange of interest.
            </div>
          </div>
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
            className='bg-gradient-common mb-10 flex h-11 items-center justify-center whitespace-nowrap rounded-full px-4 text-white md:mb-0'
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
      <LoanAddDialog
        open={open}
        setOpen={setOpen}
        miner={{ miner_id: createdMinerId || 0 }}
        updateList={() => marketClass.updateList(1)}
      />
      <BeneficiaryBindDialog
        open={isBeneficiaryBindDialogOpen}
        setOpen={setIsBeneficiaryBindDialogOpen}
        onLoanCreate={onLoanCreate}
      />
      <LoanLendDialog
        open={isLendDialogOpen}
        setOpen={setIsLendDialogOpen}
        getList={getList}
        minerInfo={selectedMiner && data.minerInfo && { ...selectedMiner, ...data.minerInfo }}
      />
    </>
  )
}

export default LoanMarket
