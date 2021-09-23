<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB1.md" target="_blank">Promise 源码解读 1</a><br>
<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB2.md" target="_blank">Promise 源码解读 2</a><br>
<a href="" target="_blank">Promise 源码解读 3</a><br>
<a href="" target="_blank">Promise 源码解读 4</a><br>

<a href="" target="_blank">完整代码+注释</a>，可对照阅读

## Promise.then - 源码

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
  var prom = new this.constructor(noop) // 等效于 var prom = new Promise(noop)
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

- 每次调用`Promise.then`时，都会新创建一个 Handler 实例

## Handler 构造函数 - 源码

```js
/** Handler构造函数：打包onFulfilled、onRejected和promise，作为一个整体方便后面调用
 * 参数onFulfilled：resolve回调函数
 * 参数onRejected：reject回调函数
 * 参数promise：下一个promise实例对象
 */
function Handler(onFulfilled, onRejected, promise) {
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null // 是否有成功回调，若没有则赋为null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null // 是否有失败回调，若没有则赋为null
  this.promise = promise // Handler的promise，指向prom，即在.then()中创建的Promise实例
  // console.log(this.promise, 'new Handler')
  // console.log(this)
}
```

- 接收 3 个参数：成功回调、失败回调和`then`后面的`Promise`对象

## finale() - 测试代码

- 更新手写的测试`finale()`方法，加入浏览器警告，方便做阶段测试

```js

```

-

## - 阶段测试

```js

```

## 实现结果总结

-

<a href="" target="_blank">本节完整代码</a>
