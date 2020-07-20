/* 创建基本包装类型对象 */
var s1 = 'some text'
var s2 = s1.substring(2) // 基本类型不是对象，本不应该有方法

// 因为后台自动完成了下列处理：
var s1 = new String('some text') // 1.创建String类型的实例
var s2 = s1.substring(2) // 2.在实例上调用指定方法
s1 = null // 3.销毁该实例

/* 基本包装类型的对象生存期 */
var s1 = 'some text'
s1.color = 'red' // 创建String对象
console.log(s1.color) // undefined，s1对象已被销毁，同时再次创建String对象，新对象没有color属性

/* 基本包装类型的构造函数 */
var objText = new Object('some text') // 创建String的实例
console.log(objText instanceof String) // true
var objBoolean = new Object(false) // 创建Boolean的实例
console.log(objBoolean instanceof Boolean) // true
var objNumber = new Object(123) // 创建Number的实例
console.log(objNumber instanceof Number) // true
console.log(objNumber instanceof Boolean) // false

/* 基本包装类型的转型函数 */
var value = '25'
var number = Number(value) // 转型函数，转成Number类型
console.log(typeof number) // number
var obj = new Number(value) // 构造函数，构造Number对象实例
console.log(typeof obj) // object
