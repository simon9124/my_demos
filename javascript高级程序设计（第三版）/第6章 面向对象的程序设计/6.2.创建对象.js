/* 工厂模式 */
function createPerson(name, age, job) {
  var o = new Object()
  o.name = name
  o.age = age
  o.job = job
  o.sayName = function () {
    console.log(this.name)
  }
  return o
}
var person1 = createPerson('Nicholas', 29, 'Software Engineer')
var person2 = createPerson('Greg', 27, 'Doctor')
console.log(person1)
console.log(person2)

/* 构造函数模式 */
function Person(name, age, job) {
  this.name = name
  this.age = age
  this.job = job
  this.sayName = function () {
    console.log(this.name)
  }
}
var person1 = new Person('Nicholas', 29, 'Software Engineer')
var person2 = new Person('Greg', 27, 'Doctor')
console.log(person1.constructor === Person) // true，constructor 属性指向构造函数
console.log(person2.constructor === Person) // true，constructor 属性指向构造函数
console.log(person1 instanceof Object) // true，是 Object 的实例
console.log(person1 instanceof Person) // true，也是 Person 的实例
console.log(person2 instanceof Object) // true，是 Object 的实例
console.log(person2 instanceof Person) // true，也是 Person 的实例

// 构造函数vs普通函数
var person3 = new Person('Nicholas', 29, 'Software Engineer') // 用构造函数创建对象
person3.sayName() // 'Nicholas'
Person('Greg', 27, 'Doctor') // 'Greg'，不使用new操作符，直接调用
global.sayName() // 直接调用函数时，this指向Global对象（浏览器中指向window对象）
var o = new Object() // 新对象o
var p = new Object() // 新对象p
Person.call(o, 'Kristen', 25, 'Nurse') // 扩充作用域，在对象o中调用Person()函数，call()分别传入每个参数
Person.apply(p, ['Kristen', 25, 'Nurse']) // 扩充作用域，在对象p中调用Person()函数，apply()传入参数数组
o.sayName() // 'Kristen'
p.sayName() // 'Kristen'

// 构造函数的缺点
function Person2(name, age, job) {
  this.name = name
  this.age = age
  this.job = job
  this.sayName = new Function(console.log(this.name)) // 与声明函数逻辑等价，每创建一个对象就要创建一个Function实例
}
console.log(person1.sayName === person2.sayName) // false，新对象的2个方法的作用域链和标识符解析不同

// 避免多次创建 Function 实例
function Person3(name, age, job) {
  this.name = name
  this.age = age
  this.job = job
  this.sayName = sayName
}
function sayName() {
  // 将sayName设置成全局函数
  console.log(this.name)
}
var person4 = new Person('Nicholas', 29, 'Software Engineer')

/* 原型模式 */

// 构造函数的prototype属性，指向构造函数的原型对象
function PersonPrototype() {}
PersonPrototype.prototype.name = 'Nicholas' // 为PersonPrototype的原型对象添加属性
PersonPrototype.prototype.age = 29 // 为PersonPrototype的原型对象添加属性
PersonPrototype.prototype.job = 'Software Engineer' // 为PersonPrototype的原型对象添加属性
PersonPrototype.prototype.sayName = function () {
  // 为PersonPrototype的原型对象添加方法
  console.log(this.name)
}
var person5 = new PersonPrototype()
var person6 = new PersonPrototype()
person5.sayName() // 'Nicholas'
person6.sayName() // 'Nicholas'
console.log(person5.sayName === person6.sayName) // true，prototype上创建的属性和方法，由新对象的所有实例共享

// 原型对象的constructor属性，指向原型对象的构造函数
console.log(PersonPrototype.prototype.constructor) // Function: PersonPrototype构造函数
console.log(PersonPrototype === PersonPrototype.prototype.constructor) // true，都指向构造函数

// 实例的[[Prototype]]属性，指向实例的构造函数的原型对象
console.log(person5.__proto__) // PersonPrototype {name: 'Nicholas',age: 29,job: 'Software Engineer',sayName: [Function] }
console.log(person5.__proto__ === PersonPrototype.prototype) // true，都指向原型对象
console.log(person5.__proto__.constructor) // Function: PersonPrototype构造函数

// isPrototypeOf()
console.log(PersonPrototype.prototype.isPrototypeOf(person5)) // true，person5包含指向PersonPrototype的原型对象的指针

// Object.getPrototypeOf()
console.log(Object.getPrototypeOf(person5)) // 原型对象
console.log(Object.getPrototypeOf(person5) === person5.__proto__) // true，都指向原型对象
console.log(Object.getPrototypeOf(person5) === PersonPrototype.prototype) // true，都指向原型对象
console.log(Object.getPrototypeOf(person5).name) // 'Nicholas'
console.log(Object.getPrototypeOf(person5).constructor) // Function: PersonPrototype构造函数
