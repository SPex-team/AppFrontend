import { Space } from 'antd'
import { useState } from 'react'

import InfoTips from '../InfoTips'

interface Props {
  title: string
  desc: string
  tip?: string | React.ReactNode
  className?: string
  type?: 'green' | 'blue' | 'white'
}

const bgColor = {
  green: '#E4FEF3',
  blue: '#ACCEF1',
  white: '#fff'
}

const titleColor = {
  green: '#0077FE',
  blue: '#fff',
  white: '#0077FE'
}

function DetailColDesc(props: Props) {
  const { title, desc, tip, className, type = 'white' } = props

  return (
    <div
      className={`flex flex-col rounded-[10px] p-[12px] ${className}`}
      style={
        type === 'white'
          ? {
              border: '1px solid #ACCEF1'
            }
          : {
              backgroundColor: bgColor[type]
            }
      }
    >
      <Space
        className='font-medium'
        style={{
          color: titleColor[type]
        }}
      >
        {title}
        {tip && <InfoTips content={tip} />}
      </Space>
      <p className='font-medium text-[#1C1C1C]'>{desc}</p>
    </div>
  )
}

export default DetailColDesc
