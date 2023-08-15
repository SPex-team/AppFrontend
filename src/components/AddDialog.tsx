import { Dialog, Transition } from '@headlessui/react'
import { Fragment, ReactNode, useMemo, useState } from 'react'
import clsx from 'clsx'
import { ethers, parseEther, ZeroAddress } from 'ethers'
import { config } from '@/config'
import { postBuildMessage, postMiner, postPushMessage, transferInCheck } from '@/api/modules'
import Tip, { message } from './Tip'
import { useMetaMask } from '@/hooks/useMetaMask'

interface IProps {
  open?: boolean
  setOpen: (bol: boolean) => void
  updataList: () => void
}

const abiCoder = ethers.AbiCoder.defaultAbiCoder()

export const handleError = (error: any) => {
  if (error?.info?.error?.code === 4001) {
    message({
      title: 'TIP',
      type: 'warning',
      content: 'User denied transaction signature.'
    })
  } else if (error?.info?.error?.data?.message) {
    message({
      title: 'TIP',
      type: 'error',
      content: error.info.error.data.message
    })
  } else if (error?.info?.error?.message) {
    message({
      title: 'TIP',
      type: 'error',
      content: error.info.error.message
    })
  } else if (error?.message) {
    message({
      title: 'TIP',
      type: 'error',
      content: error.message
    })
  } else {
    message({
      title: 'TIP',
      type: 'error',
      content: 'Error'
    })
  }
}

export default function AddDialog(props: IProps) {
  const { open = false, setOpen, updataList } = props
  const { currentAccount, contract } = useMetaMask()

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
      name: 'Input Miner Address',
      desc: 'Input the address of the miner you want to transfer.'
    },
    {
      key: 2,
      name: 'Transfer Miner',
      desc: (
        <>
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
              wallet;
            </li>
            <li>Set a price to list your miner on the market;</li>
            <li>Also, if you want to designate a buyer, please enter their address in the optional text input. </li>
          </ul>
        </>
      )
    },
    {
      key: 4,
      name: 'Completed',
      desc: 'Your miner has been successfully transferred in and listed on the market! '
    }
  ]

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
          <span className='text-xs'>Commission fee 1% For Platform</span>

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
          {' with owner address to confirm transfer owner to SPex contract and bind login address'}
        </span>
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
        <div className='mt-3'>
          <label htmlFor='price' className='mb-[10px] block text-base'>
            Price:
          </label>

          <div className='relative flex h-[49px] w-full flex-row overflow-clip rounded-lg'>
            <input
              type='text'
              name='price'
              id='price'
              className='peer w-full rounded-l-[10px] px-5 transition-colors duration-300'
              required
              autoComplete='off'
            />
            <span className='flex items-center rounded-r-[10px] border border-l-0 border-[#EAEAEF] bg-slate-50 px-4 text-sm text-slate-400 transition-colors duration-300 peer-focus:border-primary peer-focus:bg-primary peer-focus:text-white'>
              FIL
            </span>
          </div>
        </div>
        <span className='text-xs'>Commission fee 1% For Platform</span>

        <div className='mt-3'>
          <div className='mb-[10px]'>
            <label htmlFor='targetBuyer' className='block text-base'>
              Target Buyer Address (Optional):
            </label>
            <span className='text-[12px]'>For private pool</span>
          </div>

          <div className='relative flex h-[49px] w-full flex-row overflow-clip rounded-lg'>
            <input
              type='text'
              name='targetBuyer'
              id='targetBuyer'
              className='peer w-full rounded-[10px] px-5 transition-colors duration-300'
              required
              autoComplete='off'
            />
          </div>
        </div>
        <input type='text' value='' className='hidden' readOnly />
      </form>
    )
  }

  const step4 = () => {
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
        <span className='mt-2 inline-block font-medium capitalize'>succeed</span>
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
      default:
        return <></>
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stepContent = useMemo(() => renderStep(stepNum), [stepNum])

  const btnEvent = (key: number) => {
    switch (key) {
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
            try {
              setLoading(true)

              const form = document.getElementById('form_sign') as HTMLFormElement
              const formData = new FormData(form)

              const sign = formData.get('sign')?.toString()
              if (!sign) {
                onNext(form)
                setLoading(false)
                return
                // throw new Error('Please input Sign')
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
              const price = formData.get('price')?.toString()
              if (!price) {
                throw new Error('Please input Price')
              }
              const targetBuyer = formData.get('targetBuyer')
              sign = '0x' + sign.slice(2)

              console.log('ZeroAddress: ', ZeroAddress)
              console.log('parseEther(price): ', parseEther(price))
              console.log('sign: ', sign)
              console.log('data: ', data)
              const tx = await contract?.confirmTransferMinerIntoSPexAndList(
                data.miner_id,
                sign,
                data.timestamp,
                parseEther(price),
                targetBuyer ?? ZeroAddress
              )

              message({
                title: 'TIP',
                type: 'success',
                content: tx.hash,
                closeTime: 10000
              })

              const result = await tx.wait()
              console.log('result', result)

              await postMiner({
                owner: currentAccount,
                miner_id: data.miner_id,
                price: parseFloat(price),
                price_raw: parseFloat(price) * 1e18,
                is_list: true,
                list_time: data.timestamp
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
            updataList()
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
                        Add Miner
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
