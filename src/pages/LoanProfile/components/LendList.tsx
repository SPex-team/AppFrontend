import { ReactComponent as DetailIcon } from '@/assets/images/detail.svg'
import { ReactComponent as ExportIcon } from '@/assets/images/export.svg'
import BasicTable from '@/components/BasicTable'
import { config } from '@/config'
import { useMemo, useEffect, useState } from 'react'
import ProfileClass from '@/models/profile-class'
import MarketClass from '@/models/loan-market-class'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { isEmpty, numberWithCommas } from '@/utils/index'
import clsx from 'clsx'
import MinerIDRow from '@/pages/components/MinerIDRow'
import { useMetaMask } from '@/hooks/useMetaMask'
import ClaimDialog from './ClaimDialog'
import LoanDetailDialog from './LoanDetailDialog'
import { LoanOrderInfo } from '@/types'
import { PayCircleOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import BigNumber from 'bignumber.js'

const isDevEnv = process.env.NODE_ENV === 'development' || window.location.origin.includes('calibration')

const History = () => {
  const { currentAccount } = useMetaMask()
  const profileClass = useMemo(() => new ProfileClass({ currentAccount }), [currentAccount])
  const marketClass = useMemo(() => new MarketClass(), [])
  const { lendList, lendCount, lendPage, minerInfo, tableLoading } = useSelector((state: RootState) => state.loan)

  const [selectedLoan, setSelectedLoan] = useState<LoanOrderInfo>()
  const [isClaimDialogOpen, setIsClaimDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

  const columns: ColumnsType<LoanOrderInfo> = [
    {
      title: 'SP ID',
      key: 'miner_id',
      width: 160,
      render: (val) => <MinerIDRow value={val} showType={false} />
    },
    {
      title: 'Total Value',
      key: 'miner_total_balance_human',
      render: (val) => (!isEmpty(val) ? `${numberWithCommas(val)} FIL` : '-')
    },
    {
      title: 'Lend Amount',
      key: 'current_principal_human',
      render: (val) => (!isEmpty(val) ? `${numberWithCommas(val)} FIL` : '-')
    },
    {
      title: 'APY',
      key: 'annual_interest_rate',
      render: (val) => (
        <span className='whitespace-nowrap'>
          {!isEmpty(val) ? `${numberWithCommas(BigNumber(val).decimalPlaces(2))} %` : '-'}
        </span>
      )
    },
    {
      title: 'Interest Earned',
      key: 'current_interest_human',
      render: (val, row) => (val ? `${numberWithCommas(val)} FIL` : '-')
    },
    {
      title: 'Status',
      key: 'tatus',
      render: (val, row) => (
        <span
          className={clsx([
            'inline-block h-[26px] whitespace-nowrap rounded-full bg-[rgba(0,119,254,0.1)] px-2 text-center text-sm leading-[26px]'
          ])}
        >
          {row.current_principal_human <= 0 ? 'Complete' : 'Progressing'}
        </span>
      )
    },
    {
      key: 'operation',
      width: '36%',
      render: (val, row) => (
        <div className='justify-space flex flex-wrap gap-x-7'>
          <button
            className='flex items-center whitespace-nowrap break-words hover:text-[#0077FE]'
            onClick={() => {
              setSelectedLoan(row)
              marketClass.getLoanByMinerId(row.miner_id)
              setIsDetailDialogOpen(true)
            }}
          >
            Detail
            <DetailIcon className='ml-2 inline-block w-[14px]' />
          </button>
          <button
            className='flex items-center whitespace-nowrap break-words hover:text-[#0077FE]'
            onClick={() => {
              setSelectedLoan(row)
              marketClass.getLoanByMinerId(row.miner_id)
              setIsClaimDialogOpen(true)
            }}
          >
            Claim Repayment
            <PayCircleOutlined className='ml-1 align-middle' />
          </button>
          <button
            className='flex items-center whitespace-nowrap break-words hover:text-[#0077FE]'
            onClick={() => {
              const url = `${isDevEnv ? 'https://calibration.filfox.info/en' : config.filescanOrigin}/message/${
                row.transaction_hash
              }`
              window.open(url)
            }}
          >
            Transaction
            <ExportIcon className='ml-1 inline-block w-[18px]' />
          </button>
        </div>
      )
    }
  ]

  const page = {
    pageNum: Math.ceil(lendCount / profileClass.page_size),
    currentPage: lendPage,
    onChange: (page) => profileClass.selectPage(page)
  }

  useEffect(() => {
    profileClass.initLend()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileClass])

  return (
    <section className='container mx-auto'>
      <BasicTable columns={columns} data={lendList} page={page} loading={tableLoading} />
      <ClaimDialog
        open={isClaimDialogOpen}
        data={minerInfo && selectedLoan && { ...selectedLoan, ...minerInfo }}
        setOpen={setIsClaimDialogOpen}
        updateList={() => profileClass.updateLendList()}
      />
      <LoanDetailDialog
        open={isDetailDialogOpen}
        setOpen={setIsDetailDialogOpen}
        data={minerInfo && selectedLoan && { ...selectedLoan, ...minerInfo }}
        type='lend'
      />
    </section>
  )
}

export default History
