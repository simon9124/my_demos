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

/* Boolean类型 */
var booleanObject = new Boolean(true) // 调用Boolean构造函数，并传入true/false

var falseObj = new Boolean(false) // falseObj是基本包装类型，被转换成true（所有基本包装类型对象都会被转换成true）
var falseValue = false // falseValue是基本类型，就是false

console.log(falseObj && true) // true
console.log(falseValue && true) // false
console.log(typeof falseObj) // object，基本包装类型
console.log(typeof falseValue) // boolean，基本类型
console.log(falseObj instanceof Boolean) // true，Boolean对象是Boolean类型的实例
console.log(falseValue instanceof Boolean) // false

/* Number 类型 */
var numberObject = new Number(10) // 调用Number构造函数，并传入数值

var num1 = 10
console.log(num1.toString()) // 十进制，"10"
console.log(num1.toString(2)) // 二进制，"1010"
console.log(num1.toString(8)) // 八进制，"12"
console.log(num1.toString(10)) // 十进制，"10"
console.log(num1.toString(16)) // 十六进制，"a"

var num2 = 10000
console.log(num2.toFixed(2)) // 指定小数位，"10000.00"
console.log(num2.toExponential(2)) // 指数表示法，"1.00e+4"

var num3 = 99
console.log(num3.toPrecision(1)) // 用一位数表示，"1e+2"
console.log(num3.toPrecision(2)) // 用二位数表示，"99"
console.log(num3.toPrecision(3)) // 用三位数表示，"99.0"

var numberObject = new Number(10)
var numberValue = 10
console.log(typeof numberObject) // object，基本包装类型
console.log(typeof numberValue) // value，基本类型
console.log(numberObject instanceof Number) // true，Number对象是Number类型的实例
console.log(numberValue instanceof Number) // false

/* String 类型 */
var stringObject = new String('hello world') // 调用String构造函数，并传入字符串

console.log(stringObject.length) // "11"
console.log(stringObject.charAt(1)) // "e"
console.log(stringObject.charCodeAt(1)) // "101"
console.log(stringObject[1]) // "e"

console.log(stringObject.concat(' wonderful')) // "hello world wonderful"
console.log(stringObject.slice(3)) // "lo world"
console.log(stringObject.substring(3)) // "lo world"
console.log(stringObject.substr(3)) // "lo world"
console.log(stringObject.slice(3, 7)) // "lo w"，第二个参数指定到哪里结束（不包含）
console.log(stringObject.substring(3, 7)) // "lo w"，第二个参数指定到哪里结束（不包含）
console.log(stringObject.substr(3, 7)) // "lo worl"，第二个参数指定要返回的字符个数

console.log(stringObject.slice(-3)) // "rld"
console.log(stringObject.substring(-3)) // "hello world"
console.log(stringObject.substr(-3)) // "rld"
console.log(stringObject.slice(3, 7)) // "lo w"，第二个参数指定到哪里结束（不包含）
console.log(stringObject.substring(3, 7)) // "lo w"，第二个参数指定到哪里结束（不包含）
console.log(stringObject.substr(3, 7)) // "lo worl"，第二个参数指定要返回的字符个数
