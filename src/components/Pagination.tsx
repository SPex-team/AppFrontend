interface IProps {
  pageNum: number
  currentPage: number
  onChange: (page: number) => void
}

export default function Pagination(props: IProps) {
  const { pageNum, currentPage, onChange } = props

  const pageNumArr = Array.from({ length: pageNum }, (_, index) => index + 1)

  // TODO: 多页面缩略

  return pageNum ? (
    <div className='mx-auto flex select-none justify-center space-x-2 py-[18px]'>
      <div
        data-disable={pageNumArr[0] === currentPage}
        onClick={() => onChange(currentPage - 1)}
        className='box-border flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-[#EAEAEF] from-[#0077FE] to-[#3BF4BB] text-sm text-[#111029] data-[disable=true]:cursor-not-allowed data-[disable=true]:bg-gray-100 data-[disable=false]:hover:border-0 data-[disable=false]:hover:bg-[#0077FE] data-[disable=false]:hover:text-white'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='h-5 w-5'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M15.75 19.5L8.25 12l7.5-7.5' />
        </svg>
      </div>
      {pageNumArr.map((item) => (
        <div
          key={item}
          data-active={item === currentPage}
          onClick={() => onChange(item)}
          className='box-border h-8 w-8 cursor-pointer rounded-sm border border-[#EAEAEF] from-[#0077FE] to-[#3BF4BB] text-center text-sm leading-8 text-[#111029] hover:border-0 hover:bg-[#0077FE] hover:text-white data-[active=true]:border-0 data-[active=true]:bg-gradient-to-r data-[active=true]:text-white'
        >
          {item}
        </div>
      ))}
      <div
        data-disable={pageNumArr[pageNumArr.length - 1] === currentPage}
        onClick={() => onChange(currentPage + 1)}
        className='box-border flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-[#EAEAEF] from-[#0077FE] to-[#3BF4BB] text-sm text-[#111029] data-[disable=true]:cursor-not-allowed data-[disable=true]:bg-gray-100 data-[disable=false]:hover:border-0 data-[disable=false]:hover:bg-[#0077FE] data-[disable=false]:hover:text-white'
      >
        <svg
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
          strokeWidth={1.5}
          stroke='currentColor'
          className='h-5 w-5'
        >
          <path strokeLinecap='round' strokeLinejoin='round' d='M8.25 4.5l7.5 7.5-7.5 7.5' />
        </svg>
      </div>
    </div>
  ) : (
    <></>
  )
}
