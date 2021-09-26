<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB1.md" target="_blank">Promise 源码解读 1</a><br>
<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB2.md" target="_blank">Promise 源码解读 2</a><br>
<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB3.md" target="_blank">Promise 源码解读 3</a><br>
<a href="" target="_blank">Promise 源码解读 4</a>

<a href="" target="_blank">完整代码+注释</a>，可对照阅读

## Promise.resolve - 源码

```js
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
```

- 调用`Promise.resolve()`，相当于`new Promise(resolve=>{resolve()})`，参数作为解决值
- 若参数为`Promise`对象，则返回这个对象

## Promise.reject - 源码

```js
/** Promise构造函数的reject属性，指向函数
 * 参数value：拒绝理由
 */
Promise.reject = function (value) {
  /* 返回新的Promise实例并调用其失败回调，参数作为拒绝理由 */
  return new Promise(function (resolve, reject) {
    reject(value)
  })
}
```

- 调用`Promise.reject`，相当于`new Promise(resolve=>{reject()})`，参数作为拒绝理由
- **与`Promise.resolve()`不同的是**，即便参数为`Promise`对象，也将其整体作为`new Promise`失败回调时的拒绝理由

## Promise.resolve & Promise.reject - 阶段测试

- `Promise.resolve`和`Promise.reject`其实就是`new Promise`的封装，注意观察**参数为`Promise`实例时二者结果上的不同**

```js
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
```

## Promise.\_immediateFn - 源码

```js
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
```

- 根据浏览器是否有`setImmediate`方法，指向不同
- 但殊途同归，都是**异步执行**传入的方法

## Promise.\_unhandledRejectionFn - 源码

```js
/** Promise构造函数的_unhandledRejectionFn属性，指向函数
 * 参数err：拒绝理由
 */
Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
  if (typeof console !== 'undefined' && console) {
    console.warn('Possible Unhandled Promise Rejection:', err) // 浏览器给出警告
  }
}
```

- 封装：失败回调时，在浏览器给出警告

## finale() - 测试代码

- 更新手写的测试`finale()`方法，加入浏览器警告，使其更趋近于源码，方便做阶段测试

```js
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
```

- 如果是失败回调（拒绝的期约），且`_deferreds`数组长度为 0，则给出警告
- `_deferreds`数组长度由`Promise.reject()`后面是否有`catch`决定，详见后续

## 浏览器警告 - 阶段测试

```js
new Promise((resolve, reject) => {
  reject(2) // Possible Unhandled Promise Rejection: 2
})
Promise.reject(3) // Possible Unhandled Promise Rejection: 3
Promise.resolve(Promise.reject(4)) // Possible Unhandled Promise Rejection: 4
Promise.reject(Promise.reject(5)) // Possible Unhandled Promise Rejection: Promise { _state: 2, _handled: false, _value: 5, _deferreds: [] }
```

## 实现结果总结

- `Promise.resolve`和`Promise.reject`对`new Promise`的基础上加以封装
- `Promise.resolve`的参数若是期约，则返回该期约
- 失败的回调暂时会在浏览器给出警告

<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB2.js" target="_blank">截至本节的代码 →</a>
