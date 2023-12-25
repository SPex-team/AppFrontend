import { Dialog, Transition } from '@headlessui/react'
import { Fragment, ReactNode, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { config } from '@/config'
import { postPushMessage, postLoanReleaseBuildMessage } from '@/api/modules'
import { delLoanMiners } from '@/api/modules/loan'
import Tip, { message } from '../../../components/Tip'
import { useMetaMask } from '@/hooks/useMetaMask'
import { handleError } from '@/components/ErrorHandler'
import Button from '@/components/Button'
import { LoanMarketListItem } from '@/types'
import { LeftOutlined } from '@ant-design/icons'

interface IProps {
  miner?: LoanMarketListItem
  open: boolean
  setOpen: (bol: boolean) => void
  updateList?: () => void
}

export default function BeneficiaryReleaseDialog(props: IProps) {
  const { open = false, setOpen, miner, updateList } = props
  const { currentAccount, loanContract } = useMetaMask()

  const [stepNum, setStepNum] = useState(1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>()

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

  type StepType = {
    key: number | string
    name: string
    desc?: string | ReactNode
  }

  const steps: StepType[] = [
    {
      key: 1,
      name: 'Transfer Beneficiary',
      desc: (
        <>
          <p>Sign to transfer back the beneficary address to your own address.</p>
          <p>You have two options to confirm the transfer proposal :</p>
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
      key: 2,
      name: 'Confirm',
      desc: (
        <>{`Are you sure to transfer back the beneficary address of Miner ${config.address_zero_prefix}0${data?.miner_id} ?`}</>
      )
    },
    {
      key: 3,
      name: 'Completed',
      desc: ''
    }
  ]

  const step1 = () => {
    return (
      <form className='text-[#57596C]' id='form_sign'>
        <span className='mb-4 mt-[10px] inline-block text-sm font-light'>
          Key:
          <span className='inline-block w-full break-words font-medium'>{data?.msg_cid_hex || 'loading...'}</span>
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
        </span>
        <input type='text' value='' className='hidden' readOnly />
      </form>
    )
  }

  const step2 = () => {
    return <></>
  }

  const step3 = () => {
    return (
      <div className='-mt-[80px] ml-[200px] w-full'>
        <p className='mb-[20px]'>You've succeed release your Beneficiary</p>
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
      default:
        return <></>
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stepContent = useMemo(() => renderStep(stepNum), [stepNum, data])

  const btnEvent = (key: number) => {
    switch (key) {
      case 1:
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
      case 2:
        return {
          text: 'Confirm',
          onClick: async () => {
            setLoading(true)
            try {
              const tx = await loanContract.releaseBeneficiary(data.miner_id)
              const res = await tx.wait()

              if (res) {
                await delLoanMiners({
                  miner_id: data.miner_id
                })
              }
              onNext()
            } catch (error) {
              handleError(error)
            } finally {
              setLoading(false)
            }
          }
        }
      case 3:
        return {
          text: 'Done',
          onClick: () => {
            onClose()
            if (updateList) {
              updateList()
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
  const btnData = useMemo(() => btnEvent(stepNum), [stepNum, data])

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
            </div>
            <div className='text-md pt-2 font-bold leading-none'>{target.name}</div>
          </div>
          <div className='w-[600px] text-sm font-normal text-[#57596C]'>{target?.desc}</div>
        </div>
      </div>
    )
  }

  const postMsg = async () => {
    if (miner?.miner_id) {
      let res = await postLoanReleaseBuildMessage({ miner_id: miner.miner_id })
      setData({
        ...res,
        miner_id: miner?.miner_id
      })
    }
  }

  useEffect(() => {
    if (!open) {
      setStepNum(1)
    }
    if (open) {
      postMsg()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSkip = () => {
    setStepNum(stepNum + 1)
  }

  const handleBack = () => {
    setStepNum(stepNum - 1)
  }

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
                        Redemption
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

                    <div className='mt-10 flex items-center justify-center gap-[60px] text-center'>
                      {stepNum === 1 && (
                        <div className='cursor-pointer' onClick={handleSkip}>
                          Skip
                        </div>
                      )}
                      {stepNum === 2 && <LeftOutlined onClick={handleBack} />}
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
