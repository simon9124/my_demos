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
