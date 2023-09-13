import { ethers } from 'ethers'
import Tip, { message } from './Tip'

interface IProps {
  open?: boolean
  setOpen: (bol: boolean) => void
  updataList: () => void
}

const abiCoder = ethers.AbiCoder.defaultAbiCoder()

export const handleError = (error: any) => {
  if (error?.info?.error?.code === 4001) {
    message({
      title: 'TIP',
      type: 'warning',
      content: 'User denied transaction signature.'
    })
  } else if (error?.info?.error?.data?.message) {
    message({
      title: 'TIP',
      type: 'error',
      content: error.info.error.data.message
    })
  } else if (error?.info?.error?.message) {
    message({
      title: 'TIP',
      type: 'error',
      content: error.info.error.message
    })
  } else if (error?.message) {
    message({
      title: 'TIP',
      type: 'error',
      content: error.message
    })
  } else {
    message({
      title: 'TIP',
      type: 'error',
      content: 'Error'
    })
  }
}

// export default function ErrorHandler(props: IProps) {
//   const [data, setData] = useState<any>()

//   return (
//     <>
//       <Transition
//         className='z-40'
//         appear
//         show={!!data?.tx}
//         as='div'
//         leave='ease-in duration-200'
//         leaveFrom='opacity-100'
//         leaveTo='opacity-0'
//       >
//         <Tip className='z-40 max-w-[1102px]' title='TIP' content={data?.tx?.hash} />
//       </Transition>
//     </>
//   )
// }
