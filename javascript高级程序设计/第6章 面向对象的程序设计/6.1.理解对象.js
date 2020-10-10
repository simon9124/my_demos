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
  }
}

/* 属性类型 - 数据属性 */
var person = {
  name: 'Nicholas'
}
// Object.defineProperty() 修改默认属性
Object.defineProperty(person, 'name', {
  writable: false,
  configurable: false,
  value: 'Nicholas'
})
console.log(person.name);
person.name = 'Greg'
console.log(person.name); // 无法重写
delete person.name
console.log(person.name) // 无法删除

Object.defineProperty(person, 'name', {
  // configurable: true, // 试图：不可配置 -> 可配置，由于已经改为不可配置，因此会报错
  // value: 'Simon',
})
