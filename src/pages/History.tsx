import Layout from '@/layout'
import { ReactComponent as DetailIcon } from '@/assets/images/detail.svg'
import Pagination from '@/components/Pagination'

const data: any = [
  {
    miner_id: 'aaaa',
    owner: '0x2ebd277c069e7ccacdde2cead2d9aab549561c2f',
    is_list: true,
    price: 2,
    list_time: 1677742302277
  },
  {
    miner_id: 'f124422',
    owner: 'ddd',
    is_list: true,
    price: 3,
    list_time: 1675307260654
  },
  {
    miner_id: 'f0807366',
    owner: '3233',
    is_list: true,
    price: 1,
    list_time: 1675243760733
  },
  {
    miner_id: 'f08071366',
    owner: '3233',
    is_list: true,
    price: 1,
    list_time: 1675243760733
  },
  {
    miner_id: 'f08027366',
    owner: '3233',
    is_list: true,
    price: 1,
    list_time: 1675243760733
  },
  {
    miner_id: 'f08307366',
    owner: '3233',
    is_list: true,
    price: 1,
    list_time: 1675243760733
  }
]

const History = (props) => {
  return (
    <Layout>
      <section className='container mx-auto pt-[190px] pb-[60px]'>
        <div className='flex justify-between'>
          <div className='mb-20'>
            <h2 className='mb-[13px] text-[56px] font-bold leading-[61px]'>History</h2>
            <p className='w-[462px] text-lg text-[#57596C]'>
              Allowing Storage Providers to trade their account belongings such as ID address, Beneficiary, etc.
            </p>
          </div>
        </div>
        <div>
          <div className='mb-[11px] px-12 text-2xl font-semibold'>
            <span className='inline-block w-[13vw] min-w-[100px]'>Account</span>
            <span className='inline-block w-[13vw] min-w-[90px]'>Balance</span>
            <span className='inline-block w-[10vw] min-w-[75px]'>Power</span>
            <span className='inline-block w-[10vw] min-w-[105px]'>Price(Fil)</span>
            <span className='inline-block w-[20vw] min-w-[140px]'>Sold Time</span>
          </div>
          <div className='space-y-[18px]'>
            {data.map((item) => (
              <div
                key={item.miner_id}
                className='box-border h-[74px] rounded-[10px] border border-[#eaeaef] bg-white px-12 text-lg leading-[74px] text-[#57596c] hover:border-0 hover:shadow-[0_0_10px_0_rgba(17,16,41,0.15)]'
              >
                <span className='inline-block w-[13vw] min-w-[100px]'>{item.miner_id ?? '-'}</span>
                <span className='inline-block w-[13vw] min-w-[90px]'>{item.balance ?? '-'}</span>
                <span className='inline-block w-[10vw] min-w-[75px]'>{item.power ?? '-'}</span>
                <span className='inline-block w-[10vw] min-w-[105px]'>{item.price ?? '-'}</span>
                <span className='inline-block w-[20vw] min-w-[140px]'>{item.list_time ?? '-'}</span>
                <div className='inline-block text-black'>
                  <button className='hover:text-[#0077FE]'>
                    Detail
                    <DetailIcon className='ml-2 inline-block w-[14px]' />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* <Pagination /> */}
        </div>
      </section>
    </Layout>
  )
}

export default History
