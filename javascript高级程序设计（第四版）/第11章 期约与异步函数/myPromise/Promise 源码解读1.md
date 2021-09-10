<a href="" target="_blank">Promise 源码解读（一）</a>
<a href="" target="_blank">Promise 源码解读（二）</a>
<a href="" target="_blank">Promise 源码解读（三）</a>
<a href="" target="_blank">Promise 源码解读（四）</a>

市面上有很多 Promise 库，本文选取一个轻量级的<a href="https://github.com/taylorhakes/promise-polyfill" target="_blank">Promise polyfill</a>，逐步实现解析

如果对`Promise`还不熟悉，<a href="https://github.com/simon9124/my_demos/blob/master/javascript%E9%AB%98%E7%BA%A7%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1%EF%BC%88%E7%AC%AC%E5%9B%9B%E7%89%88%EF%BC%89/%E7%AC%AC11%E7%AB%A0%20%E6%9C%9F%E7%BA%A6%E4%B8%8E%E5%BC%82%E6%AD%A5%E5%87%BD%E6%95%B0/11.2.%E6%9C%9F%E7%BA%A6.md" target="_blank">请先移步</a>

## Promise 构造函数 - 源码

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

## doResolve() - 源码

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
  - 如果抛出错误，则调用`reject()`方法

## resolve() - 源码

```js
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
```

- `resolve`回调的解决值不能为期约实例本身，否则将导致无限循环
- 如果是`Promise`对象，则将期约的`_state`和`_value`分别赋值，然后执行`finale()`方法
- 如果是`thenable`对象（非`Promise`），则对其`then`方法继续执行`doResolve`（用`bind`方法重写了该过程，可参考注释，先从未重写的入手）
  - 整个`function`作为执行器方法传给`doResolve()`，立即调用执行器方法返回`then.apply(newValue, arguments)`
  - 将解决值的`then`方法体内的`this`指向解决值本身，并执行`then()`
- 如果不是上述 2 种，也将期约的`_state`和`_value`分别赋值，也执行`finale()`方法
- 如果抛出错误，则调用`reject()`方法

## bind() - 源码

```js
/** Polyfill for Function.prototype.bind
 * 用apply写bind方法
 */
function bind(fn, thisArg) {
  return function () {
    fn.apply(thisArg, arguments)
  }
}
```

## reject() - 源码

```js
/** reject()方法
 * 参数self：（期约）实例
 * 参数newValue：拒绝理由
 */
function reject(self, newValue) {
  self._state = 2 // reject的时候，_state = 2
  self._value = newValue // 把拒绝理由赋给期约实例的_value属性
  finale(self)
}
```

- 过程与`resolve()`大致相同，将期约的`_state`和`_value`分别赋值，而后执行`finale()`方法

## finale() - 测试一下

- 创建一个`Promise`实例，阶段性测试一下到此时的执行效果

```js
/** 测试用的finale()方法
 * 参数self：（期约）实例
 */
function finale(self) {
  if (self._state === 1) {
    console.log('resolve:' + self._value)
  } else if (self._state === 2) {
    console.log('reject:' + self._value)
  } else if (self._state === 3) {
    console.log('resolve value is Promise')
  }
}
```

- 根据
