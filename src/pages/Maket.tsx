import Layout from '@/layout'
import { ReactComponent as BuyIcon } from '@/assets/images/buy.svg'
import { ReactComponent as DetailIcon } from '@/assets/images/detail.svg'
import Pagination from '@/components/Pagination'
import { useEffect, useMemo, useState } from 'react'
import MaketClass from '@/models/maket-class'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import AddDialog from '@/components/AddDialog'
import { formatTime } from '@/plugins/dayjs'
import { Contract, parseUnits } from 'ethers'
import { abi, config } from '@/config'
import { postUpdataMiners } from '@/api/modules'
import { setRootData } from '@/store/modules/root'

const Maket = (props) => {
  const dispatch = useDispatch()
  const maketClass = useMemo(() => new MaketClass(), [])

  const [open, setOpen] = useState(false)
  const data = useSelector((state: RootState) => ({
    maketCount: state.root.maketCount,
    maketPage: state.root.maketPage,
    maketList: state.root.maketList,
    provider: state.root.provider,
    metaMaskAccount: state.root.metaMaskAccount
  }))

  const onBuy = async (miner_id: number, price_raw: string) => {
    try {
      dispatch(setRootData({ loading: true }))
      const provider = data.provider
      const signer = await provider?.getSigner()
      const contract = new Contract(config.contractAddress, abi, signer)
      console.log('parseEther(price)', parseUnits(price_raw, 'wei'))

      const tx = await contract.buyMiner(miner_id, {
        gasLimit: 100000000,
        value: parseUnits(price_raw, 'wei')
      })

      ;(await tx)?.wait()

      if (data.metaMaskAccount) {
        postUpdataMiners({ miner_id }).then(() => {
          maketClass.removeDataOfList(miner_id)
          dispatch(setRootData({ loading: false }))
        })
      }
    } catch (error) {
      console.log('error', error)

      dispatch(setRootData({ loading: false }))
    }
  }

  useEffect(() => {
    maketClass.init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout>
      <section className='container mx-auto pt-[190px] pb-[60px]'>
        <div className='flex justify-between'>
          <div className='mb-20'>
            <h2 className='mb-[13px] text-[56px] font-bold leading-[61px]'>Native Exchange Market</h2>
            <p className='w-[462px] text-lg text-[#57596C]'>
              Allowing Storage Providers to trade their account belongings such as ID address, Beneficiary, etc.
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className='ml-8 flex h-11 w-[119px] items-center justify-center rounded-full bg-gradient-to-r from-[#0077FE] to-[#3BF4BB] text-white'
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
          <div className='mb-[11px] px-12 text-2xl font-semibold'>
            <span className='inline-block w-[13vw] min-w-[100px]'>Miner ID</span>
            <span className='inline-block w-[13vw] min-w-[90px]'>Balance</span>
            <span className='inline-block w-[10vw] min-w-[75px]'>Power</span>
            <span className='inline-block w-[10vw] min-w-[105px]'>Price(Fil)</span>
            <span className='inline-block w-[20vw] min-w-[140px]'>List Time</span>
          </div>
          <div className='space-y-[18px]'>
            {data.maketList.map((item) => (
              <div
                key={item.miner_id}
                className='box-border h-[74px] rounded-[10px] border border-[#eaeaef] bg-white px-12 text-lg leading-[74px] text-[#57596c] hover:border-0 hover:shadow-[0_0_10px_0_rgba(17,16,41,0.15)]'
              >
                <span className='inline-block w-[13%] min-w-[100px]'>{item.miner_id ?? '-'}</span>
                <span className='inline-block w-[13%] min-w-[90px]'>{item.balance ?? '-'}</span>
                <span className='inline-block w-[10%] min-w-[75px]'>{item.power ?? '-'}</span>
                <span className='inline-block w-[10%] min-w-[105px]'>{item.price ?? '-'}</span>
                <span className='inline-block w-[20%] min-w-[140px]'>
                  {item.list_time ? formatTime(item.list_time) : '-'}
                </span>
                <div className='inline-block text-black'>
                  <button
                    className='hover:text-[#0077FE]'
                    onClick={() => window.open('https://filscan.io/tipset/pool-detail?address=f01860588')}
                  >
                    Detail
                    <DetailIcon className='ml-2 inline-block w-[14px]' />
                  </button>
                  <button className='ml-7 hover:text-[#0077FE]' onClick={() => onBuy(item.miner_id, item.price_raw)}>
                    Buy
                    <BuyIcon className='ml-2 inline-block w-[14px]' />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            pageNum={Math.ceil(data.maketCount / maketClass.page_size)}
            currentPage={data.maketPage}
            onChange={(page) => maketClass.selectPage(page)}
          />
        </div>
      </section>
      {open && <AddDialog open={open} setOpen={setOpen} />}
    </Layout>
  )
}

export default Maket
