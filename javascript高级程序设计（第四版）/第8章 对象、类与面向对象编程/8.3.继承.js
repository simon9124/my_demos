/* 8.3 继承 */

/* 8.3.1 原型链 */
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

/* 默认原型 */
console.log(SuperType.prototype.__proto__) // {}，SuperType的默认原型是Object实例，Object实例的[[Prototype]]指向Object原型
console.log(SuperType.prototype.__proto__ === Object.prototype) // true，都指向Object原型
console.log(SuperType.prototype.__proto__.constructor) // Object构造函数
console.log(Object.keys(SuperType.prototype.__proto__)) // []，Object原型上可枚举的方法
console.log(Object.getOwnPropertyNames(SuperType.prototype.__proto__)) // [ 'constructor','__defineGetter__','__defineSetter__','hasOwnProperty','__lookupGetter__','__lookupSetter__','isPrototypeOf','propertyIsEnumerable','toString','valueOf','__proto__','toLocaleString' ]，Object原型上的所有方法

/* 原型与继承关系 */

// instanceof
console.log(instance instanceof Object) // true，instance是Object的实例
console.log(instance instanceof SuperType) // true，instance是SuperType的实例
console.log(instance instanceof SubType) // true，instance是SubType的实例

// isPrototypeOf()
console.log(Object.prototype.isPrototypeOf(instance)) // true，Object.prototype是instance原型链上的原型
console.log(SuperType.prototype.isPrototypeOf(instance)) // true，SuperType.prototype是instance原型链上的原型
console.log(SubType.prototype.isPrototypeOf(instance)) // true，SubType.prototype是instance原型链上的原型

/* 关于方法 */

// 替换原型语句之后添加方法
SubType.prototype.getSubValue = function () {
  // 给子类原型添加新方法
  return false
}
SubType.prototype.getSuperValue = function () {
  // 在子类原型中重写超类原型的方法
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
  // 对象字面量重写原型，继承关系失效（子类原型被重写为Object实例）
  someFunction: function () {
    return false
  },
}
var instance4 = new SubType2()
// console.log(instance4.getSuperValue()) // error，对象字面量重写了原型，继承关系已失效

/* 原型链的问题 */

// 修改（非重写）子类实例引用类型的属性
function SuperTypePro(name) {
  this.nums = [1, 2, 3] // 超类属性，引用类型
  this.name = name // 超类属性，原始类型
}
SuperTypePro.prototype.getSuperNums = function () {
  return this.nums
}
function SubTypePro() {}
SubTypePro.prototype = new SuperTypePro() // 继承

var instance5 = new SubTypePro()
instance5.nums.push(4) // 在子类实例中，修改（非重新定义）继承的引用类型属性
console.log(instance5.nums) // [1,2,3,4]
var instance6 = new SubTypePro()
console.log(instance6.nums) // [1,2,3,4]，超类实例受到影响
var instance7 = new SubTypePro()
instance7.nums = [] // 在子类实例中，重新定义（覆盖）继承的引用类型属性
console.log(instance7.nums) // []
console.log(instance6.nums) // [1,2,3,4]，超类实例不受影响

// 子类实例化时无法给超类传参
var person = new SuperTypePro('Simon') // 创建超类型实例
console.log(person.name) // 'Simon'
var person2 = new SubTypePro('Simon') // 创建子类型实例，参数传递无意义
console.log(person2.name) // undefined

/* 8.3.2 盗用构造函数 */
function SuperTypeBorrow() {
  this.nums = [1, 2, 3]
}
function SubTypeBorrow() {
  console.log(this) // SubTypeBorrow构造函数内部的this，指向SubTypeBorrow的实例
  SuperTypeBorrow.call(this) // 将超类的作用域绑定给this，即子类的实例
}
var instance8 = new SubTypeBorrow()
console.log(instance8.nums) // [ 1, 2, 3 ]

instance8.nums.push(4)
console.log(instance8.nums) // [ 1, 2, 3, 4 ]
var instance9 = new SubTypeBorrow()
console.log(instance9.nums) // [ 1, 2, 3 ]，超类不受影响

/* 传递参数 */
function SuperTypeParam(name) {
  this.name = name
}
function SubTypeParam() {
  SuperTypeParam.call(this, 'Nicholas') // 继承，先调用超类型构造函数
  this.age = 29 // 再添加子类型中定义的属性
}
var instance10 = new SubTypeParam()
console.log(instance10.name, instance10.age) // 'Nicholas' 29

/* 8.3.3 组合继承 */
function SuperTypeMix(name) {
  this.name = name
  this.nums = [1, 2, 3]
}
SuperTypeMix.prototype.sayName = function () {
  console.log(this.name)
}
function SubTypeMix(name, age) {
  SuperTypeMix.call(this, name) // 盗用构造函数继承，继承实例属性（创建子类实例时，第二次调用超类构造函数，子类实例继承超类实例属性）
  this.age = age
}
SubTypeMix.prototype = new SuperTypeMix() // 原型链继承，继承原型方法（第一次调用超类构造函数，子类原型已经继承了超类实例和原型中的方法和属性）
SubTypeMix.prototype.sayAge = function () {
  console.log(this.age) // 子类型原型添加方法（须在替换原型语句之后）
}

var instance11 = new SubTypeMix('Nicholas', 29)
instance11.nums.push(4)
console.log(instance11.nums) // [ 1, 2, 3, 4 ]，盗用构造函数继承而来，属性保存在超类实例（[ 1, 2, 3 ]）、子类原型（[ 1, 2, 3 ]）、子类实例（[ 1, 2, 3, 4 ]）中
instance11.sayName() // 'Nicholas'，原型链继承而来，方法保存在超类型原型中
instance11.sayAge() // 29，非继承，方法保存在子类型原型中

var instance12 = new SubTypeMix('Greg', 27)
console.log(instance12.nums) // [ 1, 2, 3]
instance12.sayName() // 'Greg'
instance12.sayAge() // 27

console.log(SubTypeMix.prototype) // SuperTypeMix { name: undefined, nums: [ 1, 2, 3 ], sayAge: [Function] }，子类原型（被重写为超类实例）
console.log(instance11) // SuperTypeMix { name: 'Nicholas', nums: [ 1, 2, 3, 4 ], age: 29 }，子类实例
delete instance11.nums // 从子类实例中删除（继承自超类实例的）属性
console.log(instance11) // SuperTypeMix { name: 'Nicholas', age: 29 }，子类实例
console.log(instance11.nums) // [ 1, 2, 3 ]，仍然可以（从子类原型中）访问到该属性

/* 8.3.4 原型式继承 */
function object(o) {
  function F() {} // 函数内部创建临时构造函数
  F.prototype = o // 将传入的对象作为这个构造函数的原型
  return new F() // 返回这个构造函数的新实例
}

var person = {
  name: 'Nicholas',
}
var anotherPerson = object(person)
console.log(anotherPerson.name) // 'Nicholas'，来自person
console.log(anotherPerson.hasOwnProperty('name')) // false
anotherPerson.name = 'Greg' // 覆盖同名属性
console.log(anotherPerson.hasOwnProperty('name')) // true
console.log(anotherPerson.name) // 'Greg'，来自副本
console.log(person.name) // 'Nicholas'，来自person

// Object.create()
var anotherPerson2 = Object.create(person)
console.log(anotherPerson2.name) // 'Nicholas'，来自person

var anotherPerson3 = Object.create(person, {
  name: { value: 'Greg' }, // 描述符定义对象的属性，若有同名属性则覆盖
})
console.log(anotherPerson3.name) // 'Greg'，来自副本

var person2 = {
  nums: [1, 2, 3],
}
var anotherPerson4 = Object.create(person2)
anotherPerson4.nums.push(4) // 引用类型属性被修改，非重新定义
console.log(anotherPerson4.nums) // [1, 2, 3, 4]，来自person
console.log(person2.nums) // [1, 2, 3, 4]，作为原型的引用类型属性受到影响

/* 8.3.5 寄生式继承 */
function createAnother(original) {
  var clone = Object.create(original) // 进行原型式继承，返回一个空实例
  console.log(clone) // {}，空实例，其原型是orginal对象
  clone.sayHi = function () {
    console.log('Hi') // 给返回的实例对象添加方法（每个实例重新创建方法）
  }
  return clone
}

var person3 = {
  name: 'Nicholas',
}
var anotherPerson5 = createAnother(person3)

console.log(anotherPerson5.name) // 'Nicholas'
console.log(anotherPerson5.hasOwnProperty('name')) // false，name属性保存在作为原型的对象person3上
anotherPerson5.sayHi() // 'Hi'
console.log(anotherPerson5.hasOwnProperty('sayHi')) // true，sayHi方法保存在返回的实例对象上
console.log(anotherPerson5) // { sayHi: [Function] }

/* 8.3.6 寄生组合式继承 */
function inherit(subType, superType) {
  /* 封装：原型链的混成形式 */

  // 1.创建对象，继承超类的原型
  var superPrototype = Object.create(superType.prototype) // superPrototype的原型是超类原型
  console.log(superPrototype.__proto__) // 指向superType.prototype超类原型
  console.log(superPrototype.__proto__ === superType.prototype) // true
  console.log(superPrototype.constructor) // 此时constructor指向超类构造函数

  // 2.让constructor指向子类构造函数
  superPrototype.constructor = subType

  // 3.将创建的对象赋给子类的原型
  subType.prototype = superPrototype
  console.log(subType.prototype.__proto__ === superType.prototype) // true，子类原型继承超类原型
}

function SuperTypeMixParasitic(name) {
  this.name = name
  this.nums = [1, 2, 3]
}
SuperTypeMixParasitic.prototype.sayName = function () {
  console.log(this.name)
}
function SubTypeMixParasitic(name, age) {
  SuperTypeMixParasitic.call(this, name) // 盗用构造函数，继承属性（只调用1次超类构造函数）
  this.age = age
}

inherit(SubTypeMixParasitic, SuperTypeMixParasitic) // 原型链的混成形式，继承方法
SubTypeMixParasitic.sayAge = function () {
  console.log(this.age)
}

var instance13 = new SubTypeMixParasitic('Nicholas', 29)
instance13.nums.push(4)
console.log(instance13.nums) // [ 1, 2, 3, 4 ]，盗用构造函数继承而来，属性保存在子类实例（[ 1, 2, 3, 4 ]）和超类实例（[ 1, 2, 3 ]）中
console.log(SubTypeMixParasitic.prototype) // SubTypeMixParasitic { constructor: { [Function: SubTypeMixParasitic] sayAge: [Function] } }，子类原型不含多余属性，只继承超类原型的方法，且constructor指向子类构造函数

console.log(SubTypeMixParasitic.prototype.constructor) // SubTypeMixParasitic构造函数
console.log(instance13.__proto__ === SubTypeMixParasitic.prototype) // true

console.log(SubTypeMixParasitic.prototype.__proto__) // SuperTypeMixParasitic原型
console.log(
  SubTypeMixParasitic.prototype.__proto__ === SuperTypeMixParasitic.prototype
) // true
console.log(SubTypeMixParasitic.prototype.__proto__.constructor) // SuperTypeMixParasitic构造函数

console.log(SubTypeMixParasitic.prototype.__proto__.__proto__) // Object原型
console.log(
  SubTypeMixParasitic.prototype.__proto__.__proto__ === Object.prototype
) // true
console.log(SubTypeMixParasitic.prototype.__proto__.__proto__.constructor) // Object构造函数

console.log(instance13 instanceof SubTypeMixParasitic) // instance13是SubTypeMixParasitic的实例
console.log(instance13 instanceof SuperTypeMixParasitic) // instance13是SuperTypeMixParasitic的实例
console.log(SubTypeMixParasitic.prototype.isPrototypeOf(instance13)) // true，SubTypeMixParasitic.prototype是instance13原型链上的原型
console.log(SuperTypeMixParasitic.prototype.isPrototypeOf(instance13)) // true，SuperTypeMixParasitic.prototype13是instance原型链上的原型
