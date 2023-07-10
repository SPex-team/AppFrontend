import { ReactComponent as Github } from '@/assets/images/github.svg'
import { ReactComponent as Medium } from '@/assets/images/medium.svg'
import { ReactComponent as Twitter } from '@/assets/images/twitter.svg'
import { ReactComponent as Gitbook } from '@/assets/images/gitbook.svg'
import { ReactComponent as Discord } from '@/assets/images/discord.svg'

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
  },
  {
    icon: <Discord className='w-[33px]' />,
    link: 'https://discord.com/invite/2x8xbWUbbJ'
  },
  {
    icon: <Gitbook className='h-[34px]' />,
    link: 'https://docs.spex.website/introduction/what-is-spex'
  }
]

export default function Footer() {
  return (
    <footer className='bg-[#d0e6ff] [font-family:GeneralSansVariable]'>
      <div className='container mx-auto px-2'>
        <div className='flex justify-between pb-24 pt-20'>
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
