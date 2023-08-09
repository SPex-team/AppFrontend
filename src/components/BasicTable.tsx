import Pagination from '@/components/Pagination'
import SpinWrapper from './SpinWrapper'
interface IProps {
  columns?: any[]
  data?: any[]
  loading?: boolean
  page?: {
    pageNum: number
    currentPage: number
    onChange: (page: number) => void
  }
}

function BasicTable(props: IProps) {
  const { columns = [], data = [], loading, page } = props
  const { pageNum = 1, currentPage = 1, onChange = () => {} } = page || {}
  return (
    <div className='flex flex-col'>
      <div className='inline-block min-w-full py-2'>
        <div className='-mx-2 overflow-x-auto px-2'>
          <SpinWrapper loading={loading}>
            <table
              className={`${
                data.length > 0 && 'basic-table'
              } w-full border-separate border-spacing-x-0 border-spacing-y-[18px] whitespace-nowrap`}
            >
              <thead className='px-4'>
                <tr>
                  {columns.map((column, columnIndex) => (
                    <th
                      className={`text-l px-2 py-3 text-left font-medium first:pl-6 last:pr-6 sm:text-2xl first:sm:pl-12 last:sm:pr-12`}
                      key={`table-head-cell-${columnIndex}`}
                      style={{ width: column.width, minWidth: column.minWidth ?? 'none' }}
                      scope='col'
                    >
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.length === 0 && loading !== true && (
                  <tr>
                    <td className='pl-12'>No data available.</td>
                  </tr>
                )}
                {data.length > 0 &&
                  data.map((item, itemIndex) => (
                    <tr key={`table-body-${itemIndex}`} className='relative text-sm text-[#57596c] sm:text-lg'>
                      {columns.map((column, columnIndex) => {
                        const val = item[column.key]
                        return (
                          <td
                            key={`table-body-row-cell-${columnIndex} `}
                            className={`whitespace-pre-wrap break-all border-y bg-white px-2 py-[12px] first:rounded-l-[20px] first:border-l first:pl-6 last:rounded-r-[10px] last:border-r last:pr-12 last:pr-6 sm:py-[20px] first:sm:pl-12`}
                            style={{ width: column.width, minWidth: column.minWidth ?? 'none' }}
                          >
                            {column.render ? column.render(val, item) : val}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
              </tbody>
            </table>
          </SpinWrapper>
        </div>
      </div>
      {page && data.length > 0 && (
        <div>
          <Pagination pageNum={pageNum} currentPage={currentPage} onChange={onChange} />
        </div>
      )}
    </div>
  )
}

export default BasicTable
