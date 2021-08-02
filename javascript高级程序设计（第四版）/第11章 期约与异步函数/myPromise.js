/**
 * Promise构造函数
 * 参数fn：执行器函数(resolve,reject)=>{resolve(),reject()}
 *        执行器函数又接收2个参数：resolve()和reject()回调函数
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

/**
 * doResolve()方法
 * 参数fn：执行器函数(resolve,reject)=>{}
 * 参数self：（期约）实例
 */
function doResolve(fn, self) {
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

/**
 * resolve()方法
 * 参数self：（期约）实例
 * 参数newValue：解决值
 */
function resolve(self, newValue) {
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
        return
      } else if (typeof then === 'function') {
        // 解决值为thenable对象（拥有then方法的对象或函数），对其then方法继续执行doResolve

        // doResolve(function () {
        //   // 整个方法作为新的执行器方法，传给doResolve()并立即调用，then()作为当前resolve()，执行这个resolve()即执行then()
        //   return then.apply(newValue, arguments) // 将解决值的then方法体内的this指向解决值本身
        // }, self)

        doResolve(bind(then, newValue), self) // 源码中用apply重写上述的bind方法
        // doResolve(then, self) // 不指定then方法体内的this，调用后this指向全局对象window
        return
      }
    }
    self._state = 1 // 解决值为其他正常值，_state = 1
    self._value = newValue // 把解决值赋给期约实例的_value属性
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

/**
 * 测试用的finale()方法
 * 参数self：（期约）实例
 */
// function finale(self) {
//   if (self._state === 1) {
//     console.log('resolve:' + self._value)
//   } else if (self._state === 2) {
//     console.log('reject:' + self._value)
//   } else if (self._state === 3) {
//     console.log('resolve value is Promise')
//   }
// }

/* 测试：new Promise(()=>{}) */
// new Promise((resolve, reject) => {
// resolve(3) // 解决值为基本类型
// reject(3) // 拒绝值为基本类型
// resolve({ val: 3 }) // 解决值为普通对象
// resolve(new Promise(() => {})) // 解决值为期约实例
// resolve({
//   // 解决值为thenable对象
//   value: 3,
//   then: function () {
//     console.log(this)
//     console.log(this.value)
//   },
// })
// throw Error('error!') // 抛出错误
// })

/**
 * Promise构造函数的reject()方法
 * 参数value：解决值
 */
Promise.resolve = function (value) {
  /* 如果解决值的constructor属性指向Promise构造函数（即解决值是Promise实例） */
  if (value && typeof value === 'object' && value.constructor === Promise) {
    return value // 返回这个Promise实例
  }

  /* 解决值不是Promise实例，返回新的Promise实例并调用其resolve()方法，参数为该解决值 */
  return new Promise(function (resolve) {
    resolve(value)
  })
}

/**
 * Promise构造函数的reject()方法
 * 参数value：拒绝理由
 */
Promise.reject = function (value) {
  /* 返回新的Promise实例并调用其reject()方法，参数为该拒绝理由 */
  return new Promise(function (resolve, reject) {
    reject(value)
  })
}

/* 测试：Promise.resolve()和Promise.reject() */
// Promise.resolve(3) // 解决值为基本类型
// Promise.reject(3) // 拒绝值为基本类型
// Promise.resolve({ val: 3 }) // 解决值为普通对象
// Promise.resolve(
//   // 解决值为期约实例
//   new Promise((resolve) => {
//     resolve(3)
//   })
// )
// Promise.resolve({
//   // 解决值为thenable对象
//   value: 3,
//   then: function () {
//     console.log(this)
//     console.log(this.value)
//   },
// })

/**
 * 测试用的finale()方法
 * 参数self：（期约）实例
 */
function finale(self) {
  // console.log(self)

  /* 如果_state的值为2（Promise执行reject()方法），且未提供回调函数（或未实现catch函数），则给出警告 */
  if (self._state === 2 && self._deferreds.length === 0) {
    /**
     * 执行Promise构造函数的_immediateFn()方法
     * 参数fn：要执行的警告方法
     */
    Promise._immediateFn(function () {
      /* 如果未被处理过，则给出警告 */
      if (!self._handled) {
        /**
         * 执行Promise构造函数的._unhandledRejectionFn()方法
         * 参数self._value：拒绝理由
         */
        Promise._unhandledRejectionFn(self._value)
      }
    })
  }
}

var setTimeoutFunc = setTimeout
var setImmediateFunc = typeof setImmediate !== 'undefined' ? setImmediate : null

/**
 * Promise构造函数的_immediateFn()方法
 * 参数fn：要执行的警告方法
 */
Promise._immediateFn =
  typeof setImmediateFunc === 'function' // 判断setImmediateFunc是否为函数对象
    ? function (fn) {
        setImmediateFunc(fn) // 异步调用fn方法（立即）
      }
    : function (fn) {
        setTimeoutFunc(fn, 0) // 异步调用fn方法（0毫秒后）
      }

/**
 * Promise构造函数的_unhandledRejectionFn()方法：要执行的警告方法
 * 参数err：拒绝理由
 */
Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err) // 浏览器给出警告
  }
}

/* 测试：浏览器警告 */
// new Promise((resolve, reject) => {
//   reject(4)
// })
// Promise.reject(4) // 拒绝值为基本类型

/** Handler构造函数
 * 参数onFulfilled：resolve回调函数
 * 参数onRejected：reject回调函数
 * 参数promise：下一个promise实例对象
 * 打包onFulfilled、onRejected和promise，作为一个整体方便后面调用
 */
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.promise = promise
}

/** Promise原型的then()方法
 * 参数onFulfilled：onResolved处理程序，在期约兑现时执行的回调
 * 参数onRejected：onRejected处理程序，在期约拒绝时执行的回调
 * 支持无限链式回调，每个then()方法返回新的Promise实例
 */
Promise.prototype.then = function (onFulfilled, onRejected) {
  // console.log(this) // this指向then()前返回的Promise实例
  // console.log(this.constructor) // constructor指向Promise构造函数
  // console.log(this.constructor === Promise) // true
  var prom = new this.constructor(noop) // 传入空方法noop，创建一个新期约实例（相当于new Promise(noop)）
  // console.log(prom) // Promise { _state: 0, _handled: false, _value: undefined, _deferreds: [] }，新期约
  // console.log(new Promise(noop)) // Promise { _state: 0, _handled: false, _value: undefined, _deferreds: [] }，同上

  /**
   * handle()方法
   * 参数this：then()前返回的Promise实例
   * 参数new Handler(onFulfilled, onRejected, prom)：创建的Handler实例
   */
  handle(this, new Handler(onFulfilled, onRejected, prom))

  return prom // 返回新创建的期约实例，以便链式调用
}

function noop() {}

/**
 * 测试用的handle()方法
 * 参数self：then()前返回的Promise实例
 * 参数deferred：创建的Handler实例
 */
function handle(self, deferred) {
  // console.log(self)

  /* 如果返回的期约实例的解决值为promise类型，_state=3 */
  if (self._state === 3) {
    self = self._value // 将解决值赋给返回的期约实例
    // console.log(self)
  }

  /* 如果返回的期约实例是pendding状态，_state=0，即还没有执行resolve()或reject()方法 */
  if (self._state === 0) {
    self._deferreds.push(deferred) // 将Handler实例放入实例的_deferrends数组，然后继续等待
    // console.log(self)
    return
  }

  /* 如果不是上述情况，标记当前进行的promise._handled为true */
  self._handled = true
  console.log(self)

  /** 如果执行了resolve()或reject()方法，则通过事件循环异步来做回调的处理 **/
  // Promise._immediateFn(function () {
  //   var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected

  //   /* 如果自己没有onFulfilled或onRejected回调函数，则调用下一个Promise对象的回调，并携带当前的_value值 */
  //   if (cb === null) {
  //     ;(self._state === 1 ? resolve : reject)(deferred.promise, self._value)
  //     return
  //   }

  //   /* 自己有onFulfilled或onRejected回调函数，则执行自己的回调 */
  //   var ret
  //   try {
  //     ret = cb(self._value)
  //   } catch (e) {
  //     /* 处理下一个Promise的catch回调方法，ret作为上一个Promise catch回调return的值，返回给下一个Promise catch作为输入值 */
  //     reject(deferred.promise, e)
  //     return
  //   }

  //   /* 处理下一个Promise的then回调方法，ret作为上一个Promise then回调return的值，返回给下一个Promise then作为输入值 */
  //   resolve(deferred.promise, ret)
  // })
}

/* 测试：Promise.prototype.then */
new Promise((resolve, reject) => {
  resolve(3) // 解决值为基本类型
  // reject(3) // 拒绝值为基本类型
  // resolve({ val: 3 }) // 解决值为普通对象
  // resolve(new Promise(() => {})) // 解决值为期约实例 - pending状态
  // resolve(
  //   // 解决值为期约实例 - fulfilled状态
  //   new Promise((resolve) => {
  //     resolve(3)
  //   })
  // )
  // resolve({
  //   // 解决值为thenable对象
  //   value: 3,
  //   then: function () {
  //     console.log(this)
  //     console.log(this.value)
  //   },
  // })
  // throw Error('error!') // 抛出错误
  // 未解决，返回pending状态的期约
}).then()

/**
 * 测试用的finale()方法
 * 参数self：（期约）实例
 */
// function finale(self) {
//   // console.log(self)

//   /* 如果_state的值为2（Promise执行reject()方法），且未提供回调函数（或未实现catch函数），则给出警告 */
//   if (self._state === 2 && self._deferreds.length === 0) {
//     /**
//      * 执行Promise构造函数的_immediateFn()方法
//      * 参数fn：要执行的警告方法
//      */
//     Promise._immediateFn(function () {
//       /* 如果未被处理过，则给出警告 */
//       if (!self._handled) {
//         /**
//          * 执行Promise构造函数的._unhandledRejectionFn()方法
//          * 参数self._value：拒绝理由
//          */
//         Promise._unhandledRejectionFn(self._value)
//       }
//     })
//   }

//   /* 循环_deferreds数组，每一项都执行handle()方法 */
//   for (var i = 0, len = self._deferreds.length; i < len; i++) {
//     /**
//      * handle()方法：核心
//      * 参数self：（期约）实例
//      * 参数self._deferreds[i]：当前的Handle实例对象
//      */
//     handle(self, self._deferreds[i])
//   }

//   self._deferreds = null // 全部执行后，将_deferreds数组重置为null
// }

/**
 * handle()方法：核心
 * 参数self：（期约）实例
 * 参数deferred：
 */
// function handle(self, deferred) {
//   /* 如果参数为期约 */
//   while (self._state === 3) {
//     self = self._value // 将期约的解决值赋给期约本身
//   }

//   /* 如果是pendding状态，即还没有执行resolve()或reject()方法 */
//   // if (self._state === 0) {
//   //   self._deferreds.push(deferred) // 将deferred放入_deferrends数组，然后继续等待
//   //   return
//   // }
//   self._handled = true // 如果不是上述情况，标记当前进行的promise._handled为true

//   /** 如果执行了resolve()或reject()方法，则通过事件循环异步来做回调的处理 **/
//   // Promise._immediateFn(function () {
//   //   var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected

//   //   /* 如果自己没有onFulfilled或onRejected回调函数，则调用下一个Promise对象的回调，并携带当前的_value值 */
//   //   if (cb === null) {
//   //     ;(self._state === 1 ? resolve : reject)(deferred.promise, self._value)
//   //     return
//   //   }

//   //   /* 自己有onFulfilled或onRejected回调函数，则执行自己的回调 */
//   //   var ret
//   //   try {
//   //     ret = cb(self._value)
//   //   } catch (e) {
//   //     /* 处理下一个Promise的catch回调方法，ret作为上一个Promise catch回调return的值，返回给下一个Promise catch作为输入值 */
//   //     reject(deferred.promise, e)
//   //     return
//   //   }

//   //   /* 处理下一个Promise的then回调方法，ret作为上一个Promise then回调return的值，返回给下一个Promise then作为输入值 */
//   //   resolve(deferred.promise, ret)
//   // })
// }
