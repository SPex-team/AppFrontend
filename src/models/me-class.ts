import { getMarketList, getMeList } from '@/api/modules'
import { setRootData } from '@/store/modules/root'
import Table from './table-class'

export default class Me extends Table {
  static current_page_size?: number

  public init() {
    this.getList(1)
  }

  private getList(page) {
    getMeList({
      ordering: '-list_time',
      page,
      owner: this.rootState.root.metaMaskAccount,
      page_size: this.page_size
    }).then((res) => {
      res = res._data

      this.page = page
      this.dispatch(setRootData({ meList: res.results ?? [], mePage: page ?? 1, meCount: res.count ?? 0 }))
    })
  }

  get page_size() {
    return Me.current_page_size || this.default_page_size
  }

  public selectPage(page: number) {
    this.getList(page)
  }

  public removeDataOfList(miner_id: string) {
    this.getList(this.page)
  }
}
