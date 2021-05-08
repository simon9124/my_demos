/* 8.4 类 */

/* 8.4.1 类定义 */
class Person {} // 类声明
var animal = class {} // 类表达式

console.log(FunctionDeclaration) // [Function: FunctionDeclaration]，函数声明提前
function FunctionDeclaration() {}
// console.log(ClassDeclaration) // ReferenceError: Cannot access 'ClassDeclaration' before initialization，类没有声明提前
class ClassDeclaration {}

{
  function FunctionDeclaration2() {}
  class ClassDeclaration2 {}
}
console.log(FunctionDeclaration2) // [Function: FunctionDeclaration2]
// console.log(ClassDeclaration2) // ReferenceError: ClassDeclaration2 is not defined

/* 类的构成 */
class Foo {} // 空类定义
class Bar {
  constructor() {} // 构造函数
  get myBaz() {} // 获取函数
  static myQux() {} // 静态方法
}

var Person2 = class PersonName {
  identify() {
    console.log(PersonName) // 类表达式作用域内部，访问类表达式
    console.log(Person2.name, PersonName.name) // 类表达式作用域内部，访问类表达式的名称
    /* 
      [class PersonName]
      PersonName PersonName
    */
  }
}
var p = new Person2()
p.identify()
console.log(Person2.name) // PersonName
// console.log(PersonName) // ReferenceError: PersonName is not defined，类表达式作用域外部，无法访问类表达式

/* 8.4.2 类构造函数 */

/* 实例化 */

class Animal2 {}
class Person3 {
  constructor() {
    console.log('person ctor')
  }
}
class Vegetable {
  constructor() {
    this.color = 'orange'
  }
}
var a = new Animal2()
var p = new Person3() // 'person ctor'
var v = new Vegetable()
console.log(v.color) // 'orange'

// 传入参数 & 无参数
class Person4 {
  constructor(name) {
    console.log(arguments.length)
    this.name = name || null
  }
}
var p1 = new Person4() // 0，无参数，Person4后的括号也可省略
console.log(p1.name) // null
var p2 = new Person4('Jake') // 1
console.log(p2.name) // 'Jake'

// 返回的this对象
class Person5 {
  constructor() {
    this.foo = 'foo'
  }
}
var p3 = new Person5()
console.log(p3) // Person5 { foo: 'foo' }，类实例
console.log(p3.__proto__) // {}，类原型
console.log(p3.constructor) // [class Person5]，类本身当作构造函数
console.log(Person5 === p3.constructor) // true
console.log(Person5.prototype === p3.__proto__) // true
console.log(p3 instanceof Person5) // true，p3是Person5的实例（Person5.prototype在p3的原型链上）

class Person6 {
  constructor() {
    return {
      bar: 'bar', // 返回一个全新的对象（不是该类的实例）
    }
  }
}
var p4 = new Person6()
console.log(p4) // { bar: 'bar' }，不是Person6的类实例
console.log(p4.__proto__) // {}，Object原型
console.log(p4.constructor) // [Function: Object]，Object构造函数
console.log(Object === p4.constructor) // true
console.log(Object.prototype === p4.__proto__) // true
console.log(p4 instanceof Person6) // false，p4不是Person6的实例（Person6.prototype不在p4的原型链上）

// 类构造函数 vs 普通构造函数
function Person7() {} // 普通构造函数
class Animal3 {} // 类构造函数
var p5 = Person7() // 构造函数不使用new操作符，当作普通函数调用
// var a1 = Animal3() // TypeError: Class constructor Animal3 cannot be invoked without 'new'，类构造函数必须使用new操作符实例化
var a2 = new Animal3()

// 类构造函数成为实例方法
class Person8 {
  constructor() {
    console.log('foo')
  }
}
var p6 = new Person8() // 'foo'
// p6.constructor() // TypeError: Class constructor Person8 cannot be invoked without 'new'
new p6.constructor() // 'foo'

/* 把类当成特殊函数 */

console.log(typeof Person8) // function
console.log(Person8.prototype) // {}，原型
console.log(Person8.prototype.constructor) // [class Person8]，类自身
console.log(Person8.prototype.constructor === Person8) // true
console.log(p6 instanceof Person8) // true，p6是Person8的实例

// new调用类本身 vs new调用类构造函数
class Person9 {}
console.log(Person9.constructor) // [Function: Function]，指向Function原型的constructor，即Function构造函数

var p7 = new Person9() // new调用类本身，类本身被当作构造函数
console.log(p7.constructor) // [class Person9]，constructor指向构造函数，即类本身
console.log(p7.constructor === Person9) // true
console.log(p7 instanceof Person9) // true，p7是Person9的实例

var p8 = new Person9.constructor() // new调用类构造函数，类构造函数（constructor()）被当作构造函数
console.log(p8.constructor) // [Function: Function]，constructor指向构造函数，即Function构造函数
console.log(p8.constructor === Function) // true
console.log(p8 instanceof Person9.constructor) // true，p8是Person9.constructor的实例

// 类当作参数
let classList = [
  class {
    constructor(id) {
      this._id = id
      console.log(`instance ${this._id}`)
    }
  },
]
function createInstance(classDefinition, id) {
  return new classDefinition(id)
}
var foo = new createInstance(classList[0], 3141) // 'instance 3141'

// 立即实例化
var p9 = new (class Foo2 {
  constructor(x) {
    console.log(x) // 'bar'
  }
})('bar')
console.log(p9) // Foo2 {}，类实例
console.log(p9.constructor) // [class Foo2]，类本身

/* 8.4.3 实例、原型和类成员 */

/* 实例成员 */
class Person10 {
  constructor() {
    this.name = new String('Jack')
    this.sayName = function () {
      console.log(this.name)
    }
    this.nickNames = ['Jake', 'J-Dog']
  }
}
var p10 = new Person10()
var p11 = new Person10()

console.log(p10.name) // [String: 'Jack']，字符串包装对象
console.log(p11.name) // [String: 'Jack']，字符串包装对象
console.log(p10.name === p11.name) // false，非同一个对象（不共享）
console.log(p10.sayName) // ƒ () { console.log(this.name) }，function对象
console.log(p11.sayName) // ƒ () { console.log(this.name) }，function对象
console.log(p10.sayName === p11.sayName) // false，非同一个对象（同理，不共享）
console.log(p10.nickNames === p11.nickNames) // false，同理↑

p10.name = p10.nickNames[0]
p11.name = p10.nickNames[1]
p10.sayName() // 'Jake'，实例成员互不影响
p11.sayName() // 'J-Dog'，实例成员互不影响

/* 原型方法与访问器 */

class Person11 {
  constructor() {
    // 实例方法
    this.locate = () => {
      console.log('instance')
    }
  }
  locate() {
    // 原型方法
    console.log('prototype')
  }
  locate2() {
    // 原型方法
    console.log('prototype2')
  }
}
var p12 = new Person11()
p12.locate() // 'instance'，实例方法遮盖原型方法
p12.__proto__.locate() // 'prototype'
p12.locate2() // 'prototype2'

// 属性不能定义在类块中
class Person12 {
  // name: 'jack' // Uncaught SyntaxError: Unexpected identifier
}

// 使用字符串、符号或计算的值，作为类方法的键
const symbolKey = Symbol('symbolKey')
class Person13 {
  stringKey() {
    // 字符串作为键
    console.log('stringKey')
  }
  [symbolKey]() {
    // 符号作为键
    console.log('symbolKey')
  }
  ['computed' + 'Key']() {
    // 计算的值作为建
    console.log('computedKey')
  }
}

// 获取和设置访问器
class Person14 {
  set setName(newName) {
    this._name = newName
  }
  get getName() {
    return this._name
  }
}
var p13 = new Person14()
p13.setName = 'Jake'
console.log(p13.getName) // 'Jake'

/* 静态类方法 */
class Person15 {
  constructor() {
    // 添加到this的内容存在于不同实例上
    this.locate = () => {
      console.log('instance', this) // 此处的this为类实例
    }
  }
  locate() {
    // 定义在类的原型对象上
    console.log('prototype', this) // 此处的this为类原型
  }
  static locate() {
    // 定义在类本身上
    console.log('class', this) // 此处的this为类本身
  }
}
var p14 = new Person15()

p14.locate() // 'instance' Person15 { locate: [Function (anonymous)] }
p14.__proto__.locate() // 'prototype' {}
Person15.locate() // 'class' [class Person15]

// 作为实例工厂
class Person16 {
  constructor(age) {
    this._age = age
  }
  sayAge() {
    console.log(this._age)
  }
  static create() {
    return new Person16(Math.floor(Math.random() * 100))
  }
}
console.log(Person16.create()) // Person16 { _age: ... }

/* 非函数原型和类成员 */
class Person17 {
  sayName() {
    console.log(`${Person17.greeting} ${this.name}`)
  }
}
var p15 = new Person17()
Person17.greeting = 'My name is' // 在类上定义数据
Person17.prototype.name = 'Jake' // 在原型上定义数据
p15.sayName() // 'My name is Jake'

/* 迭代器与生成器方法 */

/* 8.4.4 继承 */
