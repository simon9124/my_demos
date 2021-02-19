var name = 'Nicholas'
// console.log(window.name) // 'Nicholas'，浏览器中全局上下文是window对象

var color = 'blue'
function getColor() {
  console.log(arguments) // [Arguments] { '0': 'blue' }，arguments是一个类数组对象
  console.log(color) // 'blue'
}
getColor(color) // 该函数的作用域链包含2个对象：arguments和全局变量对象

/* 全局上下文，只能访问全局变量color */
var color = 'blue' // 全局变量
function changeColor() {
  /* changeColor函数的局部上下文，可以访问color和anotherColor */
  let anotherColor = 'red' // changeColor函数的局部变量
  function swapColors() {
    /* swapColors函数的局部上下文，可以访问color、anotherColor、tempColor */
    let tempColor = anotherColor
    anotherColor = color
    color = tempColor
  }
  swapColors()
}
changeColor()

/* 变量声明 */

// var声明
function add1(num1, num2) {
  var sum1 = num1 + num2 // sum1存在于函数的局部上下文
  return sum1
}
let result1 = add1(10, 20)
// console.log(sum1) // ReferenceError: sum1 is not defined，函数外访问不到sum1

function add2(num1, num2) {
  sum2 = num1 + num2 // 未经声明就初始化，sum2自动添加到全局上下文
  return sum2
}
let result2 = add2(10, 20)
console.log(sum2) // 30，可在全局中访问

console.log(name2) // undefined，声明提升，不报错
var name2 = 'Jake'

// let声明
if (true) {
  let a
  console.log(a) // undefined
}
// console.log(a) // ReferenceError: a is not defined

let b
// let b // SyntaxError: Identifier 'b' has already been declared，重复声明

for (var indexVar = 0; indexVar < 5; indexVar++) {}
console.log(indexVar) // 5，循环体外部可以访问到
for (let indexLet = 0; indexLet < 5; indexLet++) {}
// console.log(indexLet) // ReferenceError: indexLet is not defined，循环体外部无法访问

// console.log(ageLetPromote) // ReferenceError: ageLetPromote is not defined
let ageLetPromote = 26

// const声明
// const c // SyntaxError: Missing initializer in const declaration
const c = 3
// c = 4 // TypeError: Assignment to constant variable.

if (true) {
  const d = 0
}
// console.log(d) // ReferenceError: d is not defined

const o1 = {}
// o1 = {} // TypeError: Assignment to constant variable，不能给常量赋值
o1.name = 'Nicholas' // 对象的键可以重新赋值
console.log(o1) // { name: 'Nicholas' }

// Object.freeze()
const o2 = Object.freeze({})
o2.name = 'Nicholas'
console.log(o2.name) // undefined

// 标识符查找
var color = 'blue'
function getColor() {
  /* 搜索：
    1.搜索getColor()中的变量对象，未找到名为color的标识符
    2.继续搜索下一个变量对象，即全局上下文，找到了名为color的标识符，搜索结束
  */
  return color
}
console.log(getColor()) // 'blue'

var color = 'blue'
function getColor2() {
  let color = 'red'
  /* 搜索：
    1.搜索getColor()中的变量对象，找到了名为color的标识符，搜索结束
  */
  console.log(color) // 'red'，局部变量
  // console.log(window.color) // 'blue'，全局变量（浏览器中查看）
  return color
}
console.log(getColor2()) // 'red'
