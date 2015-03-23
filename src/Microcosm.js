/**
 * Microcosm
 * An isomorphic flux implimentation. The strength of Microcosm
 * is that each application is its own fully encapsulated world
 */

import Heartbeat from 'Heartbeat'

export default class Microcosm extends Heartbeat {

  constructor() {
    super()

    this._stores = []
    this._state  = {}
  }

  seed(data) {
    let insert = this._stores.filter(i => data[i])

    insert.forEach(function(store) {
      this.set(store, store.getInitialState(data[store]))
    }, this)
  }

  set(key, value) {
    this._state = { ...this._state, [key]: value }
  }

  has(store) {
    return this._stores.some(i => i == store)
  }

  get(store, seed) {
    return this._state[store] || store.getInitialState(seed)
  }

  send(fn, params) {
    let request = fn(params)

    if (request instanceof Promise) {
      return request.then(body => this.dispatch(fn, body))
    }

    return this.dispatch(fn, request)
  }

  dispatch(type, body) {
    this._state = this._stores.reduce((state, store) => {
      if (type in store) {
        state[store] = store[type](this.get(store), body)
      }
      return state
    }, { ...this._state })

    this.pump()

    return body
  }

  addStore(...store) {
    this._stores = this._stores.concat(store)
  }

  toJSON() {
    return this.serialize()
  }

  serialize() {
    return this._stores.reduce((memo, store) => {
      memo[store] = this.get(store)
      return memo
    }, {})
  }
}
