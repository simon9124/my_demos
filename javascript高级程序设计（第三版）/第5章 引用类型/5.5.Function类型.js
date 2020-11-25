/* 访问函数指针 */

function sum(num1, num2) {
  return num1 + num2
}
console.log(sum(10, 10))

var anotherSum = sum // 使用不带圆括号的函数名是访问函数指针，而非调用函数
console.log(anotherSum(10, 10))

sum = null // sum与函数断绝关系
console.log(anotherSum(10, 10)) // 但anotherSum()仍可正常调用
// console.log(sum(10, 10)) // 会报错，sum is not a function

/* 没有重载 */

function addSomeNumber(num) {
  return num + 100
}
// 创建第二个函数
function addSomeNumber(num) {
  return num + 200
}
// 第二个函数等价于下列代码 -> 覆盖了引用第一个函数的变量addSomeNumber
addSomeNumber = function (num) {
  return num + 200
}
var result = addSomeNumber(100)
console.log(result) // 300

/* 函数声明与函数表达式 */

console.log(sumDeclare(10, 10)) // 函数声明会提前
function sumDeclare(num1, num2) {
  return num1 + num2
}
// console.log(sumExpression(10, 10)) // 函数表达式不会提前，会报错，sumExpression is not a function
var sumExpression = function (num1, num2) {
  return num1 + num2
}

/* 作为值的函数 */

function callSomeFunction(someFunction, someArgument) {
  return someFunction(someArgument)
}

function add10(num) {
  return num + 10
}
var result1 = callSomeFunction(add10, 10) // 访问函数的指针而不是执行函数
console.log(result1) // 20

function getGreeting(name) {
  return 'Hello,' + name // Hello,Nicholas
}
var result2 = callSomeFunction(getGreeting, 'Nicholas') // 访问函数的指针而不是执行函数
console.log(result2)

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
console.log(userList.sort(arraySort('id'))) // 按 id 正序排列
console.log(userList.sort(arraySort('id', 'desc'))) // 按 id 倒序排列

/* 函数内部属性 arguments & this & caller */

// 1.arguments对象，arguments.callee

// 递归函数：计算阶乘
function factorial(num) {
  if (num <= 1) return 1
  else return num * factorial(num - 1)
}
// 内部不再引用函数名，无论函数名是什么，都可以保证完成递归调用
function factorial(num) {
  if (num <= 1) return 1
  else return num * arguments.callee(num - 1) // callee指向拥有这个arguments对象的函数
}

var trueFactorial = factorial // 保存函数的指针
factorial = function () {
  return 0
}
console.log(trueFactorial(5)) // 120，已用arguments.callee解除函数体内代码与函数名的耦合，仍能正常计算
console.log(factorial(5)) // 0

// 2.this对象
// vscode是node运行环境，无法识别全局对象window，为方便在编辑器测试做了微调
// window.color = 'red'
// sayColor()
var window = { color: 'red' }
var o = { color: 'blue' }
function sayColor() {
  console.log(this.color)
}
window.sayColor = sayColor
window.sayColor() // red，此时this指向对象window
o.sayColor = sayColor
o.sayColor() // blue，此时this指向对象o

// 3.caller属性
function callerTest() {
  console.log(callerTest.caller)
}
callerTest() // 在全局作用域种调用当前函数，caller 的值为 null

function outer() {
  inner()
}
function inner() {
  console.log(inner.caller)
}
outer() // outer()调用了inner，因此打印outer()函数的源代码

function inner() {
  console.log(arguments.callee.caller) // 可以解除紧密耦合
}
outer() // 结果不变，打印outer()函数的源代码

/* 函数属性和方法 length & prototype(apply() & call() & bind()) */

// 1.length属性
function nameLength(name) {
  return name
}
function sumLength(sum1, sum2) {
  return sum1 + sum2
}
function helloLength() {
  return 'Hello'
}
console.log(nameLength.length, sumLength.length, helloLength.length) // 1,2,0

// 2.prototype属性 —— apply()、call()、bind()
function sumPrototype(num1, num2) {
  return num1 + num2
}

// apply()
function applySum1(num1, num2) {
  return sumPrototype.apply(this, arguments) // 传入arguments对象
}
function applySum2(num1, num2) {
  return sumPrototype.apply(this, [num1, num2]) // 传入数组实例
}
console.log(applySum1(10, 10))
console.log(applySum2(10, 10))

// call()
function callSum(num1, num2) {
  return sumPrototype.call(this, num1, num2) //分别传入每个参数
}
console.log(callSum(10, 10))

// apply()和call()扩充函数运行的作用域
// vscode是node运行环境，无法识别全局对象window，为方便在编辑器测试做了微调
var windowCall = { color: 'red' }
var oCall = { color: 'blue' }
function callColor() {
  console.log(this.color)
}
callColor() // undefined，此时找不到this指向的对象
callColor.call(this) // undefined，此时找不到this指向的对象
callColor.call(windowCall) // red，此时this指向对象windowCall
callColor.call(oCall) // blue，此时this指向对象oCall

// bind()
// vscode是node运行环境，无法识别全局对象window，为方便在编辑器测试做了微调
var windowBind = { color: 'red' }
var oBind = { color: 'blue' }
function bindColor() {
  console.log(this.color)
}
var bindColor = bindColor.bind(oBind) // 创建实例bindColor，bindColor的this被绑定给oBind
bindColor() // blue，此时this被绑定给对象oBind
