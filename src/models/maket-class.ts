import { getMaketList } from '@/api/modules'
import { setRootData } from '@/store/modules/root'
import Table from './table-class'

export default class Maket extends Table {
  static current_page_size?: number

  public init() {
    this.getList(1)
  }

  private getList(page) {
    getMaketList({
      ordering: '-list_time',
      page,
      page_size: this.page_size
    }).then((res) => {
      res = res._data

      this.page = page
      this.dispatch(setRootData({ maketList: res.results ?? [], maketPage: page ?? 1, maketCount: res.count ?? 0 }))
    })
  }

  get page_size() {
    return Maket.current_page_size || this.default_page_size
  }

  public selectPage(page: number) {
    this.getList(page)
  }

  public removeDataOfList(miner_id: number) {
    this.getList(this.page)
    // const updataData = this.rootState.root.maketList.filter((item) => item.miner_id !== miner_id)

    // this.dispatch(setRootData({ maketList: updataData, maketPage: page ?? 1, maketCount: res.count ?? 0 }))
  }
}
