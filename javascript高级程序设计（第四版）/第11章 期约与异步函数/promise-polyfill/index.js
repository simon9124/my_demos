/* 
  promise-polyfill源码：https://github.com/taylorhakes/promise-polyfill
*/

import promiseFinally from './finally'
import allSettled from './allSettled'

// Store setTimeout reference so promise-polyfill will be unaffected by
// other code modifying setTimeout (like sinon.useFakeTimers())
var setTimeoutFunc = setTimeout
// @ts-ignore
var setImmediateFunc = typeof setImmediate !== 'undefined' ? setImmediate : null

// isArray方法：判断对象是否为数组
function isArray(x) {
  return Boolean(x && typeof x.length !== 'undefined')
}

function noop() {}

// Polyfill for Function.prototype.bind（用apply写bind方法）
function bind(fn, thisArg) {
  return function () {
    fn.apply(thisArg, arguments)
  }
}

/**
 * @constructor Promise构造函数
 * @param {Function} fn 执行器函数(resolve,reject)=>{resolve(),reject()}
 *                      执行器函数又接收2个参数：resolve()和reject()回调函数
 */
function Promise(fn) {
  if (!(this instanceof Promise))
    throw new TypeError('Promises must be constructed via new') // 如果实例对象不是Promise的实例，抛出错误
  if (typeof fn !== 'function') throw new TypeError('not a function') // 如果传入的“执行器函数”不是function类型，抛出错误

  /** @type {!number}
   * 内部状态码
   * 0: pending，当前Promise正在执行中，默认值
   * 1: fulfilled, 执行了resolve函数，且参数_value不是期约，即_value instanceof Promise === false
   * 2: rejected，执行了reject函数
   * 3: fulfilled，执行了resolve函数，且参数_value是期约，即_value instanceof Promise === true
   */
  this._state = 0

  /** @type {!boolean}
   * 是否被处理过
   */
  this._handled = false

  /** @type {Promise|undefined}
   * resolve或reject的参数（解决值/拒绝理由）
   */
  this._value = undefined

  /** @type {!Array<!Function>}
   * 存放Handle实例对象的数组，缓存then方法传入的回调
   * 保存obj，obj包含3个参数：当前promise的onFulfilled和onRejected回调方法、当前promise的完成后要执行的promise
   * 当前Promise的resolve或reject触发调用后，forEach这个_deferreds数组中的每个Handle实例去处理对应的onFulfilled和onRejected方法
   */
  this._deferreds = []

  doResolve(fn, this) // 调用并传入fn函数，this为期约实例
}

// handle()方法：核心
function handle(self, deferred) {
  /* 如果返回的期约实例的解决值为promise类型，_state=3 */
  while (self._state === 3) {
    self = self._value // 当前处理变更到了新的Promise对象上
  }

  /* 如果返回的期约实例是pendding状态，_state=0，即还没有执行resolve()或reject()方法 */
  if (self._state === 0) {
    self._deferreds.push(deferred) // 将Handler实例放入实例的_deferrends数组，然后继续等待
    return
  }
  self._handled = true // 如果不是上述情况，标记当前进行的promise._handled为true

  /** 通过事件循环异步来做回调的处理 **/
  Promise._immediateFn(function () {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected

    /* 如果自己没有onFulfilled或onRejected回调函数，则调用下一个Promise对象的回调，并携带当前的_value值 */
    if (cb === null) {
      ;(self._state === 1 ? resolve : reject)(deferred.promise, self._value)
      return
    }

    /* 自己有onFulfilled或onRejected回调函数，则执行自己的回调 */
    var ret
    try {
      ret = cb(self._value)
    } catch (e) {
      /* 处理下一个Promise的catch回调方法，ret作为上一个Promise catch回调return的值，返回给下一个Promise catch作为输入值 */
      reject(deferred.promise, e)
      return
    }

    /* 处理下一个Promise的then回调方法，ret作为上一个Promise then回调return的值，返回给下一个Promise then作为输入值 */
    resolve(deferred.promise, ret)
  })
}

/**
 * resolve()方法
 * 参数self：（期约）实例
 * 参数newValue：解决值
 */
function resolve(self, newValue) {
  try {
    // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
    if (newValue === self)
      throw new TypeError('A promise cannot be resolved with itself.') // 解决值不能为期约实例本身（否则将导致无限循环）
    if (
      newValue &&
      (typeof newValue === 'object' || typeof newValue === 'function') // 如果解决值为对象或函数对象
    ) {
      var then = newValue.then
      if (newValue instanceof Promise) {
        // 解决值为promise类型，_state = 3
        self._state = 3
        self._value = newValue
        finale(self)
        return
      } else if (typeof then === 'function') {
        // 解决值为thenable对象（拥有then方法的对象或函数），对其then方法继续执行doResolve
        doResolve(bind(then, newValue), self) // 将解决值then方法体内的this指向解决值本身，确保期约实例能够调用then方法
        return
      }
    }
    self._state = 1 // 解决值为其他正常值，_state = 1
    self._value = newValue // 把解决值赋给期约实例的_value属性
    finale(self) // self为期约实例
  } catch (e) {
    reject(self, e)
  }
}

/**
 * reject()方法
 * 参数self：（期约）实例
 * 参数newValue：拒绝理由
 */
function reject(self, newValue) {
  self._state = 2 // reject的时候，_state = 2
  self._value = newValue // 把拒绝理由赋给期约实例的_value属性
  finale(self)
}

// finale()方法，调用Promise内部的handle()方法 ，消费self._deferreds队列
function finale(self) {
  if (self._state === 2 && self._deferreds.length === 0) {
    // 如果_state的值为2（Promise执行reject()方法），且未提供回调函数（或未实现catch函数），则给出警告
    Promise._immediateFn(function () {
      if (!self._handled) {
        Promise._unhandledRejectionFn(self._value) // 给出警告
      }
    })
  }

  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    // 循环_deferreds数组，每一项都执行handle()方法
    handle(self, self._deferreds[i])
  }
  self._deferreds = null // 全部执行后，将_deferreds数组重置为null
}

/** Handler构造函数
 * @constructor
 * @param onFulfilled resolve回调函数
 * @param onRejected reject回调函数
 * @param promise 下一个promise实例对象
 * 打包onFulfilled、onRejected和promise，作为一个整体方便后面调用
 */
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.promise = promise
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 *
 */
function doResolve(fn, self) {
  var done = false // 初始化done，确保resolve或reject只执行一次
  try {
    /* 立即执行（此时并非异步）传入的执行器函数fn */
    fn(
      // fn的resolve回调
      function (value) {
        if (done) return
        done = true
        resolve(self, value) // 调用resolve()方法，self为期约实例，value为解决值
      },
      // fn的reject回调
      function (reason) {
        if (done) return
        done = true
        reject(self, reason) // 调用reject()方法，self为期约实例，value为拒绝理由
      }
    )
  } catch (ex) {
    if (done) return
    done = true
    reject(self, ex) // 调用reject()方法
  }
}

// .catch()方法，在then()上做一层封装，只接收onRejected
Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected)
}

// .then()方法，支持无限链式回调，每个then()方法返回新的Promise实例
Promise.prototype.then = function (onFulfilled, onRejected) {
  // @ts-ignore
  var prom = new this.constructor(noop) // 传入空方法noop，创建一个新期约实例（相当于new Promise(noop)）
  handle(this, new Handler(onFulfilled, onRejected, prom)) // new Handler存储调用then的promise及then的参数
  return prom // 返回新创建的期约实例，以便链式调用
}

// .finally()
Promise.prototype['finally'] = promiseFinally

/** Promise构造函数的all()方法
 * 参数arr：数组
 */
Promise.all = function (arr) {
  // 返回一个新期约
  return new Promise(function (resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.all accepts an array')) // 参数必须是数组
    }
    var args = Array.prototype.slice.call(arr) // Array原型的slice方法，利用call绑定给arr（避免有自定义的slice方法）
    if (args.length === 0) return resolve([]) // 若数组长度为0，则立即执行执行器函数并返回，参数为空数组
    // ↑相当于：new Promise((resolve, reject) => resolve([]))

    var remaining = args.length

    /**
     * res()方法
     * 参数i：数组下标
     * 参数val：数组项
     */
    function res(i, val) {
      try {
        // console.log(args[i], val) // args[i]和val最初是一样的

        /* 如果该项为对象或函数对象，则对其then属性做特殊处理 */
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then
          // 如果then指向一个函数（val是Promise类型或thenable对象），则做处理
          if (typeof then === 'function') {
            /* 将该项的then方法体内的this指向该项本身，并执行then()
               Promise.prototype.then原本接受2个参数onFulfilled和onRejected，将function(val){}和reject回调分别作为这两个方法传给.then()
               执行.then() 
                -> 创建Handler实例（this指向then前的Promise实例，即该项本身）
                -> 调用handle方法，根据_state进行下一步操作
                -> 如_state为1，则调用Promise._immediateFn 
                -> 调用onFulfilled（即function(val)），参数为期约的_value值，即调用function(self._value)
            */
            then.call(
              val,
              function (val) {
                res(i, val) // 将期约的_value值作为val，再次调用res方法
              },
              reject
            )
            return
          }
        }

        /* 重写该项：若该项为期约则被重写为其解决值/拒绝理由，若为其他则不变 */
        args[i] = val
        // console.log(args[i], val)

        /* 若所有的项都执行完毕，则执行执行器函数的resolve回调，参数为处理后的数组 */
        if (--remaining === 0) {
          resolve(args) // doResolve()内部的done控制着resolve/reject方法只执行一次
        }
      } catch (ex) {
        /* 只要其中一项出现异常，则全部执行退出，进入catch异常处理 */
        reject(ex) // doResolve()内部的done控制着resolve/reject方法只执行一次
      }
    }

    /* 循环数组，针对每一项执行res()方法 */
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

Promise.allSettled = allSettled

Promise.resolve = function (value) {
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value
  }

  return new Promise(function (resolve) {
    resolve(value)
  })
}

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value)
  })
}

Promise.race = function (arr) {
  return new Promise(function (resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.race accepts an array')) // 参数必须是数组
    }

    /** doResolve()内部的done控制了resolve/reject方法只执行一次的处理，因此最快的Promise执行了resolve/reject，后面的Promise都不执行 **/
    for (var i = 0, len = arr.length; i < len; i++) {
      Promise.resolve(arr[i]).then(resolve, reject)
    }
  })
}

// Use polyfill for setImmediate for performance gains
Promise._immediateFn =
  // @ts-ignore
  (typeof setImmediateFunc === 'function' &&
    function (fn) {
      // @ts-ignore
      setImmediateFunc(fn)
    }) ||
  function (fn) {
    setTimeoutFunc(fn, 0)
  }

// _unhandledRejectionFn()方法，在浏览器给出警告
Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err) // eslint-disable-line no-console，浏览器给出警告
  }
}

export default Promise
