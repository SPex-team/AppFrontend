export const dev_config = {
  contractAddress: '0xb781cEFe4eA389f8927866E71311287770BE8027',
  address_zero_prefix: 't',
  net: 'HyperSpace',
  filescanOrigin: 'https://hyperspace.filscan.io'
}

export const hyperspace_config = {
  contractAddress: '0xb781cEFe4eA389f8927866E71311287770BE8027',
  address_zero_prefix: 't',
  net: 'HyperSpace',
  filescanOrigin: 'https://hyperspace.filscan.io'
}

export const mainnet_config = {
  contractAddress: '0xD20E95A0Cfa1F3263e46a8d79f3e4B995Bf7c709',
  address_zero_prefix: 'f',
  net: 'MainNet',
  filescanOrigin: 'https://filscan.io'
}

// export const address_zero_prefix = 't'

// export const config = Object.assign({}, process.env.NODE_ENV === 'production' ? prod_config : dev_config)
export const config = dev_config

export const abi = [
  {
    inputs: [
      {
        internalType: 'address',
        name: 'manager',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'feeRate',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [
      {
        internalType: 'int256',
        name: 'errorCode',
        type: 'int256'
      }
    ],
    name: 'ActorError',
    type: 'error'
  },
  {
    inputs: [],
    name: 'ActorNotFound',
    type: 'error'
  },
  {
    inputs: [
      {
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      }
    ],
    name: 'buyMiner',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      }
    ],
    name: 'cancelList',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'newFeeRate',
        type: 'uint256'
      }
    ],
    name: 'changeFeeRate',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'manager',
        type: 'address'
      }
    ],
    name: 'changeManager',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        internalType: 'uint256',
        name: 'newPrice',
        type: 'uint256'
      }
    ],
    name: 'changePrice',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        internalType: 'bytes',
        name: 'sign',
        type: 'bytes'
      },
      {
        internalType: 'uint256',
        name: 'timestamp',
        type: 'uint256'
      }
    ],
    name: 'confirmTransferMinerIntoSPex',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [],
    name: 'FailToCallActor',
    type: 'error'
  },
  {
    inputs: [],
    name: 'FailToCallActor',
    type: 'error'
  },
  {
    inputs: [
      {
        internalType: 'CommonTypes.FilActorId',
        name: 'actorId',
        type: 'uint64'
      }
    ],
    name: 'InvalidActorID',
    type: 'error'
  },
  {
    inputs: [
      {
        internalType: 'uint64',
        name: '',
        type: 'uint64'
      }
    ],
    name: 'InvalidCodec',
    type: 'error'
  },
  {
    inputs: [],
    name: 'InvalidResponseLength',
    type: 'error'
  },
  {
    inputs: [
      {
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        internalType: 'uint256',
        name: 'price',
        type: 'uint256'
      }
    ],
    name: 'listMiner',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'balance',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'value',
        type: 'uint256'
      }
    ],
    name: 'NotEnoughBalance',
    type: 'error'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'seller',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'buyer',
        type: 'address'
      }
    ],
    name: 'EventBuy',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      }
    ],
    name: 'EventCancelList',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newPrice',
        type: 'uint256'
      }
    ],
    name: 'EventChangePrice',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'seller',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'price',
        type: 'uint256'
      }
    ],
    name: 'EventList',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'owner',
        type: 'address'
      }
    ],
    name: 'EventMinerInContract',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        components: [
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes'
          }
        ],
        indexed: false,
        internalType: 'struct CommonTypes.FilAddress',
        name: 'newOwner',
        type: 'tuple'
      }
    ],
    name: 'EventMinerOutContract',
    type: 'event'
  },
  {
    inputs: [
      {
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        components: [
          {
            internalType: 'bytes',
            name: 'data',
            type: 'bytes'
          }
        ],
        internalType: 'struct CommonTypes.FilAddress',
        name: 'newOwner',
        type: 'tuple'
      }
    ],
    name: 'transferOwnerOut',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address payable',
        name: 'to',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      }
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    name: '_lastTimestampMap',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'FEE_RATE_UNIT',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getFeeRate',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      }
    ],
    name: 'getListMinerById',
    outputs: [
      {
        components: [
          {
            internalType: 'CommonTypes.FilActorId',
            name: 'id',
            type: 'uint64'
          },
          {
            internalType: 'address',
            name: 'seller',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'price',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'listTime',
            type: 'uint256'
          }
        ],
        internalType: 'struct SPex.ListMiner',
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getManager',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getMinerIdList',
    outputs: [
      {
        internalType: 'CommonTypes.FilActorId[]',
        name: '',
        type: 'uint64[]'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      }
    ],
    name: 'getOwnerById',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  }
]

export const LAST_WALLET = 'LAST_WALLET'
