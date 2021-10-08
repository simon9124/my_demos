<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB1.md" target="_blank">Promise 源码解读 1</a><br>
<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB2.md" target="_blank">Promise 源码解读 2</a><br>
<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB3.md" target="_blank">Promise 源码解读 3</a><br>
<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB4.md" target="_blank">Promise 源码解读 4</a><br>
<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB5.md" target="_blank">Promise 源码解读 5</a><br>

<a href="" target="_blank">完整代码+注释</a>，可对照阅读

## 多个 then 串联 - 遗留的问题

```js
/* 暂时还未实现：不少于2个的.then()链式调用 */
new Promise((resolve, reject) => {
  resolve(3)
})
  .then((res) => {
    /* 调用第1个then时，prom为当前then前返回的期约实例，是解决的期约实例，解决值为3
       在handle()里打印self为Promise { _state: 1, _handled: true, _value: 3, _deferreds: [] }
       将继续异步执行处理程序 */
    return res
  })
  .then((res) => {
    /* 调用第2个then时，prom为当前then前返回的期约实例，是第1个then返回的prom，是一个新创建的、未解决的期约实例
    将当前then中生成的Handler实例放入当前then前返回的期约实例的_deferreds数组，然后暂停并返回
    此时handle()里打印self为Promise { _state: 0, _handled: false, _value: undefined, _deferreds: [ Handler {...} ] } */
    console.log(res) // 不打印res，第2个then及后面的处理程序，暂时还未实现
  })
```

- 多个`then`链式调用时，从第 2 个`then`开始，`then`前返回的`Promise`实例都是`pending`状态的空期约实例，因此都会**将`Handler`实例放入`then`前返回的`Promise`实例的`_deferreds`数组**
- 本节将详细讲解`handle()`和`finale()`2 个方法，**重点剖析`Promise`实例的`_deferreds`数组在放入`Handler`实例后的操作**，应反复阅读

## handle() - 源码

- 终于到了`handler()`的源码！其实仅比上一节的测试代码完善了一些内容，我们**主要观察多个`then`的串联**（以 2 个为例）

```js
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
```

- 第 2 个`then`前返回的`Promise`实例一定是`pending`状态，**因此第 2 个`then`中生成的`Handler`实例会放入第 2 个`then`前返回的`Promise`实例的`_deferreds`数组**
- **重点来了**，还记得`Handler`构造函数么？
  - 每调用 1 次`then`，都生成 1 个`Handler`实例，2 个`then`串联会生成 2 个`Handler`实例
  - 每个`Handler`实例的`promise`，都指向当前`then`中生成的`Promise`实例`prom`（也就是下一个`then`前返回的`Promise`实例）
  - 但由于第 2 个`then`改变了第 2 个`then`前返回的`Promise`实例（`_deferreds`数组放入`Handler`实例），因此**第 1 个`Handler`实例也随之改变**
  - 打开`handle()`尾部的注释`console.log(deferred.promise, ret)`可更好的观察`Handler`实例的变化
  - 总结来说，就是**第 1 个`Handler`实例的`promise`属性指向的`Promise`实例，其`_deferreds`数组也放入了第 2 个`Handler`实例**
- **第 2 个重点**就是，调用处理程序后，会再次调用`resolve()`方法，保证第 2 个`then`能获取到第 1 个`then`中的返回值
  - 还记得么？在`resolve()`中，会给其`_state`和`_value`赋值，并调用`finale()`方法。因此我们来到最后的源码——`finale()`方法

## finale() - 源码

```js
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
```

- 终于到了`_deferreds`数组真正起作用的时候了！`finale()`会循环这个数组，然后给每一项执行`handle()`
- 与`handle`一起，2 个`then`串联的过程就是：
  - 第 1 个`then`前返回`Promise`实例（调用`resolve()`、`finale()`，`_deferreds`数组为空到此结束）
  - 调用第 1 个`then`，调用`handle()`，`Promise._immediateFn`放入异步线程 1
  - 调用第 2 个`then`，第 2 个`then`前返回的`Promise`实例的`_state`为 0，将第 2 个`Handle`实例放入第 2 个`then`前返回的`Promise`实例的`_deferreds`数组后返回（因此改变了第 1 个`Handle`）
  - 进入异步线程 1，执行第 1 个`then`的处理方法后，再次调用`resolve()`、`finale()`，`_deferreds`数组不为空因此调用`handle()`，`Promise._immediateFn`放入异步线程 2
  - 进入异步线程 2，执行第 2 个`then`的处理方法后，再次调用`resolve()`、`finale()`，`_deferreds`数组为空全部结束
- 如果上述流程还不明晰，下面会用测试例子一步一步的详解

## 多个 then 的链式调用 - 阶段测试

```js
new Promise((resolve, reject) => {
  resolve(3)
})
  .then((res) => {
    console.log(res)
    return 4
  })
  .then((res) => {
    console.log(res)
    return 5
  })
```

- 根据源码，上述代码的完整调用流程为：
  - `new Promise((resolve, reject) => {resolve(3)})`
    - 执行`new Promise`，创建`Promise`实例，返回这个`Promise`实例
    - 执行`doResolve()`，**同步立即执行执行器函数**`(resolve, reject) => {resolve(3)}`
    - 执行`resolve(3)`，将`Promise`实例的`_state`赋为 1、`_value`赋为 3
    - 执行`finale()`，`Promise`实例的`_deferreds`为`[]`，赋为`null`后执行结束
    - 返回的`Promise`实例：`Promise { _state: 1, _handled: false, _value: 3, _deferreds: null }`
  - `.then((res) => {console.log(res);return 4})`
    - 执行`Promise.prototype.then`，创建新`Promise`实例，传入空方法作为执行器函数，返回这个新的`Promise`实例
    - 执行`new Handler`，包装当前的`onFulfilled`处理程序`(res) => {console.log(res);return 4}`，返回`Handler`实例
    - 执行`handle()`，传入上一个`then()`前返回的`Promise`实例和`Handler`实例
      - 上一个`Promise`实例的`_state`为 1，将其`_handled`赋为`true`，执行`Promise._immediateFn()`，将当前的`onFulfilled`处理程序放入**异步线程 1**
    - 返回`Promise`实例：`Promise { _state: 0, _handled: false, _value: undefined, _deferreds: [] }`
  - `.then((res) => {console.log(res);return 5})`
    - 执行`Promise.prototype.then`，创建新`Promise`实例，传入空方法作为执行器函数，返回这个新的`Promise`实例
    - 执行`new Handler`，包装当前的`onFulfilled`处理程序`(res) => {console.log(res);return 5}`，返回`Handler`实例
    - 执行`handle()`，传入上一个`then()`前返回的`Promise`实例和`Handler`实例
      - 上一个`Promise`实例的`_state`为 0，将本次的`Hander`实例放入其`_deferreds`空数组，`return`后因为暂无后续`.then()`，**同步线程暂停**
      - 上一个`Promise`实例变为：`Promise { _state: 0, _handled: false, _value: undefined, _deferreds: [ Handler {} ] }`，`Handler`为本次的 `Handler`实例
      - **重点来了**：由于`Handler`实例的`promise`指向`.then()`中创建的`Promise`实例（`prom`），因此**上一个`Handler`实例也受到影响，其`promise`指向的`Promise`实例（即上一个`Promise`实例）的`_deferreds`同样指向`[ Handler {} ]`**
    - **回到异步线程 1**，执行上一个`Handler`实例包装的`onFulfilled`处理程序，打印 3，返回 4
    - 执行`resolve()`，传入上一个`Handler`实例的`promise`（指向已发生变化的`Promise`实例）和`onFulfilled`返回值（4），将`_state`赋为 1、`_value`赋为 4
      - 此时已发生变化的`Promise`实例更新为`Promise { _state: 1, _handled: false, _value: 4, _deferreds: [ Handler {} ] }`
    - 执行`finale()`，传入更新的`Promise`，循环`_deferreds`数组
    - 执行`handle()`，传入更新的`Promise`实例和本次的`Handler`实例
      - 更新的`Promise`实例的`_state`为 1，将其`_handled`赋为`true`，执行`Promise._immediateFn()`，将当前的`onFulfilled`处理程序放入**异步线程 2**（嵌套在异步线程 1 中）
    - 由于**没有同步线程了，直接来到异步线程 2**，执行本次`Handler`实例包装的`onFulfilled`处理程序，打印 4，返回 5
    - 执行`resolve()`，传入本次`Handler`实例的`promise`（未发生变化，初始的`Promise`实例）和`onFulfilled`返回值（5），将`_state`赋为 1、`_value`赋为 5
      - 此时`Promise`实例更新为`Promise { _state: 1, _handled: false, _value: 5, _deferreds: [] }`
    - 执行`finale()`，传入更新的`Promise`，其`_deferreds`为`[]`，赋为`null`后执行结束
    - 返回`Promise`实例：`Promise { _state: 0, _handled: false, _value: undefined, _deferreds: [] }`
- 再次总结：
  - `new Promise`的**执行器函数**是**同步**的，最先执行
  - 无论多少个`.then`，其**创建新`Promise`实例、创建`Handle`实例及`handle()`方法的前半部分（直至`Promise._immediateFn`前）**都是**同步**的，依次执行
  - 后面的`.then`会改变前面返回的`Promise`实例，从而改变前面生成的`Handle`实例
  - 同步执行完毕后，执行首个`.then`中`handle()`中的异步方法`Promise._immediateFn`，开启异步线程
    - 在异步线程的最后，执行`resolve()`方法再执行`finale()`方法
    - **此时传入的`Promise`实例的`_deferreds`不再是空数组，而是放入了下一个`.then`中的处理方法**
    - 进而再次执行`handle()`方法及其中的`Promise._immediateFn`
      - 在**异步线程中嵌套新的异步线程**，直至最终执行完毕

## then 与 catch 交替的链式调用 - 阶段测试

```js
Promise.resolve(1)
  .catch((err) => {
    console.log(3) // 不打印，resolve后面不执行onRejected处理程序
    return 3
  })
  .then((res) => {
    console.log(res) // 1
  })

Promise.reject(1)
  .then((res) => {
    console.log(2) // 不打印，reject后面不执行onResolved处理程序
    return 2
  })
  .catch((err) => {
    console.log(err) // 1
  })
```

- `resolve`后面不会执行`onRejected`处理程序，`reject`后面不执行`onResolved`处理程序

## 中间的 then 或 catch 没有回调 - 阶段测试

```js
new Promise((resolve, reject) => {
  resolve(3)
})
  .then() // 没有回调，等待下个Promise的回调
  .then((res) => {
    console.log(res)
  })

new Promise((resolve, reject) => {
  reject(4)
})
  .catch() // 没有回调，等待下个Promise的回调
  .catch((res) => {
    console.log(res)
  })
```

- 携带当前的`_value`值，等待下一个`Promise`对象的回调
  - `handle()`方法里`Promise._immediateFn`里的`cb===null`，根据`then`前`Promise`对象的类型（解决/拒绝），调用`resolve()`或`reject()`方法

## 实现结果总结

- 已实现：
  - 多个`then`(`catch`)的链式调用
  - `then`与`catch`交替的链式调用
  - 中间的`then`或`catch`没有回调的链式调用

<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%904.js" target="_blank">截至本节的代码 →</a>
