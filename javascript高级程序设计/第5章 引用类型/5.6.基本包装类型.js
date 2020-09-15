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

// 字符方法
console.log(stringObject.charAt(1)) // "e"
console.log(stringObject.charCodeAt(1)) // "101"
console.log(stringObject[1]) // "e"

// 字符串操作方法
console.log(stringObject.concat(' wonderful')) // "hello world wonderful"
console.log(stringObject.slice(3)) // "lo world"
console.log(stringObject.substring(3)) // "lo world"
console.log(stringObject.substr(3)) // "lo world"
console.log(stringObject.slice(3, 7)) // "lo w"，第二个参数指定到哪里结束（不包含）
console.log(stringObject.substring(3, 7)) // "lo w"，第二个参数指定到哪里结束（不包含）
console.log(stringObject.substr(3, 7)) // "lo worl"，第二个参数指定要返回的字符个数

console.log(stringObject.slice(-3)) // "rld"，-3转换为11-3=8
console.log(stringObject.substring(-3)) // "hello world"，-3转换为0
console.log(stringObject.substr(-3)) // "rld"，-3转换为11-3=8
console.log(stringObject.slice(3, -4)) // "lo w"，-4转换为11-3=7
console.log(stringObject.substring(3, -4)) // "hel"，-4转换为0，substring(3,0)再转换为substring(0,3)
console.log(stringObject.substr(3, -4)) // ""，-4转换为0，返回包含零个字符的字符串

console.log(stringObject.indexOf('o')) // 4
console.log(stringObject.lastIndexOf('o')) // 7
console.log(stringObject.indexOf('o', 6)) // 7，第二个参数表示从哪个位置开始搜索
console.log(stringObject.lastIndexOf('o', 6)) // 4，第二个参数表示从哪个位置开始搜索

// 字符串位置方法
var loremString =
  'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
var position = new Array()
var pos = loremString.indexOf('o')
while (pos > -1) {
  position.push(pos)
  pos = loremString.indexOf('o', pos + 1)
}
console.log(position) // 所有包含o的字符位置集合

// trim()方法
var stringValue = '  hello world  '
var trimStringValue = stringValue.trim()
console.log(stringValue) // "  hello world  "
console.log(trimStringValue) // "hello world"

// 字符串大小写转换方法
console.log(stringObject.toUpperCase()) // "HELLO WORLD"
console.log(stringObject.toLocaleUpperCase()) // "HELLO WORLD"
console.log(stringObject.toLowerCase()) // "hello world"
console.log(stringObject.toLocaleLowerCase()) // "hello world"

// 字符串模式匹配方法
var text = 'cat, bat, sat, fat'
var pattern = /.at/

var matches = text.match(pattern)
console.log(matches) // [ 'cat',index: 0,input: 'cat, bat, sat, fat',groups: undefined ]，match方法返回一个数组，第一项与整个模式匹配的字符串，后面的项保存着与正则表达式捕获匹配的字符串
console.log(matches.index) // 0
console.log(matches[0]) // "cat"
console.log(pattern.lastIndex) // 0

var pos = text.search(/at/)
console.log(pos) // 1，记录"at"首次在字符串出现的位置

var result = text.replace('at', 'ond')
console.log(result) // "cond, bat, sat, fat"，第一个参数是字符串所以只替换第一个匹配的
result = text.replace(/at/g, 'ond')
console.log(result) // "cond, bond, sond, fond"，第一个参数是全局正则所以替换全部的
result = text.replace(/(.at)/g, 'word($1)')
console.log(result) // "word(cat), word(bat), word(sat), word(fat)"，$1表示第一个匹配的参数

function htmlEscape(text) {
  return text.replace(/[<>"&]/g, function (match, pos, originalText) {
    switch (match) {
      case '<':
        return '&lt;'
        break
      case '>':
        return '&gt;'
        break
      case '&':
        return '&amp;'
        break
      case '"':
        return '&quot;'
        break
    }
  })
}
console.log(htmlEscape('<p class="greeting">Hello world!</p>')) // "&lt;p class=&quot;greeting&quot;&gt;Hello world!&lt;/p&gt;"

console.log(text.split(',')) // [ 'cat', ' bat', ' sat', ' fat' ]
console.log(text.split(',', 2)) // [ 'cat', ' bat' ]，第二个参数指定数组大小
console.log(text.split(/[^\,]+/)) // [ '', ',', ',', ',', '' ]，通过正则获取包含都好字符的数组，正则指定分隔符出现在了字符串开头和末尾，因此首尾是空字符串

// localeCompare()方法
var stringCompare = 'yellow'
console.log(stringCompare.localeCompare('brick')) // 1，brick字母表在yellow之前
console.log(stringCompare.localeCompare('yellow')) // 0，yellow字母表与yellow相同
console.log(stringCompare.localeCompare('zoo')) // -1，zoo字母表在yellow之后

function determineOrder(value) {
  var result = stringCompare.localeCompare(value)
  result < 0 &&
    console.log(`The string 'yellow' comes before the string ${value}.`)
  result > 0 &&
    console.log(`The string 'yellow' comes after the string ${value}.`)
  result === 0 &&
    console.log(`The string 'yellow' is equal to the string ${value}.`)
}
determineOrder('brick') // "The string 'yellow' comes after the string brick."
determineOrder('yellow') // "The string 'yellow' is equal to the string zoo."
determineOrder('zoo') // "The string 'yellow' comes before the string zoo."

// fromCharCode()方法
console.log(String.fromCharCode(104, 101, 108, 108, 111)) // "hello"
