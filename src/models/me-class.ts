import { getMeList } from '@/api/modules'
import { setRootData } from '@/store/modules/root'
import Table from './table-class'

class Me extends Table {
  static current_page_size?: number
  currentAccount?: string

  constructor(props) {
    super()
    this.currentAccount = props.currentAccount
  }

  public init() {
    this.getList(1)
  }

  private getList(page) {
    this.dispatch(setRootData({ tableLoading: true }))

    getMeList({
      ordering: '-list_time',
      page,
      owner: this.currentAccount,
      page_size: this.page_size
    })
      .then((res) => {
        res = res._data

        this.page = page
        this.dispatch(setRootData({ meList: res.results ?? [], mePage: page ?? 1, meCount: res.count ?? 0 }))
      })
      .finally(() => {
        this.dispatch(setRootData({ tableLoading: false }))
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

export default Me
