/* 11.3 异步函数 */

/* 11.3.1 异步函数 */

/* async */
async function foo() {} // 用在函数声明
let bar = async function () {} // 用在函数表达式
let baz = async () => {} // 用在箭头函数
class Qux {
  async qux() {} // 用在方法
}

// 代码仍同步求值
async function foo() {
  console.log(1)
}
foo()
console.log(2)
/* 
  1，foo()函数先被求值
  2
*/

// 异步函数的返回值
async function foo() {
  return 'foo' // 返回原始值
}
console.log(foo()) // Promise {<fulfilled>: "foo"}，被当作已解决的期约
foo().then((result) => console.log(result)) // 'foo'

async function bar2() {
  return ['bar'] // 返回没有实现thenable接口的对象
}
console.log(bar2()) // Promise {<fulfilled>: ['bar']}，被当作已解决的期约
bar2().then((result) => console.log(result)) // ['bar']

async function baz2() {
  const thenable = {
    then(callback) {
      callback('baz')
    },
  }
  return thenable // 返回实现了thenable接口的非期约对象
}
console.log(baz2()) // Promise {<pending>}
baz2().then((result) => console.log(result)) // 'baz'，由then()解包

async function qux() {
  return Promise.resolve('qux') // 返回解决的期约
}
console.log(qux()) // Promise {<pending>}
qux().then((result) => console.log(result)) // 'qux'，由then()解包

async function rejectQux() {
  return Promise.reject('qux') // 返回拒绝的期约
}
console.log(rejectQux()) // Promise {<pending>}
rejectQux().then(null, (result) => console.log(result)) // 'qux'，由then()解包
// Uncaught (in promise) qux
rejectQux().catch((result) => console.log(result)) // 'qux'，由catch()解包

// 抛出错误返回拒绝的期约
async function foo() {
  console.log(1)
  throw 3
}
foo().catch((result) => console.log(result)) // 给返回的期约添加拒绝处理程序
console.log(2)
/* 
  1，foo()函数先被求值
  2
  3
*/

// 拒绝期约的错误（非返回拒绝的期约）不会被异步函数捕获
async function foo() {
  Promise.reject(3) // 拒绝的期约（非返回）
}
foo().catch((result) => console.log(result)) // catch()方法捕获不到
// Uncaught (in promise) 3，浏览器消息队列捕获

/* await */
let p = new Promise((resolve, reject) => {
  setTimeout(resolve, 1000, 3)
})
p.then((x) => console.log(x))

// 用async/await重写
async function foo() {
  let p = new Promise((resolve, reject) => {
    setTimeout(resolve, 1000, 3)
  })
  console.log(await p)
}
foo() // 'foo'

// await将期约解包
async function foo() {
  console.log(await Promise.resolve('foo')) // 将期约解包，再将值传给表达式
}
foo()

async function bar2() {
  return await Promise.resolve('bar')
}
bar2().then((res) => console.log(res)) // 'bar'

async function baz2() {
  await new Promise((resolve, reject) => {
    setTimeout(resolve, 1000)
  })
  console.log('baz')
}
baz2() // 'baz'（1000毫秒后）

// await等待值比较
async function foo() {
  console.log(await 'foo') // 等待原始值，被当作已解决的期约Promise.resolve('foo')，再由await解包
}
foo() // 'foo'

async function bar2() {
  console.log(await ['bar']) // 等待值是没有实现thenable接口的对象，被当作已解决的期约再由await解包
}
bar2() // ["bar"]

async function baz2() {
  const thenable = {
    then(callback) {
      callback('baz')
    },
  }
  console.log(await thenable) // 等待值是实现了thenable接口的非期约对象，由await解包
}
baz2() // 'baz'

async function qux() {
  console.log(await Promise.resolve('qux')) // 等待值是解决的期约
}
qux() // 'qux'

// 等待会抛出错误的同步操作，返回拒绝的期约
async function foo() {
  console.log(1)
  await (() => {
    throw 3 // 抛出错误的同步操作
  })()
}
foo().catch((result) => console.log(result)) // 给返回的期约添加拒绝处理程序
console.log(2)
/* 
  1
  2
  3
*/

// 对拒绝的期约使用await，释放错误值（将拒绝期约返回）
async function foo() {
  console.log(1)
  await Promise.reject(3) // 对拒绝的期约使用await，将其返回（后续代码不再执行）
  console.log(4) // 不执行
}
foo().catch((result) => console.log(result)) // 给返回的期约添加拒绝处理程序
console.log(2)
/* 
  1
  2
  3
*/

/* await的限制 */

async function foo() {
  console.log(await Promise.resolve(3)) // 必须在异步函数中使用
}
foo() // 3
;(async function () {
  console.log(await Promise.resolve(3)) // 3，立即调用的异步函数表达式
})()

const syncFn = async () => {
  console.log(await Promise.resolve(3)) // 在箭头函数中使用，箭头函数前一样要加async
}
syncFn() // 3

function foo() {
  // console.log(await Promise.resolve(3)) // 不允许在同步函数中使用
}

async function foo() {
  // function bar() {
  //   console.log(await Promise.resolve(3)) // 错误：异步函数不会扩展到嵌套函数
  // }
  async function bar() {
    console.log(await Promise.resolve(3)) // 需要在bar前加async
  }
}

/* 11.3.2 停止和恢复执行 */

// async只是标识符
async function foo() {
  console.log(2)
}
console.log(1)
foo()
console.log(3)
/* 
  1
  2
  3
*/

// 遇到await -> 记录暂停 -> await右边的值可用 -> 恢复执行异步函数
async function foo() {
  console.log(2)
  await null // 暂停，且后续操作变为异步
  // 为立即可用的值null向消息队列中添加一个任务
  console.log(4)
}
console.log(1)
foo()
console.log(3)
/* 
  1
  2
  3
  4
*/

// await后面是一个期约
async function foo() {
  console.log(2)
  console.log(await Promise.resolve(8))
  console.log(9)
}

async function bar2() {
  console.log(4)
  console.log(await 6)
  console.log(7)
}

console.log(1)
foo()
console.log(3)
bar2()
console.log(5)
/*
  书本顺序：1 2 3 4 5 6 7 8 9
  浏览器顺序：1 2 3 4 5 8 9 6 7（tc39做过1次修改）
*/

/* 11.3.3 异步函数策略 */

/* 实现sleep() */
function sleep(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay)) // 设定延迟，延迟后返回一个解决的期约
}
async function foo() {
  const t0 = Date.now()
  await sleep(1500) // 暂停约1500毫秒
  console.log(Date.now() - t0)
}
foo() // 1507

/* 利用平行执行 */

async function randomDelay(id) {
  const delay = Math.random() * 1000 // 随机延迟0-1000毫秒
  return new Promise((resolve) =>
    setTimeout(() => {
      console.log(`${id} finished`)
      resolve()
    }, delay)
  )
}

async function foo() {
  const t0 = Date.now()
  await randomDelay(0)
  await randomDelay(1)
  await randomDelay(2)
  await randomDelay(3)
  await randomDelay(4)
  console.log(`${Date.now() - t0} ms elapsed`)
}
foo()
/* 
  0 finished
  1 finished
  2 finished
  3 finished
  4 finished
  3279 ms elapsed
*/

// 用for循环重写
async function foo() {
  const t0 = Date.now()
  for (let i = 0; i < 5; i++) {
    await randomDelay(i)
  }
  console.log(`${Date.now() - t0} ms elapsed`)
}
foo()
/* 
  0 finished
  1 finished
  2 finished
  3 finished
  4 finished
  3314 ms elapsed
*/

// 不考虑顺序，一次性初始化所有期约，再分别等待结果
async function foo() {
  const t0 = Date.now()

  // 一次性初始化所有期约
  const p0 = randomDelay(0)
  const p1 = randomDelay(1)
  const p2 = randomDelay(2)
  const p3 = randomDelay(3)
  const p4 = randomDelay(4)

  // 分别等待结果，延迟各不相同
  await p0
  await p1
  await p2
  await p3
  await p4

  console.log(`${Date.now() - t0} ms elapsed`)
}
foo()
/* 
  4 finished
  3 finished
  1 finished
  0 finished
  2 finished
  870 ms elapsed，大幅度降低总耗时
*/

// 用数组和for循环再次包装
async function foo() {
  const t0 = Date.now()
  const promises = Array(5)
    .fill(null)
    .map((item, i) => randomDelay(i))

  for (const p of promises) {
    await p
  }
  console.log(`${Date.now() - t0} ms elapsed`)
}
foo()
/* 
  1 finished
  3 finished
  0 finished
  4 finished
  2 finished
  806 ms elapsed
*/

// await按顺序收到每个期约的值
async function randomDelay(id) {
  const delay = Math.random() * 1000 // 随机延迟0-1000毫秒
  return new Promise((resolve) =>
    setTimeout(() => {
      console.log(`${id} finished`)
      resolve(id)
    }, delay)
  )
}
async function foo() {
  const t0 = Date.now()
  const promises = Array(5)
    .fill(null)
    .map((item, i) => randomDelay(i))

  for (const p of promises) {
    console.log(`awaited ${await p}`)
  }
  console.log(`${Date.now() - t0} ms elapsed`)
}
foo()
/* 
  1 finished
  4 finished
  0 finished
  awaited 0
  awaited 1
  2 finished
  awaited 2
  3 finished
  awaited 3
  awaited 4
  833 ms elapsed
*/

/* 串行执行期约 */

function addTwo(x) {
  return x + 2
}
function addThree(x) {
  return x + 3
}
function addFive(x) {
  return x + 5
}
async function addTen(x) {
  for (const fn of [addTwo, addThree, addFive]) {
    x = await fn(x)
  }
  return x
}
addTen(9).then((res) => console.log(res)) // 19

// 将函数改成异步函数，返回期约
async function addTwo(x) {
  return x + 2
}
async function addThree(x) {
  return x + 3
}
async function addFive(x) {
  return x + 5
}
addTen(9).then((res) => console.log(res)) // 19

/* 栈追踪与内存管理 */
function fooPromiseExecutor(resolve, reject) {
  setTimeout(reject, 1000, 'bar')
}
function foo() {
  new Promise(fooPromiseExecutor)
}
foo()
/* 
  Uncaught (in promise) bar
  setTimeout (async) // 错误信息包含嵌套函数的标识符
  fooPromiseExecutor // fooPromiseExecutor函数已返回，不应该在栈追踪信息中看到
  foo
*/

// 换成异步函数
async function foo() {
  await new Promise(fooPromiseExecutor)
}
foo()
/* 
  Uncaught (in promise) bar
  foo
  async function (async)
  foo
*/
