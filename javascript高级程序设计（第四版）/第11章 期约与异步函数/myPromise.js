/** Promise构造函数
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

/** doResolve()方法
 * 参数fn：执行器函数(resolve,reject)=>{}
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

/** Promise构造函数的reject()方法
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

/** Promise构造函数的reject()方法
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

/** 测试用的finale()方法
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
// }

var setTimeoutFunc = setTimeout
var setImmediateFunc = typeof setImmediate !== 'undefined' ? setImmediate : null

/** Promise构造函数的_immediateFn()方法
 * 参数fn：要执行的方法（**注意：是异步调用**）
 */
Promise._immediateFn =
  typeof setImmediateFunc === 'function' // 判断setImmediateFunc是否为函数对象
    ? function (fn) {
        setImmediateFunc(fn) // 异步调用fn方法（立即）
      }
    : function (fn) {
        setTimeoutFunc(fn, 0) // 异步调用fn方法（0毫秒后）
      }

/** Promise构造函数的_unhandledRejectionFn()方法：要执行的警告方法
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

/** Handler构造函数：打包onFulfilled、onRejected和promise，作为一个整体方便后面调用
 * 参数onFulfilled：resolve回调函数
 * 参数onRejected：reject回调函数
 * 参数promise：下一个promise实例对象
 */
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.promise = promise // Handler的promise，指向prom，即在.then()中创建的Promise实例
  // console.log(this.promise, 'new Handler')
  // console.log(this)
}

/** Promise原型的then()方法
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
  var prom = new this.constructor(noop)
  // var prom = new Promise(noop) // 等效于
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

/** 测试用的handle()方法
 * 参数self：then()前返回的Promise实例
 * 参数deferred：创建的Handler实例
 */
// function handle(self, deferred) {
//   // console.log(self)
//   // console.log(deferred)
//   /* deferred为创建的Handler实例
//   Handler {
//     onFulfilled: [Function (anonymous)], // onFulfilled处理程序，没有则为null
//     onRejected: [Function (anonymous)], // onRejected处理程序，没有则为null
//     promise: Promise { // promise属性指向一个新的Promise实例
//       _state: 0,
//       _handled: false,
//       _value: undefined,
//       _deferreds: []
//     }
//   }
//   */

//   /* 如果返回的期约实例的解决值为promise类型，_state=3 */
//   while (self._state === 3) {
//     self = self._value // 将解决值赋给返回的期约实例
//     // console.log(self)
//   }

//   /* 如果返回的期约实例是pendding状态，_state=0，即还没有执行resolve()或reject()方法 */
//   if (self._state === 0) {
//     self._deferreds.push(deferred) // 将Handler实例放入实例的_deferrends数组，然后继续等待
//     console.log(self)
//     return
//   }

//   /* 如果不是上述情况，标记当前进行的promise._handled为true */
//   self._handled = true
//   // console.log(self)

//   /** 通过事件循环异步来做回调的处理 **/
//   Promise._immediateFn(function () {
//     var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected // 获取onFulfilled或onRejected处理程序

//     /* 如果有onFulfilled或onRejected回调函数，则执行自己的回调 */
//     // var ret
//     try {
//       /**
//        * cb()方法：执行onFulfilled或onRejected处理程序
//        * 参数self._value：then()前返回的Promise实例的解决值/拒绝理由
//        */
//       // ret = cb(self._value) // 执行回调，返回值赋给ret
//       cb(self._value) // 执行回调
//     } catch (e) {
//       /* 处理下一个Promise的catch回调方法，ret作为上一个Promise catch回调return的值，返回给下一个Promise catch作为输入值 */
//       reject(deferred.promise, e)
//       return
//     }
//   })
// }

/* 测试：Promise.prototype.then */
// new Promise((resolve, reject) => {
//   // 未解决，返回pending状态的期约
//   // resolve(3) // 解决值为基本类型
//   // resolve({ val: 3 }) // 解决值为普通对象
//   // resolve(new Promise(() => {})) // 解决值为期约实例 - pending状态
//   // resolve(
//   //   // 解决值为期约实例 - fulfilled状态
//   //   new Promise((resolve) => {
//   //     resolve(3)
//   //   })
//   // )
//   // resolve({
//   //   // 解决值为thenable对象
//   //   value: 3,
//   //   then: function () {
//   //     console.log(this)
//   //     console.log(this.value)
//   //   },
//   // })
// }).then(
//   /* onFulfilled处理程序 */
//   (res) => {
//     // console.log(res) // then()前返回的Promise的解决值
//   }
//   // null,
//   /* onRejected处理程序 */
//   // (err) => {
//   //   console.log(err) // then()前返回的Promise的拒绝理由
//   // }
// )

/** Promise原型的catch()方法：在then()上做一层封装，只接收onRejected
 * 参数onRejected：onRejected处理程序，在期约拒绝时执行的回调
 * 支持无限链式回调，每个catch()方法返回新的Promise实例
 */
Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected)
}

/* 测试：Promise.prototype.catch */
// new Promise((resolve, reject) => {
//   reject(4) // 拒绝值为基本类型
//   // throw Error('error!') // 抛出错误
// }).catch(
//   /* onRejected处理程序 */
//   (err) => {
//     // console.log(err) // catch()前返回的Promise的拒绝理由
//   }
// )

/* 暂时还未实现：不少于2个的.then()链式调用 */
// new Promise((resolve, reject) => {
//   resolve(3)
// })
//   .then((res) => {
//     return res
//   })
//   .then((res) => {
//     console.log(res)
//   })

/** handle()方法：核心
 * 参数self：上一个then()前返回的Promise实例
 * 参数deferred：本次创建的Handler实例
 */
function handle(self, deferred) {
  // console.log(self, 'handle')
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
    // console.log(self)
  }

  /* 如果_state=0，即期约实例是pendding状态（还未执行onResolve或onReject处理程序） */
  /* 链式调用时，第二个或之后的then()前返回的Promise实例永远是新的Promise实例，其_state值为0 */
  if (self._state === 0) {
    self._deferreds.push(deferred) // 将Handler实例放入上一个then()前返回的Promise实例的_deferrends数组，由于上一个Handler实例的promise指向上一个Promise实例，因此上一个Handler实例也受到相应的影响
    // console.log(self, 'push')
    /* 
      Promise {
        _state: 0,
        _handled: false,
        _value: undefined,
        _deferreds: [
          Handler {
            onFulfilled: [Function (anonymous)],
            onRejected: [Function (anonymous)],
            promise: [Promise]
          }
        ]
      }
    */
    return // 同步执行到此暂停，等待异步执行（执行前一个Promise的then里面的onResolve）
  }

  /* 如果不是上述情况，标记当前进行的promise._handled为true */
  self._handled = true
  // console.log(self)

  /** 通过事件循环异步来做回调的处理
   * 注意：这里的事件是异步执行的，第二个then会比这里的方法先执行
   */
  Promise._immediateFn(function () {
    // console.log(deferred, '_immediateFn') // 注意：当有不少于2个.then()时，前一个.then()生成的Handler实例，其promise指向的Promise实例的_deferreds指向问题（后一个.then()里包含onFulfilled或onRejected回调函数，_deferreds不再指向空数组而是包含后一个Handler实例的数组）

    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected // 获取onFulfilled或onRejected处理程序

    /* 如果没有onFulfilled或onRejected回调函数，则携带当前的_value值，等待下一个Promise对象的回调 */
    if (cb === null) {
      // console.log(deferred.promise, self._value)
      ;(self._state === 1 ? resolve : reject)(deferred.promise, self._value)

      /**
       * resolve()或reject方法：等待下一个Promise对象的回调
       * 参数deferred.promise：Handler实例的promise，指向上一个then()前的Promise实例
       * 参数self._value：上一个then()前返回的Promise实例的_value属性值
       */
      // resolve(deferred.promise, self._value)
      // reject(deferred.promise, self._value)

      return
    }

    /* 如果有onFulfilled或onRejected回调函数，则执行自己的回调 */
    var ret
    try {
      /**
       * cb()方法：执行onFulfilled或onRejected处理程序
       * 参数self._value：then()前返回的Promise实例的解决值/拒绝理由
       */
      ret = cb(self._value) // 执行回调，返回值赋给ret
    } catch (e) {
      /**
       * reject()方法：处理下一个catch的回调方法
       * 参数deferred.promise：创建的Handler实例的promise属性，指向新的Promise实例
       * 参数e：错误信息
       */
      reject(deferred.promise, e)
      return
    }

    /**
     * resolve()方法：处理下一个then的回调方法
     * 参数deferred.promise：Handler实例的promise，指向上一个then()前的Promise实例
     * 参数ret：执行当前then回调的返回值
     */
    // console.log(deferred.promise, ret)
    resolve(deferred.promise, ret)
  })
}

/** finale()方法
 * 参数self：（期约）实例
 */
function finale(self) {
  // console.log(self, 'finale')

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

  /* 循环self._deferreds，每一项都执行handle()方法 */
  for (var i = 0, len = self._deferreds.length; i < len; i++) {
    /**
     * handle()方法
     * 参数self：（期约）实例
     * 参数self._deferreds[i]：当前的Handle实例对象
     */
    // console.log(self, self._deferreds[i])
    handle(self, self._deferreds[i])
  }

  self._deferreds = null // 全部执行后，将_deferreds数组重置为null
}

/* 完整的链式调用测试 */
// new Promise((resolve, reject) => {
//   resolve(3)
// })
//   .then((res) => {
//     console.log(res)
//     return 4
//   })
//   .then((res) => {
//     console.log(res)
//     return 5
//   })

/* 上述代码的完整调用流程：
  1.new Promise((resolve, reject) => {
      resolve(3)
    })
      执行new Promise，创建Promise实例，返回这个Promise实例
      执行doResolve()，同步立即执行执行器函数(resolve, reject) => {resolve(3)}
      执行resolve(3)，将Promise实例的_state赋为1、_value赋为3
      执行finale()，Promise实例的_deferreds为[]，赋为null后执行结束
    返回Promise实例：Promise { _state: 1, _handled: false, _value: 3, _deferreds: null }
  2..then((res) => {
      console.log(res)
      return 4
    })
      执行Promise.prototype.then，创建新Promise实例，传入空方法作为执行器函数，返回这个新的Promise实例
      执行new Handler，包装当前的onFulfilled处理程序(res) => {console.log(res);return 4}，返回Handler实例
      执行handle()，传入上一个then()前返回的Promise实例和Handler实例
        上一个Promise实例的_state为1，将其_handled赋为true，执行Promise._immediateFn()，将当前的onFulfilled处理程序放入异步线程1
    返回Promise实例：Promise { _state: 0, _handled: false, _value: undefined, _deferreds: [] }
  3..then((res) => {
      console.log(res)
      return 5
    })
      执行Promise.prototype.then，创建新Promise实例，传入空方法作为执行器函数，返回这个新的Promise实例
      执行new Handler，包装当前的onFulfilled处理程序(res) => {console.log(res);return 5}，返回Handler实例
      执行handle()，传入上一个then()前返回的Promise实例和Handler实例
        上一个Promise实例的_state为0，将本次的Hander实例放入其_deferreds空数组，return后因为暂无后续.then()，同步线程暂停
        上一个Promise实例变为：Promise { _state: 0, _handled: false, _value: undefined, _deferreds: [ Handler {} ]  }，Handler为本次的Handler实例
        重点来了：由于Handler实例的promise指向.then()中创建的Promise实例（prom），因此上一个Handler实例也受到影响，其promise指向的Promise实例（即上一个Promise实例）的_deferreds同样指向[ Handler {} ]
      回到异步线程1，执行上一个Handler实例包装的onFulfilled处理程序，打印3，返回4
      执行resolve()，传入上一个Handler实例的promise（指向已发生变化的Promise实例）和onFulfilled返回值（4），将_state赋为1、_value赋为4
        此时已发生变化的Promise实例更新为Promise { _state: 1, _handled: false, _value: 4, _deferreds: [ Handler {} ]  }
      执行finale()，传入更新的Promise，循环_deferreds数组
      执行handle()，传入更新的Promise实例和本次的Handler实例
        更新的Promise实例的_state为1，将其_handled赋为true，执行Promise._immediateFn()，将当前的onFulfilled处理程序放入异步线程2（嵌套在异步线程1中）
      由于没有同步线程了，直接来到异步线程2，执行本次Handler实例包装的onFulfilled处理程序，打印4，返回5
      执行resolve()，传入本次Handler实例的promise（未发生变化，初始的Promise实例）和onFulfilled返回值（5），将_state赋为1、_value赋为5
        此时Promise实例更新为Promise { _state: 1, _handled: false, _value: 5, _deferreds: []  }
      执行finale()，传入更新的Promise，其_deferreds为[]，赋为null后执行结束
    返回Promise实例：Promise { _state: 0, _handled: false, _value: undefined, _deferreds: [] }
*/

/* 中间的.then()或catch()没有回调测试 */
// new Promise((resolve, reject) => {
//   resolve(3)
// })
//   .then() // 没有回调，等待下个Promise的回调
//   .then((res) => {
//     console.log(res)
//   })

// new Promise((resolve, reject) => {
//   reject(4)
// })
//   .catch() // 没有回调，等待下个Promise的回调
//   .catch((res) => {
//     console.log(res)
//   })

/** Promise构造函数的all()方法
 * 参数arr：可迭代对象
 */
Promise.all = function (arr) {
  // 返回一个新期约
  return new Promise(function (resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.all accepts an array')) // 参数必须可迭代
    }
    var args = Array.prototype.slice.call(arr) // Array原型的slice方法，利用call绑定给arr（避免有自定义的slice方法）
    if (args.length === 0) return resolve([]) // 若可迭代对象长度为0，则立即执行执行器函数并返回，参数为空数组
    // ↑相当于：new Promise((resolve, reject) => resolve([]))

    var remaining = args.length

    /**
     * res()方法
     * 参数i：可迭代对象下标
     * 参数val：可迭代对象的项
     */
    function res(i, val) {
      try {
        // console.log(args[i], val)

        /* 如果该项为对象或函数对象，则对其then属性做特殊处理 */
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then
          // 如果then属性是一个函数（val是Promise类型或thenable对象）
          if (typeof then === 'function') {
            /* 将该项的then方法体内的this指向该项本身，并执行then()
               Promise.prototype.then原本接受2个参数onFulfilled和onRejected，将function(val){}和reject回调分别作为这两个方法传给.then()
               执行.then() 
                -> 创建Handler实例 
                -> 调用handle方法 
                -> handle方法中根据_state进行下一步操作 
                -> 调用Promise._immediateFn 
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

        /* 重写该项，若该项为期约则被重写为其解决值/拒绝理由，若为其他则不变 */
        args[i] = val
        // console.log(args[i], val)

        /* 若所有的项都执行完毕，则执行执行器函数的resolve回调，参数为处理后的可迭代对象 */
        if (--remaining === 0) {
          resolve(args) // doResolve()内部的done控制着resolve/reject方法只执行一次
        }
      } catch (ex) {
        /* 只要其中一项出现异常，则全部执行退出，进入catch异常处理 */
        reject(ex) // doResolve()内部的done控制着resolve/reject方法只执行一次
      }
    }

    /* 循环可迭代对象，针对每一项执行res()方法 */
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

// isArray方法：判断对象是否可迭代
function isArray(x) {
  return Boolean(x && typeof x.length !== 'undefined')
}

setTimeout(
  console.log,
  0,
  // Promise.all(1)
  // Promise.all([])
  // new Promise((resolve, reject) => resolve([]))
  // Promise.all([1, 2, 3])
  // Promise.all([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)])
  // Promise.all([
  //   Promise.resolve(true),
  //   Promise.resolve(true),
  //   Promise.resolve(true),
  // ])
  Promise.all([Promise.resolve(1), Promise.reject(2), Promise.resolve(3)])
)
