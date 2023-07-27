import { getMarketList, getMinerPriceAggregated } from '@/api/modules'
import { setRootData } from '@/store/modules/root'
import Table from './table-class'

export default class Market extends Table {
  static current_page_size?: number
  ordering = '-list_time'
  search: string | undefined = undefined

  public init() {
    this.getList(1)
    this.updateMinerPriceInMarket()
  }

  public updateMinerPriceInMarket() {
    this.getMinerPriceInMarket('max')
    this.getMinerPriceInMarket('min')
  }

  private getList(page) {
    this.dispatch(setRootData({ tableLoading: true }))
    getMarketList({
      ordering: this.ordering,
      search: this.search,
      is_list: true,
      page,
      page_size: this.page_size
    })
      .then((res) => {
        res = res._data

        this.page = page

        this.dispatch(
          setRootData({ marketList: res.results ?? [], marketPage: page ?? 1, marketCount: res.count ?? 0 })
        )
      })
      .finally(() => {
        this.dispatch(setRootData({ tableLoading: false }))
      })
  }

  get page_size() {
    return Market.current_page_size || this.default_page_size
  }

  private getMinerPriceInMarket(func: 'max' | 'min') {
    getMinerPriceAggregated(func).then((res) => {
      const payload = func === 'max' ? { minerPriceCeiling: res?.max || 0 } : { minerPriceFloor: res?.min || 0 }
      this.dispatch(setRootData(payload))
    })
  }

  public selectPage(page: number) {
    this.getList(page)
  }

  public sortList = (ordering: string) => {
    this.ordering = ordering === 'default' ? '-list_time' : ordering
    this.getList(1)
  }

  public searchList = (searchText: string) => {
    this.search = searchText
    this.getList(1)
  }

  public removeDataOfList(miner_id: number) {
    this.getList(this.page)
    this.updateMinerPriceInMarket()
    // const updataData = this.rootState.root.marketList.filter((item) => item.miner_id !== miner_id)

    // this.dispatch(setRootData({ marketList: updataData, marketPage: page ?? 1, marketCount: res.count ?? 0 }))
  }
}
