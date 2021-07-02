/* 11.1 异步编程 */

/* 11.1.1 同步与异步 */

// 同步行为
let x = 3 // 操作系统在栈内存上分配一个存储浮点数值的空间
x = x + 4 // 针对这个值做一次数学计算，并把计算结果写回之前分配的内存中

// 异步行为
let x2 = 3 // 操作系统在栈内存上分配一个存储浮点数值的空间
setTimeout(() => {
  x = x + 4 // 执行线程不知道x值何时会改变，取决于回调何时从消息队列出列并执行
}, 1000)

/* 11.1.2 以往的异步编程模式 */
function double(value) {
  setTimeout(() => {
    setTimeout(() => {
      console.log(value * 2)
    }, 2000) // 2000毫秒后，JS运行时会把回调函数推到消息队列上等待执行
  }, 1000) // 1000毫秒后，JS运行时会把回调函数推到消息队列上等待执行
}
double(3) // 6(约3000毫秒后)，double()函数在setTimeout成功调度异步操作后，立即退出

/* 异步返回值 */
function double2(value, callback) {
  setTimeout(() => {
    callback(value * 2) // 1000毫秒后，把回调函数推到消息队列上
  }, 1000)
}
double2(3, (x) => console.log(`I was given: ${x}`)) // 'I was given: 6'(约1000毫秒后)

/* 失败处理 */
function double3(value, success, failure) {
  setTimeout(() => {
    // 必须在初始化异步操作时定义回调
    try {
      if (typeof value !== 'number') {
        throw 'Must provide number as first argument'
      }
      success(value * 2)
    } catch (error) {
      failure(error)
    }
  }, 1000)
}
const successCallback = (x) => console.log(`Success: ${x}`)
const failureCallback = (e) => console.log(`Failure: ${e}`)
double3(3, successCallback, failureCallback) // 'Success: 6'(约1000毫秒后)
double3('3', successCallback, failureCallback) // 'Failure: Must provide number as first argument'(约1000毫秒后)

/* 嵌套异步回调 */
function double4(value, success, failure) {
  setTimeout(() => {
    try {
      if (typeof value !== 'number') {
        throw 'Must provide number as first argument'
      }
      success(value * 2)
    } catch (error) {
      failure(error)
    }
  }, 1000)
}
const successCallback2 = (x) => {
  double4(x, (y) => console.log(`Success: ${y}`)) // 异步返回值依赖另一个异步返回值，嵌套回调产生“回调地狱”
}
const failureCallback2 = (e) => console.log(`Failure: ${e}`)
double4(3, successCallback2, failureCallback2) // 'Success: 12'(约2000毫秒后)
