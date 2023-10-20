import { getMarketList, getMeList } from '@/api/modules'
import { getLoanCommentList } from '@/api/modules/loan'
import { setRootData } from '@/store/modules/root'
import Table from './table-class'

export default class Comment extends Table {
  static current_page_size?: number
  miner_id: number

  constructor(miner_id) {
    super()
    this.miner_id = miner_id
    Comment.current_page_size = 5
  }

  public init() {
    this.getList(1)
  }

  private getList(page) {
    getLoanCommentList({
      ordering: '-create_time',
      page,
      miner: this.miner_id,
      page_size: this.page_size
    }).then((res) => {
      res = res._data

      this.page = page
      this.dispatch(
        setRootData({ commentList: res.results ?? [], commentPage: page ?? 1, commentCount: res.count ?? 0 })
      )
    })
  }

  get page_size() {
    return Comment.current_page_size || this.default_page_size
  }

  public selectPage(page: number) {
    this.getList(page)
  }

  // public removeDataOfList(miner_id: string) {
  //   this.getList(this.page)
  // }
}
