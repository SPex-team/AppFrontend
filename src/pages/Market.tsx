import { ReactComponent as BuyIcon } from '@/assets/images/buy.svg'
import { ReactComponent as DetailIcon } from '@/assets/images/detail.svg'
import { ReactComponent as CommentIcon } from '@/assets/images/comment.svg'
import Pagination from '@/components/Pagination'
import { useEffect, useMemo, useState } from 'react'
import MarketClass from '@/models/market-class'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import AddDialog, { handleError } from '@/components/AddDialog'
import { formatTime } from '@/plugins/dayjs'
import { Contract, parseEther, parseUnits } from 'ethers'
import { abi, config } from '@/config'
import { postUpdataMiners, putMiner } from '@/api/modules'
import { setRootData } from '@/store/modules/root'
import { message } from '@/components/Tip'
import { NavLink, useLocation } from 'react-router-dom'
import Comment from '@/pages/Comment'

const Market = (props) => {
  const dispatch = useDispatch()
  const marketClass = useMemo(() => new MarketClass(), [])

  const [open, setOpen] = useState(false)
  const data = useSelector((state: RootState) => ({
    marketCount: state.root.marketCount,
    marketPage: state.root.marketPage,
    marketList: state.root.marketList,
    signer: state.root.signer,
    metaMaskAccount: state.root.metaMaskAccount
  }))
  const contract = useMemo(() => new Contract(config.contractAddress, abi, data.signer), [data.signer])

  const onBuy = async (miner_id: number, price_raw: string) => {
    if (!data.metaMaskAccount) {
      message({
        title: 'TIP',
        type: 'warning',
        content: 'Please connect you wallet first'
      })
      return
    }
    try {
      dispatch(setRootData({ loading: true }))

      const tx = await contract.buyMiner(miner_id, {
        value: price_raw
        // gasLimit: 100000
      })

      message({
        title: 'TIP',
        type: 'success',
        content: tx.hash,
        closeTime: 4000
      })

      const result = await tx.wait()
      console.log('result', result)
      // TODO: 全局 metaMaskAccount 判断
      // await postUpdataMiners(miner_id)

      await putMiner(miner_id, { miner_id, owner: data.metaMaskAccount, price: 0, price_raw: 0, is_list: false })

      marketClass.removeDataOfList(miner_id)
      dispatch(setRootData({ loading: false }))
    } catch (error) {
      handleError(error)
      dispatch(setRootData({ loading: false }))
    }
  }

  useEffect(() => {
    marketClass.init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <section className='container mx-auto pb-[60px] pt-[190px]'>
        <div className='flex justify-between'>
          <div className='mb-20'>
            <h2 className='mb-[13px] text-[56px] font-semibold leading-[61px]'>Miner Account Market </h2>
            <p className='w-[462px] text-lg text-[#57596C]'>
              Allowing Storage Providers to implement securely trustless account trading, optimize capital efficiency,
              select special ID numbers, etc.
            </p>
          </div>
          <button
            onClick={() => {
              if (data.metaMaskAccount) {
                setOpen(true)
              } else {
                message({
                  title: 'TIP',
                  type: 'warning',
                  content: 'Please connect you wallet first'
                })
              }
            }}
            className='bg-gradient-common ml-8 flex h-11 w-[119px] items-center justify-center rounded-full text-white'
          >
            Add
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={1.5}
              stroke='currentColor'
              className='ml-2 h-[20px] w-[20px]'
            >
              <path strokeLinecap='round' strokeLinejoin='round' d='M12 4.5v15m7.5-7.5h-15' />
            </svg>
          </button>
        </div>
        <div>
          <div className='mb-[11px] flex px-12 text-2xl font-medium'>
            <span className='inline-block w-[13%] min-w-[100px] px-2'>Miner ID</span>
            <span className='inline-block w-[13%] min-w-[90px] px-2'>Balance</span>
            <span className='inline-block w-[10%] min-w-[75px] px-2'>Power</span>
            <span className='inline-block w-[10%] min-w-[105px] px-2'>Price</span>
            <span className='inline-block w-[20%] min-w-[140px] px-2'>List Time</span>
          </div>
          <div className='space-y-[18px]'>
            {data.marketList.map((item) => (
              <div
                key={item.miner_id}
                className='box-border flex h-[74px] rounded-[10px] border border-[#eaeaef] bg-white px-12 text-lg leading-[74px] text-[#57596c] hover:border-0 hover:shadow-[0_0_10px_0_rgba(17,16,41,0.15)]'
              >
                <span className='inline-block w-[13%] min-w-[100px] truncate px-2'>
                  {config.address_zero_prefix}0{item.miner_id ?? '-'}
                </span>
                <span className='inline-block w-[13%] min-w-[90px] truncate px-2'>
                  {(item.balance_human ?? '0') + ' FIL'}
                </span>
                <span className='inline-block w-[10%] min-w-[75px] truncate px-2'>
                  {(item.power_human ?? '0') + ' TiB'}
                </span>
                <span className='inline-block w-[10%] min-w-[105px] truncate px-2'>{(item.price ?? '0') + ' FIL'}</span>
                <span className='inline-block w-[20%] min-w-[140px] truncate px-2'>
                  {item.list_time ? formatTime(item.list_time * 1000) : '-'}
                </span>
                <div className='inline-block text-black'>
                  <button
                    className='hover:text-[#0077FE]'
                    onClick={() => {
                      const url = `${config.filescanOrigin}/address/miner?address=${config.address_zero_prefix}0${item.miner_id}`
                      window.open(url)
                      // if (window.location.href.includes('hyperspace')) {
                      //   window.open(`https://hyperspace.filscan.io/address/miner?address=f0${item.miner_id}`)
                      // } else {
                      //   window.open(`https://filscan.io/address/miner?address=f0${item.miner_id}`)
                      // }
                    }}
                  >
                    Detail
                    <DetailIcon className='ml-2 inline-block w-[14px]' />
                  </button>
                  <button className='ml-7 hover:text-[#0077FE]' onClick={() => onBuy(item.miner_id, item.price_raw)}>
                    Buy
                    <BuyIcon className='ml-2 inline-block w-[14px]' />
                  </button>
                  <NavLink to={'/comment/' + item.miner_id.toString()}>
                    <button className='ml-7 hover:text-[#0077FE]'>
                      Comments
                      {/*<CommentIcon className='ml-2 inline-block w-[14px]' />*/}
                      {/*<BuyIcon className='ml-2 inline-block w-[14px]' />*/}
                      <img className='ml-2 inline-block' width={14} height={14} src='/comment.svg' alt='user' />
                    </button>
                  </NavLink>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            pageNum={Math.ceil(data.marketCount / marketClass.page_size)}
            currentPage={data.marketPage}
            onChange={(page) => marketClass.selectPage(page)}
          />
        </div>
      </section>
      <AddDialog open={open} setOpen={setOpen} updataList={() => marketClass.removeDataOfList(1)} />
    </>
  )
}

export default Market
