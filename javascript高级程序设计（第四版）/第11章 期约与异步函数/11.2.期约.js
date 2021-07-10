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

// 返回新的期约实例
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
