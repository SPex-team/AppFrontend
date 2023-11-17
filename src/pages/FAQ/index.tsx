import { useEffect, useMemo } from 'react'
import MarketClass from '@/models/market-class'
import { FAQ_CONTENT } from './constants'

const FAQ = () => {
  const marketClass = useMemo(() => new MarketClass(), [])

  useEffect(() => {
    marketClass.init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className='common-container'>
      <div className='flex flex-col gap-x-20 md:flex-row'>
        <div className='max-w-md'>
          <h2 className='mb-5 text-[32px] font-semibold'>Frequently asked questions</h2>
          <p className='text-[#57596C]'>
            Can’t find the answer you’re looking for? Reach out to our{' '}
            <a
              className='font-semibold text-[#0077fe]'
              href='https://discord.com/invite/2x8xbWUbbJ'
              target='_blank'
              rel='noreferrer'
            >
              Discord
            </a>
            .
          </p>
        </div>
        <div className='flex-1'>
          <div className='grid max-w-xl divide-y divide-neutral-200'>
            {FAQ_CONTENT.map((item) => (
              <div className='py-5' key={item.title}>
                <details className='group'>
                  <summary className='flex cursor-pointer list-none items-center justify-between font-medium'>
                    <span className=''>{item.title}</span>
                    <span className='transition group-open:rotate-180'>
                      <svg
                        fill='none'
                        height='24'
                        shapeRendering='geometricPrecision'
                        stroke='currentColor'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='1.5'
                        viewBox='0 0 24 24'
                        width='24'
                      >
                        <path d='M6 9l6 6 6-6'></path>
                      </svg>
                    </span>
                  </summary>
                  <div className='mt-3 max-h-[0px] text-sm leading-[28px] text-neutral-600 duration-300 group-open:max-h-[1500px]'>
                    {item.answer}
                  </div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FAQ
