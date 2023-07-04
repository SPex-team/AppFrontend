import { ReactComponent as CanelIcon } from '@/assets/images/canel.svg'
import { ReactComponent as OutIcon } from '@/assets/images/out.svg'
import { ReactComponent as PriceIcon } from '@/assets/images/price.svg'
import Pagination from '@/components/Pagination'
import { useEffect, useMemo, useState } from 'react'
import AddDialog, { handleError } from '@/components/AddDialog'
import MeClass from '@/models/me-class'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/store'
import Modal from '@/components/Modal'
import ChangeOwnerDialog from '@/components/ChangeOwnerDialog'
import { Contract, parseEther, ZeroAddress } from 'ethers'
import { abi, config } from '@/config'
import { putMiner, patchMiner } from '@/api/modules'
import { setRootData } from '@/store/modules/root'
import { message } from '@/components/Tip'
import clsx from 'clsx'
import { formatTime } from '@/plugins/dayjs'

const Me = (props) => {
  const dispatch = useDispatch()
  const meClass = useMemo(() => new MeClass(), [])
  const [openDialog, setOpenDialog] = useState<any>(false)
  const [minerId, setMinerId] = useState<any>()
  const [loading, setLoading] = useState<any>()

  const { meCount, mePage, meList, signer, metaMaskAccount } = useSelector((state: RootState) => ({
    meCount: state.root.meCount,
    mePage: state.root.mePage,
    meList: state.root.meList,
    signer: state.root.signer,
    metaMaskAccount: state.root.metaMaskAccount
  }))
  const contract = useMemo(() => new Contract(config.contractAddress, abi, signer), [signer])

  const closeMoadl = () => {
    setOpenDialog('')
  }

  const onSetPrice = async (data) => {
    try {
      if (!data.price) {
        throw new Error('Please input Price')
      }

      console.log('parseEther(data.price, wei)', parseEther(data.price))
      const tx = await contract.changePrice(minerId, parseEther(data.price))

      console.log('tx: ', tx)

      message({
        title: 'TIP',
        type: 'success',
        content: tx.hash,
        closeTime: 4000
      })

      const result = await tx.wait()
      console.log('result', result)

      let row = meList.find((item) => item.miner_id === minerId)
      // row = { ...row }

      // console.log('row', row, data)
      // row.price = data.price

      // await postUpdataMiners(row.miner_id)
      await putMiner(row.miner_id, {
        miner_id: row.miner_id,
        owner: metaMaskAccount,
        price: data.price,
        price_raw: data.price * 1e18,
        is_list: true
      })
      meClass.removeDataOfList(minerId)

      message({
        title: 'TIP',
        type: 'success',
        content: 'succeed'
      })
      closeMoadl()
    } catch (error) {
      handleError(error)
    }
  }

  const onCancal = async (data) => {
    try {
      dispatch(setRootData({ loading: true }))
      data = { ...data }
      data.is_list = false
      data.price = 0
      const tx = await contract.cancelList(data.miner_id)
      message({
        title: 'TIP',
        type: 'success',
        content: tx.hash,
        closeTime: 4000
      })
      console.log('x')
      console.log('tx: ', tx)

      const result = await tx.wait()
      console.log('result', result)

      await patchMiner(minerId, { price: 0, price_raw: 0, is_list: false })

      // await postUpdataMiners(data.miner_id)

      dispatch(setRootData({ loading: false }))
      meClass.removeDataOfList(minerId)

      message({
        title: 'TIP',
        type: 'success',
        content: 'succeed'
      })
      closeMoadl()
    } catch (error) {
      handleError(error)
      dispatch(setRootData({ loading: false }))
    }
  }

  const onList = async (data) => {
    try {
      console.log('parseEther(price)', parseEther(data.price))
      console.log('minerId: ', minerId)
      console.log('data: ', data)

      const tx = await contract.listMiner(minerId, parseEther(data.price), ZeroAddress)

      message({
        title: 'TIP',
        type: 'success',
        content: tx.hash,
        closeTime: 10000
      })

      const result = await tx.wait()
      console.log('result', result)

      let row = meList.find((item) => item.miner_id === minerId)

      // await postUpdataMiners(row.miner_id)
      await putMiner(row.miner_id, {
        miner_id: row.miner_id,
        owner: metaMaskAccount,
        price: data.price,
        price_raw: data.price * 1e18,
        is_list: true
      })
      meClass.removeDataOfList(minerId)

      message({
        title: 'TIP',
        type: 'success',
        content: 'succeed'
      })
      closeMoadl()
    } catch (error) {
      console.log('error', error)

      handleError(error)
    }
  }

  useEffect(() => {
    if (metaMaskAccount) {
      meClass.init()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaMaskAccount])

  return (
    <>
      {metaMaskAccount ? (
        <section className='container mx-auto pb-[60px] pt-[190px]'>
          <div className='flex justify-between'>
            <div className='mb-20'>
              <h2 className='mb-[13px] text-[56px] font-semibold leading-[61px]'>Sold</h2>
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
            <div className='mb-[11px] flex px-12 text-2xl font-medium'>
              <span className='inline-block w-[13%] min-w-[100px]'>Miner ID</span>
              <span className='inline-block w-[16%] min-w-[90px]'>Order Status</span>
              <span className='inline-block w-[14%] min-w-[75px]'>Price</span>
              <span className='inline-block w-[14%] min-w-[105px]'>List Time</span>
            </div>
            <div className='space-y-[18px]'>
              {meList.map((item) => (
                <div
                  key={item.miner_id}
                  className='box-border flex h-[74px] rounded-[10px] border border-[#eaeaef] bg-white px-12 text-lg leading-[74px] text-[#57596c] hover:border-0 hover:shadow-[0_0_10px_0_rgba(17,16,41,0.15)]'
                >
                  <span className='inline-block w-[13%] min-w-[100px] truncate'>
                    {config.address_zero_prefix}0{item.miner_id ?? '-'}
                  </span>
                  <span className='inline-block w-[16%] min-w-[90px] truncate'>
                    <span
                      className={clsx([
                        'inline-block h-[26px] w-[85px] rounded-full bg-[rgba(0,119,254,0.1)] text-center text-sm leading-[26px]',
                        item.is_list ? 'text-[#0077fe]' : 'text-[#909399]'
                      ])}
                    >
                      {item.is_list ? 'Listing' : 'Unlisted'}
                    </span>
                  </span>
                  <span className='inline-block w-[14%] min-w-[75px] truncate'>{(item.price ?? '0') + ' FIL'}</span>
                  <span className='inline-block w-[14%] min-w-[105px] truncate'>
                    {item.list_time ? formatTime(item.list_time * 1000) : '-'}
                  </span>
                  <div className='inline-block text-black' onClick={() => setMinerId(item.miner_id)}>
                    <button
                      className={clsx(['ml-7', item.is_list ? 'hover:text-[#0077FE]' : 'text-gray-400'])}
                      onClick={() => {
                        if (!item.is_list) return
                        setOpenDialog('price')
                      }}
                    >
                      Change Price
                      <PriceIcon className='ml-2 inline-block w-[14px]' />
                    </button>
                    <button
                      className={clsx(['ml-7', item.is_list ? 'text-gray-400' : 'hover:text-[#0077FE]'])}
                      onClick={() => {
                        if (item.is_list) {
                          message({
                            title: 'TIP',
                            type: 'warning',
                            content: 'You must cancel list'
                          })
                        } else {
                          setOpenDialog('owner')
                        }
                      }}
                    >
                      Transfer Out
                      <OutIcon className='ml-2 inline-block w-[14px]' />
                    </button>
                    <button
                      className='ml-7 hover:text-[#0077FE]'
                      onClick={() => {
                        if (item.is_list) {
                          // console.log("item.miner_id: ", item.miner_id)
                          // setMinerId(item.miner_id)
                          onCancal(item)
                        } else {
                          setOpenDialog('list')
                        }
                      }}
                    >
                      {item.is_list ? (
                        <>
                          Cancel
                          <CanelIcon className='ml-2 inline-block w-[14px]' />
                        </>
                      ) : (
                        <>
                          List
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                            className='ml-2 inline-block w-[16px]'
                          >
                            <path
                              fillRule='evenodd'
                              d='M2 3.75A.75.75 0 012.75 3h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.166a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 4.167a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z'
                              clipRule='evenodd'
                            />
                          </svg>
                        </>
                      )}
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
      ) : (
        <div className='container mx-auto flex items-center justify-center [min-height:calc(100vh-279px)]'>
          <button className='hidden h-11 cursor-default rounded-full bg-gradient-to-r from-[#0077FE] to-[#3BF4BB] px-6 text-white md:block'>
            Please Connect Wallet
          </button>
        </div>
      )}
      <AddDialog
        open={openDialog === 'add'}
        setOpen={setOpenDialog}
        updataList={() => meClass.removeDataOfList(minerId)}
      />
      {(openDialog === 'price' || openDialog === 'list') && (
        <Modal
          maskClosable={false}
          open={openDialog === 'price' || openDialog === 'list'}
          onClose={closeMoadl}
          loading={loading}
          onOk={async (data) => {
            setLoading(true)
            if (openDialog === 'price') {
              await onSetPrice(data)
            } else {
              await onList(data)
            }
            setLoading(false)
          }}
          title={openDialog === 'price' ? 'Change Price' : `List t0${minerId}`}
        >
          <form className='w-full text-[#57596C]' id='form_change_price'>
            <div className=''>
              <label htmlFor='price' className='mb-[10px] block text-base'>
                Price:
              </label>

              <div className='relative flex h-[49px] w-full flex-row overflow-clip rounded-lg'>
                <input
                  type='text'
                  name='price'
                  className='peer w-full rounded-l-[10px] px-5 transition-colors duration-300'
                  required
                  autoComplete='off'
                />
                <span className='flex items-center rounded-r-[10px] border border-l-0 border-[#EAEAEF] bg-slate-50 px-4 text-sm text-slate-400 transition-colors duration-300 peer-focus:border-primary peer-focus:bg-primary peer-focus:text-white'>
                  FIL
                </span>
              </div>
            </div>
            <input type='text' value='' className='hidden' readOnly />
          </form>
        </Modal>
      )}
      {openDialog === 'owner' && (
        <ChangeOwnerDialog
          open={true}
          setOpen={setOpenDialog}
          minerId={minerId}
          updataList={() => meClass.removeDataOfList(minerId)}
        />
      )}
    </>
  )
}

export default Me
