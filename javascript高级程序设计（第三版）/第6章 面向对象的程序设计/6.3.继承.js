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
console.log(SubType.prototype.__proto__.constructor) // SuperType构造函数，SuperType原型指向SuperType构造函数

var instance = new SubType()
console.log(instance.property) // true，SubType继承了property属性
console.log(SubType.prototype.hasOwnProperty('property')) // true，property是SuperType的实例属性，SubType的原型已被重写为SuperType的实例
console.log(instance.getSuperValue()) // true，SubType继承了getSuperValue()方法
console.log(SubType.prototype.hasOwnProperty('getSuperValue')) // false，getSuperValue是SuperType的原型方法，不存在于SubType的实例中
console.log(SuperType.prototype.hasOwnProperty('getSuperValue')) // true

console.log(instance.__proto__) // SuperType实例，SubType的原型SubType.prototype已被SuperType的实例重写
console.log(instance.constructor) // SuperType构造函数，constructor指向重写原型对象的constructor，即new SuperType()的constructor
console.log(instance.constructor === SubType.prototype.constructor) // true，都指向SuperType构造函数

console.log(SuperType.prototype.__proto__.constructor) // Object构造函数
console.log(Object.getOwnPropertyNames(SuperType.prototype.__proto__))
