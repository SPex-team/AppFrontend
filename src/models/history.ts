import { getSaleHistoryList, getTransactionHistory } from '@/api/modules/history'
import { setRootData } from '@/store/modules/root'
import Table from './table-class'

export default class History extends Table {
  static current_page_size?: number
  transactionHistoryPage = 1

  public init() {
    this.getList(1)
  }

  public initTransaction(account?: string) {
    this.getTransactionHistoryList(1, account)
  }

  private getList(page) {
    this.dispatch(setRootData({ tableLoading: true }))
    getSaleHistoryList({
      ordering: '-list_time',
      is_list: true,
      page,
      page_size: this.page_size
    })
      .then((res) => {
        res = res._data

        this.page = page
        this.dispatch(
          setRootData({ historyList: res.results ?? [], historyPage: page ?? 1, historyCount: res.count ?? 0 })
        )
      })
      .finally(() => {
        this.dispatch(setRootData({ tableLoading: false }))
      })
  }

  private getTransactionHistoryList(page: number, account?: string) {
    this.dispatch(setRootData({ tableLoading2: true }))
    getTransactionHistory(
      {
        ordering: '-list_time',
        is_list: true,
        page,
        page_size: this.page_size
      },
      account
    )
      .then((res) => {
        res = res._data

        this.transactionHistoryPage = page
        this.dispatch(
          setRootData({
            transactionHistoryList: res.results ?? [],
            transactionHistoryPage: page ?? 1,
            transactionHistoryCount: res.count ?? 0
          })
        )
      })
      .finally(() => {
        this.dispatch(setRootData({ tableLoading2: false }))
      })
  }

  get page_size() {
    return History.current_page_size || this.default_page_size
  }

  public selectPage(page: number) {
    this.getList(page)
  }

  public selectTransactionPage(page: number, account?: string) {
    this.getTransactionHistoryList(page, account)
  }

  public removeDataOfList(miner_id: number) {
    this.getList(this.page)
  }
}
