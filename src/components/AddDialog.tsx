import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useMemo, useState } from 'react'
import clsx from 'clsx'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { Contract, ethers, parseEther, ZeroAddress } from 'ethers'
import { abi, config } from '@/config'
import {
  postBuildMessage,
  postMiner,
  postMiners,
  postPushMessage,
  postUpdataMiners,
  putMiners,
  transferInCheck
} from '@/api/modules'
import Tip, { message } from './Tip'

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
  const { metaMaskAccount, signer } = useSelector((state: RootState) => ({
    signer: state.root.signer,
    metaMaskAccount: state.root.metaMaskAccount
  }))
  const contract = useMemo(() => new Contract(config.contractAddress, abi, signer), [signer])

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
    if (data?.miner_id && data?.miner_info && metaMaskAccount) {
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
          metaMaskAccount,
          config.chainId,
          timestamp
        ]
      )
    } else {
      return undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.miner_id, data?.miner_info, metaMaskAccount])

  const steps = [
    {
      key: 1,
      name: 'Input Miner Address'
    },
    {
      key: 2,
      name: 'Transfer Miner'
    },
    {
      key: 3,
      name: 'Confirm'
    },
    // {
    //   key: 4,
    //   name: 'Set Price'
    // },
    {
      key: 4,
      name: 'Completed'
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
            name='miner_id'
            className='h-[49px] w-full rounded-[10px] border border-[#EAEAEF] px-5'
            required
            autoComplete='off'
            placeholder={`${config.address_zero_prefix}0xxxxxx`}
          />
          <span className='text-xs'>Commission fee 3% For Platform</span>

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
          <span className='inline-block w-full break-words font-medium'>{data.msg_cid_hex}</span>
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
            SPex contract address: {config.contractFilecoinAddress}
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
              className='peer w-full rounded-l-[10px] px-5 transition-colors duration-300'
              required
              autoComplete='off'
            />
            <span className='flex items-center rounded-r-[10px] border border-l-0 border-[#EAEAEF] bg-slate-50 px-4 text-sm text-slate-400 transition-colors duration-300 peer-focus:border-primary peer-focus:bg-primary peer-focus:text-white'>
              FIL
            </span>
          </div>
        </div>
        <span className='text-xs'>Commission fee 3% For Platform</span>
        <input type='text' value='' className='hidden' readOnly />
      </form>
    )
  }

  // const step4 = () => {
  //   return (
  //     <form className='text-[#57596C]' id='form_price'>
  //       <div className=''>
  //         <label htmlFor='price' className='mb-[10px] block text-base'>
  //           Price:
  //         </label>
  //
  //         <div className='relative flex h-[49px] w-full flex-row overflow-clip rounded-lg'>
  //           <input
  //             type='text'
  //             name='price'
  //             className='peer w-full rounded-l-[10px] px-5 transition-colors duration-300'
  //             required
  //             autoComplete='off'
  //           />
  //           <span className='flex items-center rounded-r-[10px] border border-l-0 border-[#EAEAEF] bg-slate-50 px-4 text-sm text-slate-400 transition-colors duration-300 peer-focus:border-primary peer-focus:bg-primary peer-focus:text-white'>
  //             FIL
  //           </span>
  //         </div>
  //       </div>
  //       <span className='text-xs'>Commision fee 3% For Platform</span>
  //
  //       <input type='text' value='' className='hidden' readOnly />
  //     </form>
  //   )
  // }

  const step4 = () => {
    return (
      <div className='flex w-full flex-col items-center pt-10'>
        <span className='flex h-14 w-14 items-center justify-center rounded-full bg-green-400'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 20 20'
            fill='currentColor'
            className='h-12 w-12 text-white'
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
      // case 5:
      //   return step5()
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
                ZeroAddress
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
                owner: metaMaskAccount,
                miner_id: data.miner_id,
                price: parseFloat(price),
                price_raw: parseFloat(price) * 1e18,
                is_list: true
              })

              onNext(form)
            } catch (error) {
              handleError(error)
              setLoading(false)
            }
          }
        }
      // case 4:
      //   return {
      //     text: 'List Order',
      //     onClick: async () => {
      //       try {
      //         setLoading(true)
      //         const form = document.getElementById('form_price') as HTMLFormElement
      //         const formData = new FormData(form)
      //
      //         const price = formData.get('price')?.toString()
      //         if (!price) {
      //           throw new Error('Please input Price')
      //         }
      //
      //         const tx = await contract?.listMiner(data.miner_id, parseEther(price))
      //         message({
      //           title: 'TIP',
      //           type: 'success',
      //           content: tx.hash,
      //           closeTime: 4000
      //         })
      //
      //         const result = await tx.wait()
      //         console.log('result', result)
      //
      //         const _data = {
      //           is_list: true,
      //           owner: metaMaskAccount as any,
      //           miner_id: data.miner_id
      //         }
      //
      //         setData({
      //           ...data,
      //           tx
      //         })
      //
      //         postUpdataMiners(data.miner_id)
      //         // await putMiners(data.miner_id, _data)
      //         // this.$emit("add_item", response.data)
      //
      //         onNext(form)
      //       } catch (error) {
      //         handleError(error)
      //
      //         setLoading(false)
      //       }
      //     }
      //   }
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

  const syncAndUpdateNewMiner = async () => {
    await postMiners()
    await postUpdataMiners(data.miner_id)
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
                  <Dialog.Panel className='flex min-h-[523px] w-full max-w-[1102px] transform flex-col justify-between overflow-hidden rounded-2xl bg-white p-[30px] text-left align-middle shadow-xl transition-all'>
                    <div>
                      <Dialog.Title as='h3' className='mb-6 flex items-center justify-between text-2xl font-medium'>
                        Add List
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
                      <hr />
                      <div className='mb-[22px] mt-[30px] flex justify-between'>
                        {steps.map((step) => (
                          <Fragment key={step.key}>
                            <div
                              data-active={step.key <= stepNum}
                              className='group flex rounded-[10px] border-[#0077FE] p-[17px] data-[active=true]:border'
                            >
                              <span className='mr-[10px] box-border inline-block h-10 w-10 rounded-full border-[6px] border-[#EEEEF0] bg-[#57596c] text-center text-xl font-medium leading-[28px] text-white group-data-[active=true]:border-[#EFF3FC] group-data-[active=true]:bg-[#0077FE]'>
                                {step.key}
                              </span>
                              <div>
                                <div className='text-lg font-bold leading-none'>{step.name}</div>
                                <div className='font-light capitalize'>{'step ' + step.key}</div>
                              </div>
                            </div>

                            <svg
                              key={step.key + 'a'}
                              xmlns='http://www.w3.org/2000/svg'
                              fill='none'
                              viewBox='0 0 24 24'
                              strokeWidth={1.5}
                              stroke='currentColor'
                              className='w-5 data-[hidden=true]:hidden'
                              data-hidden={step.key === steps.length}
                            >
                              <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
                            </svg>
                          </Fragment>
                        ))}
                      </div>
                      {stepContent}
                    </div>

                    <div className='text-center'>
                      <button
                        type='button'
                        className={clsx([
                          'mt-5 inline-flex h-[44px] w-[256px] items-center justify-center rounded-full bg-gradient-to-r from-[#0077FE] to-[#3BF4BB] text-white focus-visible:ring-0',
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
