import { getSaleHistoryList } from '@/api/modules/history'
import { setRootData } from '@/store/modules/root'
import Table from './table-class'

export default class History extends Table {
  static current_page_size?: number

  public init() {
    this.getList(1)
  }

  private getList(page) {
    getSaleHistoryList({
      ordering: '-list_time',
      is_list: true,
      page,
      page_size: this.page_size
    }).then((res) => {
      res = res._data

      this.page = page
      this.dispatch(
        setRootData({ historyList: res.results ?? [], historyPage: page ?? 1, historyCount: res.count ?? 0 })
      )
    })
  }

  get page_size() {
    return History.current_page_size || this.default_page_size
  }

  public selectPage(page: number) {
    this.getList(page)
  }

  public removeDataOfList(miner_id: number) {
    this.getList(this.page)
  }
}
