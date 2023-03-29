import store, { AppDispatch } from '@/store'

export default class Resource {
  dispatch: AppDispatch

  constructor() {
    this.dispatch = store.dispatch
  }

  public get rootState() {
    return store.getState()
  }
}
