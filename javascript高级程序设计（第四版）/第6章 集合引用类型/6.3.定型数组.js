/* ArrayBuffer */
const buf = new ArrayBuffer(16) // 在内存中分配16字节
console.log(buf.byteLength) // 16

const buf1 = buf.slice(4, 12)
console.log(buf1.byteLength) // 8

/* DataView */

const fullDataView = new DataView(buf) // 默认使用整个ArrayBuffer
console.log(fullDataView.byteOffset) // 0，缓冲起点为0
console.log(fullDataView.byteLength) // 16，限制字节长度
console.log(fullDataView.buffer) // ArrayBuffer {...}，buf本身
console.log(fullDataView.buffer === buf) // true

const secondHalfDataView = new DataView(buf, 7) // 从缓冲的第8个字节开始
console.log(secondHalfDataView.byteOffset) // 7，缓冲起点为7
console.log(secondHalfDataView.byteLength) // 9，16-7=9，起点为7直到末尾
console.log(secondHalfDataView.buffer === buf) // true

// ElementType
const buf3 = new ArrayBuffer(2) // 分配两个字节
const view = new DataView(buf3) // 声明DataView
console.log(view)
/* DataView {
  byteLength: 2,
  byteOffset: 0,
  buffer: ArrayBuffer { [Uint8Contents]: <00 00>, byteLength: 2 }
} */

console.log(view.getInt8(0)) // 0，字节偏移量为0，检查第一个字符
console.log(view.getInt8(1)) // 0，字节偏移量为1，检查第二个字符
console.log(view.getInt16(0)) // 0，字符偏移量为0，检查整个缓冲（总共2字节）

view.setUint8(0, 255) // 设置第一个字符，255二进制是11111111（2^8-1），DataView自动转换为特定的ElementType
view.setUint8(1, 0xff) // 设置第二个字符，255十六进制是0xff，DataView自动转换为特定的ElementType
console.log(view)
/* DataView {
  byteLength: 2,
  byteOffset: 0,
  buffer: ArrayBuffer { [Uint8Contents]: <ff ff>, byteLength: 2 }
} */

console.log(view.getInt16(0)) // -1，当成二补数的有符号整数为-1

/* 定型数组 */
