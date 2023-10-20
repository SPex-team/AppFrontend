import { ReactComponent as UserIcon } from '@/assets/images/user.svg'
import { ReactComponent as BackIcon } from '@/assets/images/back.svg'
import { ReactComponent as SendIcon } from '@/assets/images/send.svg'
import { ReactComponent as EmojiIcon } from '@/assets/images/emoji.svg'
import Pagination from '@/components/Pagination'
import { useEffect, useMemo, useState } from 'react'
import CommentClass from '@/models/comment-class'
import LoanCommentClass from '@/models/loan-comment-class'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import AddDialog, { handleError } from '@/components/AddDialog'
import { formatTime } from '@/plugins/dayjs'
import { abi, config } from '@/config'
import { postUpdataMiners, postComment, getMiner } from '@/api/modules'
import { getLoanMiner, postLoanComment } from '@/api/modules/loan'
import { setRootData } from '@/store/modules/root'
import { message } from '@/components/Tip'
import { NavLink, useLocation, useParams, useNavigate } from 'react-router-dom'
import { Buffer } from 'buffer'
import clsx from 'clsx'
import { useMetaMask } from '@/hooks/useMetaMask'

const Comment = (props) => {
  const { currentAccount } = useMetaMask()
  let params = useParams()
  const location = useLocation()
  // console.log('params: ', params)
  // console.log('location ==> ', location)
  const isLoan = location.pathname.toLocaleLowerCase().includes('loan')
  const minerId = Number(params.minerId)
  // let history = useHistory();
  const navigate = useNavigate()

  const dispatch = useDispatch()
  const commentClass = useMemo(
    () => (isLoan ? new LoanCommentClass(params.minerId) : new CommentClass(params.minerId)),
    [isLoan, params.minerId]
  )

  const data = useSelector((state: RootState) => ({
    commentCount: state.root.commentCount,
    commentPage: state.root.commentPage,
    commentList: state.root.commentList,
    commentMinerOwner: state.root.commentMinerOwner
  }))

  const [loading, setLoading] = useState(false)

  const onSend = async () => {
    setLoading(true)
    try {
      // const form = document.getElementById('comment') as HTMLFormElement
      // const formData = new FormData(form)
      // let content: any = formData.get('content')
      const contentElement = document.getElementById('content') as HTMLFormElement
      console.log('contentElement: ', contentElement)
      let content = contentElement.value.trim()

      if (!currentAccount) {
        // throw new Error('Please connect your wallet first')
        message({
          title: 'TIP',
          type: 'warning',
          content: 'Please connect you wallet first'
        })
        setLoading(false)
        return
      }
      if (!content) {
        message({
          title: 'TIP',
          type: 'warning',
          content: 'Please input the comment content'
        })
        setLoading(false)
        return
      }
      if (content.length > 100) {
        message({
          title: 'TIP',
          type: 'warning',
          content: 'Content length must bee less than 100'
        })
        setLoading(false)
        return
      }
      let sign = ''
      try {
        // For historical reasons, you must submit the message to sign in hex-encoded UTF-8.
        // This uses a Node.js-style buffer shim in the browser.
        const msg = `0x${Buffer.from('Sign comment: ' + content, 'utf8').toString('hex')}`
        sign = await window.ethereum.request({
          method: 'personal_sign',
          params: [msg, currentAccount, 'Example password']
        })
        console.log('sign: ', sign)
      } catch (err) {
        // @ts-ignore
        console.error(err)
        // @ts-ignore
        message({
          title: 'TIP',
          type: 'warning',
          // @ts-ignore
          content: err?.message || 'Unknown error'
        })
        setLoading(false)
        return
      }
      // postComment
      let postData = {
        user: currentAccount as string,
        content: content as string,
        miner: minerId
      }
      try {
        isLoan ? await postLoanComment(sign, postData) : await postComment(sign, postData)
        commentClass.selectPage(1)
        contentElement.value = ''
      } catch (error) {
        console.log('error: ', error)
        message({
          title: 'Error',
          type: 'error',
          // @ts-ignore
          content: error?.message || 'Unknown error'
        })
      }
    } catch {
      setLoading(false)
    }
    setLoading(false)
  }

  const initCommentMiner = () => {
    ;(isLoan ? getLoanMiner : getMiner)(minerId).then((resData) => {
      dispatch(setRootData({ commentMinerOwner: resData.owner }))
      console.log('resData: ', resData)
    })
  }

  useEffect(() => {
    commentClass.init()
    initCommentMiner()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <section className='container mx-auto pb-[60px] pt-[190px]'>
        {/*<hr className='h-[3px] border-0 bg-black'/>*/}
        <div className='flex justify-between'>
          <div>
            <img onClick={() => navigate(-1)} className='h-full' width={38} height={38} src='/back.svg' alt='back' />
          </div>
          <h2 className='mb-[13px] text-[36px] font-semibold'>Comments</h2>
          <div></div>
          {/*<button onClick={() => {*/}
          {/*    console.log("data: ", data)*/}
          {/*}}>Test*/}
          {/*</button>*/}
        </div>
        <hr className='h-[3px] border-0 bg-black' />
        <h3 className=' m-4'>
          Miner ID: {config.address_zero_prefix}0{minerId}
        </h3>
        <div>
          <div className='space-y-[18px]'>
            {data.commentList.map((item) => (
              <div key={item.id} className='flex h-[124px] border-b-2 px-12 text-lg leading-[74px] text-[#57596c]'>
                <span className='inline-block min-w-[60px] truncate px-2'>
                  <img className='h-full' width={58} height={58} src='/user.svg' alt='user' />
                </span>
                <span className='inline-block truncate px-2'>
                  <div className='h-[30px] text-[14px]'>
                    <span>{item.user}</span>
                    {item.user == data.commentMinerOwner ? (
                      <>
                        <span
                          className={clsx([
                            'ml-1 inline-block h-[26px] w-[85px] rounded-full bg-[rgba(0,119,254,0.1)] text-center text-sm leading-[26px] text-[#0077fe]'
                          ])}
                        >
                          Owner
                        </span>
                      </>
                    ) : (
                      <></>
                    )}
                    <span className='ml-8'>{item.create_time.slice(0, 16)}</span>
                  </div>
                  <div className='mt-3' style={{ height: '50px' }}>
                    <span>{item.content}</span>
                  </div>
                </span>
              </div>
            ))}
          </div>
          <div
            // style={{margin_top: '10px'}}
            // className={"mt-["+String((commentClass.page_size - data.commentList.length) * 30)+"px]"}>
            className={'mt-[20px]'}
          >
            <Pagination
              // style={"margin-top"}
              pageNum={Math.ceil(data.commentCount / commentClass.page_size)}
              currentPage={data.commentPage}
              onChange={(page) => commentClass.selectPage(page)}
            />
          </div>
          <div className='relative mt-3 flex h-[49px] w-full flex-row overflow-clip rounded-lg bg-[#F4F4F4] opacity-70'>
            <span className='flex items-center rounded-l-[10px] bg-slate-50 px-4 text-sm text-slate-400 transition-colors duration-300 peer-focus:border-primary peer-focus:bg-primary peer-focus:text-white'>
              <EmojiIcon></EmojiIcon>
            </span>
            {/*<form className='text-[#57596C]' id='comment'>*/}
            <input
              type='text'
              name='content'
              id='content'
              className='w-full bg-[#F4F4F4] opacity-70'
              required
              autoComplete='off'
              placeholder=' Write a comment here'
            />
            {/*</form>*/}
            <span
              onClick={onSend}
              className='flex items-center rounded-r-[10px] bg-slate-50 px-4 text-sm text-slate-400 transition-colors duration-300 '
            >
              <button disabled={loading}>
                <SendIcon></SendIcon>
              </button>
            </span>
          </div>
        </div>
      </section>
    </>
  )
}

export default Comment
