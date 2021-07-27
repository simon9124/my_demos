/**
 * Promise构造函数
 * 参数fn：执行器函数(resolve,reject)=>{}，是一个箭头函数
 */
function Promise(fn) {
  if (!(this instanceof Promise))
    throw new TypeError('Promises must be constructed via new') // 如果实例对象不是Promise的实例，抛出错误
  if (typeof fn !== 'function') throw new TypeError('not a function') // 如果传入的“执行器函数”不是function类型，抛出错误

  /** 内部状态码
   * 0: pending，当前Promise正在执行中，默认值
   * 1: fulfilled, 执行了resolve函数，且参数_value不是期约，即_value instanceof Promise === false
   * 2: rejected，执行了reject函数
   * 3: fulfilled，执行了resolve函数，且参数_value是期约，即_value instanceof Promise === true
   */
  this._state = 0 // 内部状态码初始值为0

  /* 是否被处理过 */
  this._handled = false // 默认未被处理过

  /* resolve或reject的参数（解决值/拒绝理由） */
  this._value = undefined // 解决值/拒绝理由默认为undefined

  /** 存放Handle实例对象的数组，缓存then方法传入的回调
   * 保存obj,obj包含3个参数：当前promise的onFulfilled和onRejected回调方法、当前promise的完成后要执行的promise
   * 当前Promise的resolve或reject触发调用后，forEach这个_deferreds数组中的每个Handle实例去处理对应的onFulfilled和onRejected方法
   */
  this._deferreds = []

  doResolve(fn, this) // 调用并传入fn函数，this为期约实例
}
