import Resource from './resource-class'

export default class Table extends Resource {
  page: number
  default_page_size: number

  constructor() {
    super()

    this.page = 1
    this.default_page_size = 6
  }
}
