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
