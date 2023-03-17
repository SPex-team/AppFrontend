export default function Header() {
  return (
    <header className='fixed top-0 z-50 w-full bg-transparent backdrop-blur-lg [font-family:GeneralSansVariable]'>
      <div className='container mx-auto flex items-center justify-between py-6 px-2'>
        <a href='/'>
          <img width={104} height={38} src='/logo.svg' alt='SPex' />
        </a>
        <button className='hidden h-11 w-40 rounded-full bg-gradient-to-r from-[#0077FE] to-[#3BF4BB] text-white md:block'>
          Access App
        </button>
      </div>
    </header>
  )
}
