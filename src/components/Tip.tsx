interface IProps {
  className?: string
  type?: 'error' | 'warning' | 'success'
  title?: string
  messages?: string
  // open?: boolean
  // setOpen: (bol: boolean) => void
}

const colorConfig = {}

export default function Tip(props: IProps) {
  const { className = '', type = 'success', title = '', messages = '' } = props

  return (
    <div
      className={
        'bg fixed top-[8%] left-1/2 -translate-x-1/2 rounded-[10px] border-l-[6px] border-[#0077FE] bg-[#CCE4FF] px-[18px] py-5 ' +
        className
      }
    >
      <div className='mb-2'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='mr-2 inline-block h-6 w-6 text-[#0077FE]'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0'
          />
        </svg>
        <span className=' font-semibold'>{title}</span>
      </div>
      <p className=''>{messages}</p>
    </div>
  )
}
