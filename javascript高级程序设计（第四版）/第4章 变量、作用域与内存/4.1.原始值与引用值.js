/* 动态属性 */
let personRefer = new Object() // 创建对象
personRefer.name = 'Nicholas' // 添加属性并赋值
console.log(personRefer.name) // 'Nicholas'

let namePrim = 'Nicholas' // 原始值
namePrim.age = 27 // 给原始值添加属性
console.log(namePrim.age) // undefined，不报错但无效

let name1 = 'Nicholas' // 原始类型
let name2 = new String('Matt') // 原始值包装类型
name1.age = 27
name2.age = 26
console.log(name1.age) // undefined，原始类型不能有属性
console.log(name2.age) // 26，引用类型可以有属性
console.log(typeof name1) // string，原始类型
console.log(typeof name2) // object，引用类型

/* 复制值 */
let num1Prim = 5
let num2Prim = num1Prim
console.log(num2Prim) // 5，原始值，复制的值是副本
num2Prim = 6 // 副本发生改变
console.log(num2Prim) // 6
console.log(num1Prim) // 5，被复制的值无变化

let obj1Refer = new Object()
let obj2Refer = obj1Refer // 引用值，复制的值是指针
obj2Refer.name = 'Nicholas' // 一个对象发生改变
console.log(obj2Refer.name) // 'Nicholas'
console.log(obj1Refer.name) // 'Nicholas'，影响另一个对象
delete obj1Refer.name // 一个对象发生改变
console.log(obj1Refer.name) // u
console.log(obj2Refer.name) // undefined，影响另一个对象

/* 传递参数 */
let count = 10 // 函数外，原始值作为参数
function addTen(num) {
  num += 10 // 函数内，参数的值发生改变
  return num
}
let result = addTen(count)
console.log(result) // 30
console.log(count) // 20，未受影响

let person = new Object() // 函数外，引用值作为参数
function setName(obj) {
  obj.name = 'Nicholas' // 函数内，obj和外部参数person指向同一个对象，并改变了这个对象的属性
}
setName(person)
console.log(person.name) // 'Nicholas'，受影响

let person2 = new Object()
function setName2(obj) {
  obj.name = 'Nicholas' // 改变参数的属性，参数受影响
  obj = new Object() // 重写参数，参数不受该影响
  obj.name = 'Greg'
}
setName2(person2)
console.log(person2.name) // 'Nicholas'

/* 确定类型 */
let str = 'Nicholas'
let num = 30
let boo = true
let u
let n = null
let sym = Symbol()
let f = new Function()
let o = new Object()
let a = new Array()
let r = new RegExp()

// typeof
console.log(typeof str) // string，原始值
console.log(typeof num) // number，原始值，原始值
console.log(typeof boo) // boolean，原始值
console.log(typeof u) // undefined，原始值
console.log(typeof sym) // symbol，原始值
console.log(typeof f) // function，引用值但是Function会返回function

console.log(typeof n) // object，原始值但是Null会返回object
console.log(typeof o) // object，除Function之外的引用值都返回object
console.log(typeof a) // object，除Function之外的引用值都返回object
console.log(typeof r) // object，除Function之外的引用值都返回object

// instanceof
console.log(o instanceof Object) // true，o是Object的实例
console.log(f instanceof Function) // true，f是Function的实例
console.log(f instanceof Array) // false，f不是Array的实例
console.log(a instanceof Array) // true，a是Array的实例
console.log(r instanceof RegExp) // true，r是RegExp的实例

console.log(f instanceof Object) // true，所有引用类型都是Object的实例
console.log(a instanceof Object) // true，所有引用类型都是Object的实例
console.log(r instanceof Object) // true，所有引用类型都是Object的实例

console.log(n instanceof Object) // false，原始值不是对象，不是Object的实例
