<a href="" target="_blank">Promise 源码解读（一）</a>
<a href="" target="_blank">Promise 源码解读（二）</a>
<a href="" target="_blank">Promise 源码解读（三）</a>
<a href="" target="_blank">Promise 源码解读（四）</a>

市面上有很多 Promise 库，本文选取一个轻量级的<a href="https://github.com/taylorhakes/promise-polyfill" target="_blank">Promise polyfill</a>，逐步实现解析

如果对`Promise`还不熟悉，<a href="https://github.com/simon9124/my_demos/blob/master/javascript%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC%E5%9B%9B%E7%89%88%EF%BC%89/%E7%AC%AC11%E7%AB%A0%20%E6%9C%9F%E7%BA%A6%E4%B8%8E%E5%BC%82%E6%AD%A5%E5%87%BD%E6%95%B0/11.2.%E6%9C%9F%E7%BA%A6.md" target="_blank">请先移步</a>

## Promise 构造函数（源码）

```js
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
```

- 调用`new Promise`生成`Promise`实例，其参数必须是`function`类型
- 内部设置**状态码**、**是否被处理**、**解决值/拒绝理由**及**缓存`then()`方法传入的回调**
- 立即调用的`doResolve()`方法

## doResolve 方法（源码）

```js
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
```

- 初始化`done`为`false`，一旦执行`resolve`或`reject`回调将其赋为`true`，确保回调只执行一次
- **立即执行**执行器函数，证实了执行`new Promise`时的代码是**同步**的
- 立即调用`resolve()`（resolve 回调时）或`reject()`（resolve 回调或抛出错误时）方法

## resolve() 方法（源码）
