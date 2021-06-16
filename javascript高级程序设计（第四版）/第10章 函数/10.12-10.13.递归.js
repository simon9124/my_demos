/* 10.12 递归 */
function factorial(num) {
  if (num <= 1) {
    return 1
  } else {
    return num * factorial(num - 1)
  }
}

// 递归函数赋值给其他变量，并解除原函数名与函数之间的关系
let anotherFactorial = factorial // 访问指针
factorial = null // 切断factorial与函数之间的联系
// console.log(anotherFactorial(4)) // TypeError: factorial is not a function

// arguments.callee解藕
function factorial2(num) {
  if (num <= 1) {
    return 1
  } else {
    return num * arguments.callee(num - 1)
  }
}
let anotherFactorial2 = factorial2 // 访问指针
factorial2 = null // 切断factorial与函数之间的联系
console.log(anotherFactorial2(4)) // 24，arguments.callee指向anotherFactorial2

// 严格模式下使用命名函数表达式
let factorial3 = function f(num) {
  if (num <= 1) {
    return 1
  } else {
    return num * f(num - 1) // 无论赋值给哪个变量，表达式f都不会变
  }
}
let anotherFactorial3 = factorial3
factorial3 = null
console.log(anotherFactorial3(4)) // 24

/* 10.13 尾调用优化 */
function outerFunction() {
  return innerFunction() // 尾调用
}

/* 10.13.1 尾调用优化的条件 */
;('use strict')

function outerFunction() {
  innerFunction() // 无优化，尾调用没有返回
}

function outerFunction() {
  let innerFunctionResult = innerFucntion()
  return innerFunctionResult() // 无优化，尾调用没有直接返回
}

function outerFunction() {
  return innerFunction().toString() // 无优化，尾调用返回后必须转型为字符串（有额外逻辑）
}

function outerFunction() {
  let foo = 'bar'
  function innerFunction() {
    return foo
  }
  return innerFunction() // 无优化，尾调用是一个闭包
}

function outerFunction(a, b) {
  innerFunction(a + b) // 有优化，栈帧销毁前执行参数计算
}

function outerFunction(a, b) {
  if (a < b) return a
  innerFunction(a + b) // 有优化，初始返回值不涉及栈帧
}

function outerFunction(condition) {
  return condition ? innerFunctionA() : innerFunctionB() // 有优化，2个内部函数都在尾部
}

/* 10.13.1 尾调用优化的代码 */
function fib(n) {
  if (n < 2) {
    return n
  }
  return fib(n - 1) + fib(n - 2) // 返回语句有相加操作，不符合优化条件
}

// 使用2个嵌套的函数重构斐波那契数列
;('use strict')

function fib(n) {
  return fibImp1(0, 1, n) // 以0为初始值，1作为第1个数字，n为第几个数字
}
function fibImp1(a, b, n) {
  if (n === 0) return a
  return fibImp1(b, a + b, n - 1) // 外部函数的返回值是内部函数的返回值，符合优化条件
}
