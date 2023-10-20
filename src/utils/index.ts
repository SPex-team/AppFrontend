import BigNumber from 'bignumber.js'

const isEmpty = (val) => {
  if (val === 0 || val === '0') return false
  if (val) return false
  return true
}

const NUMBER_TYPE = {
  vintage: [
    /^(0|\+?[1-9][0-9]{0,3})$/ // < 10000
  ],
  specialEvent: [
    /^14888$/, // relate to special event
    /^31415$/ // relate to special event
  ],
  legendary: [
    /([\d])\1{3,}/, // more than 3 same numbers
    /(?:(?:0(?=1)|1(?=2)|2(?=3)|3(?=4)|4(?=5)|5(?=6)|6(?=7)|7(?=8)|8(?=9)){4,}|(?:9(?=8)|8(?=7)|7(?=6)|6(?=5)|5(?=4)|4(?=3)|3(?=2)|2(?=1)|1(?=0)){4,})\d/, // 4 - 9 consecutive numbers
    /^([\d])\1{2,}([\d])\2{1,}$/, // AABBB
    /^([\d])\1{1,}([\d])\2{2,}$/ // AAABB
  ],
  rare: [
    /([\d])\1{2,}/, // more than 2 same numebrs
    /(?:(?:0(?=1)|1(?=2)|2(?=3)|3(?=4)|4(?=5)|5(?=6)|6(?=7)|7(?=8)|8(?=9)){3,}|(?:9(?=8)|8(?=7)|7(?=6)|6(?=5)|5(?=4)|4(?=3)|3(?=2)|2(?=1)|1(?=0)){3,})\d/, // 3 consecutive numbers
    /(?:22(?=33)|33(?=44)|44(?=55)|55(?=66)|66(?=77)|77(?=88)|88(?=99)){2}\d/, //AABBCC
    /((?:9(?=8)|8(?=7)|7(?=6)|6(?=5)|5(?=4)|4(?=3)|3(?=2)|2(?=1)|1(?=0)){2,}\d)\1/, // ABCABC
    function (val: string) {
      if (!val) return false
      return val === val?.split('').reverse().join('')
    } // ABCBA
  ]
}

const getTypeOfRareNumbers = (num: string | number) => {
  const str = num?.toString()
  let flag = false
  let rate: string = ''
  Object.keys(NUMBER_TYPE).some((key) => {
    const regArr = NUMBER_TYPE[key]
    const included = regArr.some((rule: RegExp | Function) =>
      typeof rule === 'function' ? rule(str) : new RegExp(rule).test(str)
    )
    if (!flag && included) {
      flag = true
      rate = key
    }
    return included && rate
  })
  return rate
}

export { isEmpty, getTypeOfRareNumbers }

export function isIndent(str: string, unit: number = 6) {
  return str && unit && str.length > unit * 2 ? str?.slice(0, unit) + '...' + str?.slice(-unit) : str
}

export function numberWithCommas(x, decimal?: number) {
  if (!x) return '0'
  return new Intl.NumberFormat('en-US', { maximumSignificantDigits: 18 }).format(
    BigNumber(x || 0)
      .decimalPlaces(decimal || 6)
      .toNumber()
  )
}

export function getValueMultiplied(num: number | string, pow: number = 18) {
  return new BigNumber(num).multipliedBy(Math.pow(10, pow)).toFixed(0)
}

export function convertRateToContract(num: number | string) {
  return Math.pow(BigNumber(num).dividedBy(100).plus(1).toNumber(), 1 / 365) - 1
}
