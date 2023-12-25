import { useState } from 'react'
import clsx from 'clsx'

interface Props {
  width?: number
  className?: string
  children?: string | React.ReactNode
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
}

function CustomButton(props: Props) {
  const { width, className, children, disabled, loading, onClick } = props

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <button
      type='button'
      className={clsx([
        'inline-flex h-[44px] w-[100%] items-center justify-center rounded-full text-white focus-visible:ring-0',
        { 'cursor-not-allowed': loading },
        { 'bg-gray-300': disabled },
        { 'bg-gradient-common': !disabled },
        className
      ])}
      style={{
        width: `${width}px`
      }}
      disabled={loading || disabled}
      onClick={handleClick}
    >
      {loading && (
        <svg
          className='-ml-1 mr-3 h-5 w-5 animate-spin text-white'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
        >
          <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          ></path>
        </svg>
      )}
      {children || 'Confirm'}
    </button>
  )
}

export default CustomButton
