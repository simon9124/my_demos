<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB1.md" target="_blank">Promise 源码解读 1</a><br>
<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB2.md" target="_blank">Promise 源码解读 2</a><br>
<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB3.md" target="_blank">Promise 源码解读 3</a><br>
<a href="" target="_blank">Promise 源码解读 4</a><br>

<a href="" target="_blank">完整代码+注释</a>，可对照阅读

## Promise.prototype.then - 源码

```js
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
```

- `then`指向的函数中的`this`，指向当前`then`前返回的`Promise`实例，因此`this.constructor`指向`Promise`构造函数
- 每次调用`Promise.then`时：
  - 将空方法`noop`作为执行器函数，调用`new this.constructor()`创建一个新的空`Promise`实例
  - 还会新创建一个`Handler`实例，然后调用`handle()`方法
  - 最终都**返回新创建的期约实例**，这是为了**支持无限链式回调**
  - “调用下一个`.then()`会将上一个`Promise`实例的`_deferreds`数组改变”，可后续再研究

## Handler 构造函数 - 源码

```js
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
```

- 接收 3 个参数：成功回调、失败回调新的空`promise`实例

## handle() - 测试代码

- 在源码的基础上加以简化，方便做阶段测试

```js
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
```

- `then`前返回的期约实例，根据`_state`值的不同，做不同的处理
  - 返回非待定的期约，最终会执行`then`中的处理程序
  - 返回待定的期约，则不会执行`then`中的处理程序，但**会将`then`中生成的`Handler`实例放入`then`前`Promise`实例的`_deferreds`数组**
- 执行`then`中的处理程序是**异步**的，会在所有同步操作都执行完才去执行

## Promise.prototype.then - 阶段测试

```js
new Promise((resolve, reject) => {}).then(() => {
  console.log(3) // then前是未解决的期约，期约解决前不会执行处理程序
})
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

new Promise((resolve, reject) => {
  /* 实际执行首个resolve或reject后，后续的resolve或reject不会再执行，这里仅把测试结果合并 */

  resolve(3) // 打印res为3，解决值为基本类型
  /* self为Promise { _state: 1, _handled: true, _value: 3, _deferreds: [] } */
  resolve({ val: 3 }) // 打印res为{ val: 3 }，解决值为普通对象
  /* self为Promise { _state: 1, _handled: true, _value: { val: 3 }, _deferreds: [] } */
  resolve(new Promise(() => {})) // 不打印res，解决值为pending的期约实例
  /* self与new Promise((resolve, reject) => {}).then()基本相同，onFulfilled不再是null*/
  resolve(Promise.resolve(3)) // 打印res为3，解决值为fullfilled的期约实例，将fullfilled的解决值赋给self
  /* self为Promise { _state: 1, _handled: true, _value: 3, _deferreds: [] } */
  resolve({
    // 解决值为thenable对象
    value: 3,
    then: function () {
      console.log(this) // { value: 3, then: [Function: then] }
      console.log(this.value) // 3
    },
  })
  /* self与resolve(new Promise(() => {}))相同 */
}).then((res) => {
  console.log(res) // then()前返回的Promise的解决值
})

new Promise((resolve, reject) => {
  reject(3) // 打印res为3
  /* self为Promise { _state: 2, _handled: true, _value: 3, _deferreds: [] } */
}).then(null, (err) => {
  console.log(err) // then()前返回的Promise的拒绝理由
})
```

- 大体有了链式回调的雏形：
  - 能够根据`Promise`实例的状态，获取其解决值/拒绝理由，并执行相应的处理程序（`onResolve`或`onReject`）
- `pedding`状态的期约调用`then`后，会将`then`中生成的`Handler`实例放入其`_deferreds`数组

## Promise.prototype.catch - 源码

```js
/** Promise原型的catch属性，指向函数
 * 参数onRejected：onRejected处理程序，在期约拒绝时执行的回调
 * 支持无限链式回调，每个catch()方法返回新的Promise实例
 */
Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected)
}
```

- 在`Promise.prototype.then`上做一层封装，只接收`onRejected`处理程序

## Promise.prototype.catch - 阶段测试

```js
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
```

- 与`Promise.prototype.then`的结果大致相同，需区分`catch`前期约的拒绝理由是`Promise`实例的情况

## 实现结果总结

- 单个`Promise.prototype.then`和`Promise.prototype.catch`的链式回调（多个还未实现）

<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB3.js" target="_blank">截至本节的代码 →</a>
