import { getLoanMiners, getLoanByMinerId, getMinerBalance } from '@/api/modules/loan'
import { setRootData } from '@/store/modules/loan'
import Table from './table-class'

export default class LoanMarket extends Table {
  static current_page_size?: number
  ordering = '-create_time'
  search: string | undefined = undefined

  public init() {
    this.getList(1)
  }

  public updateMinerPriceInMarket() {
    this.getMinerPriceInMarket('max')
    this.getMinerPriceInMarket('min')
  }

  private getList(page) {
    this.dispatch(setRootData({ tableLoading: true }))
    getLoanMiners({
      ordering: this.ordering,
      search: this.search,
      page,
      page_size: this.page_size
    })
      .then((res) => {
        res = res._data

        this.page = page

        this.dispatch(
          setRootData({
            marketList: res.results?.filter((item) => !item.disabled) ?? [],
            marketPage: page ?? 1,
            marketCount: res.count ?? 0
          })
        )
      })
      .finally(() => {
        this.dispatch(setRootData({ tableLoading: false }))
      })
  }

  get page_size() {
    return LoanMarket.current_page_size || this.default_page_size
  }

  private getMinerPriceInMarket(func: 'max' | 'min') {
    // getMinerPriceAggregated(func).then((res) => {
    //   const payload = func === 'max' ? { minerPriceCeiling: res?.max || 0 } : { minerPriceFloor: res?.min || 0 }
    //   this.dispatch(setRootData(payload))
    // })
  }

  public getLoanByMinerId(minerId: number) {
    getLoanByMinerId({ minerId }).then((res) => {
      // console.log('res ==> ', res)
      const payload = {
        minerInfo: res._data
      }
      this.dispatch(setRootData(payload))
    })
  }

  public selectPage(page: number) {
    this.getList(page)
  }

  public sortList = (ordering: string) => {
    this.ordering = ordering === 'default' ? '-create_time' : ordering
    this.getList(1)
  }

  public searchList = (searchText: string) => {
    this.search = searchText
    this.getList(1)
  }

  public updateList(page: number) {
    this.page = page
    this.getList(this.page)
    this.updateMinerPriceInMarket()
  }

  public getMinerBalance(miner_id: number) {
    getMinerBalance(miner_id).then((res) => {
      const payload = {
        minerBalance: res._data
      }
      this.dispatch(setRootData(payload))
    })
  }
}
