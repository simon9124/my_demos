/** Polyfill for Function.prototype.bind
 * 手写bind方法
 */
function bind(fn, thisArg) {
  return function () {
    fn.apply(thisArg, arguments)
  }
}

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
        // doResolve(bind(then, newValue), self) // 将then方法bind，确保期约实例能够调用then方法
        doResolve(function () {
          return then.apply(newValue, arguments) // 将then方法体内的this指向newValue
        }, self)
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

function finale(self) {
  if (self._state === 1) {
    console.log('resolve:' + self._value)
  } else if (self._state === 2) {
    console.log('reject:' + self._value)
  } else if (self._state === 3) {
    console.log('resolve value is Promise')
  }
}

new Promise((resolve, reject) => {
  // resolve(3)
  // reject(3)
  // resolve({ val: 3 })
  // resolve(
  //   new Promise((resolve, reject) => {
  //     resolve(3)
  //   })
  // )
  resolve({
    then: function () {
      console.log('thenable function')
    },
  })
  // throw Error('error!')
})
