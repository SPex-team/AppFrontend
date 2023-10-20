import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import BorrowList from './components/BorrowList'
import LendList from './components/LendList'
import { useMetaMask } from '@/hooks/useMetaMask'
import { Tabs } from 'antd'
import './index.scss'

import DigitalCoinURL from '@/assets/images/digital_coin.png'

const LoanProfile = (props) => {
  const { connectButton, currentAccount } = useMetaMask()

  const data = useSelector((state: RootState) => ({
    marketCount: state.root.marketCount,
    marketPage: state.root.marketPage,
    marketList: state.root.marketList,
    signer: state.root.signer,
    minerPriceCeiling: state.root.minerPriceCeiling,
    minerPriceFloor: state.root.minerPriceFloor
  }))

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

  // const onTabsChange = (key: string) => {
  //   console.log(key)
  // }

  return (
    <>
      {currentAccount ? (
        <section className='container mx-auto pb-[60px] pt-[190px]'>
          <div className='flex flex-col justify-between sm:flex-row'>
            <div className='mb-10 sm:mb-20'>
              <h2 className='mb-[13px] text-[56px] font-semibold leading-[61px]'>My Account</h2>
              <p className='w-[300px] text-lg text-[#57596C] sm:w-[480px]'>
                Check the details of your borrowing / lending
              </p>
            </div>
            <div className='mx-5 hidden pt-5 xl:block'>{renderInterestTotal()}</div>
          </div>
          <Tabs
            type='card'
            size='large'
            destroyInactiveTabPane
            items={['Borrow', 'Lend'].map((tab, i) => {
              return {
                label: tab,
                key: tab,
                children: tab === 'Borrow' ? <BorrowList /> : <LendList />
              }
            })}
          />
        </section>
      ) : (
        <div className='container mx-auto flex items-center justify-center [min-height:calc(100vh-279px)]'>
          {connectButton('Please Connect Wallet')}
        </div>
      )}
    </>
  )
}

export default LoanProfile
