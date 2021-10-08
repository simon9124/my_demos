<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB1.md" target="_blank">Promise 源码解读 1</a><br>
<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB2.md" target="_blank">Promise 源码解读 2</a><br>
<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB3.md" target="_blank">Promise 源码解读 3</a><br>
<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB4.md" target="_blank">Promise 源码解读 4</a><br>
<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB5.md" target="_blank">Promise 源码解读 5</a><br>

<a href="" target="_blank">完整代码+注释</a>，可对照阅读

`Promise`源码解读系列的最后 1 篇，详解`Promise`构造函数的最后几个方法及`.finally`，封装`isArray`判断对象是否为数组：

```js
/* isArray方法：判断对象是否为数组 */
function isArray(x) {
  return Boolean(x && typeof x.length !== 'undefined')
}
```

## Promise.all - 源码

```js
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
```

- **参数**必须是**数组**，若为**空数组**则等同于`new Promise((resolve, reject) => resolve([]))`
- 循环参数数组，若数组项为解决的期约，则被重写为其解决值/拒绝理由，若为非期约则不变
- 若所有的`Promise`都执行完毕（没有待定的），则执行执行器函数的`resolve`回调，参数为处理后的数组
  - 若有待定的期约，则会一直等待，直到执行完毕
- 只要其中一项出现异常，则全部执行退出，进入`catch`异常处理

## Promise.all - 阶段测试

```js
setTimeout(
  console.log,
  0,
  Promise.all(), // 参数不是数组
  /* Promise { _state: 2, _handled: false, _value: 'TypeError: Promise.all accepts an array', _deferreds: null } */
  Promise.all([]), // 参数是空数组
  /* Promise { _state: 1, _handled: false, _value: [], _deferreds: null } */
  new Promise((resolve, reject) => resolve([])), // 等效于Promise.all([])
  Promise.all([1, 2, 3]), // 参数是数组，数组的每项不是Promise对象
  /* Promise { _state: 1, _handled: false, _value: [ 1, 2, 3 ], _deferreds: null } */
  Promise.all([Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)]), // 参数是数组，数组的每项是解决的Promise对象
  /* Promise { _state: 1, _handled: false, _value: [ 1, 2, 3 ], _deferreds: null } */
  Promise.all([
    Promise.resolve(true),
    Promise.resolve(true),
    Promise.resolve(true),
  ]),
  /* Promise { _state: 1, _handled: false, _value: [true, true, true], _deferreds: null } */
  Promise.all([Promise.resolve(1), Promise.reject(2), Promise.resolve(3)]), // 参数是数组，数组中有拒绝的Promise对象
  /* Promise { _state: 2, _handled: false, _value: 2, _deferreds: null } */
  Promise.all([Promise.resolve(1), new Promise(() => {}), Promise.resolve(3)]) // 参数是数组，数组中有待定的Promise对象
  /* Promise { _state: 0, _handled: false, _value: undefined, _deferreds: null } */
)
```

## Promise.race - 源码

```js
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
```

- **参数**必须是**数组**，若为**空数组**则**返回待定的期约**
- 循环参数数组，按顺序调用`Promise.resolve`，参数为数组项
- 只有最先落定（解决或拒绝）的`Promise`，根据其状态执行`resolve/reject`，后面的都不执行
- **核心思路比对**：
  - `Promise.all`：`resolve`数组所有项（如果该项是期约，则用其解决值/拒绝理由替换）
  - `Promise.race`：逐个`Promise.resolve`数组项（如果返回的期约已解决/拒绝，则不再`Promise.resolve`后面的项）

## Promise.race - 阶段测试

```js
setTimeout(
  console.log,
  0,
  Promise.race(), // 参数不是数组
  /* Promise { _state: 2, _handled: false, _value: 'TypeError: Promise.race accepts an array', _deferreds: null } */
  Promise.race([]), // 参数是空数组
  /* Promise { _state: 0, _handled: false, _value: undefined, _deferreds: null } */
  Promise.race([3, 2, 1]), // 参数是数组，数组的每项不是Promise对象
  /* Promise { _state: 1, _handled: false, _value: 3, _deferreds: null } */
  Promise.resolve(3), // 等效于Promise.race([3, 2, 1])
  /* Promise { _state: 1, _handled: false, _value: 3, _deferreds: null } */
  Promise.race([Promise.resolve(3), Promise.resolve(2), Promise.resolve(1)]), // 参数是数组，最先落定解决的Promise对象
  /* Promise { _state: 1, _handled: false, _value: 3, _deferreds: null } */
  Promise.race([Promise.reject(1), Promise.resolve(2), Promise.resolve(3)]), // 参数是数组，最先落定拒绝的Promise对象
  /* Promise { _state: 2, _handled: false, _value: 1, _deferreds: null }
     Possible Unhandled Promise Rejection: 1 */
  Promise.race([new Promise(() => {}), Promise.resolve(2), Promise.resolve(1)]) // 参数是数组，最先落定解决的Promise对象
  /* Promise { _state: 1, _handled: false, _value: 2, _deferreds: null } */
)
```

## Promise.prototype.finally - 源码

```js
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
```

## Promise.prototype.finally - 阶段测试

```js
setTimeout(
  console.log,
  0,
  Promise.resolve(2).finally(() => {
    console.log('finally3') // 打印'finally3'
    return 3
  })
  /* Promise为
    Promise {
      _state: 3,
      _handled: false,
      _value: Promise {
        _state: 0,
        _handled: false,
        _value: undefined,
        _deferreds: null
      },
      _deferreds: null
    }
  */
  Promise.reject(2).finally(() => {
    console.log('finally4') // 打印'finally4'
    return 4
  })
  /* Promise为
    Promise {
      _state: 3,
      _handled: false,
      _value: Promise {
        _state: 3,
        _handled: false,
        _value: Promise {
          _state: 2,
          _handled: false,
          _value: 2,
          _deferreds: null
        },
        _deferreds: null
      },
      _deferreds: null
    }
  */
)
```

## Promise.allSettled - 源码

```js
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
```

- **参数**必须是**数组**，若为**空数组**则等同于`new Promise((resolve, reject) => resolve([]))`
- 循环参数数组，并重写：
  - 若该项为**解决的期约**，则被重写为`{status:'fulfilled',value:解决值}`
  - 若该项为**拒绝的期约**，则被重写为`{status:'rejected',reason:拒绝理由}`
  - 若该项为**非期约**，则被重写为对象`{status:'fulfilled',value:该项}`
- 若所有的`Promise`都执行完毕（没有待定的），则执行执行器函数的`resolve`回调，参数为处理后的数组
  - 若有待定的期约，则会一直等待，直到执行完毕

## Promise.allSettled - 阶段测试

```js
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
```

## 实现结果总结

- 实现`Promise`构造函数方法：`Promise,all`、`Promise.race`、`Promise.allSettled`
- 实现`Promise`原型方法：`Promise.prototype.finally`

<a href="https://github.com/simon9124/my_demos/blob/master/%E6%BA%90%E7%A0%81%E8%A7%A3%E8%AF%BB%E7%B3%BB%E5%88%97/javascript/Promise/Promise%E6%BA%90%E7%A0%81%E8%A7%A3%E6%9E%905.js" target="_blank">截至本节的代码 →</a>
