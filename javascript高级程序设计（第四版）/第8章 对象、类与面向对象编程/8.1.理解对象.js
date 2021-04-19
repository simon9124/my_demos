/* 8.1 理解对象 */

// 创建一个 Object 实例，然后为它添加属性和方法
var person = new Object()
person.name = 'Nicholas'
person.age = 29
person.job = 'Software Engineer'
person.sayName = function () {
  console.log(this.name)
}

// 对象字面量创建对象
var person = {
  name: 'Nicholas',
  age: 29,
  job: 'Software Engineer',
  sayName: function () {
    console.log(this.name)
  },
}

/* 8.1.1 属性类型 */

/* 数据属性 */
var person = {}

// Object.defineProperty() 修改数据属性
Object.defineProperty(person, 'name', {
  writable: false, // 不可修改
  configurable: false, // 不可配置
  value: 'Nicholas',
})
console.log(person.name) // 'Nicholas'

person.name = 'Greg' // 试图重写（严格模式会报错）
console.log(person.name) // 'Nicholas'，无法重写
delete person.name // 试图删除（严格模式会报错）
console.log(person.name) // 'Nicholas'，无法删除

// configurable为false，试图修改非writable属性会报错
Object.defineProperty(person, 'name', {
  // configurable: true, // 报错，configurable为true方可修改
  // value: 'Simon', // 报错，writable为true方可修改
  // writable: true, // 报错，configurable为true方可修改
  // enumerable: true, // 报错，configurable为true方可修改
})

/* 访问器属性 */
var book = {
  _year: 2017, // 默认属性
  edition: 1, // 默认属性
}

// Object.defineProperty() 定义访问器属性
Object.defineProperty(book, 'year', {
  // year是访问器属性
  get() {
    return this._year
  },
  set(newValue) {
    if (newValue > 2017) {
      this._year = newValue // this._year = 2018
      this.edition += newValue - 2017 // this.edition = 1 + 2018 - 2017
    }
  },
})
book.year = 2018 // 写入访问器属性。调用set()方法
console.log(book) // { _year: 2018, edition: 2 }

// IE8或更早，定义访问器属性的方法 - 遗留的方法，可在浏览器测试，vscode会报错
// book.__defineGetter__('year', function () {
//   return this._year
// })
// book.__defineSetter__('year', function (newValue) {
//   if (newValue > 2017) {
//     this._year = newValue
//     this.edition += newValue - 2017
//   }
// })
// book.year = 2018
// console.log(book)

/* 8.1.2 定义多个属性 */

// Object.defineProperties() 同时定义多个属性
var book2 = {}
Object.defineProperties(book2, {
  _year: {
    writable: true,
    value: 2017,
  },
  edition: {
    writable: true,
    value: 1,
  },
  year: {
    get() {
      return this._year
    },
    set(newValue) {
      if (newValue > 2017) {
        this._year = newValue
        this.edition += newValue - 2017
      }
    },
  },
})
book2.year = 2018
console.log(book2.edition) // 2

/* 8.1.3 读取属性的特性 */

// Object.getOwnPropertyDescriptor() - 取得指定属性的属性描述符
var book3 = {}
Object.defineProperties(book3, {
  _year: {
    value: 2017,
  },
  edition: {
    value: 1,
  },
  year: {
    get: function () {
      return this._year
    },
    set: function (newValue) {
      if (newValue > 2017) {
        this._year = newValue
        this.edition += newValue - 2017
      }
    },
  },
})
var descriptor = Object.getOwnPropertyDescriptor(book3, '_year')
console.log(descriptor) // { value: 2017, writable: false, enumerable: false, configurable: false }
console.log(descriptor.value) // 2017
console.log(descriptor.configurable) // false，Object.getOwnPropertyDescriptor()定义属性的特性，默认值为false
console.log(typeof descriptor.get) // undefined，数据属性不含get函数

var descriptor2 = Object.getOwnPropertyDescriptor(book3, 'year')
console.log(descriptor2) // { get: [Function: get], set: [Function: set], enumerable: false, configurable: false }
console.log(descriptor2.value) // undefined，访问器属性不含value
console.log(descriptor2.configurable) // false，Object.getOwnPropertyDescriptor()定义属性的特性，默认值为false
console.log(typeof descriptor2.get) // 'function'

// Object.getOwnPropertyDescriptors() - 获取每个属性的属性描述符
console.log(Object.getOwnPropertyDescriptors(book3))
/* 
  {
    _year: {
      value: 2017,
      writable: false,
      enumerable: false,
      configurable: false
    },
    edition: { value: 1, writable: false, enumerable: false, configurable: false },
    year: {
      get: [Function: get],
      set: [Function: set],
      enumerable: false,
      configurable: false
    }
  }
*/

// 调用 Object.defineProperty()、Object.defineProperties()方法时，configurable、enumerable、writable的默认值均为false
var book4 = {
  year: 2017,
}
var descriptorBook4 = Object.getOwnPropertyDescriptor(book4, 'year')
console.log(
  'book4', // book4
  descriptorBook4.configurable, // true
  descriptorBook4.enumerable, // true
  descriptorBook4.writable, // true
  typeof descriptorBook4.set, // undefined
  typeof descriptorBook4.get // undefined
)
var book5 = {}
Object.defineProperty(book5, 'year', {
  value: 2017,
})
var descriptorBook5 = Object.getOwnPropertyDescriptor(book5, 'year')
console.log(
  'book5', // book5
  descriptorBook5.configurable, // false
  descriptorBook5.enumerable, // false
  descriptorBook5.writable, // false
  typeof descriptorBook4.set, // undefined
  typeof descriptorBook4.get // undefined
)

/* 8.1.4 合并对象 */
let dest, src, result

// 单个源对象
dest = {}
src = { id: 'src' }
result = Object.assign(dest, src) // 返回修改后的目标对象

console.log(result) // { id: 'src' }
console.log(dest === result) // true，修改后的目标对象
console.log(dest === src) // false，目标对象和源对象

// 多个源对象
dest = {}
result = Object.assign(dest, { a: 'foo' }, { b: 'bar' })
console.log(result) // { a: 'foo', b: 'bar' }

// 获取函数与设置函数
dest = {
  set a(val) {
    console.log(`Invoked dest setter with param ${val}`)
  },
}
src = {
  get a() {
    console.log(`Invoked src better`)
    return 'foo'
  },
}
Object.assign(dest, src)
/* 
  'Invoked src better'，调用源对象上的get方法获得返回值
  'Invoked dest setter with param foo'，再调用目标对象的set()方法传入值
*/

// 多个源对象有相同的属性
dest = { id: 'dest' }
result = Object.assign(dest, { id: 'src1', a: 'foo' }, { id: 'src2', b: 'bar' })
console.log(result) // { id: 'src2', a: 'foo', b: 'bar' }

// 不能在两个对象间转移获取函数和设置函数
dest = {
  set id(x) {
    console.log(x)
  },
}
Object.assign(dest, { id: 'first' }, { id: 'second' }, { id: 'third' }) // first second third，依次赋值给目标对象
console.log(dest) // set id: ƒ id(x)，设置函数是不变的

// Object.assign()实际上是对每个源对象执行浅复制
dest = {}
src = { a: {} }
Object.assign(dest, src)
console.log(dest) // { a: {} }
console.log(dest === src) // false
console.log(dest.a === src.a) // true，对源对象浅复制，复制对象的引用

// Object.assign()只有一个参数
console.log(Object.assign(src) === src) // true

src = { a: 1 }
dest = Object.assign(src)
console.log(dest) // { a: 1 }
dest.a = 2
console.log(src) // { a: 2 }

// Object.assign()不会回滚
dest = {}
src = {
  a: 'foo', // 没遇到错误，执行复制
  get b() {
    throw new Error() // 注入错误，操作终止
  },
  c: 'bar', // 已遇到错误，不会执行
}
try {
  Object.assign(dest, src)
} catch (e) {}
console.log(dest) // { a: 'foo' }，遇到错误前已经完成的修改被保留

/* 8.1.5 对象标识及相等判定 */

// 两个值都是 null
//   - 两个值都是 true 或者都是 false
//   - 两个值是由相同个数的字符按照相同的顺序组成的字符串
//   - 两个值指向同一个对象
//   - 两个值都是数字并且
//   - 都是正零 +0
//   - 都是负零 -0
//   - 都是 NaN
//   - 都是除零和 NaN 外的其它同一个数字

console.log(undefined === undefined) // true
console.log(null === null) // true
console.log(+0 === 0) // true
console.log(+0 === -0) // true // true
console.log(-0 === 0) // true
console.log(NaN === NaN) // false

// Object.is()
console.log(Object.is(undefined, undefined)) // true
console.log(Object.is(null, null)) // true
console.log(Object.is(+0, 0)) // true
console.log(Object.is(+0, -0)) // false
console.log(Object.is(-0, 0)) // false
console.log(Object.is(NaN, NaN)) // true

/* 8.1.6 增强的对象语法 */

// 属性值简写
var name = 'Matt'
var person = {
  name: name,
}
var person = { name }

// 可计算属性
var nameKey = 'name'
var ageKey = 'age'
var jobKey = 'job'
var person = {
  [nameKey]: 'Matt',
  [ageKey]: 27,
  [jobKey]: 'Software engineer',
}
console.log(person) // { name: 'Matt', age: 27, job: 'Software engineer' }

var uniqueToken = 0
function getUniqueKey(key) {
  return `${key}_${uniqueToken++}`
}
var person = {
  [getUniqueKey(nameKey)]: 'Matt',
  [getUniqueKey(ageKey)]: 27,
  [getUniqueKey(jobKey)]: 'Software engineer',
}
console.log(person) // { name_0: 'Matt', age_1: 27, job_2: 'Software engineer' }

// 简写方法名
var person = {
  sayName: function (name) {
    console.log(`My name is ${name}`)
  },
}
var person = {
  sayName(name) {
    console.log(`My name is ${name}`)
  },
}

var person = {
  name_: '',
  get name() {
    return this.name_
  },
  set name(name) {
    this.name_ = name
  },
  sayName() {
    console.log(`My name is ${this.name_}`)
  },
}
person.name = 'Matt'
person.sayName() // 'My name is Matt'

var methodKey = 'sayName'
var person = {
  [methodKey](name) {
    console.log(`My name is ${name}`)
  },
}
person.sayName('Matt') // 'My name is Matt'

/* 8.1.7 对象解构 */
var person = {
  name: 'Matt',
  age: 27,
}
var { name: personName, age: personAge } = person
console.log(personName, personAge) // 'Matt' 27

var { name, age } = person // 变量直接使用属性名称
console.log(name, age) // 'Matt' 27

var { name, job } = person // job不存在
console.log(name, job) // 'Matt' undefined

var { name, job = 'Sofrware engineer' } = person // 定义job的默认值
console.log(name, job) // 'Matt' 'Sofrware engineer'

var { length } = 'foobar' // 'foobar'转换为String包装对象
console.log(length) // 6，字符串长度
var { constructor: c } = 4 // 4转换为Number包装对象
console.log(c === Number) // true，constructor指向构造函数

// var { _ } = null // TypeError
// var { _ } = undefined // TypeError

var person = {
  name: 'Matt',
  age: 27,
}
let personName2,
  personAge2 // 事先声明的变量
;({ name: personName2, age: personAge2 } = person) // 给实现声明的变量赋值，赋值表达式必须包含在一对括号中
console.log(personName, personAge) // 'Matt' 27
