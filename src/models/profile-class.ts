import { getMeList } from '@/api/modules'
import { setRootData } from '@/store/modules/loan'
import Table from './table-class'

class Profile extends Table {
  static current_page_size?: number
  currentAccount?: string

  constructor(props) {
    super()
    this.currentAccount = props.currentAccount
  }

  public initBorrow() {
    this.getBorrowList(1)
  }

  public initLend() {
    this.getBorrowList(1)
  }

  private getBorrowList(page) {
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
        this.dispatch(
          setRootData({ borrowList: res.results ?? [], borrowPage: page ?? 1, borrowCount: res.count ?? 0 })
        )
      })
      .finally(() => {
        this.dispatch(setRootData({ tableLoading: false }))
      })
  }

  private getLendList(page) {
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
        this.dispatch(setRootData({ lendList: res.results ?? [], lendPage: page ?? 1, lendCount: res.count ?? 0 }))
      })
      .finally(() => {
        this.dispatch(setRootData({ tableLoading: false }))
      })
  }

  get page_size() {
    return Profile.current_page_size || this.default_page_size
  }

  public selectPage(page: number) {
    this.getBorrowList(page)
  }

  public selectLendPage(page: number) {
    this.getLendList(page)
  }

  public removeDataOfList(miner_id: string) {
    this.getBorrowList(this.page)
  }
}

export default Profile
