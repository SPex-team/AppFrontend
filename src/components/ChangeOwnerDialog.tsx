import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useMemo, useState } from 'react'
import clsx from 'clsx'
import { abi, config } from '@/config'
import { deleteMiner, postPushMessage, postTransferOut, putMiner } from '@/api/modules'
import Tip, { message } from './Tip'
import { handleError } from './AddDialog'
import fa from '@glif/filecoin-address'
import { useMetaMask } from '@/hooks/useMetaMask'
import Button from '@/components/Button'

interface IProps {
  open?: boolean
  setOpen: (bol: boolean) => void
  minerId: number
  updataList: () => void
}

export default function ChangeOwnerDialog(props: IProps) {
  const { open = false, setOpen, minerId, updataList } = props
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

  const steps = [
    {
      key: 1,
      name: 'Transfer Miner Out'
    },
    {
      key: 2,
      name: 'Accept Miner'
    },
    {
      key: 3,
      name: 'Completed'
    }
  ]

  const step1 = () => {
    return (
      <form className='text-[#57596C]' id='form_change_price_address'>
        <div className=''>
          <label htmlFor='new_owner_address' className='mb-[10px] block text-base'>
            New Owner ID:
          </label>

          <input
            type='text'
            name='new_owner_address'
            className='h-[49px] w-full rounded-[10px] border border-[#EAEAEF] px-5'
            required
            placeholder={`${config.address_zero_prefix}0xxxxxx`}
            autoComplete='off'
          />
        </div>
        <input type='text' value='' className='hidden' readOnly />
      </form>
    )
  }

  const step2 = () => {
    return (
      <form className='text-[#57596C]' id='form_sign'>
        <div className=''>
          <span className='mb-4 mt-[10px] inline-block text-sm font-light'>
            {'Sign '}
            <span className='font-medium'>
              {data?.msg_cid_hex} with {data?.owner}
            </span>
            {' to accept change owner'}
          </span>
          <label htmlFor='sign' className='mb-[10px] block text-base'>
            Sign:
          </label>

          <input
            type='text'
            name='sign'
            id='sign'
            className='h-[49px] w-full rounded-[10px] border border-[#EAEAEF] px-5'
            required
            autoComplete='off'
          />
        </div>
        <span className='mb-4 mt-[20px] inline-block text-sm font-light'>
          {
            'You can also accept by other tools, e.g. Lotus,Venus, please do not input anything if you are already use other tools'
          }
          <span className='inline-block w-full break-words font-medium'>
            SPex contract address: {config.contractFilecoinAddress} (old owner)
          </span>
        </span>
        <input type='text' value='' className='hidden' readOnly />
      </form>
    )
  }

  const step3 = () => {
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
        <span className='mt-2 inline-block font-medium capitalize'>Succeeded</span>
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
  const stepContent = useMemo(() => renderStep(stepNum), [stepNum])

  const btnEvent = (key: number) => {
    switch (key) {
      case 1:
        return {
          text: 'Next',
          onClick: async () => {
            try {
              setLoading(true)
              const form = document.getElementById('form_change_price_address') as HTMLFormElement
              const formData = new FormData(form)

              let new_owner_address: any = formData.get('new_owner_address')
              if (!new_owner_address) {
                throw new Error('Please input Address')
              }

              // const reg = /^t0.{1,}/
              var reg = /^t0.{1,}/
              if (config.address_zero_prefix == 'f') {
                reg = /^f0.{1,}/
              }

              if (!reg.test(new_owner_address)) {
                // throw new Error('Please output t0xxxxxx format')
                throw new Error(`Please output ${config.address_zero_prefix}0xxxxxx format`)
              }

              const filAddress = fa.newFromString(new_owner_address)
              console.log('filAddress.bytes: ', filAddress.bytes)

              const delegator = await contract.getMinerDelegator(minerId)
              const transferOutDelegator = await contract.getTransferOutMinerDelegator(minerId)

              console.log('delegator: ', delegator)
              console.log('transferOutDelegator: ', transferOutDelegator)

              // @ts-ignore
              if (delegator.toLowerCase() === currentAccount.toLowerCase()) {
                const tx = await contract.transferOwnerOut(minerId, [filAddress.bytes])
                message({
                  title: 'TIP',
                  type: 'success',
                  content: tx.hash
                })
                console.log('tx: ', tx)

                const result = await tx.wait()
                console.log('result: ', result)
                // @ts-ignore
              } else if (transferOutDelegator.toLowerCase() === currentAccount.toLowerCase()) {
                const tx = await contract.transferOwnerOutAgain(minerId, [filAddress.bytes])
                message({
                  title: 'TIP',
                  type: 'success',
                  content: tx.hash
                })
                console.log('tx: ', tx)

                const result = await tx.wait()
                console.log('result: ', result)
              } else {
                message({
                  title: 'TIP',
                  type: 'warning',
                  content: 'You are not the delegator of the miner'
                })
                setLoading(false)
                return
              }

              const data = {
                miner_id: minerId,
                new_owner_address
              }

              let res = await postTransferOut(data)
              //   price_raw:parseEther(data.price), is_list: true})
              res = res._data

              setData({
                owner: new_owner_address,
                ...res
              })

              onNext(form)
            } catch (error) {
              // @ts-ignore
              // if (error?.info?.error?.code === 404) {
              //   onNext()
              //   return
              // }
              handleError(error)

              setLoading(false)
            }
          }
        }
      case 2:
        return {
          // push
          text: 'Next',
          onClick: async () => {
            try {
              setLoading(true)

              const form = document.getElementById('form_sign') as HTMLFormElement
              const formData = new FormData(form)
              const sign = formData.get('sign')?.toString()
              if (!sign) {
                onNext(form)
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

              // await deleteMiner(minerId)

              setData({
                ...data,
                ...res
              })

              onNext(form)
              message({
                title: 'TIP',
                type: 'success',
                content: 'succeed'
              })
            } catch (error) {
              handleError(error)
              setLoading(false)
            }
          }
        }
      case 3:
        return {
          text: 'Done',
          onClick: async () => {
            try {
              await deleteMiner(minerId)
            } catch (error) {}

            onClose()
            updataList()
          }
        }
      default:
        return {
          text: '',
          onClick: () => {}
        }
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const btnData = useMemo(() => btnEvent(stepNum), [stepNum])

  return (
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

        <Tip className='z-40 max-w-[702px]' open={!!data?.tx} title='TIP' content={data?.tx} />
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
              <Dialog.Panel className='flex min-h-[523px] w-full max-w-[702px] transform flex-col justify-between overflow-hidden rounded-2xl bg-white p-[30px] text-left align-middle shadow-xl transition-all'>
                <div>
                  <Dialog.Title as='h3' className='mb-6 flex items-center justify-between text-2xl font-medium'>
                    Change Owner
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      strokeWidth={2}
                      stroke='currentColor'
                      className='h-6 w-6 cursor-pointer'
                      onClick={() => setOpen(false)}
                    >
                      <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
                    </svg>
                  </Dialog.Title>
                  <hr />
                  <div className='mb-[22px] mt-[30px] flex'>
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

                <div className='mt-5 text-center'>
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
  )
}
