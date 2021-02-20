/* var关键字 */
var message
console.log(message) // undefined
var message = 'hi'
message = 100 // 合法，但不推荐
console.log(message) // 100

// var声明作用域
function test() {
  var messageTest = 'hi' // 在函数内部创建变量并赋值
}
test() // 调用函数，内部变量被销毁
// console.log(messageTest) // ReferenceError: messageTest is not defined

function test() {
  messageTest = 'hi' // 省略var操作符，全局变量
}
test() // 调用函数，定义内部的全局变量
console.log(messageTest) // 'hi'

// var声明提升
function foo() {
  console.log(age)
  var age = 30
}
foo() // undefined，不报错，变量声明提升到函数作用域顶部
console.log(age)
var age = 30 // undefined，不报错，变量声明提升到全局作用域顶部

function fooAge() {
  var age = 16
  var age = 26
  var age = 36
  console.log(age)
}
fooAge() // 36，可反复多次使用var声明同一个变量

/* let声明 */
if (true) {
  var nameVar = 'Matt'
  console.log(nameVar) // 'Matt'
}
console.log(nameVar) // 'Matt'
if (true) {
  let nameLet = 'Matt' // 作用域仅限块内部
  console.log(nameLet) // 'Matt'
}
// console.log(nameLet) // ReferenceError: nameLet is not defined

// 冗余声明
var nameVar
var nameVar // var允许重复声明同一个变量
let nameLet
// let nameLet // Identifier 'nameLet' has already been declared，冗余声明
// let nameVar // Identifier 'nameVar' has already been declared
// var nameLet // Identifier 'nameLet' has already been declared

let ageNest = 30
console.log(ageNest) // 30
if (true) {
  let ageNest = 28
  console.log(ageNest) // 28，在不同的块中
}

// 暂时性死区
console.log(ageVarPromote) // undefined
var ageVarPromote = 26
// console.log(ageLetPromote) // ReferenceError: ageLetPromote is not defined
let ageLetPromote = 26

// 全局声明
var nameVarWhole = 'Matt'
// console.log(window.nameVarWhole) // 'Matt0'，vscode没有window对象，在浏览器印证
let nameLetWhole = 'Matt'
// console.log(window.nameLetWhole) // undefined，vscode没有window对象，在浏览器中印证

// 条件声明
if (typeof nameLetCondition === 'undefined') {
  let nameLetCondition = 'Matt' // 仅在块级作用域内
  console.log(nameLetCondition) // 'Matt'
}
// console.log(nameLetCondition) // ReferenceError: nameLetCondition is not defined

try {
  console.log(nameLetCondition2)
} catch (error) {
  let nameLetCondition2 = 'Matt' // 仅在块级作用域内
  console.log(nameLetCondition2) // 'Matt'
}
// console.log(nameLetCondition2) // ReferenceError: nameLetCondition2 is not defined

// for循环中的let声明
for (var iVar = 0; iVar < 5; iVar++) {}
console.log(iVar) // 5，循环体外部受影响
for (let iLet = 0; iLet < 5; iLet++) {}
// console.log(iLet) // ReferenceError: iLet is not defined

// 使用var声明：退出循环时，迭代变量保存的是导致循环退出的值
for (var iVarDelay = 0; iVarDelay < 5; iVarDelay++) {
  // 超时逻辑在退出循环后执行，此时变量的值为5
  setTimeout(() => {
    console.log(iVarDelay) // 5、5、5、5、5
  }, 0)
}
// 使用let声明：为每个迭代循环声明新的迭代变量
for (let iLetDelay = 0; iLetDelay < 5; iLetDelay++) {
  // 超时逻辑在退出循环后执行，变量值分别为每个新的迭代变量
  setTimeout(() => {
    console.log(iLetDelay) // 0、1、2、3、4
  }, 0)
}

/* const声明 */
// const ageConst // SyntaxError: Missing initializer in const declaration
const ageConst = 26
// ageConst = 28 // TypeError: Assignment to constant variable.
// const ageConst = 28 // SyntaxError: Identifier 'ageConst' has already been declared

if (true) {
  const nameConst = 'Nicholas'
}
// console.log(nameConst) // ReferenceError: nameConst is not defined

const person = {}
console.log(person.name) // undefined
person.name = 'Matt'
console.log(person.name) // 'Matt'，未重写地址，仅修改对象的内部属性
// person = { name: 'Matt' } // TypeError: Assignment to constant variable，重写地址

// for (const index = 0; index < 5; index++) {} // TypeError: Assignment to constant variable.

let i = 0
for (const j = 7; i < 5; i++) {
  console.log(j) // 7、7、7、7、7
}
for (const key in { a: 1, b: 2 }) {
  console.log(key) // a、b
}
for (const value of 'Matt') {
  console.log(value) // 'M'、'a'、't'、't'
}
