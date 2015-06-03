/**
 * Tag
 * Uniquely tag a function. This is used to identify actions
 */

let uid = 0
let known = {}

module.exports = function(fn) {
  let name = fn.name || 'action'
  let mark = (name in known) ? `${ name }-${ uid++}` : name

  known[name] = true

  if (!fn.hasOwnProperty('toString')) {
    fn.toString = () => mark
  }

  return fn
}
