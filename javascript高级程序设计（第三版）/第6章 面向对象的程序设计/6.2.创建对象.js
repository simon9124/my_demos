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
var person1 = createPerson('Nicholas', 29, 'Engineer')
var person2 = createPerson('Greg', 27, 'Doctor')
console.log(person1)
console.log(person2)

/* 构造函数模式 */
