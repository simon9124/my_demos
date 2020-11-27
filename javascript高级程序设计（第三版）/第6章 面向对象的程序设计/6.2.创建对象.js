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
