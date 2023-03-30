import { Dialog, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { Fragment, useState } from 'react'

interface IProps {
  open?: boolean
  onClose: () => void
  maskClosable?: boolean
  title?: string
  children: JSX.Element
  onOk: (data?: IObject) => void | Promise<any>
  okText?: string
}

export default function Modal(props: IProps) {
  const { maskClosable = true, title = '', children, onClose, open, onOk, okText = 'Confirm' } = props
  const [loading, setLoading] = useState<any>(false)

  const _onOk = async () => {
    //   setLoading(true)
    const form_wrap = document.getElementById('form_wrap')
    if (!form_wrap) {
      // TODO: add error message
      return
    }

    const form = form_wrap.children[0] as HTMLFormElement | undefined

    if (form) {
      if (
        Object.prototype.toString.call(onOk) === '[object AsyncFunction]' ||
        Object.prototype.toString.call(onOk) === '[object Promise]'
      ) {
        setLoading(true)
      }

      const formData = new FormData(form)

      const jsondata = {}

      formData.forEach((value, key) => {
        if (!jsondata[key]) {
          jsondata[key] = formData.getAll(key).length > 1 ? formData.getAll(key) : formData.get(key)
        }
      })

      if (Object.prototype.toString.call(onOk) === '[object Promise]') {
        ;(onOk(jsondata) as Promise<any>).finally(() => {
          setLoading(false)
        })
      } else if (Object.prototype.toString.call(onOk) === '[object AsyncFunction]') {
        await onOk(jsondata)
        setLoading(false)
      } else {
        onOk(jsondata)
      }
    } else {
      onOk()
    }
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-30'
        onClose={() => {
          if (maskClosable) {
            onClose()
          }
        }}
      >
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
              <Dialog.Panel className='flex w-full max-w-[702px] transform flex-col justify-between overflow-hidden rounded-2xl bg-white p-[30px] text-left align-middle shadow-xl transition-all'>
                <div>
                  <Dialog.Title as='h3' className='mb-6 flex items-center justify-between text-2xl font-medium'>
                    {title}
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
                  <div id='form_wrap' className='mt-[30px] mb-[22px] flex justify-between'>
                    {children}
                  </div>
                </div>

                <div className='text-center'>
                  <button
                    type='button'
                    className={clsx([
                      'inline-flex h-[44px] w-[256px] items-center justify-center rounded-full bg-gradient-to-r from-[#0077FE] to-[#3BF4BB] text-white focus-visible:ring-0'
                      //   { 'cursor-not-allowed': loading }
                    ])}
                    onClick={_onOk}
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
                    {okText}
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
