import clsx from 'clsx'
import ReactDOM from 'react-dom'

interface IProps {
  className?: string
  type?: 'error' | 'warning' | 'success'
  title?: string
  content?: string
  open?: boolean
  // setOpen: (bol: boolean) => void
}

const colorConfig = {
  success: {
    primary: '#0077FE',
    bg: '#CCE4FF'
  },
  warning: {
    primary: '#d97706',
    bg: '#fcd34d'
  },
  error: {
    primary: '#dc2626',
    bg: '#fca5a5'
  }
}

export default function Tip(props: IProps) {
  const { className = '', type = 'success', title = '', open = false, content = '' } = props

  return open ? (
    <div
      className={clsx([
        'bg fixed top-[8%] left-1/2 -translate-x-1/2 rounded-[10px] border-l-[6px] px-[18px] py-5',
        className
      ])}
      style={{
        backgroundColor: colorConfig[type].bg,
        borderColor: colorConfig[type].primary
      }}
    >
      <div className='mb-2'>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className={clsx(['mr-2 inline-block h-6 w-6'])}
          style={{ backgroundColor: colorConfig[type].bg }}
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            d='M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0'
          />
        </svg>
        <span className=' font-semibold'>{title}</span>
      </div>
      <p className=''>{content}</p>
    </div>
  ) : (
    <></>
  )
}

interface IParams {
  className?: string
  type?: 'error' | 'warning' | 'success'
  title?: string
  content?: string
  // setOpen: (bol: boolean) => void
}

export function message(params: IParams) {
  const { className = '', type = 'success', title, content = '' } = params
  const tipRootDom = document.getElementById('tip') as HTMLElement

  setTimeout(() => {
    ReactDOM.unmountComponentAtNode(tipRootDom)
  }, 2000)

  ReactDOM.render(
    <div
      className={clsx([
        'bg fixed top-[8%] left-1/2 -translate-x-1/2 rounded-[10px] border-l-[6px] px-[18px] py-5 ',
        className
      ])}
      style={{
        backgroundColor: colorConfig[type].bg,
        borderColor: colorConfig[type].primary
      }}
    >
      {title && (
        <div className='mb-2'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className={clsx(['mr-2 inline-block h-6 w-6'])}
            style={{ backgroundColor: colorConfig[type].bg }}
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0'
            />
          </svg>
          <span className=' font-semibold'>{title}</span>
        </div>
      )}
      <p className=''>{content}</p>
    </div>,
    tipRootDom
  )
}
