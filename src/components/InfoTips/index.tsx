import { Popover } from 'antd'
import { ReactNode } from 'react'
import { InfoCircleOutlined } from '@ant-design/icons'
import './index.scss'

interface Props {
  type?: 'small'
  content?: string | ReactNode
}

function InfoTips({ type, content }: Props) {
  const isSmall = type === 'small'
  return (
    <Popover rootClassName='info-tips-component' content={content} title='' trigger='hover'>
      <InfoCircleOutlined
        style={{
          width: isSmall ? '14px' : '16px',
          height: isSmall ? '14px' : '16px',
          color: 'inherit'
        }}
      />
    </Popover>
  )
}

export default InfoTips
