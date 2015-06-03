/**
 * An isomorphic flux implementation. The strength of Microcosm
 * is that each application is its own fully encapsulated world.
 */

const Foliage = require('foliage')
const Plugin  = require('./Plugin')
const Signal  = require('./Signal')
const Store   = require('./Store')
const install = require('./install')
const remap   = require('./remap')
const run     = require('./run')

class Microcosm extends Foliage {

  constructor() {
    super()

    this.stores  = {}
    this.plugins = []
    this.queue   = []
  }

  /**
   * Generates the initial state a microcosm starts with. The reduction
   * of calling `getInitialState` on all stores.
   * @return Object
   */
  getInitialState() {
    return remap(this.stores, store => store.getInitialState())
  }

  /**
   * Resets state to the result of calling `getInitialState()`
   * @return this
   */
  reset() {
    this.commit(this.getInitialState())
    return this
  }

  /**
   * Executes `deserialize` on the provided data and then merges it into
   * the current application state.
   *
   * This function is great for bootstrapping data when rendering from the
   * server. It will not blow away keys that haven't been provided.
   *
   * @param {Object} data - A JavaScript object of data to replace
   * @return this
   */
  replace(data) {
    this.update(this.deserialize(data))
    this.volley()
    return this
  }

  /**
   * Pushes a plugin in to the registry for a given microcosm.
   * When `app.start()` is called, it will execute plugins in
   * the order in which they have been added using this function.
   *
   * @param {Object} plugin  - The plugin that will be added
   * @param {Object} options - Options passed to the plugin on start
   * @return this
   */
  addPlugin(config, options) {
    this.plugins.push(new Plugin(config, options))
    return this
  }

  /**
   * Generates a store based on the provided `config` and assigns it to
   * manage the provided `key`. Whenever this store responds to an action,
   * it will be provided the current state for that particular key.
   *
   * @param {String} key - The key in global state the store will manage
   * @param {Object} config - Configuration options to build a new store
   * @return this
   */
  addStore(key, config) {
    if (process.env.NODE_ENV !== 'production' && typeof key !== 'string') {
      throw TypeError(`Microcosm::addStore expected string key but was given: ${ typeof key }. Did you forget to include the key?`)
    }

    this.stores[key] = new Store(config, key)

    return this
  }

  /**
   * Returns an object that is the result of transforming application state
   * according to the `serialize` method described by each store.
   *
   * @return Object
   */
  serialize() {
    return remap(this.stores, store => store.serialize(this.get(store)))
  }

  /**
   * For each key in the provided `data` parameter, transform it using
   * the `deserialize` method provided by the store managing that key.
   * Then fold the deserialized data over the current application state.
   *
   * @param {Object} data - Data to deserialize
   * @return Object
   */
  deserialize(data) {
    return remap(data, (state, key) => {
      return this.stores[key].deserialize(state)
    })
  }

  /**
   * Alias for `serialize`
   * @return Object
   */
  toJSON() {
    return this.serialize()
  }

  /**
   * Returns a clone of the current application state
   * @return Object
   */
  toObject() {
    return this.valueOf()
  }

  /**
   * Starts an application. It does a couple of things:
   *
   * 1. Calls `this.reset()` to determine initial state
   * 2. Runs through all plugins, it will terminate if any fail
   * 3. Executes the provided list of callbacks, passing along any errors
   *    generated if installing plugins fails.
   *
   * @param {...Function} callbacks - Callbacks to run after plugins install
   * @return Microcosm
   */
  start(/*...callbacks*/) {
    let callbacks = arguments

    this.reset()

    // Queue plugins and then notify that installation has finished
    install(this.plugins, this, () => run(callbacks, [], this, 'start'))

    return this
  }

  prepare(action, ...params) {
    return this.push.bind(this, action, ...params)
  }

  replay() {
    let state = this.queue.reduce(this.dispatch.bind(this),
                                  this.getInitialState())
    this.update(state)
  }

  record(signal, body) {
    let current = this.queue.filter(i => i.signal === signal)[0]

    if (current) {
      current.body = body
    } else {
      this.queue.push({ signal, action: signal.action, body })
    }

    this.replay()

    return body
  }

  forget(signal, error) {
    this.queue = this.queue.filter(i => i.signal !== signal)

    this.replay()

    return error
  }

  push(action, ...params) {
    let signal = new Signal(action, params)

    return signal.then(body  => this.record(signal, body),
                       error => this.forget(signal, error))
  }

  dispatch(state, { action, body }) {
    return remap(this.stores, (store, key) => {
      return store.send(state[key], action, body)
    })
  }

}

module.exports = Microcosm
