export const joyrideSteps = [
  {
    target: '.jr-market',
    disableBeacon: true,
    content: (
      <div className='font-medium'>
        <h2 className='mb-6 text-lg font-semibold'>Hey there, welcome to the SPex Miner Account Marketplace!</h2>
        Here you can easily buy and sell miner accounts to suit your needs.
      </div>
    )
  },
  {
    target: '.jr-connect-wallet',
    disableBeacon: true,
    content: <h2 className='text-lg font-medium'>Click here to connect your crypto wallet.</h2>
  },
  {
    target: '.jr-add-miner',
    disableBeacon: true,
    content: (
      <h2 className='text-lg font-medium'>
        Use the "Add" button to transfer your miners in and list them on the market for sale.
      </h2>
    )
  },
  {
    target: '.jr-market-list',
    disableBeacon: true,
    content: <h2 className='text-lg font-medium'>Below is the marketplace listing miners currently for sale.</h2>
  }
]

export const sortOptions = [
  {
    key: 'default',
    value: 'Default'
  },
  {
    key: 'price',
    value: 'Lowest Price'
  },
  {
    key: '-price',
    value: 'Highest Price'
  },
  {
    key: 'list_time',
    value: 'Earliest Listed'
  },
  {
    key: 'balance_human',
    value: 'Lowest Balance'
  },
  {
    key: '-balance_human',
    value: 'Highest Balance'
  },
  {
    key: 'power_human',
    value: 'Lowest Power'
  },
  {
    key: '-power_human',
    value: 'Highest Power'
  }
]
