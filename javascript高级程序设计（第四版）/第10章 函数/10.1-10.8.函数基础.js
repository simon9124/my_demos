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

/* 10.4 没有重载 */

/* 10.5 默认参数值 */

/* 10.6 参数扩展与收集 */

/* 10.7 函数声明与函数表达式 */

/* 10.8 函数作为值 */
