/* 10.9 函数内部 */

/* 10.9.1 arguments */

// 递归函数：计算阶乘
function factorial(num) {
  if (num <= 1) return 1
  else return num * factorial(num - 1)
}
// 使用arguments.callee解耦函数逻辑与函数名
function factorial(num) {
  if (num <= 1) return 1
  else return num * arguments.callee(num - 1) // callee指向arguments对象所在函数
}

let trueFactorial = factorial // 保存函数的指针

// 重写factorial函数，trueFactorial指针不变
factorial = function () {
  return 0
}
console.log(trueFactorial(5)) // 120，已用arguments.callee解除函数体内代码与函数名的耦合，仍能正常计算
console.log(factorial(5)) // 0，函数已被重写

/* 10.9.2 this */

// 标准函数中
global.color = 'red' // vscode是node运行环境，无法识别全局对象window，测试时将window改为global
let o = { color: 'blue' }
function sayColor() {
  console.log(this.color)
}
sayColor() // 'red'，this指向全局对象
o.sayColor = sayColor
o.sayColor() // 'blue'，this指向对象o

// 箭头函数中
let sayColor2 = () => {
  console.log(this.color) // this指向定义sayColor2的上下文，即全局对象
}
sayColor2() // 'red'，this指向全局对象
o.sayColor2 = sayColor2
o.sayColor2() // 'red'，this指向全局对象

// 事件回调或定时回调中，使用箭头函数解决this指向问题
function King() {
  this.royaltyName = 'Henry'
  setTimeout(() => {
    console.log(this.royaltyName) // 箭头函数，this指向定义函数的上下文，即King()的函数上下文
  }, 1000)
}
function Queen() {
  this.royaltyName = 'Elizabeth'
  setTimeout(function () {
    console.log(this.royaltyName) // 标准函数，this指向调用函数的上下文，即setTimeout()的函数上下文
  }, 1000)
}
new King() // 'Henry'，1秒后打印
new Queen() // undefined，1秒后打印

/* 10.9.3 caller */
function callerTest() {
  console.log(callerTest.caller)
}
callerTest() // null，在全局作用域种调用

function outer() {
  inner()
}
function inner() {
  console.log(inner.caller)
}
outer() // [Function: outer]，在outer()调用

// 解除耦合
function inner() {
  console.log(arguments.callee.caller) // arguments.callee指向arguments所在函数的指针，即inner
}
outer() // [Function: outer]，在outer()调用

// arguments.caller
function inner2() {
  console.log(arguments.caller) // undefined
  console.log(arguments.callee) // [Function: inner2]
}
inner2()

/* 10.9.4 new.target */
function King2() {
  if (!new.target) {
    console.log(new.target, 'King2 must be instantiated using "new"')
  } else {
    console.log(new.target, 'King2 instantiated using "new"')
  }
}
new King2() // [Function: King2] 'King2 instantiated using "new"'
King2() // undefined 'King2 must be instantiated using "new"'

/* 10.10 函数属性与方法 */

// length
function nameLength(name) {
  return name
}
function sumLength(sum1, sum2) {
  return sum1 + sum2
}
function helloLength() {
  return 'Hello'
}
console.log(nameLength.length, sumLength.length, helloLength.length) // 1 2 0

// prototype
console.log(Array.prototype) // 在浏览器中查看Array的原型对象，包含sort()等方法
console.log(Object.keys(Array)) // []，Array构造函数自身所有可枚举的属性
console.log(Object.getOwnPropertyNames(Array)) // [ 'length', 'name', 'prototype', 'isArray', 'from', 'of' ]，Array构造函数自身的所有属性

function sum(num1, num2) {
  return num1 + num2
}

// apply()
function applySum1(num1, num2) {
  return sum.apply(this, arguments) // 传入arguments对象
}
function applySum2(num1, num2) {
  return sum.apply(this, [num1, num2]) // 传入数组实例
}
console.log(applySum1(10, 10)) // 20
console.log(applySum2(10, 10)) // 20

// call()
function callSum(num1, num2) {
  return sum.call(this, num1, num2) // 逐个传入每个参数
}
console.log(callSum(10, 10)) // 20

// 控制this值
global.color = 'red' // vscode是node运行环境，无法识别全局对象window，测试时将window改为global
let o2 = { color: 'blue' }
function sayColor3() {
  console.log(this.color)
}
sayColor3() // 'red'，this指向全局对象
sayColor3.call(this) // 'red'，this指向全局对象
sayColor3.call(global) // 'red'，this指向全局对象，测试时将window改为global
sayColor3.call(o2) // 'blue'，this指向对象o2

// Function.prototype.apply.call
let f1 = function () {
  console.log(arguments[0] + this.mark)
}
let o3 = {
  mark: 95,
}
f1([15]) // '15undefined'，this指向f1的函数上下文，this.mark为undefined
f1.apply(o3, [15]) // 110，将f1的this绑定到o3
Function.prototype.apply.call(f1, o3, [15]) // 110，函数f1的原型对象的apply方法，利用call进行绑定
Reflect.apply(f1, o3, [15]) // 110，通过指定的参数列表发起对目标函数的调用，三个参数（目标函数、绑定的this对象、实参列表）

// bind()
let o4 = { color: 'blue' }
function sayColor4() {
  console.log(this.color)
}
let bindSayColor = sayColor4.bind(o4) // 创建实例bindSayColor，其this被绑定给o4
sayColor4() // 'red'，this指向全局对象
bindSayColor() // 'blue'，this被绑定给对象o4

/* 10.11 函数表达式 */

// 函数声明提升
sayHi() // 'Hi'，先调用后声明
function sayHi() {
  console.log('Hi')
}

// 函数表达式没有提升
// sayHi2() // ReferenceError: Cannot access 'sayHi2' before initialization，不能先调用后赋值
let sayHi2 = function sayHi() {
  console.log('Hi')
}

// 条件块中的函数声明和函数表达式
let condition = false
if (condition) {
  function sayHi3() {
    console.log('true')
  }
} else {
  function sayHi3() {
    console.log('false')
  }
}
sayHi3() // 不同浏览器的结果不同，避免在条件块中使用函数声明

let sayHi4
if (condition) {
  sayHi4 = function () {
    console.log('true')
  }
} else {
  sayHi4 = function () {
    console.log('false')
  }
}
sayHi4() // false，可以在条件块中使用函数表达式

/**
 * 按照对象数组的某个object key，进行数组排序
 * @param {String} key 要排序的key
 * @param {String} sort 正序/倒序：asc/desc，默认为asc
 */
function arraySort(key, sort) {
  return function (a, b) {
    if (sort === 'asc' || sort === undefined || sort === '') {
      // 正序：a[key] > b[key]
      if (a[key] > b[key]) return 1
      else if (a[key] < b[key]) return -1
      else return 0
    } else if (sort === 'desc') {
      // 倒序：a[key] < b[key]
      if (a[key] < b[key]) return 1
      else if (a[key] > b[key]) return -1
      else return 0
    }
  }
}
var userList = [
  { name: 'Tony', id: 3 },
  { name: 'Tom', id: 2 },
  { name: 'Jack', id: 5 },
]
console.log(userList.sort(arraySort('id'))) // [{ name: 'Tom', id: 2 },{ name: 'Tony', id: 3 },{ name: 'Jack', id: 5 }]，按 id 正序排列
console.log(userList.sort(arraySort('id', 'desc'))) // [{ name: 'Jack', id: 5 },{ name: 'Tony', id: 3 },{ name: 'Tom', id: 2 }]，按 id 倒序排列
console.log(userList.sort(arraySort('name'))) // [{ name: 'Jack', id: 5 },{ name: 'Tom', id: 2 },{ name: 'Tony', id: 3 }]，按 name 正序排列
