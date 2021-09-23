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

/* 测试：Promise.resolve和Promise.reject */
Promise.resolve(3) // 'resolve:3'，解决值为基本类型
/* self为Promise { _state: 1, _handled: false, _value: 3, _deferreds: [] } */
Promise.resolve({ val: 3 }) // 'resolve:[object Object]'，解决值为普通对象
/* self为Promise { _state: 1, _handled: false, _value: { val: 3 }, _deferreds: [] } */
Promise.resolve(Promise.resolve(3)) // 'resolve:3'，解决值为期约实例
/* self为Promise { _state: 1, _handled: false, _value: 3, _deferreds: [] } */
Promise.resolve({
  // 解决值为thenable对象
  value: 3,
  then: function () {
    console.log(this) // { value: 3, then: [Function: then] }，this指向解决值本身
    console.log(this.value) // 3
  },
})
Promise.reject(3) // 'reject:3'，拒绝理由为基本类型
/* self为Promise { _state: 2, _handled: false, _value: 3, _deferreds: [] } */
Promise.reject(Promise.resolve(3)) // 'reject:[object Object]'，拒绝理由为期约实例（此处与Promise.resolve()区分）
/* self为Promise { _state: 2, _handled: false, _value: Promise { _state: 1, _handled: false, _value: 3, _deferreds: [] }, _deferreds: [] } */

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

/* 测试：浏览器警告 */
new Promise((resolve, reject) => {
  reject(2) // Possible Unhandled Promise Rejection: 2
})
Promise.reject(3) // Possible Unhandled Promise Rejection: 3
Promise.resolve(Promise.reject(4)) // Possible Unhandled Promise Rejection: 4
Promise.reject(Promise.reject(5)) // Possible Unhandled Promise Rejection: Promise { _state: 2, _handled: false, _value: 5, _deferreds: [] }
