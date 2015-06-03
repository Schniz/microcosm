module.exports = function implements (value, key) {
  return value && typeof value[key] === 'function'
}
