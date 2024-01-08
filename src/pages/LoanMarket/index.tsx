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
import { isEmpty, numberWithCommas } from '@/utils'
import BasicTable from '@/components/BasicTable'
import MinerIDRow from '@/pages/components/MinerIDRow'
import { useMetaMask } from '@/hooks/useMetaMask'
import { ShoppingCartOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { LoanMarketListItem } from '@/types'
import BigNumber from 'bignumber.js'
import { Space } from 'antd'
import InfoTips from '../../components/InfoTips'

const LoanMarket = (props) => {
  const { currentAccount } = useMetaMask()
  const marketClass = useMemo(() => new MarketClass(), [])

  const [open, setOpen] = useState<boolean>(false)
  const [isBeneficiaryBindDialogOpen, setIsBeneficiaryBindDialogOpen] = useState<boolean>(false)
  const [isLendDialogOpen, setIsLendDialogOpen] = useState<boolean>(false)
  const [selectedMiner, setSelectedMiner] = useState<LoanMarketListItem>()
  const [createdMinerId, setCreatedMinerId] = useState<number | null>()

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
      title: 'SP ID',
      key: 'miner_id',
      render: (val, row) => <MinerIDRow showType={false} value={val} />
    },
    {
      title: (
        <Space>
          Total Value <InfoTips content='Total Value = Pledge + Locked Reward + Available Balance' />
        </Space>
      ),
      key: 'total_balance_human',
      render: (val) => `${numberWithCommas(val) ?? '0'} FIL`
    },
    {
      title: 'APY',
      key: 'annual_interest_rate_human',
      render: (val) => <span className='whitespace-nowrap'>{`${numberWithCommas(val) ?? '0'} %`}</span>
    },
    {
      title: 'Requested Loan Amount',
      key: 'max_debt_amount_human',
      render: (val) => (!isEmpty(val) ? `${numberWithCommas(val)} FIL` : '-')
    },
    {
      title: '% of Loan Filled',
      key: 'progress',
      render: (val, row) => (
        <Progress
          format={(percent) => `${numberWithCommas(percent)}%`}
          percent={BigNumber(row?.current_total_principal_human || 0)
            .dividedBy(BigNumber(row?.max_debt_amount_human || 0))
            .multipliedBy(100)
            .decimalPlaces(2, BigNumber.ROUND_DOWN)
            .toNumber()}
        />
      )
    },
    {
      title: '',
      width: '25%',
      key: 'operation',
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
              SP Detail
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
            {/* <NavLink to={'/loanComment/' + row.miner_id.toString()}>
              <button className='flex items-center whitespace-nowrap hover:text-[#0077FE]'>
                Comments
                <CommentIcon className='ml-1 inline-block' width={14} height={14} />
              </button>
            </NavLink> */}
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
            <h2 className='jr-market mb-[13px] text-[32px] font-semibold leading-[61px] sm:text-[56px]'>
              DePIN Market
            </h2>
            <div className='w-[360px] text-[#57596C] md:w-[500px] md:text-lg'>
              Invest directly in decentralized physical infrastructure network (DePIN) permissionlessly. Finance your
              preferred DePIN provider and start earning yield.
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
