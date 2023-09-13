import { Dialog, Transition } from '@headlessui/react'
import { Fragment, ReactNode, useMemo, useState } from 'react'
import clsx from 'clsx'
import { ethers } from 'ethers'
import { config } from '@/config'
import { postBuildMessage, transferInCheck } from '@/api/modules'
import Tip, { message } from '@/components/Tip'
import { useMetaMask } from '@/hooks/useMetaMask'
import type { RadioChangeEvent } from 'antd'
import { Input, Radio } from 'antd'
import NumberInput from '@/components/NumberInput'
import { handleError } from './ErrorHandler'

interface IProps {
  open?: boolean
  setOpen: (bol: boolean) => void
  updateList: () => void
}

const abiCoder = ethers.AbiCoder.defaultAbiCoder()

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
  const { open = false, setOpen, updateList } = props
  const { currentAccount, contract } = useMetaMask()

  const [stepNum, setStepNum] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>()
  const [borrowInfo, setBorrowInfo] = useState<BorrowInfoType>(defaultBorrowInfo)

  const onClose = () => {
    setStepNum(1)
    setData({})
    setOpen(false)
  }

  const onNext = (form?: HTMLFormElement) => {
    if (form) {
      form.reset()
    }
    setLoading(false)
    setStepNum(stepNum + 1)
  }

  const confirmSignContent = useMemo(() => {
    if (data?.miner_id && data?.miner_info && currentAccount) {
      const timestamp = Math.floor(Date.now() / 1000)
      setData({
        ...data,
        timestamp
      })
      return abiCoder.encode(
        ['string', 'uint64', 'uint64', 'address', 'uint256', 'uint256'],
        [
          'validateOwnerSign',
          parseInt(data.miner_id),
          data.miner_info['Owner'].slice(2),
          currentAccount,
          config.chainId,
          timestamp
        ]
      )
    } else {
      return undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.miner_id, data?.miner_info, currentAccount])

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
    // to do
  }

  const step1 = () => {
    const BorrowAmountMap = [
      {
        title: 'Pledge amount',
        value: '20000 FIL'
      },
      {
        title: 'Locked rewards',
        value: '90000 FIL'
      },
      {
        title: 'Available balance',
        value: '100000 FIL'
      },
      {
        title: 'The Miner Total Current Value',
        value: '300000 FIL'
      }
    ]
    return (
      <>
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
                maxButton
                onMaxButtonClick={handleMaxBtnClick}
                onChange={(val: number) => setBorrowInfo({ ...borrowInfo, borrowAmount: val })}
                prefix='FIL'
              />
            ) : (
              <p className='h-[49px] leading-[49px]'>{borrowInfo.borrowColleteral}</p>
            )}
            <p className='pt-[5px] text-sm text-gray-500'>The colleteral rate cannot over 50%</p>
          </div>
          <div className='w-1/2'>
            {borrowInfo?.borrowFunction === 2 ? (
              <NumberInput
                value={borrowInfo.borrowColleteral}
                maxButton
                onMaxButtonClick={handleMaxBtnClick}
                onChange={(val: number) => setBorrowInfo({ ...borrowInfo, borrowColleteral: val })}
                prefix='%'
              />
            ) : (
              <p className='h-[49px] leading-[49px]'>{borrowInfo.borrowAmount}</p>
            )}
            <p className='pt-[5px] text-sm text-gray-500'>Colleteral % = Borrow amount/Miner Total Current Value</p>
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
                maxButton
                onMaxButtonClick={handleMaxBtnClick}
                onChange={(val: number) => setBorrowInfo({ ...borrowInfo, borrowInterestRate: val })}
                prefix='%'
              />
            ) : (
              <p className='h-[49px] leading-[49px]'>{borrowInfo.borrowInterestAmount}</p>
            )}
          </div>
          <div className='w-1/2'>
            {borrowInfo?.borrowInterestFunction === 2 ? (
              <NumberInput
                value={borrowInfo.borrowInterestAmount}
                maxButton
                onMaxButtonClick={handleMaxBtnClick}
                onChange={(val: number) => setBorrowInfo({ ...borrowInfo, borrowInterestAmount: val })}
                prefix='FIL'
              />
            ) : (
              <p className='h-[49px] leading-[49px]'>{borrowInfo.borrowInterestRate}</p>
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
        name: 'Miner ID',
        value: 'f0123123'
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
  const stepContent = useMemo(() => renderStep(stepNum), [stepNum, borrowInfo])

  const btnEvent = (key: number) => {
    switch (key) {
      case 1:
        return {
          text: 'Next',
          onClick: async () => {
            if (!borrowInfo.borrowAmount && !borrowInfo.borrowColleteral) return
            try {
              setLoading(true)

              const form = document.getElementById('form_minerAddress') as HTMLFormElement
              const formData = new FormData(form)

              let miner_id: any = formData.get('miner_id')
              miner_id = miner_id.trim()

              if (!miner_id) {
                throw new Error('Please input Miner Address')
              }
              var reg = /^t0.{1,}/
              if (config.address_zero_prefix == 'f') {
                reg = /^f0.{1,}/
              }

              if (!reg.test(miner_id)) {
                throw new Error(`Please output ${config.address_zero_prefix}0xxxxxx format`)
              }

              miner_id = parseInt(miner_id.slice(2))
              let checkRes = await transferInCheck({ miner_id })
              if (checkRes['in_spex'] === true) {
                throw new Error(`Miner alredy in SPex, Please go to 'Me' page to view`)
              }
              let res = await postBuildMessage({ miner_id })

              setData({
                ...res,
                miner_id
              })

              onNext(form)
            } catch (error: any) {
              handleError(error)
              setLoading(false)
            }
          }
        }
      case 2:
        return {
          text: 'Next',
          onClick: async () => {
            // try {
            //   setLoading(true)

            //   const form = document.getElementById('form_sign') as HTMLFormElement
            //   const formData = new FormData(form)

            //   const sign = formData.get('sign')?.toString()
            //   if (!sign) {
            //     onNext(form)
            //     setLoading(false)
            //     return
            //     // throw new Error('Please input Sign')
            //   }

            //   const post_data = {
            //     message: data.msg_hex as string,
            //     sign,
            //     cid: data.msg_cid_str as string,
            //     wait: true
            //   }

            //   let res = await postPushMessage(post_data)
            //   res = res._data

            //   setData({
            //     ...data,
            //     ...res
            //   })
            //   onNext(form)
            // } catch (error) {
            //   handleError(error)
            //   setLoading(false)
            // }
            onNext()
          }
        }
      case 3:
        return {
          text: 'Confirm',
          onClick: async () => {
            // try {
            //   setLoading(true)

            //   const form = document.getElementById('form_confirm') as HTMLFormElement

            //   const formData = new FormData(form)

            //   let sign = formData.get('sign')
            //   if (!sign) {
            //     throw new Error('Please input Sign')
            //   }
            //   const price = formData.get('price')?.toString()
            //   if (!price) {
            //     throw new Error('Please input Price')
            //   }
            //   const targetBuyer = formData.get('targetBuyer')
            //   sign = '0x' + sign.slice(2)

            //   console.log('ZeroAddress: ', ZeroAddress)
            //   console.log('parseEther(price): ', parseEther(price))
            //   console.log('sign: ', sign)
            //   console.log('data: ', data)
            //   const tx = await contract?.confirmTransferMinerIntoSPexAndList(
            //     data.miner_id,
            //     sign,
            //     data.timestamp,
            //     parseEther(price),
            //     targetBuyer || ZeroAddress
            //   )

            //   message({
            //     title: 'TIP',
            //     type: 'success',
            //     content: tx.hash,
            //     closeTime: 10000
            //   })

            //   const result = await tx.wait()
            //   console.log('result', result)

            //   await postMiner({
            //     owner: currentAccount,
            //     miner_id: data.miner_id,
            //     price: parseFloat(price),
            //     price_raw: parseFloat(price) * 1e18,
            //     is_list: true,
            //     list_time: data.timestamp
            //   })

            //   onNext(form)
            // } catch (error) {
            //   handleError(error)
            //   setLoading(false)
            // }
            console.log('borrowInfo', borrowInfo)

            onNext()
          }
        }
      case 4:
        return {
          text: 'Confirm & Publish',
          onClick: () => {
            onClose()
            updateList()
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
  const btnData = useMemo(() => btnEvent(stepNum), [stepNum])

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

                    <div className='text-center'>
                      <button
                        type='button'
                        className={clsx([
                          'bg-gradient-common mt-5 inline-flex h-[44px] w-[256px] items-center justify-center rounded-full text-white focus-visible:ring-0',
                          { 'cursor-not-allowed': loading }
                        ])}
                        onClick={btnData.onClick}
                        disabled={loading}
                      >
                        {loading && (
                          <svg
                            className='-ml-1 mr-3 h-5 w-5 animate-spin text-white'
                            xmlns='http://www.w3.org/2000/svg'
                            fill='none'
                            viewBox='0 0 24 24'
                          >
                            <circle
                              className='opacity-25'
                              cx='12'
                              cy='12'
                              r='10'
                              stroke='currentColor'
                              strokeWidth='4'
                            ></circle>
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                            ></path>
                          </svg>
                        )}
                        {btnData.text}
                      </button>
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
