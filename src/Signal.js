/**
 * Handles the various ways in which an action can be resolved.
 * Currently, it handles values, and promises
 */

let isGenerator = require('./isGenerator')
let isPromise   = require('./isPromise')
let tag         = require('./tag')
let uid         = 0

function Signal (action, params) {
  if (process.env.NODE_ENV !== 'production' && typeof action !== 'function') {
    throw TypeError(`${ action } is not a function. Was app.push() called with the wrong value?`)
  }

  this.id     = uid++
  this.action = tag(action)
  this.value  = action.apply(undefined, params)
}

Signal.prototype = {
  then(resolve, reject) {
    return this.pipe(resolve, reject, this.value)
  },

  pipe(resolve, reject, body) {
    let next = this.pipe.bind(this, resolve, reject)

    if (isPromise(body)) {
      body.then(next, reject)
      return body
    }

    if (isGenerator(body)) {
      for (var value of body) next(value)
      return value
    }

    return resolve(body)
  },

  toString() {
    return `signal-${ this.id }:${ this.action }`
  }
}

module.exports = Signal
