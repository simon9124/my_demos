/** Promise构造函数
 * 参数fn：执行器函数(resolve,reject)=>{resolve(),reject()}
 *        执行器函数又接收2个参数：resolve和reject回调函数
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
  this._state = 0 // 默认值为0

  /* 是否被处理过 */
  this._handled = false // 默认未被处理过

  /* 解决值/拒绝理由（resolve或reject的参数） */
  this._value = undefined // 默认为undefined

  /** 存放Handle实例对象的数组，缓存then方法传入的回调
   * 包含3个参数：当前promise的onFulfilled和onRejected回调方法、当前promise的完成后要执行的promise
   * 当前Promise的resolve()或reject()触发调用后，循环_deferreds数组中的每个Handle实例，处理对应的onFulfilled和onRejected方法
   */
  this._deferreds = []

  /** 调用doResolve()方法
   * 参数fn：执行器函数
   * 参数this：（期约）实例
   */
  doResolve(fn, this)
}

/** doResolve()方法
 * 参数fn：执行器函数(resolve,reject)=>{resolve(),reject()}
 * 参数self：（期约）实例
 */
function doResolve(fn, self) {
  // console.log(self)

  var done = false // 初始化done，确保resolve或reject只执行一次

  /* 立即执行（此时并非异步）传入的执行器函数fn */
  try {
    fn(
      // fn的resolve回调
      function (value) {
        if (done) return
        done = true
        /**
         * resolve()方法
         * 参数self：（期约）实例
         * 参数value：解决值
         */
        resolve(self, value)
      },
      // fn的reject回调
      function (reason) {
        if (done) return
        done = true
        /**
         * resolve()方法
         * 参数self：（期约）实例
         * 参数value：拒绝理由
         */
        reject(self, reason)
      }
    )
  } catch (err) {
    if (done) return
    done = true
    reject(self, err)
  }
}

/** resolve()方法
 * 参数self：（期约）实例
 * 参数newValue：解决值
 */
function resolve(self, newValue) {
  // console.log(self, newValue)
  try {
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
        /* 此时的self
          Promise {
            _state: 3,
            _handled: false,
            _value: Promise {...},
            _deferreds: []
          }
        */
        return
      } else if (typeof then === 'function') {
        // 解决值为thenable对象（拥有then方法的对象或函数），对其then方法继续执行doResolve
        // console.log(newValue)
        // console.log(newValue.then)
        // console.log(self)

        // doResolve(function () {
        //   // 整个function作为新的执行器方法，传给doResolve()并立即调用，then()作为当前的resolve()，执行这个resolve()即执行then()
        //   return then.apply(newValue, arguments) // 将解决值的then方法体内的this指向解决值本身，并执行then()
        // }, self)
        doResolve(bind(then, newValue), self) // 源码中用apply重写上述的bind方法
        // doResolve(then, self) // 不指定then方法体内的this，调用后this指向全局对象window

        return
      }
    }
    self._state = 1 // 解决值为其他正常值，_state = 1
    self._value = newValue // 把解决值赋给期约实例的_value属性
    // console.log(self)
    /**
     * finale()方法
     * 参数self：（期约）实例
     */
    finale(self)
  } catch (e) {
    reject(self, e)
  }
}

/** Polyfill for Function.prototype.bind
 * 用apply写bind方法
 */
function bind(fn, thisArg) {
  return function () {
    fn.apply(thisArg, arguments)
  }
}

/** reject()方法
 * 参数self：（期约）实例
 * 参数newValue：拒绝理由
 */
function reject(self, newValue) {
  self._state = 2 // reject的时候，_state = 2
  self._value = newValue // 把拒绝理由赋给期约实例的_value属性
  finale(self)
}

/** 测试用的finale()方法
 * 参数self：（期约）实例
 */
function finale(self) {
  console.log(self)
  if (self._state === 1) {
    console.log('resolve:' + self._value)
  } else if (self._state === 2) {
    console.log('reject:' + self._value)
  } else if (self._state === 3) {
    console.log('resolve value is Promise')
  }
}

/** Promise构造函数的resolve属性，指向函数
 * 参数value：解决值
 */
Promise.resolve = function (value) {
  /* 如果解决值的constructor属性指向Promise构造函数（即解决值是Promise实例） */
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value // 返回这个Promise实例
  }

  /* 解决值不是Promise实例，返回新的Promise实例并调用其成功回调，参数作为解决值 */
  return new Promise(function (resolve) {
    resolve(value)
  })
}

/** Promise构造函数的reject属性，指向函数
 * 参数value：拒绝理由
 */
Promise.reject = function (value) {
  /* 返回新的Promise实例并调用其失败回调，参数作为拒绝理由 */
  return new Promise(function (resolve, reject) {
    reject(value)
  })
}

/** Promise构造函数的_immediateFn属性，指向函数
 * 参数fn：要执行的方法（**注意：是异步调用**）
 */
var setTimeoutFunc = setTimeout
var setImmediateFunc = typeof setImmediate !== 'undefined' ? setImmediate : null // 判断浏览器是否有setImmediate方法

Promise._immediateFn =
  typeof setImmediateFunc === 'function' // 判断setImmediateFunc是否为函数对象
    ? function (fn) {
        setImmediateFunc(fn) // 异步调用fn方法（立即）
      }
    : function (fn) {
        setTimeoutFunc(fn, 0) // 异步调用fn方法（0毫秒后）
      }

/** Promise构造函数的_unhandledRejectionFn属性，指向函数
 * 参数err：拒绝理由
 */
Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err) // 浏览器给出警告
  }
}

/** 测试用的finale()方法
 * 参数self：（期约）实例
 */
function finale(self) {
  // console.log(self)
  // if (self._state === 1) {
  //   console.log('resolve:' + self._value)
  // } else if (self._state === 2) {
  //   console.log('reject:' + self._value)
  // } else if (self._state === 3) {
  //   console.log('resolve value is Promise')
  // }

  /* 如果_state的值为2（失败回调），且_deferreds数组长度为0，则给出警告 */
  if (self._state === 2 && self._deferreds.length === 0) {
    /**
     * 调用Promise构造函数的_immediateFn方法
     * 参数fn：要执行的警告方法
     */
    Promise._immediateFn(function () {
      /* 如果未被处理过，则给出警告 */
      if (!self._handled) {
        /**
         * 调用Promise构造函数的._unhandledRejectionFn方法
         * 参数self._value：拒绝理由
         */
        Promise._unhandledRejectionFn(self._value)
      }
    })
  }
}

/** Promise原型的then属性，指向函数
 * 参数onFulfilled：onResolved处理程序，在期约兑现时执行的回调
 * 参数onRejected：onRejected处理程序，在期约拒绝时执行的回调
 * 支持无限链式回调，每个then()方法返回新的Promise实例
 */
Promise.prototype.then = function (onFulfilled, onRejected) {
  // console.log(this, 'then') // this指向then()前返回的Promise实例
  // console.log(this.constructor) // constructor指向Promise构造函数
  // console.log(this.constructor === Promise) // true

  /* 创建一个新期约实例（相当于new Promise(noop)），传入空方法noop作为执行器函数
     注意：每次调用.then()都创建新的Promise实例，但调用下一个.then()会将上一个Promise实例的_deferreds数组改变（放入下一个的Handler实例）！
  */
  var prom = new this.constructor(noop) // -> var prom = new Promise(noop) -> var prom = new Promise(()=>{})
  // console.log(prom) // Promise { _state: 0, _handled: false, _value: undefined, _deferreds: [] }，新期约
  // console.log(new Promise(noop)) // Promise { _state: 0, _handled: false, _value: undefined, _deferreds: [] }，同上

  /**
   * handle()方法
   * 参数this：then()前返回的上一个Promise实例
   * 参数new Handler(onFulfilled, onRejected, prom)：创建的Handler实例
   */
  handle(this, new Handler(onFulfilled, onRejected, prom))

  return prom // 返回新创建的期约实例，以便链式调用
}

function noop() {}

/** Handler构造函数：打包onFulfilled、onRejected和promise，作为一个整体方便后面调用
 * 参数onFulfilled：resolve回调函数
 * 参数onRejected：reject回调函数
 * 参数promise：新的空promise实例
 */
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null // 是否有成功回调，若没有则赋为null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null // 是否有失败回调，若没有则赋为null
  this.promise = promise // Handler的promise，指向prom，即在.then()中创建的新Promise实例
  // console.log(this.promise, 'new Handler')
  // console.log(this)
}

/** 测试用的handle()方法
 * 参数self：then()前返回的Promise实例
 * 参数deferred：创建的Handler实例
 */
function handle(self, deferred) {
  // console.log(self)
  // console.log(deferred)

  /* deferred为创建的Handler实例
    Handler {
      onFulfilled: [Function (anonymous)], // onFulfilled处理程序，没有则为null
      onRejected: [Function (anonymous)], // onRejected处理程序，没有则为null
      promise: Promise { // promise属性指向一个新的Promise实例
        _state: 0,
        _handled: false,
        _value: undefined,
        _deferreds: []
      }
    }
  */

  /* 如果返回的期约实例的解决值为promise类型，_state=3 */
  while (self._state === 3) {
    self = self._value // 将解决值赋给返回的期约实例
  }

  /* 如果返回的期约实例是pendding状态，_state=0，即还没有执行resolve()或reject()方法 */
  if (self._state === 0) {
    self._deferreds.push(deferred) // 将Handler实例放入实例的_deferrends数组，然后返回，继续等待
    console.log(self)
    return
  }

  /* 标记当前进行的promise._handled为true */
  self._handled = true
  console.log(self)

  /* 通过事件循环异步来做回调的处理（注意：这里是异步的！） */
  Promise._immediateFn(function () {
    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected // 获取onFulfilled或onRejected处理程序

    /* 如果有onFulfilled或onRejected回调函数，则执行自己的回调 */
    try {
      /**
       * cb()方法：执行onFulfilled或onRejected处理程序
       * 参数self._value：then()前返回的Promise实例的解决值/拒绝理由
       */
      cb(self._value) // 执行回调
    } catch (e) {
      /* 若抛出错误，则调用reject()方法，参数为创建的Handler实例的promise（新Promise实例）和错误原因 */
      reject(deferred.promise, e)
      return
    }
  })
}

/* 测试：Promise.prototype.then */
// new Promise((resolve, reject) => {}).then(() => {
//   console.log(3) // then前是未解决的期约，期约解决前不会执行处理程序
// })
/* 执行到handle()时，self._state为0，将Handler实例放入实例的_deferrends数组，不再执行后续操作，self为：
  Promise {
    _state: 0,
    _handled: false,
    _value: undefined,
    _deferreds: [
      Handler { 
        onFulfilled: [Function (anonymous)], 
        onRejected: null, 
        promise: Promise {_state: 0, _handled: false, _value: undefined, _deferreds: []}
      }
    ]
  }
*/

// new Promise((resolve, reject) => {
//   /* 实际执行首个resolve或reject后，后续的resolve或reject不会再执行，这里仅把测试结果合并 */

//   resolve(3) // 打印res为3，解决值为基本类型
//   /* self为Promise { _state: 1, _handled: true, _value: 3, _deferreds: [] } */
//   resolve({ val: 3 }) // 打印res为{ val: 3 }，解决值为普通对象
//   /* self为Promise { _state: 1, _handled: true, _value: { val: 3 }, _deferreds: [] } */
//   resolve(new Promise(() => {})) // 不打印res，解决值为pending的期约实例
//   /* self与new Promise((resolve, reject) => {}).then()基本相同，onFulfilled不再是null */
//   resolve(Promise.resolve(3)) // 打印res为3，解决值为fullfilled的期约实例，将fullfilled的解决值赋给self
//   /* self为Promise { _state: 1, _handled: true, _value: 3, _deferreds: [] } */
//   resolve({
//     // 解决值为thenable对象
//     value: 3,
//     then: function () {
//       console.log(this) // { value: 3, then: [Function: then] }
//       console.log(this.value) // 3
//     },
//   })
//   /* self与resolve(new Promise(() => {}))相同 */
// }).then((res) => {
//   console.log(res) // then()前返回的Promise的解决值
// })

// new Promise((resolve, reject) => {
//   reject(3) // 打印res为3
//   /* self为Promise { _state: 2, _handled: true, _value: 3, _deferreds: [] } */
// }).then(null, (err) => {
//   console.log(err) // then()前返回的Promise的拒绝理由
// })

/** Promise原型的catch属性，指向函数
 * 参数onRejected：onRejected处理程序，在期约拒绝时执行的回调
 * 支持无限链式回调，每个catch()方法返回新的Promise实例
 */
Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected)
}

/* 测试：Promise.prototype.catch */
new Promise((resolve, reject) => {}).catch(() => {
  console.log(3) // catch前是未解决的期约，期约解决前不会执行处理程序（同then）
})

new Promise((resolve, reject) => {
  /* 实际执行首个resolve或reject后，后续的resolve或reject不会再执行，这里仅把测试结果合并 */

  reject(4) // 4，拒绝理由为基本类型
  /* self为Promise { _state: 2, _handled: true, _value: 4, _deferreds: [] } */
  reject({ val: 4 }) // { val: 4 }，拒绝理由为普通对象
  /* self为Promise { _state: 2, _handled: true, _value: { val: 4 }, _deferreds: [] } */
  throw Error('error!') // 'Error: error!'，抛出错误
  /* self为Promise { _state: 2, _handled: true, _value: Error: error!, _deferreds: [] } */
  reject(new Promise(() => {})) // 'Promise { _state: 0, _handled: false, _value: undefined, _deferreds: [] }'，期约本身作为拒绝理由（需与resolve区分）
  /* self为Promise { _state: 2, _handled: true, _value: Promise { _state: 0, _handled: false, _value: undefined, _deferreds: [] }, _deferreds: [] } */
  reject(Promise.resolve(3)) // 'Promise { _state: 1, _handled: false, _value: 3, _deferreds: [] }'，同上，期约本身作为拒绝理由，与期约状态无关
  /* self为Promise { _state: 2, _handled: true, _value: Promise { _state: 1, _handled: false, _value: 3, _deferreds: [] }, _deferreds: [] } */
}).catch((err) => {
  console.log(err) // catch()前返回的Promise的拒绝理由
})
