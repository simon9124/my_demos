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
