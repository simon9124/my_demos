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

class Person18 {
  *createNicknameIterator() {
    // 在原型上定义生成器方法
    yield 'Jack'
    yield 'Jake'
    yield 'J-Dog'
  }
  static *createJobIterator() {
    // 在类本身定义生成器方法
    yield 'Butcher'
    yield 'Baker'
    yield 'Candlestick maker'
  }
}

var jobIter = Person18.createJobIterator() // 调用生成器函数，产生生成器对象
console.log(jobIter.next().value) // 'Butcher'
console.log(jobIter.next().value) // 'Baker'
console.log(jobIter.next().value) // 'Candlestick maker'

var p16 = new Person18()
var nicknameIter = p16.createNicknameIterator() // 调用生成器函数，产生生成器对象
console.log(nicknameIter.next().value) // 'Jack'
console.log(nicknameIter.next().value) // 'Jake'
console.log(nicknameIter.next().value) // 'J-Dog'

// 生成器方法作为默认迭代器
class Person19 {
  constructor() {
    this.nickNames = ['Jack', 'Jake', 'J-Dog']
  }
  *[Symbol.iterator]() {
    // 生成器函数作为默认迭代器
    yield* this.nickNames.entries()
  }
}

var p17 = new Person19()
for (let [i, n] of p17) {
  console.log(i, n)
  /* 
    0 'Jack'
    1 'Jake'
    2 'J-Dog'
  */
}

// 返回迭代器实例
class Person20 {
  constructor() {
    this.nickNames = ['Jack', 'Jake', 'J-Dog']
  }
  [Symbol.iterator]() {
    // 返回迭代器实例
    return this.nickNames.entries()
  }
}
var p18 = new Person20()
for (let [i, n] of p18) {
  console.log(i, n)
  /* 
    0 'Jack'
    1 'Jake'
    2 'J-Dog'
  */
}

/* 8.4.4 继承 */

/* 继承基础 */

class Vehicle {}
class Bus extends Vehicle {} // 继承类
var b = new Bus()
console.log(b instanceof Bus) // true
console.log(b instanceof Vehicle) // true

function Person21() {}
class Engineer extends Person21 {} // 继承构造函数
var p19 = new Engineer()
console.log(p19 instanceof Engineer) // true
console.log(p19 instanceof Person21) // true

// extends关键字在类表达式中使用
var Bus2 = class extends Vehicle {}

// 子类访问父类和父类原型上定义的方法
class Vehicle2 {
  identifyPrototype(id) {
    // 父类原型上定义的方法
    console.log(id, this)
  }
  static identifyClass(id) {
    // 父类本身定义的方法
    console.log(id, this)
  }
}
class Bus3 extends Vehicle2 {}

var v = new Vehicle2()
var b2 = new Bus3()

v.identifyPrototype('v') // 'v' Vehicle2 {}，this为父类实例
b2.identifyPrototype('b') // 'b' Bus3 {}，this为子类实例
v.__proto__.identifyPrototype('v') // 'v' {}，this为父类原型
b2.__proto__.identifyPrototype('b') // 'b' Vehicle2 {}，this为子类原型，即父类实例
Vehicle2.identifyClass('v') // v [class Vehicle2]，this为父类本身
Bus3.identifyClass('b') // b [class Bus3 extends Vehicle2]，this为子类本身

/* 构造函数、HomeObject 和 super() */

// 子类构造函数中调用super()
class Vehicle3 {
  constructor() {
    this.hasEngine = true
  }
}
class Bus4 extends Vehicle3 {
  constructor() {
    super() // 调用父类构造函数constructor
    console.log(this) // Bus4 { hasEngine: true }，子类实例，已调用父类构造函数
    console.log(this instanceof Vehicle3) // true
    console.log(this instanceof Bus4) // true
  }
}
new Bus4()

// 子类静态方法中调用super()

class Vehicle4 {
  static identifyV() {
    // 父类静态方法
    console.log('vehicle4')
  }
}
class Bus5 extends Vehicle4 {
  static identifyB() {
    // 子类静态方法
    super.identifyV() // 调用父类静态方法
  }
}
Bus5.identifyB() // 'vehicle4'

// 使用super需注意几个问题
class Vehicle5 {
  constructor(id) {
    // super() // SyntaxError: 'super' keyword unexpected here，super只能在子类构造函数和子类静态方法中使用
    this.id = id
  }
}
class Bus6 extends Vehicle5 {
  constructor(id) {
    // console.log(super) // SyntaxError: 'super' keyword unexpected here，不能单独引用super
    // console.log(this) // ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor，调用super()之前不能引用this
    super(id) // 调用父类构造函数，手动给父类构造函数传参，并将返回的实例赋给this（子类实例）
    console.log(this) // Bus6 { id: 5 }，子类实例
    console.log(this instanceof Vehicle5) // true
    console.log(this instanceof Bus6) // true
  }
}
new Bus6(5)

class Bus7 extends Vehicle5 {} // 子类未定义构造函数
console.log(new Bus7(6)) // Bus7 { id: 6 }，实例化时自动调用super()并传参

class Bus8 extends Vehicle5 {
  // constructor() {} // ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
  constructor(id) {
    super(id) // 子类显式定义构造函数，要么调用super()
  }
}
class Bus9 extends Vehicle5 {
  // constructor() {} // ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
  constructor(id) {
    return {} // 子类显式定义构造函数，要么返回其他对象
  }
}
console.log(new Bus8(7)) // Bus8 { id: 7 }，子类实例
console.log(new Bus9(8)) // {}，返回新对象

/* 抽象基类 */

class Vehicle6 {
  constructor() {
    console.log(new.target)
    if (new.target === Vehicle6) {
      // 阻止抽象基类被实例化
      throw new Error('Vehicle6 cannot be directly instantiated')
    }
    if (!this.foo) {
      // 要求子类必须定义foo()方法
      throw new Error('Inheriting class must define foo()')
    }
  }
}
class Bus10 extends Vehicle6 {} // 子类未定义foo()方法
class Bus11 extends Vehicle6 {
  // 子类定义了foo()方法
  foo() {}
}

// new Vehicle6() // [class Vehicle6]，Error: Vehicle6 cannot be directly instantiated
// new Bus10() // [class Bus10 extends Vehicle6]，Error: Inheriting class must define foo()
new Bus11() // [class Bus11 extends Vehicle6]

/* 继承内置类型 */

class SuperArray extends Array {
  // 在子类原型上追加方法：任意洗牌
  shuffle() {
    for (let i = this.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[this[i], this[j]] = [this[j], this[i]]
    }
  }
}
var a = new SuperArray(1, 2, 3, 4, 5)
console.log(a instanceof Array) // true，a是Array的实例
console.log(a instanceof SuperArray) // true，a是SuperArray的实例
console.log(a) // SuperArray(5) [ 1, 2, 3, 4, 5 ]
a.shuffle()
console.log(a) // SuperArray(5) [ 3, 1, 2, 5, 4 ]

// 内置类型的方法返回新实例
var a1 = new SuperArray(1, 2, 3, 4, 5)
var a2 = a1.filter((x) => !!(x % 2)) // filter方法返回新的实例，实例类型与a1的一致
console.log(a1) // SuperArray(5) [ 1, 2, 3, 4, 5 ]
console.log(a2) // SuperArray(3) [ 1, 3, 5 ]
console.log(a1 instanceof SuperArray) // true
console.log(a2 instanceof SuperArray) // true

// Symbol.species
class SuperArray2 extends Array {
  // Symbol.species定义静态获取器方法，覆盖新创建实例时返回的类
  static get [Symbol.species]() {
    return Array // 内置类型的方法新创建实例时，返回Array类型
  }
}
var a3 = new SuperArray2(1, 2, 3, 4, 5)
var a4 = a3.filter((x) => !!(x % 2)) // filter方法返回新的实例，实例类型已被覆盖（Array）
console.log(a3) // SuperArray(5) [ 1, 2, 3, 4, 5 ]
console.log(a4) // [ 1, 3, 5 ]
console.log(a3 instanceof SuperArray2) // true
console.log(a4 instanceof SuperArray2) // false

/* 类混入 */

// extends后面接表达式
class Vehicle7 {}
function getParentClass() {
  console.log('evaluated expression')
  return Vehicle7 // 表达式被解析为Vehicle7类
}
class Bus12 extends getParentClass {}
new Bus12() // 'evaluated expression'

// 混入模式，一个表达式连缀多个混入元素
class Vehicle8 {}
let FooMixin = (SuperClass) =>
  // 表达式接收超类作为参数，返回子类
  class extends SuperClass {
    // 子类原型追加方法
    foo() {
      console.log('foo')
    }
  }
let BarMixin = (SuperClass) =>
  // 表达式接收超类作为参数，返回子类
  class extends SuperClass {
    // 子类原型追加方法
    bar() {
      console.log('bar')
    }
  }

class Bus13 extends BarMixin(FooMixin(Vehicle8)) {} // 嵌套逐级继承：FooMixin继承Vehicle8，BarMixin继承FooMixin，Bus13继承BarMixin
var b3 = new Bus13()
console.log(b3) // Bus13 {}，子类实例
b3.foo() // 'foo'，继承了超类原型上方法
b3.bar() // 'bar'，继承了超类原型上方法

// 辅助函数展开嵌套
function mix(BaseClass, ...Mixins) {
  /* 
    reduce接收2个参数：对每一项都会运行的归并函数、归并起点的初始值（非必填）
    归并函数接收4个参数：上一个归并值、当前项、当前索引、数组本身
  */
  return Mixins.reduce(
    (pre, cur) => cur(pre), // 归并方法：执行当前项方法，参数为上个归并值
    BaseClass // 归并初始值
  )
}
class Bus14 extends mix(Vehicle7, FooMixin, BarMixin) {}
var b4 = new Bus14()
console.log(b4) // Bus14 {}
b4.foo() // 'foo'
b4.bar() // 'bar'
