/* 10.1 箭头函数 */
let arrowSum = (a, b) => {
  return a + b
}
let functionExpressionSum = function (a, b) {
  return a + b
}
console.log(arrowSum(5, 8)) // 13
console.log(functionExpressionSum(5, 8)) // 13

// 只有1个参数，省略括号
let double = (x) => {
  return x * 3
}
console.log(double(3)) // 9

// 不用大括号，隐式返回
let person = {}
let setName = (obj) => (obj.name = 'Matt') // 相当于 { return obj.name = 'Matt' }
// let setName = (obj) => { return (obj.name = 'Matt') } // 用大括号的写法
setName(person)
console.log(person.name) // 'Matt'

/* 10.2 函数名 */
function sum(num1, num2) {
  return num1 + num2
}
console.log(sum(10, 10)) // 20

var anotherSum = sum // 使用不带括号的函数名是访问函数指针，而非调用函数
console.log(anotherSum(10, 10)) // 20

sum = null // 切断sum与函数的关系
console.log(anotherSum(10, 10)) // 20，anotherSum()仍可正常调用
// console.log(sum(10, 10)) // 会报错，sum is not a function

// name标识符
function foo() {} // 函数声明
let bar = function () {} // 函数表达式
let baz = () => {} // 箭头函数

console.log(foo.name) // 'foo'
console.log(bar.name) // 'bar'
console.log(baz.name) // 'baz'
console.log((() => {}).name) // 空字符串
console.log(new Function().name) // 'anonymous'

// 标识符前缀
console.log(foo.bind(null).name) // 'bound foo' ，标识符前加前缀
let dog = {
  years: 1,
  get age() {
    return this.years
  },
  set age(newAge) {
    this.years = newAge
  },
}
let propertyDescriptor = Object.getOwnPropertyDescriptor(dog, 'age') // 获取属性描述符
console.log(propertyDescriptor) // { get: [Function: get age], set: [Function: set age], enumerable: true, configurable: true }
console.log(propertyDescriptor.get.name) // 'get age'，标识符前加前缀
console.log(propertyDescriptor.set.name) // 'set age'，标识符前加前缀

/* 10.3 理解参数 */

// arguments取得每个参数值
function sayHi(name, message) {
  console.log(`Hello ${name}, ${message}`)
}
function sayHi2(name, message) {
  console.log(`Hello ${arguments[0]}, ${arguments[1]}`)
}
function sayHi3() {
  // 没有命名参数
  console.log(`Hello ${arguments[0]}, ${arguments[1]}`)
}
sayHi('Jake', 'How are you') // 'Hello Jake, How are you'
sayHi2('Jake', 'How are you') // 'Hello Jake, How are you'
sayHi3('Jake', 'How are you') // 'Hello Jake, How are you'

// arguments.length检查参数个数
function howManyArgs() {
  console.log(arguments.length) // 检查参数个数
}
howManyArgs('string', 45) // 2
howManyArgs() // 0
howManyArgs(12) // 1

// arguments与命名参数一起使用
function doAdd(num1, num2) {
  if (arguments.length === 1) {
    console.log(num1 + 10)
  } else if (arguments.length === 2) {
    console.log(arguments[0] + num2)
  }
}
doAdd(10) // 20，10+10
doAdd(30, 20) // 50，30+20

// arguments与命名参数同步
function args(num1, num2) {
  arguments[1] = 10
  console.log(num1, num2)
}
args(2, 3) // 2 10

function args2(num1, num2) {
  arguments[1] = 10
  console.log(num1, num2)
}
args2(2) // 2 undefined，调用函数时只传入一个参数，修改arguments不会改变第二个命名参数，仍旧是undefined

function args3(num1, num2) {
  num1 = 10
  console.log(arguments[0], arguments[1])
}
args3(2, 3) // 10 3

// 严格模式arguments的变化
function strictArgs(num1, num2) {
  'use strict'
  arguments[1] = 10
  console.log(num1, num2)
  // arguments = [] // SyntaxError: Unexpected eval or arguments in strict mode，不能重写arguments
}
strictArgs(2, 3) // 2 3，arguments与命名参数不再同步

// 箭头函数不能访问arguments
let bar2 = (num1, num2) => {
  // console.log(arguments[0], arguments[1]) // Uncaught ReferenceError: arguments is not defined
  console.log(num1, num2)
}
bar2(2, 3) // 2 3

/* 10.4 没有重载 */
function addSomeNumber(num) {
  return num + 100
}
function addSomeNumber(num) {
  return num + 200
}
let result = addSomeNumber(100)
console.log(result) // 300

// 把函数名当成指针
let addSomeNumber2 = function (num) {
  return num + 100
}
addSomeNumber2 = function (num) {
  return num + 200
}
let result2 = addSomeNumber2(100)
console.log(result2) // 300

/* 10.5 默认参数值 */

// ES5及以前
function makeKing(name) {
  name = typeof name !== 'undefined' ? name : 'Henry' // 检测参数name是否为undefined，如果是则赋值
  return `King ${name} VIII`
}
console.log(makeKing()) // 'King Henry VIII'
console.log(makeKing('James')) // 'King James VIII'

// ES6及以后
function makeKing2(name = 'Henry') {
  return `King ${name} VIII`
}
console.log(makeKing2()) // 'King Henry VIII'
console.log(makeKing2('James')) // 'King James VIII'

// arguments只反映传给函数的参数
function makeKing3(name = 'Henry') {
  name = 'Louis' // 修改命名参数
  return `King ${arguments[0]}`
}
console.log(makeKing3()) // 'King undefined'，传给函数的参数为undefined
console.log(makeKing3('James')) // 'King James'，传给函数的参数为'James'

// 使用调用函数返回值作为默认参数值
let romanNumerals = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ']
let ordinality = 0
function getNumerals() {
  return romanNumerals[ordinality++] // 每次调用后递增
}
function makeKing4(name = 'Henry', numerals = getNumerals()) {
  return `King ${name} ${numerals}`
}
console.log(makeKing4()) // 'King Henry Ⅰ'，未传numerals参数，调用函数getNumerals()
console.log(makeKing4('James', 'Ⅸ')) // 'King James Ⅸ'，已传numerals参数，不调用函数
console.log(makeKing4()) // 'King Henry Ⅱ'，未传numerals参数，调用函数getNumerals()
console.log(makeKing4()) // 'King Henry Ⅲ'，未传numerals参数，调用函数getNumerals()

// 箭头函数默认参数
let makeKing5 = (name = 'Henry') => `King ${name}`
console.log(makeKing5()) // 'King Henry'

/* 默认参数作用域与暂时性死区 */
function makeKing6(name = 'Henry', numerals = 'Ⅷ') {
  return `King ${name} ${numerals}`
}

// 使用let按顺序声明变量
function makeKing7() {
  let name = 'Henry'
  let numerals = 'Ⅷ'
  return `King ${name} ${numerals}`
}

// 后定义默认值的参数引用先定义的参数
function makeKing8(name = 'Henry', numerals = name) {
  return `King ${name} ${numerals}`
}
console.log(makeKing8()) // 'King Henry Henry'

// 先定义默认值的参数不能引用后定义的参数
function makeKing9(name = numerals, numerals = 'Ⅷ') {
  return `King ${name} ${numerals}`
}
// console.log(makeKing9()) // ReferenceError: Cannot access 'numerals' before initialization

// 参数不能引用函数体的作用域
function makeKing10(name = 'Henry', numerals = defaultNumeral) {
  let defaultNumeral = 'Ⅷ'
  return `King ${name} ${numerals}`
}
// console.log(makeKing10()) // ReferenceError: defaultNumeral is not defined

/* 10.6 参数扩展与收集 */
let values = [1, 2, 3, 4]
function getSum() {
  let sum = 0
  for (let i = 0; i < arguments.length; i++) {
    sum += arguments[i]
  }
  return sum
}

/* 10.6.1 扩展参数 */
console.log(getSum(...values)) // 10，1+2+3+4
console.log(getSum(-1, ...values)) // 9，-1+1+2+3+4
console.log(getSum(...values, 5)) // 15，1+2+3+4+5
console.log(getSum(-1, ...values, 5)) // 14，-1+1+2+3+4+5
console.log(getSum(...values, ...[5, 6, 7])) // 28，1+2+3+4+5+6+7

// arguments仍按照传入的参数接收每个值
function countArgs() {
  console.log(arguments.length)
}
countArgs(-1, ...values) // 5
countArgs(...values, 5) // 5
countArgs(-1, ...values, 5) // 6
countArgs(...values, ...[5, 6, 7]) // 7

// 同时使用...和默认参数
function getProduct(a, b, c = 1) {
  return a * b * c
}
console.log(getProduct(...[1, 2])) // 2，1*2*1
console.log(getProduct(...[1, 2, 3])) // 6，1*2*3
console.log(getProduct(...[1, 2, 3, 4])) // 6，1*2*3

let getSum2 = (a, b, c = 0) => {
  return a + b + c
}
console.log(getSum2(...[0, 1])) // 1，0+1
console.log(getSum2(...[0, 1, 2])) // 3，0+1+2
console.log(getSum2(...[0, 1, 2, 3])) // 3，0+1+2

/* 10.6.2 收集参数 */
function getSum3(...values) {
  return values.reduce((pre, cur) => pre + cur, 0)
}
console.log(getSum3(1, 2, 3)) // 6

// 只能作为最后一个参数
// function getProduct(...values, lastValue) {} // SyntaxError: Rest parameter must be last formal parameter
function ignoreFirst(firstValue, ...values) {
  console.log(values)
}
ignoreFirst() // []，没收集到
ignoreFirst(1) // []，没收集到
ignoreFirst(1, 2) // [2]，收集其余参数
ignoreFirst(1, 2, 3) // [2, 3]，收集其余参数

// 箭头函数支持收集参数
let getSum4 = (...values) => values.reduce((pre, cur) => pre + cur, 0)
console.log(getSum4(1, 2, 3, 4)) // 10

// 不影响arguments
function getSum5(...values) {
  console.log(arguments.length) // 4
  console.log(arguments) // [Arguments] { '0': 1, '1': 2, '2': 3, '3': 4 }
  console.log(values) // [ 1, 2, 3, 4 ]
}
getSum5(1, 2, 3, 4)

/* 10.7 函数声明与函数表达式 */

console.log(sumDeclare(10, 10)) // 函数声明会提前
function sumDeclare(num1, num2) {
  return num1 + num2
}
// console.log(sumExpression(10, 10)) // 函数表达式不会提前，会报错，sumExpression is not a function
let sumExpression = function (num1, num2) {
  return num1 + num2
}

/* 10.8 函数作为值 */
function callSomeFunction(someFunction, someArgument) {
  return someFunction(someArgument)
}

function add10(num) {
  return num + 10
}
let result3 = callSomeFunction(add10, 10) // 访问函数的指针而不是执行函数，add10不带括号
console.log(result3) // 20

function getGreeting(name) {
  return 'Hello,' + name // Hello,Nicholas
}
let result4 = callSomeFunction(getGreeting, 'Nicholas') // 访问函数的指针而不是执行函数，getGreeting不带括号
console.log(result4) // 'Hello,Nicholas'

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
