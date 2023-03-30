import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useMemo, useState } from 'react'
import clsx from 'clsx'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import { Contract } from 'ethers'
import { abi, config } from '@/config'
import { postPushMessage, postTransferOut } from '@/api/modules'
import Tip, { message } from './Tip'
import { handleError } from './AddDialog'
import fa from '@glif/filecoin-address'

interface IProps {
  open?: boolean
  setOpen: (bol: boolean) => void
  minerId: number
}

export default function ChangeOwnerDialog(props: IProps) {
  const { open = false, setOpen, minerId } = props
  const { signer, metaMaskAccount } = useSelector((state: RootState) => ({
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

  const steps = [
    {
      key: 1,
      name: 'Transfer Miner Out'
    },
    {
      key: 2,
      name: 'Accept Miner'
    }
  ]

  const step1 = () => {
    return (
      <form className='text-[#57596C]' id='form_change_price_address'>
        <div className=''>
          <label htmlFor='new_owner_address' className='mb-[10px] block text-base'>
            Address:
          </label>

          <input
            type='text'
            name='new_owner_address'
            className='h-[49px] w-full rounded-[10px] border border-[#EAEAEF] px-5'
            required
            placeholder='t0xxxxxx'
            autoComplete='off'
          />
        </div>
      </form>
    )
  }

  const step2 = () => {
    return (
      <form className='text-[#57596C]' id='form_sign'>
        <div className=''>
          <span className='mt-[10px] mb-4 inline-block text-sm font-light'>
            {'Sign '}
            <span className='font-medium'>
              {data?.msg_cid_hex} with {data?.owner}
            </span>
            {' with owner address to transfer owner to SPex contract'}
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
      </form>
    )
  }

  const renderStep = (key: number) => {
    switch (key) {
      case 1:
        return step1()
      case 2:
        return step2()
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

              const reg = /^t0.{1,}/

              if (!reg.test(new_owner_address)) {
                throw new Error('Please output t0xxxxxx format')
              }

              const filAddress = fa.newFromString(new_owner_address)
              console.log('filAddress.bytes: ', filAddress.bytes)

              const tx = await contract.transferOwnerOut(minerId, [filAddress.bytes], { gasLimit: 10000000 })
              message({
                title: 'TIP',
                type: 'success',
                content: tx.hash
              })
              console.log('tx: ', tx)

              const result = await tx.wait()
              console.log('result: ', result)

              const data = {
                miner_id: minerId,
                new_owner_address
              }

              let res = await postTransferOut(data)
              res = res._data

              setData({
                owner: new_owner_address,
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
          // push
          text: 'Next',
          onClick: async () => {
            try {
              // TODO: add error message
              setLoading(true)

              const form = document.getElementById('form_sign') as HTMLFormElement
              const formData = new FormData(form)
              const sign = formData.get('sign')?.toString()
              if (!sign) {
                throw new Error('Please input Sign')
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

              onClose()
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
                  <div className='mt-[30px] mb-[22px] flex'>
                    {steps.map((step) => (
                      <Fragment key={step.key}>
                        <div
                          data-active={step.key <= stepNum}
                          className='group flex rounded-[10px] border-[#0077FE] p-[17px] data-[active=true]:border'
                        >
                          <span className='mr-[10px] box-border inline-block h-10 w-10 rounded-full border-[6px] border-[#EEEEF0] bg-[#57596c] text-center text-xl font-semibold leading-[28px] text-white group-data-[active=true]:border-[#EFF3FC] group-data-[active=true]:bg-[#0077FE]'>
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
                      'inline-flex h-[44px] w-[256px] items-center justify-center rounded-full bg-gradient-to-r from-[#0077FE] to-[#3BF4BB] text-white focus-visible:ring-0',
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
  )
}
