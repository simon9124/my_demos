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
console.log(person5.__proto__) // 原型对象，PersonPrototype {name: 'Nicholas',age: 29,job: 'Software Engineer',sayName: [Function] }
console.log(person5.__proto__ === PersonPrototype.prototype) // true，都指向原型对象
console.log(person5.__proto__.constructor) // Function: PersonPrototype构造函数

// isPrototypeOf()
console.log(PersonPrototype.prototype.isPrototypeOf(person5)) // true，person5包含指向PersonPrototype的原型对象的指针
console.log(PersonPrototype.prototype.isPrototypeOf(person1)) // false，person1不包含指向PersonPrototype的原型对象的指针

// Object.getPrototypeOf()
console.log(Object.getPrototypeOf(person5)) // 原型对象
console.log(Object.getPrototypeOf(person5) === person5.__proto__) // true，都指向原型对象
console.log(Object.getPrototypeOf(person5) === PersonPrototype.prototype) // true，都指向原型对象
console.log(Object.getPrototypeOf(person5).name) // 'Nicholas'
console.log(Object.getPrototypeOf(person5).constructor) // Function: PersonPrototype构造函数

// 实例同名属性 → 屏蔽原型的属性
var person7 = new PersonPrototype()
person7.name = 'Greg'
console.log(person7.name) // 'Greg'，来自实例
console.log(person5.name) // 'Nicholas'，来自原型

// 删除同名的实例属性 → 恢复被屏蔽的原型的属性
delete person7.name
console.log(person7.name) // 'Nicholas'，来自原型

// hasOwnProperty()
var person8 = new PersonPrototype()
var person9 = new PersonPrototype()
console.log(person8.hasOwnProperty('name')) // false，name不存在在person8的实例中
person8.name = 'Simon'
console.log(person8.name) // 'Simon'，来自实例
console.log(person8.hasOwnProperty('name')) // true，name存在在person8的实例中
console.log(person9.name) // 'Nicholas'，来自原型
console.log(person9.hasOwnProperty('name')) // false，name不存在在person8的实例中
delete person8.name
console.log(person8.name) // 'Nicholas'，来自原型
console.log(person8.hasOwnProperty('name')) // false，person8实例的name属性已被删除

// Object.getOwnPropertyDescriptor()
console.log(Object.getOwnPropertyDescriptor(person8, 'name')) // undefined，person8实例上没有name属性
console.log(Object.getOwnPropertyDescriptor(person8.__proto__, 'name')) // {value: 'Nicholas',writable: true,enumerable: true,configurable: true}，原型对象的name属性描述符

// in
function PersonIn() {}
PersonIn.prototype.name = 'Nicholas'
PersonIn.prototype.age = 29
PersonIn.prototype.job = 'Software Engineer'
PersonIn.prototype.sayName = function () {
  console.log(this.name)
}
var person9 = new PersonIn()
var person10 = new PersonIn()
console.log(person9.hasOwnProperty('name')) // false，实例person9中不含name属性
console.log('name' in person9) // true，通过person9可以访问到name属性
person9.name = 'Greg'
console.log(person9.name) // 'Greg'，来自实例
console.log(person9.hasOwnProperty('name')) // true，实例person9中包含name属性
console.log('name' in person9) // true，通过person9可以访问到name属性
console.log(person10.name) // 'Nicholas'，来自原型
console.log(person10.hasOwnProperty('name')) // false，实例person10中不含name属性
console.log('name' in person10) // true，通过person10可以访问到name属性
delete person9.name
console.log(person9.name) // 'Nicholas'，来自原型
console.log(person9.hasOwnProperty('name')) // false，实例person9中不含name属性
console.log('name' in person9) // true，通过person9可以访问到name属性

// 同时使用 hasOwnProperty 和 in，判断属性存在于 对象 or 原型
function hasPrototypeProperty(object, name) {
  return !object.hasOwnProperty(name) && name in object
}
var person11 = new PersonIn()
console.log(hasPrototypeProperty(person11, 'name')) // true，!false && true
person11.name = 'Greg'
console.log(hasPrototypeProperty(person11, 'name')) // false，!true && true

// for-in
for (var attr in person11) {
  console.log(`${attr}:${person11[attr]}`)
  /*  
    name:Greg
    age:29
    job:Software Engineer
    sayName:function () {
      console.log(this.name)
    } 
  */
}

// Object.keys()
var keys = Object.keys(PersonIn.prototype) // 原型对象的所有可枚举属性
console.log(keys) // [ 'name', 'age', 'job', 'sayName' ]
var person12 = new PersonIn()
person12.name = 'Bob'
person12.age = 31
var p12keys = Object.keys(person12) // person12的所有可枚举属性
console.log(p12keys) // [ 'name', 'age' ]

// Object.getOwnPropertyNames()
var keys = Object.getOwnPropertyNames(PersonIn.prototype) // 原型对象的所有属性，包含不可枚举
console.log(keys) // [ 'constructor', 'name', 'age', 'job', 'sayName' ]，原型对象都包含constructor属性，指向构造函数
var p12keys = Object.getOwnPropertyNames(person12) // person12的所有属性，包含不可枚举
console.log(p12keys) // [ 'name', 'age' ]

// 对象字面量重写原型对象
function PersonLiteral() {}
PersonLiteral.prototype = {
  name: 'Nicholas',
  age: 29,
  job: 'Software Engineer',
  sayName: function () {
    console.log(this.name)
  },
}
var friend = new PersonLiteral()
console.log(friend instanceof Object) // true，friend是Object的实例
console.log(friend instanceof PersonLiteral) // true，friend是PersonLiteral的实例
console.log(friend.constructor === PersonLiteral) // false，constructor属性变成了新对象——即对象字面量的constructor
console.log(friend.constructor === Object) // true，新对象的constructor指向Object

// 设置 constructor 属性，让其指向原构造函数
function PersonLiteral2() {}
PersonLiteral2.prototype = {
  constructor: PersonLiteral2, // 直接在对象上定义constructor，指向原构造函数
  name: 'Nicholas',
  age: 29,
  job: 'Software Engineer',
  sayName: function () {
    console.log(this.name)
  },
}
var friend2 = new PersonLiteral2()
console.log(friend2.constructor === PersonLiteral2) // true，constructor再次指向原构造函数
console.log(friend2.constructor === Object) // false
var keys = Object.keys(PersonLiteral2.prototype)
console.log(keys) // [ 'constructor', 'name', 'age', 'job', 'sayName' ]，因为constructor是“直接在对象上定义的属性”

// 兼容 ES5 的 javascript 引擎
Object.defineProperty(PersonLiteral2.prototype, 'constructor', {
  enumerable: false,
  value: PersonLiteral2,
})
var keys = Object.keys(PersonLiteral2.prototype)
console.log(keys) // [ 'name', 'age', 'job', 'sayName' ]，constructor的enumerable已被设置为false

// 原型的动态性
function Person4() {}
var friend3 = new Person4()
Person4.prototype.sayHi = function () {
  console.log('Hi')
}
friend3.sayHi() // 'Hi'，先在friend3实例中搜索sayHi属性，没有找到则继续找原型对象

Person4.prototype = {
  constructor: Person4,
  name: 'Nicholas',
  age: 29,
  job: 'Software Engineer',
  sayName: function () {
    console.log(this.name)
  },
}
console.log(friend3.__proto__) // Person4 { sayHi: [Function] }，最初的原型对象
console.log(friend3.__proto__ === Person4.prototype) // false，实例的__proto__指向最初的原型对象，重写整个原型切断了构造函数与最初原型之间的联系
// friend3.sayName() // error:friend3.sayName is not a function

// 原生对象的原型
console.log(Array.prototype) // 在浏览器中查看Array的原型对象，包含sort()等方法
console.log(String.prototype) // 在浏览器中查看Array的原型对象，包含substring()等方法
String.prototype.startsWith = function (text) {
  // 给String的原型对象添加startsWith方法
  return this.indexOf(text) === 0
}
var msg = 'Hello World'
console.log(msg.startsWith('Hello')) // true
console.log(msg.startsWith('World')) // false
delete String.prototype.startsWith
// console.log(msg.startsWith('Hello')) // error

// 原型对象的问题
function PersonProblem() {}
PersonProblem.prototype = {
  constructor: PersonProblem,
  name: 'Nicholas',
  age: 29,
  job: 'Software Engineer',
  friends: ['Shelby', 'Court'],
  sayName: function () {
    console.log(this.name)
  },
}
var person13 = new PersonProblem()
var person14 = new PersonProblem()
person13.name = 'Greg' // 重新定义，在实例中屏蔽原型的属性
person13.friends.push('Van') // 非重新定义，而是向原型的数组中添加一个字符串
console.log(person13.name) // 'Greg'，从实例获得
console.log(person14.name) // 'Nicholas'，从原型中获得
console.log(person13.friends) // [ 'Shelby', 'Court', 'Van' ]，从原型中获得
console.log(person14.friends) // [ 'Shelby', 'Court', 'Van' ]，从原型中获得
console.log(person13.friends === person14.friends) // true
var person15 = new PersonProblem()
person15.friends = [] // 重新定义，在实例中屏蔽原型的属性
console.log(person15.friends) // []，从实例获得
console.log(person13.friends) // [ 'Shelby', 'Court', 'Van' ]，从原型中获得
console.log(person14.friends) // [ 'Shelby', 'Court', 'Van' ]，从原型中获得

/* 组合使用构造函数模式和原型模式 */
function PersonMix(name, age, job) {
  // 在构造函数定义实例属性
  this.name = name
  this.age = age
  this.job = job
  this.friends = ['Shelby', 'Court']
}
PersonMix.prototype = {
  // 在原型定义方法和共享的属性
  constructor: PersonMix, // 直接在对象上定义constructor属性，指向构造函数，[[Enumerable]]为true
  sayName: function () {
    console.log(this.name)
  },
}
var person16 = new PersonMix('Nicholas', 29, 'Software Engineer')
var person17 = new PersonMix('Greg', 27, 'Doctor')
person16.friends.push('Van') // 仅向person16实例本身的friends数组push数据
console.log(person16.friends) // [ 'Shelby', 'Court', 'Van' ]
console.log(person17.friends) // [ 'Shelby', 'Court' ]
console.log(person16.friends === person17.friends) // false，person16实例的friends数组push了数据
console.log(person16.sayName === person17.sayName) // true，共享方法sayName

/* 动态原型模式 */
function PersonDynamic(name, age, job) {
  // 属性
  this.name = name
  this.age = age
  this.job = job
  // 方法：①只有方法不存在时才添加到原型；②只在初次调用构造函数时执行；③会立即在实例中体现
  if (typeof this.sayName !== 'function') {
    PersonDynamic.prototype.sayName = function () {
      console.log(this.name)
    }
  }
}
var person18 = new PersonDynamic('Nicholas', 29, 'Software Engineer')
person18.sayName() // 'Nicholas'
console.log(person18 instanceof PersonDynamic) // true，person18是PersonDynamic的实例

// 用对象字面量重写整个原型
PersonDynamic.prototype = {
  newName:
    typeof this.newName !== 'function'
      ? function () {
          console.log('prototype:', this.name)
        }
      : this.newName,
}
// person18.newName() // error，person18指向最初的原型，没有newName方法
var person19 = new PersonDynamic('Greg', 27, 'Doctor') // person19是重写原型后创建的实例
person19.newName() // prototype: Greg
person19.sayName() // Greg

console.log(person18 instanceof PersonDynamic) // false，person18不是重写原型后的PersonDynamic的实例，person18指向最初的原型
console.log(person19 instanceof PersonDynamic) // true，person19是重写原型后的PersonDynamic的实例

/* 寄生构造函数模式 */
function PersonParasitic(name, age, job) {
  var o = new Object() // 用原生引用类型创建对象
  o.name = name
  o.age = age
  o.job = job
  o.sayName = function () {
    console.log(this.name)
  }
  return o
}
var person20 = new PersonParasitic('Nicholas', 29, 'Software Engineer')
person20.sayName() // 'Nicholas'

function SpecialArray() {
  var values = new Array() // 用原生引用类型创建数组
  values.push.apply(values, arguments) // 添加值
  // 添加方法
  values.toPipedString = function () {
    return this.join('|')
  }
  return values // 返回经过操作后的数组
}
var colors = new SpecialArray('red', 'blue', 'green')
console.log(colors.toPipedString()) // red|blue|green
console.log(SpecialArray.prototype) // SpecialArray{}，构造函数的原型对象
console.log(colors.__proto__) // []，构造函数内部通过new Array()重新初始化，其原型对象是原生对象Array
console.log(SpecialArray.prototype === colors.__proto__) // false，二者无关联
console.log(colors instanceof SpecialArray) // false，二者无关联
console.log(colors instanceof Array) // true，colors是Array的实例

/* 稳妥构造函数 */
function PersonSafe(name, age, job) {
  var o = new Object() // 用原生引用类型创建对象
  o.sayName = function () {
    console.log(name)
  }
  return o
}
var person21 = new PersonParasitic('Nicholas', 29, 'Software Engineer')
person21.sayName() // 'Nicholas'
