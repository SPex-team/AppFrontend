export const FAQ_CONTENT = [
  {
    title: 'What is SPex?',
    answer:
      'SPex is the first-ever marketplace for Storage Providers (SPs) on Filecoin Virtual Machine (FVM) to allow them to trade/exchange their account properties, including miner account ownership, beneficiary address, and computing power in the future. We aim to provide a solution for SPs to trade, swap, bid, and interact.'
  },
  {
    title: 'What is the miner account market?',
    answer:
      'The miner account market is the first market SPex introduced. This market enables the transfer of miner account ownership addresses.'
  },
  {
    title: 'What are the use cases for the miner account market?',
    answer: (
      <>
        <p>{`a) Optimize capital efficiency: Withdraw locked rewards immediately without waiting, preventing price falling risk.`}</p>
        <p>{`b) Acquire special IDs: SPex assigns value to meaningful IDs, enabling purchases of desirable IDs for new SPs! SPs can also acquire value from old scarce short IDs or rare number combinations by selling them. Many special IDs are already emerged in the market!`}</p>
        <p>{`c) Secure account trading: The atomicity benefits allow SPs to easily and securely trade accounts without trust. The private pool enables SPs to use the market as a trustless tool to assign accounts on-chain after making the deal off-chain.`}</p>
        <p>{`d) Trade accounts on demand.`}</p>
      </>
    )
  },
  {
    title: 'How does the miner account market work?',
    answer: `There are two roles: seller and buyer.
    Sellers (the SPs) transfer in miners, bind their address in the contract as delegator, and list miners for sale. They can withdraw/transfer out miners anytime. When a buyer purchases, ownership transfers via smart contract. The purchase amount distributes to the seller after deducting fees.Buyers can click to buy preferred miners. The purchased miner appears in their profile, ready to relist or withdraw/transfer out.`
  },
  {
    title: 'Why doesn’t the owner address of the miner change after I purchased the miner? ',
    answer:
      "The relationship between the new owner and the purchased miner will reflect only on the contract, only if you complete the step of the transfer out the miner from the contract to you, then this ownership will officially transfer to your address and the ownership address will present to yours on the chain, but before transfer out the miner, the ownership of the miner is still yours based on the function of _minersDelegators in the contract, just won't show the chain but will present/reflect in the contract."
  },
  {
    title: 'What do the ID categories mean?',
    answer: (
      <>
        <p>We classify IDs into 4 categories :</p>
        <p>{`- Vintage - oldest 4-digit IDs`}</p>
        <p>{`- Special events - the number combination that represents some special events including the first block height after filecoin mainnet launch, FVM launch dates, etc.`}</p>
        <p>{`- Legendary - IDs with 4+ successive repeated digits, as well as full house numbers (e.g. 222333)`}</p>
        <p>{`- Rare - palindrome digits, 3-4 successive repeats, 3 pairs, or other unique patterns`}</p>
      </>
    )
  },
  {
    title: 'How do I list my miner?',
    answer: 'Click "Add" and follow the instructions.'
  },
  {
    title: 'What is the private pool?',
    answer: 'The private pool is for sellers to designate specific buyers.'
  }
]
