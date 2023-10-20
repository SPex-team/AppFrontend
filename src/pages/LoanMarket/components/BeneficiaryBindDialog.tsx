import { Dialog, Transition } from '@headlessui/react'
import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react'
import { ethers, parseEther, ZeroAddress } from 'ethers'
import { config } from '@/config'
import { postPushMessage, postLoanBuildMessage, transferLoanCheck } from '@/api/modules'
import { postLoanMiners, getMinerBalance } from '@/api/modules/loan'
import Tip, { message } from '../../../components/Tip'
import { useMetaMask } from '@/hooks/useMetaMask'
import { handleError } from '@/components/ErrorHandler'
import { WarningOutlined } from '@ant-design/icons'
import Button from '@/components/Button'
import { MinerBalance } from '@/types'

interface IProps {
  open: boolean
  setOpen: (bol: boolean) => void
  updateList?: () => void
  onLoanCreate?: (minerId: number) => void
}

const abiCoder = ethers.AbiCoder.defaultAbiCoder()

export default function BeneficiaryBindDialog(props: IProps) {
  const { open = false, setOpen, updateList, onLoanCreate } = props
  const { currentAccount, loanContract } = useMetaMask()

  const [stepNum, setStepNum] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>()
  const [miner, setMiner] = useState<MinerBalance>()

  const onClose = () => {
    setStepNum(0)
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

  const handleLoanCreate = () => {
    if (onLoanCreate) {
      onLoanCreate(data.miner_id)
    }
  }

  type StepType = {
    key: number | string
    name: string
    desc?: string | ReactNode
  }

  const steps: StepType[] = [
    {
      key: 1,
      name: 'Input Miner Address',
      desc: 'Input the address of the miner you want to collateralize later.'
    },
    {
      key: 2,
      name: 'Transfer Beneficiary',
      desc: (
        <>
          <p>Sign to transfer your beneficary address to the contract as the colleteral for later Loan creation.</p>
          <p>You have two options to confirm the transfer :</p>
          <ul className='list-inside list-disc'>
            <li>Copy the provided command, sign it in your terminal, and paste the signature here;</li>
            <li>
              Use a third-party tool like Venus or Lotus to make the transfer. Skip this step if you use this method.
            </li>
          </ul>
        </>
      )
    },
    {
      key: 3,
      name: 'Confirm',
      desc: (
        <>
          <p>There are 3 things you would do here :</p>
          <ul className='list-inside list-disc'>
            <li>
              Bind your f0 address to the f4 address. This allows you to conveniently take actions by signing with your
              wallet.
            </li>
          </ul>
        </>
      )
    },
    {
      key: 4,
      name: 'Completed',
      desc: ''
    }
  ]

  const step0 = () => {
    return (
      <div className='space-y-[20px] pt-[20px]'>
        <p>👋 Hey, welcome to SPex Loan Market!</p>
        <p>
          👂 Heard you're looking to free up your locked miner value through a loan. You've come to the right place! 🚀
        </p>
        <p>It's super easy and quick - just follow theses few simple steps:</p>
        <ul>
          <li>{`1) Bind your Beneficiary address to SPex.`}</li>
          <li>{`2) Use your beneficary as collateral to customize your loan details.`}</li>
          <li>{`3) List your loan order. Lenders fund agreed upon loans, and you receive the borrowed amount!`}</li>
        </ul>
        <p className='pt-[30px] font-semibold text-gray-500'>
          <WarningOutlined />
          PS: SPex will only charge 1% from the interest of the loan as the transaction fee.
        </p>
        <p className='text-gray-500'>
          Your asset is secured: Binding Beneficiary will only allow lenders to claim repayment from your avaliable
          balance via smart contract. There is no access to your locked assets.
        </p>
      </div>
    )
  }

  const step1 = () => {
    return (
      <form className='text-[#57596C]' id='form_minerAddress'>
        <div className=''>
          <label htmlFor='miner_id' className='mb-[10px] block text-base'>
            Miner Address:
          </label>

          <input
            type='text'
            id='miner_id'
            name='miner_id'
            className='h-[49px] w-full rounded-[10px] border border-[#EAEAEF] px-5'
            required
            autoComplete='off'
            placeholder={`${config.address_zero_prefix}0xxxxxx`}
          />
          {/* <span className='text-xs'>Commission fee 1% For Platform</span> */}

          <input type='text' value='' className='hidden' readOnly />
        </div>
      </form>
    )
  }

  const step2 = () => {
    return (
      <form className='text-[#57596C]' id='form_sign'>
        <span className='mb-4 mt-[10px] inline-block text-sm font-light'>
          {'Sign '}
          <span className='inline-block w-full break-words font-medium'>{data?.msg_cid_hex}</span>
          {' with owner address to propose transfer owner to SPex contract'}
        </span>
        <div className=''>
          <label htmlFor='sign' className='mb-[10px] block text-base'>
            Sign:
          </label>

          <div className='relative flex h-[49px] w-full flex-row-reverse overflow-clip rounded-lg'>
            <input
              type='text'
              name='sign'
              className='peer w-full rounded-r-[10px] px-5 transition-colors duration-300'
              required
              autoComplete='off'
            />
            <span className='flex items-center rounded-l-[10px] border border-r-0 border-[#EAEAEF] bg-slate-50 px-4 text-sm text-slate-400 transition-colors duration-300 peer-focus:border-primary peer-focus:bg-primary peer-focus:text-white'>
              0x
            </span>
          </div>
        </div>
        <span className='mb-4 mt-[20px] inline-block text-sm font-light'>
          {
            'You can also propose by other tools, e.g. Lotus,Venus, please do not input anything if you are already use other tools'
          }
          <span className='inline-block w-full break-words font-medium'>
            SPex contract address: {config.contractFilecoinAddress} (new owner)
          </span>
        </span>
        <input type='text' value='' className='hidden' readOnly />
      </form>
    )
  }

  const step3 = () => {
    return (
      <form className='text-[#57596C]' id='form_confirm'>
        <span className='mb-4 mt-[10px] inline-block w-full text-sm font-light'>
          {'Sign '}
          <span className='inline-block w-full break-words font-medium'>
            {confirmSignContent?.toString()?.slice(2)}
          </span>
        </span>
        <p className='pt-[10px]'>
          With beneficiary address to confirm transfer beneficiary to SPex contract and bind login address
        </p>
        <div className=''>
          <label htmlFor='sign' className='mb-[10px] block text-base'>
            Sign:
          </label>

          <div className='relative flex h-[49px] w-full flex-row-reverse overflow-clip rounded-lg'>
            <input
              type='text'
              name='sign'
              id='sign'
              className='peer w-full rounded-r-[10px] px-5 transition-colors duration-300'
              required
              autoComplete='off'
            />
            <span className='flex items-center rounded-l-[10px] border border-r-0 border-[#EAEAEF] bg-slate-50 px-4 text-sm text-slate-400 transition-colors duration-300 peer-focus:border-primary peer-focus:bg-primary peer-focus:text-white'>
              0x
            </span>
          </div>
        </div>
        {/* <span className='text-xs'>Commission fee 1% For Platform</span> */}
        <input type='text' value='' className='hidden' readOnly />
      </form>
    )
  }

  const step4 = () => {
    return (
      <div className='-mt-[80px] ml-[200px] w-full'>
        <p className='mb-[20px]'>🎉 Congrats! You've succeed bind your Beneficiary to the contract!</p>
        <p>
          Now you would be able to{' '}
          <a className='cursor-pointer text-[#0077FE] underline' onClick={handleLoanCreate}>
            Create A Loan Order
          </a>
        </p>
        <p className='my-[20px]'>OR</p>
        <p>
          You could do it in your{' '}
          <a className='cursor-pointer text-[#0077FE] underline' onClick={() => window.location.replace('/me')}>
            Profile
          </a>{' '}
          to set and list your Loan Order at anytime {':)'}
        </p>
      </div>
    )
  }

  const renderStep = (key: number) => {
    switch (key) {
      case 0:
        return step0()
      case 1:
        return step1()
      case 2:
        return step2()
      case 3:
        return step3()
      case 4:
        return step4()
      default:
        return <></>
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stepContent = useMemo(() => renderStep(stepNum), [stepNum])

  const btnEvent = (key: number) => {
    switch (key) {
      case 0:
        return {
          text: `OK, Let's get started`,
          onClick: () => {
            onNext()
          }
        }
      case 1:
        return {
          text: 'Next',
          onClick: async () => {
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
              if (config.address_zero_prefix === 'f') {
                reg = /^f0.{1,}/
              }
              if (!reg.test(miner_id)) {
                throw new Error(`Please output ${config.address_zero_prefix}0xxxxxx format`)
              }

              miner_id = parseInt(miner_id.slice(2))
              let checkRes = await transferLoanCheck({ miner_id })
              if (checkRes['in_spex'] === true) {
                throw new Error(`Miner already in SPex, Please go to 'Me' page to view`)
              }
              let res = await postLoanBuildMessage({ miner_id })
              setData({
                ...res,
                miner_id
              })

              const balance = await getMinerBalance(miner_id)
              console.log('balance ==> ', balance)

              setMiner(balance._data)
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
            try {
              setLoading(true)

              const form = document.getElementById('form_sign') as HTMLFormElement
              const formData = new FormData(form)

              const sign = formData.get('sign')?.toString()
              if (!sign) {
                onNext(form)
                setLoading(false)
                return
              }

              const post_data = {
                message: data.msg_hex as string,
                sign,
                cid: data.msg_cid_str as string,
                wait: true
              }

              let res = await postPushMessage(post_data)
              res = res._data

              setData({
                ...data,
                ...res
              })
              onNext(form)
            } catch (error) {
              handleError(error)
              setLoading(false)
            }
          }
        }
      case 3:
        return {
          text: 'Confirm',
          onClick: async () => {
            try {
              setLoading(true)

              const form = document.getElementById('form_confirm') as HTMLFormElement
              const formData = new FormData(form)

              let sign = formData.get('sign')
              if (!sign) {
                throw new Error('Please input Sign')
              }
              sign = '0x' + sign.slice(2)

              const params = [data.miner_id, sign, data.timestamp, 0, 0, ZeroAddress, true]
              const tx = await loanContract?.pledgeBeneficiaryToSpex(...params)

              message({
                title: 'TIP',
                type: 'success',
                content: tx.hash,
                closeTime: 10000
              })

              await tx.wait()

              await postLoanMiners({
                delegator_address: currentAccount,
                miner_id: data.miner_id,
                receive_address: ZeroAddress,
                disabled: true,
                max_debt_amount_raw: 0,
                max_debt_amount_human: 0,
                total_balance_human: miner?.total_balance_human || 0,
                available_balance_human: miner?.available_balance_human || 0,
                initial_pledge_human: miner?.pledge_balance_human || 0,
                locked_rewards_human: miner?.locked_balance_human || 0
              })

              onNext(form)
            } catch (error) {
              handleError(error)
              setLoading(false)
            }
          }
        }
      case 4:
        return {
          text: 'Done',
          onClick: () => {
            onClose()
            // updateList()
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
          {step === 4 && <span className='text-sm'>Completed</span>}
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
              <span className='box-border inline-block h-12 w-12 rounded-full border-[6px] border-[#EFF3FC] bg-[#0077FE] text-center text-3xl font-medium leading-[36px] text-white'>
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
      setStepNum(0)
    }
  }, [open])

  return (
    <>
      <Transition
        className='z-40'
        appear
        show={!!data?.tx}
        as='div'
        leave='ease-in duration-200'
        leaveFrom='opacity-100'
        leaveTo='opacity-0'
      >
        <Tip className='z-40 max-w-[1102px]' title='TIP' content={data?.tx?.hash} />
      </Transition>
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
                        {stepNum === 0 ? 'Intro' : 'Bind Beneficiary'}
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
                      {stepNum !== 0 && (
                        <>
                          <ul
                            data-te-stepper-init
                            className='m-0 flex w-[113%] list-none justify-between overflow-hidden p-0 transition-[height] duration-200 ease-in-out'
                          >
                            {steps.map((item) => {
                              return renderStepIcon(item.key)
                            })}
                          </ul>
                          {renderStepIntro()}
                        </>
                      )}

                      {stepContent}
                    </div>

                    <div className='text-center'>
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
