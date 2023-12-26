import { Dialog, Transition } from '@headlessui/react'
import clsx from 'clsx'
import { Fragment, useState } from 'react'

interface IProps {
  open?: boolean
  onClose: () => void
  maskClosable?: boolean
  title?: string
  children: JSX.Element
  onOk: (data?: IObject) => void
  loading?: boolean
  okText?: string
}

export default function Modal(props: IProps) {
  const { maskClosable = true, title = '', loading, children, onClose, open, onOk, okText = 'Confirm' } = props

  const _onOk = async () => {
    //   setLoading(true)
    const form_wrap = document.getElementById('form_wrap')
    if (!form_wrap) {
      throw new Error('error')
    }

    const form = form_wrap.children[0] as HTMLFormElement | undefined

    if (form) {
      const formData = new FormData(form)

      const jsondata = {}

      formData.forEach((value, key) => {
        if (!jsondata[key]) {
          jsondata[key] = formData.getAll(key).length > 1 ? formData.getAll(key) : formData.get(key)
        }
      })

      onOk(jsondata)
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
                  <div id='form_wrap' className='mb-[22px] mt-[30px] flex justify-between'>
                    {children}
                  </div>
                </div>

                <div className='mt-5 text-center'>
                  <button
                    type='button'
                    className={clsx([
                      'bg-gradient-common inline-flex h-[44px] w-[256px] items-center justify-center rounded-full text-white focus-visible:ring-0'
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
