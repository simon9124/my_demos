/* Global 对象 */

// URI编码方法
var uri = 'https://element cn/#tab'
console.log(encodeURI(uri)) // https://element%20cn/#tab，本身属于URI的字符不编码（冒号、正斜杠、问号、井号）
console.log(encodeURIComponent(uri)) // https%3A%2F%2Felement%20cn%2F%23tab，编码所有非标准字符
console.log(decodeURI('https%3A%2F%2Felement%20cn%2F%23tab')) // https%3A%2F%2Felement cn%2F%23tab，只针对使用 encode()编码的字符解码
console.log(decodeURIComponent('https%3A%2F%2Felement%20cn%2F%23tab')) // https://element cn/#tab，解码所有非标准字符

// eval方法
eval("console.log('hi')") // "hi"，将传入的参数当作实际的 EXMAScript 语句解析
eval("function sayHi() {console.log('hi')}")
sayHi() // "hi"，被执行的代码具有与该执行环境相同的作用域链
// console.log(msg) // 报错，eval() 创建的变量或函数不会被提升
eval("var msg = 'hi'")
console.log(msg) // "hi"，被执行的代码具有与该执行环境相同的作用域链

// window对象
// vscode是node运行环境，无法识别全局对象window，为方便在编辑器测试做了微调
var window = { color: 'red' }
function sayColor() {
  console.log(window.color)
}
window.sayColor = sayColor
window.sayColor() // red

/* Math 对象 */
console.log(Math.max(3, 54, 32, 16)) // 54，确定一组数值的最大值
console.log(Math.min(3, 54, 32, 16)) // 3，确定一组数值的最小值

// 确定数组中的最大值/最小值
var values = [1, 2, 3, 4, 5]
console.log(Math.max.apply(Math, values)) // 把Math对象作为apply()的第一个参数，将数组作为第二个参数

console.log(Math.ceil(1.9)) // 2，向上取整
console.log(Math.floor(1.9)) // 1，向下取整
console.log(Math.round(1.9)) // 2，四舍五入

console.log(Math.random()) // 大于 0 小于 1 的随机数

// 选择1-10之间的整数
console.log(Math.floor(Math.random() * 10 + 1))

// 选择m-n之间的整数
function selectFrom(lowerValue, upperValue) {
  var choices = upperValue - lowerValue + 1 // 获取范围内的数量
  return Math.floor(Math.random() * choices + lowerValue)
}
var num = selectFrom(7, 32)
console.log(num)
