import { InputNumber, InputNumberProps, Checkbox, Space } from 'antd'
import { useState } from 'react'

interface Props extends InputNumberProps {
  className?: string
  label?: string
  maxButton?: boolean
  repayAll?: boolean
  onRepayAllCheck?: () => void
  onChange?: (val: any) => void
  onMaxButtonClick?: () => void
}

function NumberInput(props: Props) {
  const {
    className,
    label,
    maxButton = false,
    repayAll = false,
    onChange,
    onRepayAllCheck,
    onMaxButtonClick,
    ...rest
  } = props

  const [repayAllCheck, setRepayAllCheck] = useState<boolean>(false)

  const handleChange = (val: any | number) => {
    val = val?.target?.type === 'checkbox' ? val.target.checked : val
    if (typeof val === 'boolean') {
      setRepayAllCheck(val)
    }
    if (onChange) {
      onChange(val)
    }
  }

  const handleMaxButtonClick = () => {
    if (repayAll && repayAllCheck) return
    if (onMaxButtonClick) {
      onMaxButtonClick()
    }
  }

  return (
    <div>
      <div>
        {label && (
          <label className='text-lg' style={{ display: 'inline-block', marginBottom: '3px' }}>
            {label}
          </label>
        )}
        <div className='relative'>
          <InputNumber
            className={`h-[49px] w-full ${className}`}
            controls={false}
            onChange={handleChange}
            disabled={repayAll && repayAllCheck}
            {...rest}
          />
          {maxButton && (
            <div
              className='absolute cursor-pointer rounded bg-gray-100 px-2 py-1 text-gray-500'
              style={{ top: '10px', right: '20px', zIndex: 10 }}
              onClick={handleMaxButtonClick}
            >
              Max
            </div>
          )}
        </div>
      </div>
      {repayAll && (
        <Checkbox className='mt-2' onChange={handleChange} checked={repayAllCheck}>
          Repay all
        </Checkbox>
      )}
    </div>
  )
}

export default NumberInput
