/* 11.2 期约 */

/* 11.2.2 期约基础 */
// let p = new Promise() // TypeError: Promise resolver undefined is not a function，必须提供执行器函数作为参数
let p = new Promise(() => {})
setTimeout(console.log, 0, p) // Promise { <pending> }

/* 通过执行函数控制期约状态 */
let p1 = new Promise((resolve, reject) => resolve())
setTimeout(console.log, 0, p1) // Promise {<fulfilled>: undefined}

let p2 = new Promise((resolve, reject) => reject())
setTimeout(console.log, 0, p2) // Promise {<rejected>: undefined}
// Uncaught (in promise)

// 执行器函数是同步执行的
new Promise(() => setTimeout(console.log, 0, 'executor'))
setTimeout(console.log, 0, 'promise initialized')
/* 
  'executor'，先打印
  'promise initialized'，后打印
*/

// 添加setTimeout推迟执行器函数的切换状态
let p3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 1000)
})
setTimeout(console.log, 0, p3) // Promise { <pending> }，打印实例p3时，还不会执行内部回调

// 状态不可撤销
let p4 = new Promise((resolve, reject) => {
  resolve()
  reject() // 静默失败
})
setTimeout(console.log, 0, p4) // Promise {<fulfilled>: undefined}

// 避免期约卡在待定，添加定时退出
let p5 = new Promise((resolve, reject) => {
  setTimeout(reject, 10000) // 10秒后调用reject()
})
setTimeout(console.log, 0, p5) // Promise { <pending> }，10秒内，不调用resolve()
setTimeout(console.log, 11000, p5) // Promise {<rejected>: undefined}，10秒外，调用reject()
// Uncaught (in promise)

/* Promise.resolve() */
let p6 = new Promise((resolve, reject) => {
  resolve()
})
console.log(p6) // Promise {<fulfilled>: undefined}
let p7 = Promise.resolve()
console.log(p7) // Promise {<fulfilled>: undefined}

// 第一个参数为解决的期约的值
setTimeout(console.log, 0, Promise.resolve()) // Promise {<fulfilled>: undefined}
setTimeout(console.log, 0, Promise.resolve(3)) // Promise {<fulfilled>: 3}
setTimeout(console.log, 0, Promise.resolve(4, 5, 6)) // Promise {<fulfilled>: 4}，只取首个参数

// Promise.resolve()是幂等方法
let p8 = Promise.resolve(7)
setTimeout(console.log, 0, Promise.resolve(p8)) // Promise { 7 }
setTimeout(console.log, 0, p8 === Promise.resolve(p8)) // true
setTimeout(console.log, 0, p8 === Promise.resolve(Promise.resolve(p8))) // true

// 幂等性保留传入期约的状态
let p9 = new Promise(() => {}) // 待定状态
setTimeout(console.log, 0, p9) // Promise { <pending> }
setTimeout(console.log, 0, Promise.resolve(p9)) // Promise { <pending> }
setTimeout(console.log, 0, Promise.resolve(Promise.resolve(p9))) // Promise { <pending> }

// 能够包装错误对象，可能导致不符合预期的行为
let p10 = Promise.resolve(new Error('foo'))
// setTimeout(console.log, 0, p10) // Promise {<fulfilled>: Error: foo

/* Promise.reject() */
let p11 = new Promise((resolve, reject) => {
  reject()
})
console.log(p11) // Promise {<rejected>: undefined}
// Uncaught (in promise)

let p12 = Promise.reject()
console.log(p12) // Promise {<rejected>: undefined}
// Uncaught (in promise)

// 第一个参数为拒绝的期约的理由
let p13 = Promise.reject(3)
setTimeout(console.log, 0, p13) // Promise { <rejected> 3 }
p13.then(null, (err) => setTimeout(console.log, 0, err)) // 3，参数传给后续拒绝处理程序

// Promise.reject()不是幂等方法
setTimeout(console.log, 0, Promise.reject(Promise.resolve())) // Promise {<rejected>: Promise}

/* 同步/异步执行的二元性 */
try {
  throw new Error('foo') // 同步线程抛出错误
} catch (error) {
  console.log(error + '1') // Error: foo1，同步线程捕获错误
}

try {
  Promise.reject('bar') // 同步线程使用期约
} catch (error) {
  console.log(error + '2') // 同步线程捕获不到拒绝的期约
}
// Promise {<rejected>: "bar"}，浏览器异步消息队列捕获到拒绝的期约
// Uncaught (in promise) bar

/* 11.2.3 期约的实例方法 */

/* 实现 Thenable 接口 */
class MyThenable {
  // 实现Thenable接口的最简单的类
  then() {}
}

/* Promise.prototype.then() */
function onResolved(id) {
  setTimeout(console.log, 0, id, 'resolved')
}
function onRejected(id) {
  setTimeout(console.log, 0, id, 'rejected')
}
let p14 = new Promise((resolve, reject) => {
  setTimeout(resolve, 3000)
})
let p15 = new Promise((resolve, reject) => {
  setTimeout(reject, 3000)
})

p14.then(
  () => {
    onResolved('p14') // 'p14 resolved'（3秒后）
  },
  () => {
    onRejected('p14')
  }
)
p15.then(
  () => {
    onResolved('p15')
  },
  () => {
    onRejected('p15') // 'p15 rejected'（3秒后）
  }
)

// 非函数类型的参数被静默忽略
p14.then('gobbeltygook') // 参数不是对象，静默忽略
p14.then(() => onResolved('p14')) // 'p14 resolved'（3秒后），不传onRejected
p15.then(null, () => onRejected('p15')) // 'p15 rejected'（3秒后），不传onResolved

// 返回新的期约实例 - 基于onResolved处理程序
let p16 = Promise.resolve('foo')

let result1 = p16.then() // 没有提供处理程序
setTimeout(console.log, 0, result1) // Promise {<fulfilled>: 'foo'}，包装上一个期约解决后的值

let result2 = p16.then(() => undefined) // 处理程序没有显示的返回语句
let result3 = p16.then(() => {}) // 处理程序没有显示的返回语句
let result4 = p16.then(() => Promise.resolve()) // 处理程序没有显示的返回语句
setTimeout(console.log, 0, result2) // Promise {<fulfilled>: undefined}，包装默认返回值undefined
setTimeout(console.log, 0, result3) // Promise {<fulfilled>: undefined}，包装默认返回值undefined
setTimeout(console.log, 0, result4) // Promise {<fulfilled>: undefined}，包装默认返回值undefined

let result5 = p16.then(() => 'bar') // 处理程序有显示的返回值
let result6 = p16.then(() => Promise.resolve('bar')) // 处理程序有显示的返回值
setTimeout(console.log, 0, result5) // Promise {<fulfilled>: 'bar'}，包装这个值
setTimeout(console.log, 0, result6) // Promise {<fulfilled>: 'bar'}，包装这个值

let result7 = p16.then(() => new Promise(() => {})) // 处理程序返回一个待定的期约
let result8 = p16.then(() => Promise.reject('bar')) // 处理程序返回一个拒绝的期约
// Uncaught (in promise) bar
setTimeout(console.log, 0, result7) // Promise {<pending>}，包装返回的期约
setTimeout(console.log, 0, result8) // Promise {<rejected>: 'bar'}，包装返回的期约

let result9 = p16.then(() => {
  throw 'baz' // 处理程序抛出异常
})
// Uncaught (in promise) baz
setTimeout(console.log, 0, result9) // Promise {<rejected>: 'baz'}，包装拒绝的期约

let result10 = p16.then(() => Error('qux')) // 处理程序返回错误值
setTimeout(console.log, 0, result10) // Promise {<fulfilled>: Error: qux}，把错误对象包装在一个解决的期约中

// 返回新的期约实例 - 基于onRejected处理程序
let p17 = Promise.reject('foo')

let result11 = p17.then() // 没有提供处理程序
// Uncaught (in promise) foo
setTimeout(console.log, 0, result11) // Promise {<rejected>: 'foo'}，包装上一个期约解决后的值

let result12 = p17.then(null, () => undefined) // 处理程序没有显示的返回语句
let result13 = p17.then(null, () => {}) // 处理程序没有显示的返回语句
let result14 = p17.then(null, () => Promise.resolve()) // 处理程序没有显示的返回语句
setTimeout(console.log, 0, result12) // Promise {<fulfilled>: undefined}，包装默认返回值undefined
setTimeout(console.log, 0, result13) // Promise {<fulfilled>: undefined}，包装默认返回值undefined
setTimeout(console.log, 0, result14) // Promise {<fulfilled>: undefined}，包装默认返回值undefined

let result15 = p17.then(null, () => 'bar') // 处理程序有显示的返回值
let result16 = p17.then(null, () => Promise.resolve('bar')) // 处理程序有显示的返回值
setTimeout(console.log, 0, result15) // Promise {<fulfilled>: 'bar'}，包装这个值
setTimeout(console.log, 0, result16) // Promise {<fulfilled>: 'bar'}，包装这个值

let result17 = p17.then(null, () => new Promise(() => {})) // 处理程序返回一个待定的期约
let result18 = p17.then(null, () => Promise.reject('bar')) // 处理程序返回一个拒绝的期约
// Uncaught (in promise) bar
setTimeout(console.log, 0, result17) // Promise {<pending>}，包装返回的期约
setTimeout(console.log, 0, result18) // Promise {<rejected>: 'bar'}，包装返回的期约

let result19 = p17.then(null, () => {
  throw 'baz' // 处理程序抛出异常
})
// Uncaught (in promise) baz
setTimeout(console.log, 0, result19) // Promise {<rejected>: 'baz'}，包装拒绝的期约

let result20 = p17.then(null, () => Error('qux')) // 处理程序返回错误值
setTimeout(console.log, 0, result20) // Promise {<fulfilled>: Error: qux}，把错误对象包装在一个解决的期约中

/* Promise.prototype.catch() */
let p18 = Promise.reject()
let onRejected2 = function () {
  setTimeout(console.log, 0, 'reject')
}
p18.then(null, onRejected2) // 'reject'
p18.catch(onRejected2) // 'reject'，两种添加拒绝处理程序的方式是一样的

let result21 = p18.then()
let result22 = p18.catch()
setTimeout(console.log, 0, result21)
setTimeout(console.log, 0, result22)

/* Promise.prototype.finally() */
let p19 = Promise.resolve()
let p20 = Promise.reject()
let onFinally = function () {
  setTimeout(console.log, 0, 'Finally')
}
p19.finally(onFinally) // 'Finally'
p20.finally(onFinally) // 'Finally'

// 返回新的期约实例 - 以下情况包装父期约的实例
let p21 = Promise.resolve('foo')

let result23 = p21.finally() // 未提供处理程序
let result24 = p21.finally(() => undefined) // 提供了处理程序，但没有显示的返回语句
let result25 = p21.finally(() => {}) // 提供了处理程序，但没有显示的返回语句
let result26 = p21.finally(() => Promise.resolve()) // 提供了处理程序，但没有显示的返回语句
let result27 = p21.finally(() => 'bar') // 提供了处理程序，且有显示的返回值
let result28 = p21.finally(() => Promise.resolve('bar')) // 处理程序返回一个解决的期约
let result29 = p21.finally(() => Error('qux')) // 处理程序返回错误值
setTimeout(console.log, 0, result23) // Promise {<fulfilled>: 'foo'}，包装父期约的传递
setTimeout(console.log, 0, result24) // Promise {<fulfilled>: 'foo'}，包装父期约的传递
setTimeout(console.log, 0, result25) // Promise {<fulfilled>: 'foo'}，包装父期约的传递
setTimeout(console.log, 0, result26) // Promise {<fulfilled>: 'foo'}，包装父期约的传递
setTimeout(console.log, 0, result27) // Promise {<fulfilled>: 'foo'}，包装父期约的传递
setTimeout(console.log, 0, result28) // Promise {<fulfilled>: 'foo'}，包装父期约的传递
setTimeout(console.log, 0, result29) // Promise {<fulfilled>: 'foo'}，包装父期约的传递

// 返回新的期约实例 - 以下情况包装相应的期约
let result30 = p21.finally(() => new Promise(() => {})) // 处理程序返回一个待定的期约
let result31 = p21.finally(() => Promise.reject()) // 处理程序返回一个拒绝的期约
// Uncaught (in promise) undefined
let result32 = p21.finally(() => {
  throw 'baz' // 处理程序抛出错误
})
// Uncaught (in promise) baz
setTimeout(console.log, 0, result30) // Promise {<pending>}，返回相应的期约
setTimeout(console.log, 0, result31) // Promise {<rejected>: undefined}，返回相应的期约
setTimeout(console.log, 0, result32) // Promise {<rejected>: 'baz'}，返回相应的期约

// 待定的期约解决后，新期约仍后传初始期约
let p22 = Promise.resolve('foo')
let p23 = p22.finally(
  () => new Promise((resolve, reject) => setTimeout(() => resolve('bar'), 100)) // 处理程序返回一个待定的期约（100毫秒后解决）
)
setTimeout(console.log, 0, p23) // Promise {<pending>}，返回相应的期约
setTimeout(() => setTimeout(console.log, 0, p23), 200) // Promise {<fulfilled>: "foo"}，（200毫秒后）待定的期约已解决

/* 非重入期约方法 */
let p24 = Promise.resolve() // 解决的期约，已落定
p24.then(() => console.log('onResolved handler')) // 与期约状态相关的onResolved处理程序
console.log('then() returns') // 处理程序之后的同步代码
/* 
  'then() returns'，处理程序之后的同步代码先执行
  'onResolved handler'
*/

// 期约在处理程序之后改变状态，处理程序仍表现非重入特性
let synchronousResolve // 全局方法：期约状态状态
let p25 = new Promise((resolve) => {
  synchronousResolve = function () {
    console.log('1: invoking resolve()')
    resolve() // 期约状态改变
    console.log('2: resolve() returns')
  }
})
p25.then(() => console.log('4: then() handler executes')) // 与期约状态相关的onResolved处理程序
synchronousResolve() // 处理程序之后的同步代码：期约状态改变
console.log('3: synchronousResolve() returns') // 处理程序之后的同步代码
/* 
  '1: invoking resolve()'
  '2: resolve() returns'
  '3: synchronousResolve() returns'
  '4: then() handler executes'
*/

// 非重入适用于onResolved、onRejected、catch()、finally()
let p26 = Promise.resolve()
p26.then(() => console.log('p26.then() onResolved'))
console.log('p26.then() returns')

let p27 = Promise.reject()
p27.then(null, () => console.log('p27.then() onRejected'))
console.log('p27.then() returns')

let p28 = Promise.reject()
p28.catch(() => console.log('p28.catch() onRejected'))
console.log('p28.catch() returns')

let p29 = Promise.resolve()
p26.finally(() => console.log('p29.finally() onFinally'))
console.log('p29.finally() returns')
/* 
  'p26.then() returns'
  'p27.then() returns'
  'p28.catch() returns'
  'p29.finally() returns'
  'p26.then() onResolved'
  'p27.then() onRejected'
  'p28.catch() onRejected'
  'p29.finally() onFinally'
*/

/* 邻近处理程序的执行顺序 */
let p30 = Promise.resolve()
let p31 = Promise.reject()

p30.then(() => setTimeout(console.log, 0, 1))
p30.then(() => setTimeout(console.log, 0, 2))

p31.then(null, () => setTimeout(console.log, 0, 3))
p31.then(null, () => setTimeout(console.log, 0, 4))

p31.catch(() => setTimeout(console.log, 0, 5))
p31.catch(() => setTimeout(console.log, 0, 6))

p30.finally(() => setTimeout(console.log, 0, 7))
p30.finally(() => setTimeout(console.log, 0, 8))
/* 
  1
  2
  3
  4
  5
  6
  7
  8
*/

/* 传递解决之和拒绝理由 */
let p32 = new Promise((resolve, reject) => resolve('foo')) // 执行函数中
p32.then((value) => console.log(value)) // 'foo'
let p33 = new Promise((resolve, reject) => reject('bar')) // 执行函数中
p33.catch((reason) => console.log(reason)) // 'bar'

let p34 = Promise.resolve('foo') // Promise.resolve()中
p34.then((value) => console.log(value)) // 'foo'
let p35 = Promise.reject('bar') // Promise.reject()中
p35.catch((reason) => console.log(reason)) // 'bar'

/* 拒绝期约与拒绝错误处理 */
let p36 = new Promise((resolve, reject) => reject(Error('foo'))) // 在执行函数中抛出错误
let p37 = new Promise((resolve, reject) => {
  throw Error('foo') // 在执行函数中抛出错误
})
let p38 = Promise.resolve().then(() => {
  throw Error('foo') // 在处理程序中抛出错误
})
let p39 = Promise.reject(Error('foo')) // 在拒绝的期约中抛出错误
setTimeout(console.log, 0, p36) // Promise {<rejected>: Error: foo
setTimeout(console.log, 0, p37) // Promise {<rejected>: Error: foo
setTimeout(console.log, 0, p38) // Promise {<rejected>: Error: foo
setTimeout(console.log, 0, p39) // Promise {<rejected>: Error: foo

/* 上述拒绝期约会抛出4个未捕获错误：栈追踪信息
  Uncaught (in promise) Error: foo
  at <anonymous>:1:51
  at new Promise (<anonymous>)
  at <anonymous>:1:11
  (anonymous)	@	VM1402:1
  (anonymous)	@	VM1402:1

  Uncaught (in promise) Error: foo
  at <anonymous>:3:9
  at new Promise (<anonymous>)
  at <anonymous>:2:11
  (anonymous)	@	VM1402:3
  (anonymous)	@	VM1402:2

  Uncaught (in promise) Error: foo
  at <anonymous>:8:26
  (anonymous)	@	VM1402:8

  Uncaught (in promise) Error: foo
  at <anonymous>:6:9
  (anonymous)	@	VM1402:6
  Promise.then (async)		
  (anonymous)	@	VM1402:5
*/

// 异步错误 vs 同步错误
// throw Error('foo') // 同步代码抛出错误（try/catch中能捕获）
// console.log('bar') // 后续任何指令不再执行
// Uncaught Error: foo，浏览器消息队列

Promise.reject(Error('foo')) // 期约中抛出错误（try/catch中捕获不到）
console.log('bar') // 'bar'，同步指令继续执行
// Uncaught (in promise) Error: foo，浏览器消息队列

Promise.reject(Error('foo')).catch((e) => {
  console.log(e) // 'Error: foo'，在期约中捕获
})

// 执行函数中的错误，在解决或拒绝期约之前，仍可用try/catch捕获
let p40 = new Promise((resolve, reject) => {
  try {
    throw Error('foo')
  } catch (error) {}
  resolve('bar')
})
setTimeout(console.log, 0, p40) // Promise {<fulfilled>: 'bar'}

// onRejected捕获异步错误后,返回一个解决的期约
console.log('begin synchronous execution')
try {
  throw Error('foo') // 抛出同步错误
} catch (error) {
  console.log('caught error', error) // 捕获同步错误
}
console.log('continue synchronous execution')
/* 
  'begin synchronous execution'
  'caught error Error: foo'
  'continue synchronous execution'
*/

new Promise((resolve, reject) => {
  console.log('begin synchronous execution')
  reject(Error('bar')) // 抛出异步错误
})
  .catch((e) => {
    console.log('caught error', e) // 捕获异步错误
  })
  .then(() => {
    console.log('continue synchronous execution')
  })
/* 
  'begin synchronous execution'
  'caught error Error: bar'
  'continue synchronous execution'
*/

/* 11.2.4 期约连锁与期约合成 */

/* 期约连锁 */

// 串行化同步任务
let p41 = new Promise((resolve, reject) => {
  console.log('first')
  resolve()
})
p41
  .then(() => console.log('second'))
  .then(() => console.log('third'))
  .then(() => console.log('fourth'))
/* 
  'first'
  'second'
  'third'
  'fourth'
*/

// 串行化异步任务
let p42 = new Promise((resolve, reject) => {
  console.log('p42 first')
  setTimeout(resolve, 1000)
})
p42
  .then(
    () =>
      // 执行器返回期约实例
      new Promise((resolve, reject) => {
        console.log('p42 second')
        setTimeout(resolve, 1000)
      })
  )
  .then(
    () =>
      // 执行器返回期约实例
      new Promise((resolve, reject) => {
        console.log('p42 third')
        setTimeout(resolve, 1000)
      })
  )
  .then(
    () =>
      // 执行器返回期约实例
      new Promise((resolve, reject) => {
        console.log('p42 fourth')
        setTimeout(resolve, 1000)
      })
  )
/* 
  'p42 first'（1秒后）
  'p42 second'（2秒后）
  'p42 third'（3秒后）
  'p42 fourth'（4秒后）
*/

// 工厂函数封装
function delayedResolve(str) {
  return new Promise((resolve, reject) => {
    console.log(str)
    setTimeout(resolve, 1000)
  })
}
delayedResolve('p42 first')
  .then(() => delayedResolve('p42 second'))
  .then(() => delayedResolve('p42 third'))
  .then(() => delayedResolve('p42 fourth'))
/* 
  'p42 first'（1秒后）
  'p42 second'（2秒后）
  'p42 third'（3秒后）
  'p42 fourth'（4秒后）
*/

// 不使用期约会产生“回调地狱”
function delayedNotPromise(str, callback = null) {
  setTimeout(() => {
    console.log(str)
    callback && callback()
  }, 1000)
}
delayedNotPromise('p42 first', () => {
  delayedNotPromise('p42 second', () => {
    delayedNotPromise('p42 third', () => {
      delayedNotPromise('p42 fourth', () => {})
    })
  })
})
/* 
  'p42 first'（1秒后）
  'p42 second'（2秒后）
  'p42 third'（3秒后）
  'p42 fourth'（4秒后）
*/

// then()、catch()、finally()任意期约连锁
let p43 = new Promise((resolve, reject) => {
  console.log('p43')
  reject()
})
p43
  .catch(() => console.log('p43 catch'))
  .then(() => console.log('p43 then'))
  .finally(() => console.log('p43 finally'))
/* 
  'p43'
  'p43 catch'
  'p43 then'
  'p43 finally'
*/

/* 期约图 */
let A = new Promise((resolve, reject) => {
  console.log('A')
  resolve()
})
let B = A.then(() => console.log('B'))
let C = A.then(() => console.log('C'))
B.then(() => console.log('D'))
B.then(() => console.log('E'))
C.then(() => console.log('F'))
C.then(() => console.log('F'))
/* 
  'A'
  'B'
  'C'
  'D'
  'E'
  'F'
*/

/* Promise.all()和 Promise.race() */

// Promise.all()
Promise.all([Promise.resolve(), Promise.resolve()]) // 接收1组可迭代对象
Promise.all([3, 4]) // 可迭代对象中的元素通过Promise.resolve()转换为期约
Promise.all([]) // 空迭代对象等价于Promise.resolve()
// Promise.all() // TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))，参数必填

let p44 = Promise.all([
  Promise.resolve(),
  new Promise((resolve, reject) => setTimeout(resolve, 1000)),
])
p44.then(() => setTimeout(console.log, 0, 'all() resolved!')) // 'all() resolved!'（1秒后，非0秒，需等包含的期约先解决）

let p45 = Promise.all([new Promise(() => {}), Promise.resolve()]) // 包含的期约有待定的
setTimeout(console.log, 0, p45) // Promise {<pending>}，合成待定的期约
let p46 = Promise.all([new Promise(() => {}), Promise.reject()]) // 包含的期约有拒绝的（也有待定的）
// Uncaught (in promise) undefined
setTimeout(console.log, 0, p46) // Promise {<rejected>: undefined}，合成拒绝的期约

let p47 = Promise.all([
  Promise.resolve(1),
  Promise.resolve(),
  Promise.resolve(3),
]) // 包含的所有期约都解决
setTimeout(console.log, 0, p47) // [1, undefined, 3]

let p48 = Promise.all([
  Promise.reject(3), // 第一个拒绝的期约，拒绝理由为3
  new Promise((resolve, reject) => setTimeout(reject, 1000, 4)), // 第二个拒绝的期约，拒绝理由为4
])
// Uncaught (in promise) 3
setTimeout(console.log, 0, p48) // Promise {<rejected>: 3}，第一个拒绝理由作为合成期约的拒绝理由
p48.catch((reason) => setTimeout(console.log, 2, reason)) // 3，第一个拒绝理由作为合成期约的拒绝理由，但浏览器不会显示未处理的错误（Uncaught (in promise) 3）

// Promise.race()
Promise.race([Promise.resolve(), Promise.resolve()]) // 接收1组可迭代对象
Promise.race([3, 4]) // 可迭代对象中的元素通过Promise.resolve()转换为期约
Promise.race([]) // 空迭代对象等价于Promise.resolve()
// Promise.all() // TypeError: undefined is not iterable (cannot read property Symbol(Symbol.iterator))，参数必填

let p49 = Promise.race([
  Promise.resolve(3),
  new Promise((resolve, reject) => setTimeout(reject, 1000)),
])
setTimeout(console.log, 0, p49) // Promise {<fulfilled>: 3}，解决先发生，超时后的拒绝被忽略

let p50 = Promise.race([
  Promise.reject(4),
  new Promise((resolve, reject) => setTimeout(resolve, 1000)),
])
// Uncaught (in promise) 4
setTimeout(console.log, 0, p50) // Promise {<rejected>: 4}，拒绝先发生，超时后的解决被忽略

let p51 = Promise.race([
  Promise.resolve(1),
  Promise.resolve(),
  Promise.resolve(3),
])
setTimeout(console.log, 0, p51) // Promise {<fulfilled>: 1}，迭代顺序决定落定顺序

let p52 = Promise.race([
  Promise.reject(3), // 第一个拒绝的期约，拒绝理由为3
  new Promise((resolve, reject) => setTimeout(reject, 1000, 4)), // 第二个拒绝的期约，拒绝理由为4
])
// Uncaught (in promise) 3
setTimeout(console.log, 0, p52) // Promise {<rejected>: 3}，第一个拒绝理由作为合成期约的拒绝理由
p52.catch((reason) => setTimeout(console.log, 2, reason)) // 3，第一个拒绝理由作为合成期约的拒绝理由，但浏览器不会显示未处理的错误（Uncaught (in promise) 3）

/* 串行期约合成 */
function addTwo(x) {
  return x + 2
}
function addThree(x) {
  return x + 3
}
function addFive(x) {
  return x + 5
}

// 函数合成
function addTen(x) {
  return addFive(addThree(addTwo(x)))
}
console.log(addTen(7)) // 17

// 期约合成
function addTen(x) {
  return Promise.resolve(x).then(addTwo).then(addThree).then(addFive)
}
setTimeout(console.log, 0, addTen(8)) // Promise {<fulfilled>: 18}
addTen(8).then((result) => console.log(result)) // 18

// 使用reduce()简化
function addTen(x) {
  return [addTwo, addThree, addFive].reduce((pre, cur) => {
    return pre.then(cur)
  }, Promise.resolve(x)) // 归并起点值（归并函数第1个参数）为Promise.resolve(x)，第2个参数为数组第1项addTwo
}
setTimeout(console.log, 0, addTen(9)) // Promise {<fulfilled>: 19}
addTen(9).then((result) => console.log(result)) // 19

// 封装通用方法
function compose(...fns) {
  return (x) =>
    fns.reduce((pre, cur) => {
      return pre.then(cur)
    }, Promise.resolve(x))
}
addTen = compose(addTwo, addThree, addFive)
addTen(10).then((result) => console.log(result)) // 20

/* 11.2.5 期约扩展 */

/* 期约取消 */

/* 期约进度通知 */
