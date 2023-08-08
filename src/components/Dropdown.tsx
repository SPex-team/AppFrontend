import { useState, useEffect, Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'

interface OptionItem {
  key: string
  value: number | string
}

interface IProps {
  defaultOptionKey?: number | string
  options?: OptionItem[]
  onChange?: (key: string) => void
}

function Dropdown(props: IProps) {
  const { defaultOptionKey, options = [], onChange } = props
  const [currentOption, setCurrentOption] = useState<OptionItem | undefined>()
  const active = currentOption && currentOption.key !== 'default'

  const onOptionItemClick = (option?: OptionItem) => {
    setCurrentOption(option)
  }

  useEffect(() => {
    if (onChange && currentOption?.key) {
      onChange(currentOption.key)
    }
  }, [currentOption, currentOption?.key, onChange])

  useEffect(() => {
    if (defaultOptionKey) {
      const target = options?.find((item) => item.key === defaultOptionKey)
      setCurrentOption(target)
    }
  }, [defaultOptionKey, options])

  return (
    <Menu as='div' className='relative inline-block text-left'>
      <div>
        <Menu.Button
          className={`group inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-medium hover:text-[#0077fe] ${
            active ? 'text-[#0077fe]' : 'text-gray-500'
          }`}
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth='1.5'
            stroke='currentColor'
            className='mr-1 h-6 w-6'
          >
            <path d='M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75' />
          </svg>
          {active ? currentOption?.value : 'Sort by'}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter='transition ease-out duration-100'
        enterFrom='transform opacity-0 scale-95'
        enterTo='transform opacity-100 scale-100'
        leave='transition ease-in duration-75'
        leaveFrom='transform opacity-100 scale-100'
        leaveTo='transform opacity-0 scale-95'
      >
        <Menu.Items className='absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'>
          <div className='px-1 py-1'>
            {(options || []).map((item) => (
              <Menu.Item key={item?.key}>
                {({ active }) => (
                  <button
                    className={`${
                      active || currentOption?.key === item?.key ? 'bg-gray-100 text-[#0077fe]' : 'text-gray-900'
                    } group my-1 flex w-full items-center rounded-md px-2 py-2 text-sm font-medium`}
                    onClick={() => onOptionItemClick(item)}
                  >
                    {item?.value}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

export default Dropdown
