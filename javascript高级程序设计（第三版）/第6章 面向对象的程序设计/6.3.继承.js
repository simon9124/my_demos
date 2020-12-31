/* 原型链 */
function SuperType() {
  this.property = true
}
SuperType.prototype.getSuperValue = function () {
  return this.property
}
function SubType() {}
SubType.prototype = new SuperType() // SubType的原型 = SuperType的实例，SubType原型被重写 → SubType 继承了 SuperType

console.log(SubType.prototype.__proto__) // SuperType原型，SuperType实例的[[Prototype]]指向SuperType原型
console.log(SubType.prototype.__proto__.constructor) // SuperType构造函数，SuperType原型的constructor指向SuperType构造函数

var instance = new SubType()
console.log(instance.property) // true，SubType继承了property属性
console.log(SubType.prototype.hasOwnProperty('property')) // true，property是SuperType的实例属性，SubType的原型已被重写为SuperType的实例
console.log(instance.getSuperValue()) // true，SubType继承了getSuperValue()方法
console.log(SubType.prototype.hasOwnProperty('getSuperValue')) // false，getSuperValue是SuperType的原型方法，不存在于SubType的实例中
console.log(SuperType.prototype.hasOwnProperty('getSuperValue')) // true

console.log(instance.__proto__) // SuperType实例，SubType的原型SubType.prototype已被SuperType的实例重写
console.log(instance.constructor) // SuperType构造函数，constructor指向重写原型对象的constructor，即new SuperType()的constructor
console.log(instance.constructor === SubType.prototype.constructor) // true，都指向SuperType构造函数

// 默认原型
console.log(SuperType.prototype.__proto__ === Object.prototype) // true，SuperType的默认原型是Object的实例，Object实例的__proto__指向Object原型
console.log(SuperType.prototype.__proto__.constructor) // Object构造函数
console.log(Object.getOwnPropertyNames(SuperType.prototype.__proto__)) // [ 'constructor','__defineGetter__','__defineSetter__','hasOwnProperty','__lookupGetter__','__lookupSetter__','isPrototypeOf','propertyIsEnumerable','toString','valueOf','__proto__','toLocaleString' ]，Object原型上的所有方法

// instanceof
console.log(instance instanceof Object) // true，instance是Object的实例
console.log(instance instanceof SuperType) // true，instance是SuperType的实例
console.log(instance instanceof SubType) // true，instance是SubType的实例

// isPrototypeOf()
console.log(Object.prototype.isPrototypeOf(instance)) // true，Object.prototype是instance原型链上的原型
console.log(SuperType.prototype.isPrototypeOf(instance)) // true，SuperType.prototype是instance原型链上的原型
console.log(SubType.prototype.isPrototypeOf(instance)) // true，SubType.prototype是instance原型链上的原型

// 替换原型语句之后添加方法
SubType.prototype.getSubValue = function () {
  // 给子类型原型添加新方法
  return false
}
SubType.prototype.getSuperValue = function () {
  // 在子类型原型中重写超类型原型的方法
  return false
}
var instance2 = new SubType()
console.log(instance2.getSubValue()) // false
console.log(instance2.getSuperValue()) // false，方法被重写
var instance3 = new SuperType()
console.log(instance3.getSuperValue()) // true，不影响超类型原型中的方法

// 原型链实现继承时，不能使用对象字面量创建原型方法
function SubType2() {}
SubType2.prototype = new SuperType() // 继承
SubType2.prototype = {
  // 对象字面量重写原型，继承关系失效
  someFunction: function () {
    return false
  },
}
var instance4 = new SubType2()
// console.log(instance4.getSuperValue()) // error，对象字面量重写了原型，继承关系已失效

// 原型链的问题
function SuperTypePro(name) {
  this.nums = [1, 2, 3]
  this.name = name
}
SuperTypePro.prototype.getSuperNums = function () {
  return this.nums
}
function SubTypePro() {}
SubTypePro.prototype = new SuperTypePro() // 继承

var instance5 = new SubTypePro()
instance5.nums.push(4) // 非重新定义，而是向超类型实例的数组中添加数据
console.log(instance5.nums) // [1,2,3,4]
var instance6 = new SubTypePro()
console.log(instance6.nums) // [1,2,3,4]，超类型实例的数组受到影响
var instance7 = new SubTypePro()
instance7.nums = [] // 重新定义，覆盖超类型实例中的属性
console.log(instance7.nums) // []
console.log(instance6.nums) // [1,2,3,4]，超类型实例的数组补受影响

var person = new SuperTypePro('Simon') // 创建超类型实例
console.log(person.name) // 'Simon'
var person2 = new SubTypePro('Simon') // 创建超类型实例，参数传递无意义
console.log(person2.name) // undefined

/* 借用构造函数 */
function SuperTypeBorrow() {
  this.nums = [1, 2, 3]
}
function SubTypeBorrow() {
  console.log(this) // SubTypeBorrow构造函数内部的this，指向SubTypeBorrow的实例
  SuperTypeBorrow.call(this) // 将SuperTypeBorrow的作用域绑定给this，也就是SubTypeBorrow的实例
}
var instance8 = new SubTypeBorrow()
console.log(instance8.nums) // [ 1, 2, 3 ]

instance8.nums.push(4)
console.log(instance8.nums) // [ 1, 2, 3, 4 ]
var instance9 = new SubTypeBorrow()
console.log(instance9.nums) // [ 1, 2, 3 ]

// 传递参数
function SuperTypeParam(name) {
  this.name = name
}
function SubTypeParam() {
  SuperTypeParam.call(this, 'Nicholas') // 继承，先调用超类型构造函数
  this.age = 29 // 再添加子类型中定义的属性
}
var instance10 = new SubTypeParam()
console.log(instance10.name, instance10.age) // Nicholas 29

/* 组合继承 */
function SuperTypeMix(name) {
  this.name = name
  this.nums = [1, 2, 3]
}
SuperTypeMix.prototype.sayName = function () {
  console.log(this.name)
}
function SubTypeMix(name, age) {
  SuperTypeMix.call(this, name) // 借用构造函数继承，继承属性（创建子类型实例时，第二次调用超类型构造函数）
  this.age = age
}
SubTypeMix.prototype = new SuperTypeMix() // 原型链继承，继承方法（第一次调用超类型构造函数）
SubTypeMix.prototype.sayAge = function () {
  console.log(this.age) // 子类型原型添加方法（须在替换原型语句之后）
}

var instance11 = new SubTypeMix('Nicholas', 29)
instance11.nums.push(4)
console.log(instance11.nums) // [ 1, 2, 3, 4 ]，借用构造函数继承而来，属性保存在超类型实例中
instance11.sayName() // 'Nicholas'，原型链继承而来，方法保存在超类型原型中
instance11.sayAge() // 29，非继承，方法保存在子类型原型中

var instance12 = new SubTypeMix('Greg', 27)
console.log(instance12.nums) // [ 1, 2, 3]
instance12.sayName() // 'Greg'
instance12.sayAge() // 27

console.log(SubTypeMix.prototype) // SuperTypeMix { name: undefined, nums: [ 1, 2, 3 ], sayAge: [Function] }，子类型的原型
console.log(instance11) // SuperTypeMix { name: 'Nicholas', nums: [ 1, 2, 3, 4 ], age: 29 }，子类型的实例
delete instance11.name
console.log(instance11)
console.log(instance11.name)

/* 原型式继承 */
// function object(o) {
//   function F() {} //函数内部创建临时构造函数
//   F.prototype = o // 将传入的对象作为这个构造函数的原型
//   return new F() // 返回这个构造函数的新实例
// }

// var person = {
//   name: 'Nicholas',
// }
// var anotherPerson = object(person)
// console.log(anotherPerson.name) // 'Nicholas'，来自person
// anotherPerson.name = 'Greg' // 覆盖同名属性
// console.log(anotherPerson.name) // 'Greg'，来自副本
// console.log(person.name) // 'Nicholas'，来自person

// // Object.create()
// var anotherPerson2 = Object.create(person)
// console.log(anotherPerson2.name) // 'Nicholas'，来自person

// var anotherPerson3 = Object.create(person, {
//   name: { value: 'Greg' }, // 描述符定义对象的属性，若有同名属性则覆盖
// })
// console.log(anotherPerson3.name) // 'Greg'，来自副本

// var person2 = {
//   nums: [1, 2, 3],
// }
// var anotherPerson4 = Object.create(person2)
// anotherPerson4.nums.push(4) // 引用类型属性被修改，非重新定义
// console.log(anotherPerson4.nums) // [1, 2, 3, 4]，来自person
// console.log(person2.nums) // [1, 2, 3, 4]，作为原型的引用类型属性受到影响

// /* 寄生式继承 */
// function object(o) {
//   // 原型式继承的函数封装
//   function F() {}
//   F.prototype = o
//   return new F()
// }
// function createAnother(original) {
//   var clone = object(original) // 将作为原型的对象传给object——封装原型式继承的函数
//   console.log(clone) // {}，构造函数F的实例
//   clone.sayHi = function () {
//     console.log('Hi') // 给返回的实例对象添加方法
//   }
//   return clone
// }

// var person3 = {
//   name: 'Nicholas',
// }
// var anotherPerson5 = createAnother(person3)

// console.log(anotherPerson5.name) // 'Nicholas'
// console.log(anotherPerson5.hasOwnProperty('name')) // false，name属性保存在作为原型的对象person3上
// anotherPerson5.sayHi() // 'Hi'
// console.log(anotherPerson5.hasOwnProperty('sayHi')) // true，sayHi方法保存在返回的实例对象上
// console.log(anotherPerson5) // { sayHi: [Function] }

/* 寄生组合式继承 */
