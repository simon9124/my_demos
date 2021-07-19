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

async function bar() {
  return ['bar'] // 返回没有实现thenable接口的对象
}
console.log(bar()) // Promise {<fulfilled>: ['bar']}，被当作已解决的期约
bar().then((result) => console.log(result)) // ['bar']

async function baz() {
  const thenable = {
    then(callback) {
      callback('baz')
    },
  }
  return thenable // 返回实现了thenable接口的非期约对象
}
console.log(baz()) // Promise {<pending>}
baz().then((result) => console.log(result)) // 'baz'，由then()解包

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
