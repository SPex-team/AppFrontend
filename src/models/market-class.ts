import { getMarketList } from '@/api/modules'
import { setRootData } from '@/store/modules/root'
import Table from './table-class'

export default class Market extends Table {
  static current_page_size?: number

  public init() {
    this.getList(1)
  }

  private getList(page) {
    getMarketList({
      ordering: '-list_time',
      is_list: true,
      page,
      page_size: this.page_size
    }).then((res) => {
      res = res._data

      this.page = page
      this.dispatch(setRootData({ marketList: res.results ?? [], marketPage: page ?? 1, marketCount: res.count ?? 0 }))
    })
  }

  get page_size() {
    return Market.current_page_size || this.default_page_size
  }

  public selectPage(page: number) {
    this.getList(page)
  }

  public removeDataOfList(miner_id: number) {
    this.getList(this.page)
    // const updataData = this.rootState.root.marketList.filter((item) => item.miner_id !== miner_id)

    // this.dispatch(setRootData({ marketList: updataData, marketPage: page ?? 1, marketCount: res.count ?? 0 }))
  }
}
