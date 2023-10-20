import { Progress, ProgressProps } from 'antd'
import { useState } from 'react'
import './index.scss'

interface Props extends ProgressProps {}

function CustomProgress(props: Props) {
  const { percent, ...rest } = props

  const twoColors = { '0%': '#3BF4BB', '100%': '#0077FE' }

  return (
    <>
      <Progress percent={Number(percent?.toFixed(2))} strokeColor={twoColors} size={['100%', 20]} {...rest} />
    </>
  )
}

export default CustomProgress
