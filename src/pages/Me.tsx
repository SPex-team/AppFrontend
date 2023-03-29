import Layout from '@/layout'
import { ReactComponent as CanelIcon } from '@/assets/images/canel.svg'
import { ReactComponent as OutIcon } from '@/assets/images/out.svg'
import { ReactComponent as PriceIcon } from '@/assets/images/price.svg'
import Pagination from '@/components/Pagination'
import { useEffect, useMemo, useState } from 'react'
import AddDialog from '@/components/AddDialog'
import MeClass from '@/models/me-class'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'
import Modal from '@/components/Modal'
import ChangeOwnerDialog from '@/components/ChangeOwnerDialog'
import { Contract } from 'ethers'
import { abi, config } from '@/config'
import { postUpdataMiners } from '@/api/modules'

const Me = (props) => {
  const meClass = useMemo(() => new MeClass(), [])
  const [openDialog, setOpenDialog] = useState<any>(false)
  const [minerId, setMinerId] = useState<any>()

  const { meCount, mePage, meList, provider, metaMaskAccount } = useSelector((state: RootState) => ({
    meCount: state.root.meCount,
    mePage: state.root.mePage,
    meList: state.root.meList,
    provider: state.root.provider,
    metaMaskAccount: state.root.metaMaskAccount
  }))

  const onSetPrice = async (data) => {
    try {
      // TODO: add error message and loading
      const signer = await provider?.getSigner()
      const contract = new Contract(config.contractAddress, abi, signer)

      const tx = await contract.changePrice(minerId, data.price, { gasLimit: 10000000 })
      // this.$message.info(`Waiting transaction: ${tx.hash}`)
      console.log('tx: ', tx)
      ;(await tx)?.wait()
      console.log('meList: ', tx)

      let row = meList.find((item) => item.miner_id === minerId)
      row = { ...row }

      console.log('row', row, data)
      row.price = data.price

      await postUpdataMiners(row.miner_id)
      meClass.removeDataOfList(minerId)
      // TODO: 替换参数
    } catch (error) {
      console.log('error', error)
    }
  }

  const onCancal = async (data) => {
    data = { ...data }
    data.is_list = false
    data.price = 0

    const signer = await provider?.getSigner()
    const contract = new Contract(config.contractAddress, abi, signer)

    const tx = await contract.cancelList(minerId, { gasLimit: 10000000 })
    // this.$message.info(`Waiting transaction: ${tx.hash}`)
    console.log('tx: ', tx)
    ;(await tx)?.wait()

    await postUpdataMiners(data.miner_id)
    meClass.removeDataOfList(minerId)
  }

  useEffect(() => {
    meClass.init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Layout>
      <section className='container mx-auto pt-[190px] pb-[60px]'>
        <div className='flex justify-between'>
          <div className='mb-20'>
            <h2 className='mb-[13px] text-[56px] font-bold leading-[61px]'>Sold</h2>
            <p className='w-[462px] text-lg text-[#57596C]'>
              Allowing Storage Providers to trade their account belongings such as ID address, Beneficiary, etc.
            </p>
          </div>
          <button
            onClick={() => setOpenDialog('add')}
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
            <span className='inline-block w-[13vw] min-w-[90px]'>Order Status</span>
            <span className='inline-block w-[10vw] min-w-[75px]'>Price(Fil)</span>
            <span className='inline-block w-[10vw] min-w-[105px]'>List Time</span>
          </div>
          <div className='space-y-[18px]'>
            {meList.map((item) => (
              <div
                key={item.miner_id}
                className='box-border h-[74px] rounded-[10px] border border-[#eaeaef] bg-white px-12 text-lg leading-[74px] text-[#57596c] hover:border-0 hover:shadow-[0_0_10px_0_rgba(17,16,41,0.15)]'
              >
                <span className='inline-block w-[13vw] min-w-[100px]'>{item.miner_id ?? '-'}</span>
                <span className='inline-block w-[13vw] min-w-[90px]'>
                  <span className='inline-block h-[26px] w-[85px] rounded-full bg-[rgba(0,119,254,0.1)] text-center text-sm leading-[26px] text-[#0077fe]'>
                    {item.status ?? '-'}
                  </span>
                </span>
                <span className='inline-block w-[10vw] min-w-[75px]'>{item.power ?? '-'}</span>
                <span className='inline-block w-[10vw] min-w-[105px]'>{item.price ?? '-'}</span>
                <div className='inline-block text-black' onClick={() => setMinerId(item.miner_id)}>
                  <button className='hover:text-[#0077FE]' onClick={() => setOpenDialog('price')}>
                    Change Price
                    <PriceIcon className='ml-2 inline-block w-[14px]' />
                  </button>
                  <button className='ml-7 hover:text-[#0077FE]' onClick={() => setOpenDialog('owner')}>
                    Transfer Out
                    <OutIcon className='ml-2 inline-block w-[14px]' />
                  </button>
                  <button className='ml-7 hover:text-[#0077FE]' onClick={() => onCancal(item)}>
                    Canel
                    <CanelIcon className='ml-2 inline-block w-[14px]' />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination
            pageNum={Math.ceil(meCount / meClass.page_size)}
            currentPage={mePage}
            onChange={(page) => meClass.selectPage(page)}
          />
        </div>
      </section>
      {openDialog === 'add' && <AddDialog open={!!openDialog} setOpen={setOpenDialog} />}
      {openDialog === 'price' && (
        <Modal onOk={onSetPrice} title='Change Price'>
          <form className='w-full text-[#57596C]' id='form_change_price'>
            <div className=''>
              <label htmlFor='price' className='mb-[10px] block text-base'>
                Price:
              </label>

              <input
                type='text'
                name='price'
                className='h-[49px] w-full rounded-[10px] border border-[#EAEAEF] px-5'
                required
                autoComplete='off'
              />
            </div>
          </form>
        </Modal>
      )}
      {openDialog === 'owner' && <ChangeOwnerDialog open={true} setOpen={setOpenDialog} minerId={minerId} />}
    </Layout>
  )
}

export default Me
