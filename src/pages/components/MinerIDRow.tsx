import { config } from '@/config'
import { NUMBER_TYPE_CLASS_NAME, NUMBER_TYPE_NAME, NUMBER_TYPE_COLOR } from '@/utils/enum'
import { getTypeOfRareNumbers } from '@/utils'

interface Props {
  value: string | number
}

const MinerIDRow = ({ value }: Props) => {
  const numberType = getTypeOfRareNumbers(value)
  const name = NUMBER_TYPE_NAME[numberType]
  const color = NUMBER_TYPE_COLOR[numberType]
  const idText = `${config.address_zero_prefix}0${value ?? '-'}`

  return (
    <div className='relative'>
      {numberType ? (
        <div className='flex flex-wrap items-center gap-x-1'>
          <span className={`${NUMBER_TYPE_CLASS_NAME[numberType]}`} style={{ color }}>
            {idText}
          </span>
          <span
            className='text-primary-700 -mb-[3px] inline-block h-[16px] whitespace-nowrap rounded-[0.27rem] border bg-white px-[0.5em] pb-[0.1em] pt-[0.1em] text-center text-[12px] font-medium leading-none'
            style={{
              color,
              borderColor: color
            }}
          >
            {name}
          </span>
        </div>
      ) : (
        idText
      )}
    </div>
  )
}

export default MinerIDRow
