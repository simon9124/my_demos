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

/** Promise原型的catch属性，指向函数
 * 参数onRejected：onRejected处理程序，在期约拒绝时执行的回调
 * 支持无限链式回调，每个catch()方法返回新的Promise实例
 */
Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected)
}

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

    var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected // 根据上一个then()前的Promise实力的_state，获取onFulfilled或onRejected处理程序
    // console.log(cb)

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

/* isArray方法：判断对象是否为数组 */
function isArray(x) {
  return Boolean(x && typeof x.length !== 'undefined')
}

/** Promise构造函数的all属性，指向函数
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
                -> 创建Handler实例（this指向then前的Promise实例，即该项本身）
                -> 调用handle方法，根据_state进行下一步操作
                  -> 如_state为1，则调用Promise._immediateFn 
                  -> 调用onFulfilled（即function(val)），参数为期约的_value值，即调用function(self._value)
                  （若_state为0，则将Handler实例放入then()前Promise实例（该项本身）的_deferrends数组，同步执行暂停，整端代码执行终止，返回该项，即待定的期约）
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

        /* 重写该项：若该项为解决的期约则被重写为其解决值/拒绝理由，若为非期约则不变 */
        args[i] = val
        // console.log(args[i], val)
        // console.log(args)

        /* 若所有的Promise都执行完毕（没有待定的），则执行执行器函数的resolve回调，参数为处理后的数组 */
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

/* 测试：Promise.all */
// setTimeout(
//   console.log,
//   0,
//   Promise.all(), // 参数不是数组
//   /* Promise { _state: 2, _handled: false, _value: 'TypeError: Promise.all accepts an array', _deferreds: null } */
//   Promise.all([]), // 参数是空数组
//   /* Promise { _state: 1, _handled: false, _value: [], _deferreds: null } */
//   new Promise((resolve, reject) => resolve([])), // 等效于Promise.all([])
//   Promise.all([1, 2, 3]), // 参数是数组，数组的每项不是Promise对象
//   /* Promise { _state: 1, _handled: false, _value: [ 1, 2, 3 ], _deferreds: null } */
//   Promise.all([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]), // 参数是数组，数组的每项是解决的Promise对象
//   /* Promise { _state: 1, _handled: false, _value: [ 1, 2, 3 ], _deferreds: null } */
//   Promise.all([
//     Promise.resolve(true),
//     Promise.resolve(true),
//     Promise.resolve(true),
//   ]),
//   /* Promise { _state: 1, _handled: false, _value: [true, true, true], _deferreds: null } */
//   Promise.all([Promise.resolve(1), Promise.reject(2), Promise.resolve(3)]), // 参数是数组，数组中有拒绝的Promise对象
//   /* Promise { _state: 2, _handled: false, _value: 2, _deferreds: null } */
//   Promise.all([Promise.resolve(1), new Promise(() => {}), Promise.resolve(3)]) // 参数是数组，数组中有待定的Promise对象
//   /* Promise { _state: 0, _handled: false, _value: undefined, _deferreds: null } */
// )

/** Promise构造函数的race属性，指向函数
 * 参数arr：数组
 */
Promise.race = function (arr) {
  // 返回一个新期约
  return new Promise(function (resolve, reject) {
    if (!isArray(arr)) {
      return reject(new TypeError('Promise.race accepts an array')) // 参数必须是数组
    }
    /* 循环数组，针对每一项执行resolve()和.then()方法（若参数为空数组，则不执行，返回待定的期约） */
    for (var i = 0, len = arr.length; i < len; i++) {
      /**
       * Promise.resolve()方法
       * 参数arr[i]：数组项
       */
      Promise.resolve(arr[i]) // 返回新期约
        /* Promise.prototype.then()方法
           Promise.prototype.then原本接受2个参数onFulfilled和onRejected，将fn的resolve和reject回调分别作为这两个方法传给.then()
           -> 创建Handler实例（this指向then前的Promise实例，即Promise.resolve()返回的新期约）
           -> 调用handle方法，根据_state进行下一步操作
              -> 如_state为1，则调用Promise._immediateFn
              -> 调用onFulfilled，参数为期约的_value值，即调用function(self._value)
        */
        .then(resolve, reject) // doResolve()内部的done控制着resolve/reject方法只执行一次，因此只有最先落定（解决或拒绝）的Promise执行了resolve/reject，后面的Promise都不执行
    }
  })
  // 以Promise.race([3, 2, 1])为例，可以简化为new Promise((resolve,reject)=>{Promise.resolve(3).then(resolve, reject)})
}

/* 测试：Promise.race */
// setTimeout(
//   console.log,
//   0,
//   Promise.race(), // 参数不是数组
//   /* Promise { _state: 2, _handled: false, _value: 'TypeError: Promise.race accepts an array', _deferreds: null } */
//   Promise.race([]), // 参数是空数组
//   /* Promise { _state: 0, _handled: false, _value: undefined, _deferreds: null } */
//   Promise.race([3, 2, 1]), // 参数是数组，数组的每项不是Promise对象
//   /* Promise { _state: 1, _handled: false, _value: 3, _deferreds: null } */
//   Promise.resolve(3), // 等效于Promise.race([3, 2, 1])
//   /* Promise { _state: 1, _handled: false, _value: 3, _deferreds: null } */
//   Promise.race([Promise.resolve(3), Promise.resolve(2), Promise.resolve(1)]), // 参数是数组，最先落定解决的Promise对象
//   /* Promise { _state: 1, _handled: false, _value: 3, _deferreds: null } */
//   Promise.race([Promise.reject(1), Promise.resolve(2), Promise.resolve(3)]), // 参数是数组，最先落定拒绝的Promise对象
//   /* Promise { _state: 2, _handled: false, _value: 1, _deferreds: null }
//      Possible Unhandled Promise Rejection: 1 */
//   Promise.race([new Promise(() => {}), Promise.resolve(2), Promise.resolve(1)]) // 参数是数组，最先落定解决的Promise对象
//   /* Promise { _state: 1, _handled: false, _value: 2, _deferreds: null } */
// )

/** Promise原型的finally属性，指向函数
 * 参数callback：onFinally处理程序，在期约无论兑现还是拒绝后，最终执行的回调
 */
Promise.prototype['finally'] = function (callback) {
  // console.log(this, 'finally') // this指向finally()前返回的Promise实例
  // console.log(this.constructor) // constructor指向Promise构造函数
  // console.log(this.constructor === Promise) // true
  var constructor = this.constructor

  /* 调用Promise.prototype.then()方法，以下文setTimeout中的测试为例：
     -> 创建Handler实例（this指向finally()前的Promise实例），创建新Promise实例
     -> 调用handle()，_state为1，调用Promise._immediateFn，调用onFulfilled，调用后返回Promise实例（调用过程见onFulfilled内部）
     -> 调用resolve()，传入Handler实例的promise和onFulfilled返回值（是一个Promise实例），将_state赋值为3，_value赋值为onFulfilled返回的Promise实例
     -> 调用finale()，其_deferreds为[]，赋为null后执行结束
     -> 返回.then()内部创建的Promise实例：
        Promise { 
          _state: 3,
          _handled: false,
          _value: Promise {
            _deferreds: null,
            _handled: false,
            _state: 1,
            _value: 2,
          }
          _deferreds: null
        }
  */
  return this.then(
    /* onFulfilled处理程序 */
    function (value) {
      /* 调用过程，以下文setTimeout中的测试为例：
        -> 调用callback，打印finally3，返回3
        -> 调用Promise.resolve()，创建解决的Promise实例，解决值为callback返回值3
           此时then前的Promise实例为：Promise { _state: 1, _handled: false, _value: 3, _deferreds: null }
        -> 调用.then()（内部this指向Promise.resolve()返回的期约，_state为1，_value为3），创建Handler实例（只有onFulfilled），创建新Promise实例
        -> 调用handle()，内部state为1，将handled置为true，调用Promise._immediateFn，调用onFulfilled（即：function() {return value}），返回的value是finally前Promise实例的_value，即2
        -> 调用resolve()，传入Handler实例的promise和onFulfilled返回值2，将_state赋值为1，_value赋值为2
        -> 调用finale()，其_deferreds为[]，赋为null后执行结束
        -> 返回.then()内部创建的Promise实例（作为参数，传递给上层resolve()方法）
           返回的Promise实例为：Promise { _state: 1, _handled: false, _value: 2, _deferreds: null }
      */
      // return constructor.resolve(callback())
      return constructor.resolve(callback()).then(function () {
        // console.log(value) // finally()前返回的Promise实例的解决值
        return value
      })
    },
    /* onRejected处理程序 */
    function (reason) {
      return constructor.resolve(callback()).then(function () {
        // console.log(reason) // finally()前返回的Promise实例的拒绝理由
        return constructor.reject(reason) // 与onFulfilled不同的是，内部返回拒绝的期约，拒绝理由为finally()前Promise实例的拒绝理由
        /* 
          Promise._immediateFn最后一步均为调用resolve()方法，第二个参数若不是期约，则_state值会在resolve()中被赋为1
          因此为了区分与onFulfilled的区别，返回拒绝的期约（而不是拒绝理由），第二个参数是期约，_state值在resolve()中被赋为3
          因此最终返回的期约，会多嵌套一层Promise（onFulfilled嵌套2层，onRejected嵌套3层），最内层为这个拒绝的期约
          Promise { 
            _state: 3,
            _handled: false,
            _value: Promise {
              _deferreds: null,
              _handled: false,
              _state: 3,
              _value: Promise { // 最内层为拒绝的期约
                _deferreds: null,
                _handled: false,
                _state: 2, // 此处的_state
                _value: 2
              }
            }
            _deferreds: null
          }
        */
      })
    }

    /* 内层Promise实例赋给外层Promise实例的_value，逐层依次赋值递推 */
  )
}

/* 测试：Promise.prototype.finally */
// setTimeout(
//   console.log,
//   0,
//   Promise.resolve(2).finally(() => {
//     console.log('finally3') // 打印'finally3'
//     return 3
//   })
//   /* Promise为
//     Promise {
//       _state: 3,
//       _handled: false,
//       _value: Promise {
//         _state: 0,
//         _handled: false,
//         _value: undefined,
//         _deferreds: null
//       },
//       _deferreds: null
//     }
//   */
//   Promise.reject(2).finally(() => {
//     console.log('finally4') // 打印'finally4'
//     return 4
//   })
//   /* Promise为
//     Promise {
//       _state: 3,
//       _handled: false,
//       _value: Promise {
//         _state: 3,
//         _handled: false,
//         _value: Promise {
//           _state: 2,
//           _handled: false,
//           _value: 2,
//           _deferreds: null
//         },
//         _deferreds: null
//       },
//       _deferreds: null
//     }
//   */
// )

/** Promise构造函数的allSettled属性，指向函数
 * 参数arr：数组
 */
Promise.allSettled = function (arr) {
  // console.log(this) // this指向Promise构造函数
  var P = this

  // 返回一个新期约
  return new P(function (resolve, reject) {
    // 参数必须是数组
    if (!(arr && typeof arr.length !== 'undefined')) {
      return reject(
        new TypeError(
          typeof arr +
            ' ' +
            arr +
            ' is not iterable(cannot read property Symbol(Symbol.iterator))'
        )
      )
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
      // console.log(args[i], val) // args[i]和val最初是一样的

      /* 如果该项为对象或函数对象，则对其then属性做特殊处理 */
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        var then = val.then
        // 如果then指向一个函数（val是Promise类型或thenable对象），则做处理
        if (typeof then === 'function') {
          /* 将该项的then方法体内的this指向该项本身，并执行then()
             Promise.prototype.then原本接受2个参数onFulfilled和onRejected，将function(val){}和function(e){}回调分别作为这两个方法传给.then()
             -> 创建Handler实例（this指向then前的Promise实例，即该项本身）
             -> 调用handle方法，根据_state进行下一步操作
               -> 如_state为1，则调用Promise._immediateFn
               -> 调用onFulfilled（即function(val)），参数为期约的_value值，即调用function(self._value)
               （若_state为0，则将Handler实例放入then()前Promise实例（该项本身）的_deferrends数组，同步执行暂停，整端代码执行终止，返回该项，即待定的期约）
          */
          then.call(
            val,
            function (val) {
              res(i, val) // 将期约的_value值作为val，再次调用res方法
            },
            function (e) {
              args[i] = { status: 'rejected', reason: e } // 将该项重写为{status:'rejected',reason:错误原因}
              /* 若所有的项都执行完毕，则执行执行器函数的resolve回调，参数为处理后的数组 */
              if (--remaining === 0) {
                resolve(args)
              }
            }
          )
          return
        }
      }

      /* 重写该项：
         若该项为解决的期约，则被重写为{status:'fulfilled',value:解决值}
         若该项为拒绝的期约，则被重写为{status:'rejected',reason:拒绝理由}
         若该项为非期约，则被重写为对象{status:'fulfilled',value:该项}
      */
      args[i] = { status: 'fulfilled', value: val }
      // console.log(args[i], val)
      // console.log(args)

      /* 若所有的Promise都执行完毕（没有待定的），则执行执行器函数的resolve回调，参数为处理后的数组 */
      if (--remaining === 0) {
        resolve(args) // doResolve()内部的done控制着resolve/reject方法只执行一次
      }
    }

    /* 循环数组，针对每一项执行res()方法 */
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

/* 测试：Promise.allSettled */
setTimeout(
  console.log,
  0,
  Promise.allSettled(), // 参数不是数组
  /* Promise { _state: 2, _handled: false, _value: 'TypeError: undefined undefined is not iterable(cannot read property Symbol(Symbol.iterator))', _deferreds: null } */
  Promise.allSettled([]), // 参数是空数组
  /* Promise { _state: 1, _handled: false, _value: [], _deferreds: null } */
  Promise.allSettled([3, 2, 1]), // 参数是数组，数组的每项都不是Promise对象
  /* 
    Promise {
      _state: 1,
      _handled: false,
      _value: [
        { status: 'fulfilled', value: 3 },
        { status: 'fulfilled', value: 2 },
        { status: 'fulfilled', value: 1 }
      ],
      _deferreds: null
    }
  */
  Promise.allSettled([
    Promise.resolve(3),
    Promise.resolve(2),
    Promise.resolve(1),
  ]), // 参数是数组，每项都是解决的Promise对象
  /* 
    Promise {
      _state: 1,
      _handled: false,
      _value: [
        { status: 'fulfilled', value: 3 },
        { status: 'fulfilled', value: 2 },
        { status: 'fulfilled', value: 1 }
      ],
      _deferreds: null
    }
  */
  Promise.allSettled([
    Promise.resolve(1),
    Promise.reject(2),
    Promise.resolve(3),
  ]), // 参数是数组，每项都是Promise对象，有拒绝的期约
  /* 
    Promise {
      _state: 1,
      _handled: false,
      _value: [
        { status: 'fulfilled', value: 1 },
        { status: 'rejected', reason: 2 },
        { status: 'fulfilled', value: 3 }
      ],
      _deferreds: null
    }
  */
  Promise.allSettled([
    Promise.resolve(2),
    new Promise(() => {}),
    Promise.resolve(1),
  ]) // 参数是数组，每项都是Promise对象，有待定的期约
  /* Promise { _state: 0, _handled: false, _value: undefined, _deferreds: [] } */
)
