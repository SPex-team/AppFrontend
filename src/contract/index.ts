export const loanABI = [
  {
    inputs: [],
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
        internalType: 'address',
        name: 'buyer',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'seller',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'buyAmount',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'pricePerFil',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'principalChange',
        type: 'uint256'
      }
    ],
    name: 'EventBuyLoan',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'operator',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      }
    ],
    name: 'EventCancelSellLoan',
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
        name: 'newDelegator',
        type: 'address'
      }
    ],
    name: 'EventChangeMinerDelegator',
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
        internalType: 'bool',
        name: 'disabled',
        type: 'bool'
      }
    ],
    name: 'EventChangeMinerDisabled',
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
        name: 'newLoanInterestRate',
        type: 'uint256'
      }
    ],
    name: 'EventChangeMinerLoanInterestRate',
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
        name: 'newMaxDebtAmount',
        type: 'uint256'
      }
    ],
    name: 'EventChangeMinerMaxDebtAmount',
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
        name: 'maxLenderCount',
        type: 'uint256'
      }
    ],
    name: 'EventChangeMinerMaxLenderCount',
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
        name: 'minLendAmount',
        type: 'uint256'
      }
    ],
    name: 'EventChangeMinerMinLendAmount',
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
        name: 'newReceiveAddress',
        type: 'address'
      }
    ],
    name: 'EventChangeMinerReceiveAddress',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'lender',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      }
    ],
    name: 'EventLendToMiner',
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
        indexed: true,
        internalType: 'address',
        name: 'delegator',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'maxDebtAmount',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'loanInterestRate',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'receiveAddress',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'uint8',
        name: 'maxLenderCount',
        type: 'uint8'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'minLendAmount',
        type: 'uint256'
      }
    ],
    name: 'EventPledgeBeneficiaryToSpex',
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
        name: 'newBeneficiary',
        type: 'tuple'
      }
    ],
    name: 'EventReleaseBeneficiary',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'repayer',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'lender',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'actualRepaymentAmount',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'repaiedInterest',
        type: 'uint256'
      }
    ],
    name: 'EventRepayment',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'seller',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'ceilingAmount',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'pricePerFil',
        type: 'uint256'
      }
    ],
    name: 'EventSellLoan',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'address',
        name: 'operator',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'lender',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'actualRepaymentAmount',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'repaiedInterest',
        type: 'uint256'
      }
    ],
    name: 'EventWithdrawRepayment',
    type: 'event'
  },
  {
    inputs: [],
    name: 'MAX_FEE_RATE',
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
    name: 'RATE_BASE',
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
    name: 'REQUIRED_EXPIRATION',
    outputs: [
      {
        internalType: 'int64',
        name: '',
        type: 'int64'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'REQUIRED_QUOTA',
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
    name: '_feeRate',
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
    name: '_foundation',
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
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      },
      {
        internalType: 'CommonTypes.FilActorId',
        name: '',
        type: 'uint64'
      }
    ],
    name: '_loans',
    outputs: [
      {
        internalType: 'uint256',
        name: 'principalAmount',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'lastAmount',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'lastUpdateTime',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: '_maxDebtRate',
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
        name: '',
        type: 'uint64'
      }
    ],
    name: '_miners',
    outputs: [
      {
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        internalType: 'address',
        name: 'delegator',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'maxDebtAmount',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'loanInterestRate',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'receiveAddress',
        type: 'address'
      },
      {
        internalType: 'bool',
        name: 'disabled',
        type: 'bool'
      },
      {
        internalType: 'uint256',
        name: 'principalAmount',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'maxLenderCount',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'minLendAmount',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address'
      },
      {
        internalType: 'CommonTypes.FilActorId',
        name: '',
        type: 'uint64'
      }
    ],
    name: '_sales',
    outputs: [
      {
        internalType: 'uint256',
        name: 'amountRemaining',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'pricePerFil',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'lender',
        type: 'address'
      },
      {
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      }
    ],
    name: '_updateLenderOwedAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: 'currentOwedAmount',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'lenderList',
        type: 'address[]'
      },
      {
        internalType: 'CommonTypes.FilActorId[]',
        name: 'minerIdList',
        type: 'uint64[]'
      },
      {
        internalType: 'uint256[]',
        name: 'amountList',
        type: 'uint256[]'
      }
    ],
    name: 'batchDirectRepayment',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'actualRepaymentAmounts',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'lenderList',
        type: 'address[]'
      },
      {
        internalType: 'CommonTypes.FilActorId[]',
        name: 'minerIdList',
        type: 'uint64[]'
      }
    ],
    name: 'batchDirectRepaymentWithTotalAmount',
    outputs: [
      {
        internalType: 'uint256[]',
        name: 'actualRepaymentAmounts',
        type: 'uint256[]'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'lenderList',
        type: 'address[]'
      },
      {
        internalType: 'CommonTypes.FilActorId[]',
        name: 'minerIdList',
        type: 'uint64[]'
      },
      {
        internalType: 'uint256[]',
        name: 'amountList',
        type: 'uint256[]'
      }
    ],
    name: 'batchWithdrawRepayment',
    outputs: [
      {
        internalType: 'uint256',
        name: 'actuallRepaymentAmount',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address[]',
        name: 'lenderList',
        type: 'address[]'
      },
      {
        internalType: 'CommonTypes.FilActorId[]',
        name: 'minerIdList',
        type: 'uint64[]'
      },
      {
        internalType: 'uint256',
        name: 'totalAmount',
        type: 'uint256'
      }
    ],
    name: 'batchWithdrawRepaymentWithTotalAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: 'actualRepaymentAmount',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address payable',
        name: 'seller',
        type: 'address'
      },
      {
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        internalType: 'uint256',
        name: 'buyAmount',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'expectedPricePerFil',
        type: 'uint256'
      }
    ],
    name: 'buyLoan',
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
    name: 'cancelLoanSale',
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
        name: 'foundation',
        type: 'address'
      }
    ],
    name: 'changeFoundation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'newMaxDebtRate',
        type: 'uint256'
      }
    ],
    name: 'changeMaxDebtRate',
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
        internalType: 'address',
        name: 'newDelegator',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'newMaxDebtAmount',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'newLoanInterestRate',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'newReceiveAddress',
        type: 'address'
      },
      {
        internalType: 'bool',
        name: 'disabled',
        type: 'bool'
      },
      {
        internalType: 'uint256',
        name: 'maxLenderCount',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'minLendAmount',
        type: 'uint256'
      }
    ],
    name: 'changeMinerBorrowParameters',
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
        internalType: 'address',
        name: 'newDelegator',
        type: 'address'
      }
    ],
    name: 'changeMinerDelegator',
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
        internalType: 'bool',
        name: 'disabled',
        type: 'bool'
      }
    ],
    name: 'changeMinerDisabled',
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
        name: 'newLoanInterestRate',
        type: 'uint256'
      }
    ],
    name: 'changeMinerLoanInterestRate',
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
        name: 'newMaxDebtAmount',
        type: 'uint256'
      }
    ],
    name: 'changeMinerMaxDebtAmount',
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
        name: 'maxLenderCount',
        type: 'uint256'
      }
    ],
    name: 'changeMinerMaxLenderCount',
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
        name: 'minLendAmount',
        type: 'uint256'
      }
    ],
    name: 'changeMinerMinLendAmount',
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
        internalType: 'address',
        name: 'newReceiveAddress',
        type: 'address'
      }
    ],
    name: 'changeMinerReceiveAddress',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'lender',
        type: 'address'
      },
      {
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      }
    ],
    name: 'directRepayment',
    outputs: [
      {
        internalType: 'uint256',
        name: 'actualRepaymentAmount',
        type: 'uint256'
      }
    ],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'lender',
        type: 'address'
      },
      {
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      }
    ],
    name: 'getCurrentLenderOwedAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: 'totalAmountOwed',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'principal',
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
    name: 'getCurrentMinerOwedAmount',
    outputs: [
      {
        internalType: 'uint256',
        name: 'totalDebt',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'principal',
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
    name: 'getMiner',
    outputs: [
      {
        components: [
          {
            internalType: 'CommonTypes.FilActorId',
            name: 'minerId',
            type: 'uint64'
          },
          {
            internalType: 'address',
            name: 'delegator',
            type: 'address'
          },
          {
            internalType: 'uint256',
            name: 'maxDebtAmount',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'loanInterestRate',
            type: 'uint256'
          },
          {
            internalType: 'address',
            name: 'receiveAddress',
            type: 'address'
          },
          {
            internalType: 'bool',
            name: 'disabled',
            type: 'bool'
          },
          {
            internalType: 'uint256',
            name: 'principalAmount',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'maxLenderCount',
            type: 'uint256'
          },
          {
            internalType: 'uint256',
            name: 'minLendAmount',
            type: 'uint256'
          },
          {
            internalType: 'address[]',
            name: 'lenders',
            type: 'address[]'
          }
        ],
        internalType: 'struct SPexBeneficiary.Miner',
        name: '',
        type: 'tuple'
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
      },
      {
        internalType: 'uint256',
        name: 'expectedInterestRate',
        type: 'uint256'
      }
    ],
    name: 'lendToMiner',
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
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'price',
        type: 'uint256'
      }
    ],
    name: 'modifyLoanSale',
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
      },
      {
        internalType: 'uint256',
        name: 'maxDebtAmount',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'loanInterestRate',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'receiveAddress',
        type: 'address'
      },
      {
        internalType: 'bool',
        name: 'disabled',
        type: 'bool'
      },
      {
        internalType: 'uint8',
        name: 'maxLenderCount',
        type: 'uint8'
      },
      {
        internalType: 'uint256',
        name: 'minLendAmount',
        type: 'uint256'
      }
    ],
    name: 'pledgeBeneficiaryToSpex',
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
      }
    ],
    name: 'releaseBeneficiary',
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
        name: 'ceilingAmount',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'pricePerFil',
        type: 'uint256'
      }
    ],
    name: 'sellLoan',
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
        internalType: 'address payable',
        name: 'lender',
        type: 'address'
      },
      {
        internalType: 'CommonTypes.FilActorId',
        name: 'minerId',
        type: 'uint64'
      },
      {
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256'
      }
    ],
    name: 'withdrawRepayment',
    outputs: [
      {
        internalType: 'uint256',
        name: 'actualRepaymentAmount',
        type: 'uint256'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  }
]
