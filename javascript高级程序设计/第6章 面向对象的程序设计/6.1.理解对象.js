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

/* 属性类型 - 数据属性 */
var person = {
  name: 'Nicholas',
}
// Object.defineProperty() 修改默认属性
Object.defineProperty(person, 'name', {
  writable: false,
  configurable: false,
  value: 'Nicholas',
})
console.log(person.name)
person.name = 'Greg'
console.log(person.name) // 无法重写
delete person.name
console.log(person.name) // 无法删除

Object.defineProperty(person, 'name', {
  // configurable: true, // 试图：不可配置 -> 可配置，由于已经改为不可配置，因此会报错
  // value: 'Simon',
})

/* 属性类型 - 访问器属性 */
var book = {
  _year: 2004,
  edition: 1,
}

// Object.defineProperty() 定义属性
Object.defineProperty(book, 'year', {
  get: function () {
    return this._year
  },
  set: function (newValue) {
    if (newValue > 2004) {
      this._year = newValue
      this.edition += newValue - 2004
    }
  },
})

book.year = 2007
console.log(book.edition)

// IE8或更早，定义访问器属性的方法 - 遗留的方法，可在浏览器测试，vscode会报错
// book.__defineGetter__('year', function () {
//   return this._year
// })
// book.__defineSetter__('year', function (newValue) {
//   if (newValue > 2004) {
//     this._year = newValue
//     this.edition += newValue - 2004
//   }
// })
// book.year = 2008
// console.log(book.edition)

// Object.defineProperties() - 同时定义多个属性
var book2 = {}
Object.defineProperties(book2, {
  _year: {
    writable: true,
    value: 2004,
  },
  edition: {
    writable: true,
    value: 1,
  },
  year: {
    get: function () {
      return this._year
    },
    set: function (newValue) {
      if (newValue > 2004) {
        this._year = newValue
        this.edition += newValue - 2004
      }
    },
  },
})
book2.year = 2008
console.log(book2.edition)

// Object.getOwnPropertyDescriptor() - 取得给定属性的描述符
var book3 = {}
Object.defineProperties(book3, {
  _year: {
    value: 2004,
  },
  edition: {
    value: 1,
  },
  year: {
    get: function () {
      return this._year
    },
    set: function (newValue) {
      if (newValue > 2004) {
        this._year = newValue
        this.edition += newValue - 2004
      }
    },
  },
})
var descriptor = Object.getOwnPropertyDescriptor(book3, '_year')
console.log(descriptor)
console.log(descriptor.value) // 2004
console.log(descriptor.configurable) // false，非直接在对象上定义属性，默认值为false
console.log(typeof descriptor.get) // undefined，数据属性不含get函数

var descriptor2 = Object.getOwnPropertyDescriptor(book3, 'year')
console.log(descriptor2)
console.log(descriptor2.value) // undefined，访问器属性不含value
console.log(descriptor2.configurable) // false，非直接在对象上定义属性，默认值为false
console.log(typeof descriptor2.get) // 'function'
