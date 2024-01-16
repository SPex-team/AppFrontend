import { Dialog, Transition } from '@headlessui/react'
import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react'
import { config } from '@/config'
import { patchLoanMiners } from '@/api/modules/loan'
import MarketClass from '@/models/loan-market-class'
import Tip, { message } from '@/components/Tip'
import { useMetaMask } from '@/hooks/useMetaMask'
import type { RadioChangeEvent } from 'antd'
import { Input, Radio } from 'antd'
import NumberInput from '@/components/NumberInput'
import Button from '@/components/Button'
import { handleError } from './ErrorHandler'
import { LoanMarketListItem } from '@/types'
import { getValueMultiplied, getContinuousProfile, numberWithCommas } from '@/utils'
import { useSelector } from 'react-redux'
import BigNumber from 'bignumber.js'
import { RootState } from '@/store'
import { LeftOutlined } from '@ant-design/icons'
import { formatEther, formatUnits } from 'ethers'

interface IProps {
  open?: boolean
  miner?: LoanMarketListItem
  setOpen: (bol: boolean) => void
  updateList: () => void
}

interface BorrowInfoType {
  borrowFunction: string | number
  borrowAmount: string | number | null
  borrowColleteral: string | number | null
  borrowInterestFunction: string | number
  borrowInterestAmount: string | number | null
  borrowInterestRate: string | number | null
  depositAddress: string
}

const defaultBorrowInfo: BorrowInfoType = {
  borrowFunction: 1,
  borrowAmount: null,
  borrowColleteral: null,
  borrowInterestFunction: 1,
  borrowInterestAmount: null,
  borrowInterestRate: null,
  depositAddress: ''
}

export default function LoanAddDialog(props: IProps) {
  const { open = false, miner, setOpen, updateList } = props
  const { currentAccount, loanContract } = useMetaMask()
  const marketClass = useMemo(() => new MarketClass(), [])
  const { minerBalance } = useSelector((state: RootState) => ({
    minerBalance: state.loan.minerBalance
  }))

  const [stepNum, setStepNum] = useState(1)
  const [loading, setLoading] = useState(false)
  const [borrowInfo, setBorrowInfo] = useState<BorrowInfoType>(defaultBorrowInfo)
  const [maxDebtRate, setMaxDebtRate] = useState(0)

  const maxBorrowAmount = useMemo(() => {
    return BigNumber(minerBalance?.available_balance_human || 0)
      .times(maxDebtRate)
      .decimalPlaces(0, BigNumber.ROUND_DOWN)
      .toNumber()
  }, [minerBalance?.available_balance_human, maxDebtRate])

  const onClose = () => {
    setStepNum(1)
    setOpen(false)
  }

  const onNext = (form?: HTMLFormElement) => {
    if (form) {
      form.reset()
    }
    setLoading(false)
    setStepNum(stepNum + 1)
  }

  const handleBack = () => {
    if (stepNum === 1) return
    setStepNum(stepNum - 1)
  }

  useEffect(() => {
    if (miner && miner?.miner_id) {
      marketClass.getMinerBalance(miner.miner_id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [miner?.miner_id])

  const getMaxDebtRate = async () => {
    const res = await loanContract?._maxDebtRate()
    const rate = formatUnits(res, 6) // 0.6
    setMaxDebtRate(Number(rate))
  }

  useEffect(() => {
    if (open) {
      getMaxDebtRate()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  type StepType = {
    key: number | string
    name: string
    desc?: string | ReactNode
  }

  const steps: StepType[] = [
    {
      key: 1,
      name: 'Set Borrow Amount',
      desc: 'Choose the amount you want to borrow based on the total value of your miner worth as the colleteral.'
    },
    {
      key: 2,
      name: 'Set Interest',
      desc: 'Set the interest rate you are willing to pay in returns of the borrowed amount. A reasonable rate will increase the chance of completing the deal.'
    },
    {
      key: 3,
      name: 'Set Deposit Address',
      desc: (
        <>
          <p>Set the address you want to deposit your borrowed funds in.</p>
          <p>
            Please make sure that the address is correct. SPex is not responsible for any incorrect address input
            causing funds lossing.
          </p>
        </>
      )
    },
    {
      key: 4,
      name: 'Confirm and List!',
      desc: (
        <>
          <p>
            One more step away! Just confirm all the information you set for your loan order and then you could list it
            to the market!
          </p>
        </>
      )
    },
    {
      key: 5,
      name: 'Completed',
      desc: 'You created a loan order successfully'
    }
  ]

  const onBorrowFuncChange = (e: RadioChangeEvent) => {
    setBorrowInfo({
      ...borrowInfo,
      borrowAmount: null,
      borrowColleteral: null,
      borrowFunction: e.target.value
    })
  }

  const handleMaxBtnClick = () => {
    setBorrowInfo({
      ...borrowInfo,
      borrowAmount: maxBorrowAmount,
      borrowColleteral: maxBorrowAmount
        ? BigNumber(minerBalance?.total_balance_human || 0)
            .dividedBy(maxBorrowAmount)
            .times(100)
            .decimalPlaces(0, BigNumber.ROUND_DOWN)
            .toNumber()
        : 0
    })
  }

  const step1 = () => {
    const BorrowAmountMap = [
      {
        title: 'Pledge amount',
        value: `${numberWithCommas(minerBalance?.pledge_balance_human) || 0} FIL`
      },
      {
        title: 'Locked rewards',
        value: `${numberWithCommas(minerBalance?.locked_balance_human) || 0} FIL`
      },
      {
        title: 'Available balance',
        value: `${numberWithCommas(minerBalance?.available_balance_human) || 0} FIL`
      },
      {
        title: 'The SP Total Current Value',
        value: `${numberWithCommas(minerBalance?.total_balance_human) || 0} FIL`
      }
    ]
    return (
      <>
        <div>{`SP Id: ${config.address_zero_prefix}0${miner?.miner_id}`}</div>
        <div className='flex w-3/4 flex-wrap'>
          {BorrowAmountMap.map((item) => (
            <div key={item.title} className='w-1/2 text-sm'>
              <span>{item.title}: </span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
        <Radio.Group
          className='mt-[20px] flex flex-row justify-between space-x-[30px]'
          onChange={onBorrowFuncChange}
          value={borrowInfo?.borrowFunction}
        >
          <Radio value={1} className='w-1/2'>
            By Amount
          </Radio>
          <Radio value={2} className='w-1/2'>
            By Colleteral (%)
          </Radio>
        </Radio.Group>
        <div className='flex items-center justify-between space-x-[30px] pt-[5px]'>
          <div className='w-1/2'>
            {borrowInfo?.borrowFunction === 1 ? (
              <NumberInput
                value={borrowInfo.borrowAmount}
                max={maxBorrowAmount}
                maxButton
                onMaxButtonClick={handleMaxBtnClick}
                onChange={(val: number) =>
                  setBorrowInfo({
                    ...borrowInfo,
                    borrowAmount: val,
                    borrowColleteral: val
                      ? BigNumber(minerBalance?.total_balance_human || 0)
                          .dividedBy(val)
                          .times(100)
                          .decimalPlaces(0, BigNumber.ROUND_DOWN)
                          .toNumber()
                      : ''
                  })
                }
                prefix='FIL'
              />
            ) : (
              <p className='h-[49px] leading-[49px]'>{borrowInfo.borrowAmount}</p>
            )}
            <div className='pt-[5px] text-sm text-gray-500'>{`The minimum lend amount for each lender: ${BigNumber(
              borrowInfo.borrowAmount || 0
            )
              .dividedBy(20)
              .toNumber()} FIL`}</div>
            <p className='text-xs text-gray-500'>* The maximum number of lenders is 20</p>
          </div>
          <div className='w-1/2'>
            {borrowInfo?.borrowFunction === 2 ? (
              <NumberInput
                value={borrowInfo.borrowColleteral}
                // maxButton
                min={166}
                // onMaxButtonClick={handleMaxBtnClick}
                onChange={(val: number) => {
                  setBorrowInfo({
                    ...borrowInfo,
                    borrowColleteral: val,
                    borrowAmount: val
                      ? BigNumber(minerBalance?.total_balance_human || 0)
                          .dividedBy(val)
                          .times(100)
                          .decimalPlaces(0, BigNumber.ROUND_DOWN)
                          .toNumber()
                      : ''
                  })
                }}
                prefix='%'
              />
            ) : (
              <p className='h-[49px] leading-[49px]'>{borrowInfo.borrowColleteral}</p>
            )}
            <div className='pt-[5px]'>
              <p className='text-xs text-gray-500'>* Colleteral % = SP Total Current Value / Borrow amount</p>
              <p className='text-xs text-gray-500'>* The colleteral rate cannot be less than 166%</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  const onBorrowInterestRadioChange = (e: RadioChangeEvent) => {
    setBorrowInfo({
      ...borrowInfo,
      borrowInterestAmount: null,
      borrowInterestRate: null,
      borrowInterestFunction: e.target.value
    })
  }

  const step2 = () => {
    const BorrowInterestMap = [
      {
        title: 'Amount you want to borrow',
        value: `${borrowInfo.borrowAmount} FIL`
      },
      {
        title: 'Colleteral',
        value: `${borrowInfo.borrowColleteral} %`
      }
    ]
    return (
      <>
        <div className='flex flex-col'>
          {BorrowInterestMap.map((item) => (
            <div key={item.title} className='text-sm'>
              <span>{item.title}: </span>
              <span>{item.value}</span>
            </div>
          ))}
        </div>
        <Radio.Group
          className='mt-[20px] flex flex-row justify-between space-x-[30px]'
          onChange={onBorrowInterestRadioChange}
          value={borrowInfo?.borrowInterestFunction}
        >
          <Radio value={1} className='w-1/2'>
            By Interest Rate (APY)
          </Radio>
          <Radio value={2} className='w-1/2'>
            By Amount
          </Radio>
        </Radio.Group>
        <div className='flex items-center justify-between space-x-[30px] pt-[5px]'>
          <div className='w-1/2'>
            {borrowInfo?.borrowInterestFunction === 1 ? (
              <NumberInput
                value={borrowInfo.borrowInterestRate}
                onChange={(val: number) =>
                  setBorrowInfo({
                    ...borrowInfo,
                    borrowInterestRate: val,
                    borrowInterestAmount: getContinuousProfile(borrowInfo.borrowAmount || 0, val)
                  })
                }
                prefix='%'
              />
            ) : (
              <p className='h-[49px] leading-[49px]'>{borrowInfo.borrowInterestRate} % </p>
            )}
          </div>
          <div className='w-1/2'>
            {borrowInfo?.borrowInterestFunction === 2 ? (
              <NumberInput
                value={borrowInfo.borrowInterestAmount}
                maxButton
                onMaxButtonClick={handleMaxBtnClick}
                onChange={(val: number) =>
                  setBorrowInfo({
                    ...borrowInfo,
                    borrowInterestAmount: val,
                    borrowInterestRate: BigNumber(
                      Math.log(
                        BigNumber(val)
                          .plus(borrowInfo.borrowAmount || 0)
                          .dividedBy(borrowInfo.borrowAmount || 0)
                          .toNumber()
                      ) / Math.log(Math.E)
                    )
                      .times(100)
                      .decimalPlaces(2, BigNumber.ROUND_DOWN)
                      .toNumber()
                  })
                }
                prefix='FIL'
              />
            ) : (
              <p className='h-[49px] leading-[49px]'>{borrowInfo.borrowInterestAmount} FIL</p>
            )}
          </div>
        </div>
      </>
    )
  }

  const handleDepositAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBorrowInfo({
      ...borrowInfo,
      depositAddress: e.target.value
    })
  }

  const step3 = () => {
    return (
      <div className='mt-[50px]'>
        <div className='mb-[10px]'>
          <label htmlFor='targetBuyer' className='block text-base'>
            Deposit Address
          </label>
        </div>
        <Input className='h-[49px]' value={borrowInfo?.depositAddress} onChange={handleDepositAddressChange} />
      </div>
    )
  }

  const step4 = () => {
    const data = [
      {
        name: 'SP ID',
        value: `${config.address_zero_prefix}0${miner?.miner_id}`
      },
      {
        name: 'Borrow Amount / Collateral %',
        value: `${borrowInfo.borrowAmount} FIL / ${borrowInfo.borrowColleteral}%`
      },
      {
        name: 'Interest APY / Interest Amount Per Year',
        value: `${borrowInfo.borrowInterestRate}% / ${borrowInfo.borrowInterestAmount} FIL`
      },
      {
        name: 'Deposit Address',
        value: borrowInfo.depositAddress
      }
    ]
    return (
      <div className='px-[50px]'>
        {data.map((item) => (
          <div className='flex justify-between' key={item.name}>
            <span className='font-semibold'>{item.name}</span>
            <span className='font-semibold text-[#0077FE]'>{item.value}</span>
          </div>
        ))}
        <div className='mt-[40px] text-sm font-semibold opacity-40'>
          <div className='flex w-[400px] justify-between'>
            <span>* The maximum number of lenders</span>
            <span>20</span>
          </div>
          <div className='flex w-[400px] justify-between'>
            <span>* The minimum lend amount for each lender</span>
            <span>
              {`${BigNumber(borrowInfo.borrowAmount || 0)
                .dividedBy(20)
                .toNumber()} FIL`}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const step5 = () => {
    return (
      <div className='flex w-full flex-col items-center pt-10'>
        <span className='flex h-20 w-20 items-center justify-center rounded-full bg-green-400'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            className='h-14 w-14 text-white'
          >
            <path
              fillRule='evenodd'
              d='M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z'
              clipRule='evenodd'
            />
          </svg>
        </span>
      </div>
    )
  }

  const renderStep = (key: number) => {
    switch (key) {
      case 1:
        return step1()
      case 2:
        return step2()
      case 3:
        return step3()
      case 4:
        return step4()
      case 5:
        return step5()
      default:
        return <></>
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stepContent = useMemo(() => renderStep(stepNum), [stepNum, borrowInfo, miner, minerBalance])

  const btnEvent = (key: number) => {
    switch (key) {
      case 1:
        return {
          text: 'Next',
          onClick: async () => {
            if (!borrowInfo.borrowAmount && !borrowInfo.borrowColleteral) return
            onNext()
          }
        }
      case 2:
        return {
          text: 'Next',
          onClick: async () => {
            if (!borrowInfo.borrowInterestAmount && !borrowInfo.borrowInterestRate) return
            onNext()
          }
        }
      case 3:
        return {
          text: 'Confirm',
          onClick: async () => {
            if (!borrowInfo.depositAddress) return
            onNext()
          }
        }
      case 4:
        return {
          text: 'Confirm & Publish',
          onClick: async () => {
            try {
              setLoading(true)
              const params = [
                miner?.miner_id,
                currentAccount,
                getValueMultiplied(borrowInfo.borrowAmount || 0),
                getValueMultiplied(
                  BigNumber(borrowInfo.borrowInterestRate || 0)
                    .dividedBy(100)
                    .toNumber(),
                  6
                ),
                borrowInfo.depositAddress,
                false,
                20, // maxLenderCount
                getValueMultiplied(
                  BigNumber(borrowInfo.borrowAmount || 0)
                    .dividedBy(20)
                    .toNumber()
                ) // minLendAmount
              ]

              const tx = await loanContract?.changeMinerBorrowParameters(...params)

              message({
                title: 'TIP',
                type: 'success',
                content: tx.hash,
                closeTime: 10000
              })

              await tx.wait()

              if (miner?.miner_id) {
                await patchLoanMiners({
                  delegator_address: currentAccount,
                  miner_id: miner.miner_id,
                  receive_address: borrowInfo.depositAddress,
                  disabled: false,
                  max_debt_amount_human: borrowInfo.borrowAmount,
                  annual_interest_rate_human: borrowInfo.borrowInterestRate,
                  collateral_rate: borrowInfo.borrowColleteral
                })
                onClose()
                updateList()
              }
            } catch (error) {
              handleError(error)
              setLoading(false)
            }
          }
        }
      default:
        return {
          text: 'error',
          onClick: onClose
        }
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const btnData = useMemo(() => btnEvent(stepNum), [stepNum, borrowInfo])

  const renderStepIcon = (step, size?) => {
    const status = () => {
      if (step < stepNum) return 'success'
      if (step === stepNum) return 'isCurrent'
      return 'default'
    }
    const bgStyles: any = {
      default: {
        backgroundColor: '#ebedef',
        color: '#40464f'
      },
      isCurrent: {
        backgroundColor: '#0077FE',
        color: '#fff'
      },
      success: {
        backgroundColor: '#4ADE80',
        color: '#fff'
      }
    }
    return (
      <li
        data-te-stepper-step-ref
        data-te-stepper-step-active
        className='w-[4.5rem] flex-auto [&>div]:last:after:hidden'
        key={step}
      >
        <div
          data-te-stepper-head-ref
          className="flex items-center pl-2 leading-[1.3rem] no-underline after:ml-2 after:h-px after:w-full after:flex-1 after:bg-[#e0e0e0] after:content-['']"
        >
          <span
            data-te-stepper-head-icon-ref
            className='my-6 mr-2 flex h-[1.3rem] w-[1.3rem] items-center justify-center rounded-full bg-[#ebedef] text-sm font-medium text-[#40464f]'
            style={bgStyles[status()]}
          >
            {step < stepNum ? '✓' : step}
          </span>
        </div>
      </li>
    )
  }

  const renderStepIntro = () => {
    const target: StepType = steps.find((item) => item.key === stepNum) || { key: 0, name: '' }
    return (
      <div className='p-x-10' key={target.key}>
        <div className='mb-6 flex justify-center gap-x-10'>
          <div className='flex flex-col items-center'>
            <div className='flex flex-col items-center'>
              <span className='box-border inline-block h-12 w-12 rounded-full border-[6px]  border-[#EFF3FC] bg-[#0077FE] text-center text-3xl font-medium leading-[36px] text-white'>
                {target.key}
              </span>
              {/* <span className='text-[14px]'>{`Step ${target?.key}`}</span> */}
            </div>
            <div className='text-md pt-2 font-bold leading-none'>{target.name}</div>
          </div>
          <div className='w-[600px] text-sm font-normal text-[#57596C]'>{target?.desc}</div>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if (!open) {
      setBorrowInfo(defaultBorrowInfo)
    }
  }, [open])

  return (
    <>
      {open && (
        <Transition appear show={open} as={Fragment}>
          <Dialog as='div' className='relative z-30' onClose={() => {}}>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
            >
              <div className='fixed inset-0 bg-black bg-opacity-25' />
            </Transition.Child>

            <div className='fixed inset-0 overflow-y-auto'>
              <div className='flex min-h-full items-center justify-center p-4 text-center'>
                <Transition.Child
                  as={Fragment}
                  enter='ease-out duration-300'
                  enterFrom='opacity-0 scale-95'
                  enterTo='opacity-100 scale-100'
                  leave='ease-in duration-200'
                  leaveFrom='opacity-100 scale-100'
                  leaveTo='opacity-0 scale-95'
                >
                  <Dialog.Panel className='flex min-h-[523px] w-full max-w-[900px] transform flex-col justify-between overflow-hidden rounded-2xl bg-white p-[30px] text-left align-middle shadow-xl transition-all'>
                    <div>
                      <Dialog.Title as='h3' className='flex items-center justify-between text-2xl font-medium'>
                        Create A Loan Order
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          fill='none'
                          viewBox='0 0 24 24'
                          strokeWidth={2}
                          stroke='currentColor'
                          className='h-6 w-6 cursor-pointer'
                          onClick={onClose}
                        >
                          <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                        </svg>
                      </Dialog.Title>
                      <ul
                        data-te-stepper-init
                        className='m-0 flex w-[113%] list-none justify-between overflow-hidden p-0 transition-[height] duration-200 ease-in-out'
                      >
                        {steps.map((item) => {
                          return renderStepIcon(item.key)
                        })}
                      </ul>
                      {renderStepIntro()}
                      {stepContent}
                    </div>

                    <div className='mt-5 text-center'>
                      {stepNum > 1 && <LeftOutlined className='mr-[60px]' onClick={handleBack} />}
                      <Button width={256} loading={loading} onClick={btnData.onClick}>
                        {btnData.text}
                      </Button>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </>
  )
}
