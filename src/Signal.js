/**
 * Handles the various ways in which an action can be resolved.
 * Currently, it handles values, and promises
 */

import tag from './tag'

function Signal (action, params, state) {
  if (process.env.NODE_ENV !== 'production' && typeof action !== 'function') {
    throw TypeError(`${ action } is not a function. Was app.push() called with the wrong value?`)
  }

  this.action = tag(action)
  this.value  = action.apply(undefined, params)
  this.state  = state
}

Signal.prototype = {
  then(next) {
    return this.pipe(this.value, next)
  },

  pipe(body, next) {
    if (body) {
      // When actions return thenables, wait for them to resolve
      // before moving on
      if (typeof body.then === 'function') {
        // Return a thenable without catching a rejection
        return body.then(result => this.pipe(result, next))
      }

      // When actions return iterators, resolve all of them
      // sequentially
      if (typeof body.next === 'function') {
        for (var value of body) {
          this.pipe(value, next)
        }
        // Return the value of the last iteration
        return value
      }
    }

    next(body)

    return body
  }
}

module.exports = Signal
