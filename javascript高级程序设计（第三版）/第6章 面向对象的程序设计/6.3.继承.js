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
console.log(SuperType.prototype.__proto__ === Object.prototype) // true，SuperType的默认原型是Object的实例，默认原型内部的__proto__指向Object实例的原型
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
  // 给继承原型添加新方法
  return false
}
SubType.prototype.getSuperValue = function () {
  // 在继承原型中重写被继承原型的方法
  return false
}
var instance2 = new SubType()
console.log(instance2.getSubValue()) // false
console.log(instance2.getSuperValue()) // false，方法被重写
var instance3 = new SuperType()
console.log(instance3.getSuperValue()) // true，不影响被继承原型中的方法

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
