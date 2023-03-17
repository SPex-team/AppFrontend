import { ReactComponent as Github } from '@/assets/images/github.svg'
import { ReactComponent as Medium } from '@/assets/images/medium.svg'
import { ReactComponent as Twitter } from '@/assets/images/twitter.svg'

const Informations = [
  {
    icon: <Twitter />,
    link: 'https://twitter.com/FVM_Spex'
  },
  {
    icon: <Medium />,
    link: 'https://medium.com/@FVM_Spex'
  },
  {
    icon: <Github />,
    link: 'https://github.com/orgs/SPex-team/repositories'
  }
]

export default function Footer() {
  return (
    <footer className='bg-[#d0e6ff] [font-family:GeneralSansVariable]'>
      <div className='container mx-auto px-2'>
        <div className='flex justify-between pt-20 pb-24'>
          <img width={104} height={38} src='/logo.svg' alt='SPex' />
          <div className='space-x-6'>
            {Informations.map((item, index) => (
              <a key={index} href={item.link} className='inline-block h-[30px] w-[30px] hover:text-[#545368]'>
                {item.icon}
              </a>
            ))}
          </div>
        </div>
        <hr className=' h-[1px] border-0 bg-[#B4C5DF]' />
        <span className='inline-block py-5'>Copyright © 2023 SPex All rights reserved.</span>
      </div>
    </footer>
  )
}
