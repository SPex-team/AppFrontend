import { getLoanMiners, getLoanList, getLoanListByMiner } from '@/api/modules/loan'
import { setRootData } from '@/store/modules/loan'
import Table from './table-class'

const ordering = '-create_time'
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
    this.getLendList(1)
  }

  private getBorrowList(page) {
    this.dispatch(setRootData({ tableLoading: true }))

    getLoanMiners({
      ordering,
      page,
      page_size: this.page_size,
      delegator_address: this.currentAccount
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

    getLoanList({
      ordering,
      page,
      page_size: this.page_size,
      user_address: this.currentAccount
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

  public getLendListByMiner(minerId) {
    this.dispatch(setRootData({ tableLoading2: true }))

    getLoanListByMiner({
      ordering,
      page: 1,
      page_size: 1000,
      miner_id: minerId
    })
      .then((res) => {
        res = res._data
        this.dispatch(
          setRootData({
            lendListByMiner: res.results ?? []
          })
        )
      })
      .finally(() => {
        this.dispatch(setRootData({ tableLoading2: false }))
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

  public updateBorrowList() {
    this.getBorrowList(this.page)
  }

  public unlist() {
    this.getBorrowList(this.page)
  }
}

export default Profile
