/**
 * @this {Promise}
 */
function finallyConstructor(callback) {
  var constructor = this.constructor
  return this.then(
    function (value) {
      // @ts-ignore，最终执行callback
      return constructor.resolve(callback()).then(function () {
        return value
      })
    },
    function (reason) {
      // @ts-ignore，最终执行callback
      return constructor.resolve(callback()).then(function () {
        // @ts-ignore
        return constructor.reject(reason)
      })
    }
  )
}

export default finallyConstructor
