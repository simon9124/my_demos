/* 基本API */

// new关键字 和 Map构造函数
const m = new Map()
console.log(m) // Map(0) {}

// 嵌套数组初始化映射
const m1 = new Map([
  ['key1', 'val1'],
  ['key2', 'val2'],
  ['key3', 'val3'],
])
console.log(m1) // Map(3) { 'key1' => 'val1', 'key2' => 'val2', 'key3' => 'val3' }

// 自定义迭代器初始化映射
const m2 = new Map({
  [Symbol.iterator]: function* () {
    yield ['key1', 'val1']
    yield ['key2', 'val2']
    yield ['key3', 'val3']
  },
})
console.log(m2) // Map(3) { 'key1' => 'val1', 'key2' => 'val2', 'key3' => 'val3' }

// set()、get()、has()、size、delete()、clear()
const m3 = new Map()
console.log(m3.size) // 0

m.set('firstName', 'Matt').set('lastName', 'Frisbie')
console.log(m.has('firstName')) // true
console.log(m.get('firstName')) // 'Matt'
console.log(m.size) // 2

m.delete('firstName') // 删除这个键值对
console.log(m.has('firstName')) // false
console.log(m.get('firstName')) // undefined
console.log(m.has('lastName')) // true
console.log(m.size) // 1

m.clear() // 清除所有键值对
console.log(m.has('firstName')) // false
console.log(m.has('lastName')) // false
console.log(m.size) // 0

const m4 = new Map().set('key1', 'val1')
console.log(m4) // Map(1) { 'key1' => 'val1' }

// 使用任何数据类型作为建
const m5 = new Map()

const functionKey = function () {}
const symbolKey = Symbol()
const objectKey = new Object()

m5.set(functionKey, 'functionValue')
  .set(symbolKey, 'symbolValue')
  .set(objectKey, 'objectValue')

console.log(m5.get(functionKey)) // 'functionValue'
console.log(m5.get(symbolKey)) // 'symbolValue'
console.log(m5.get(objectKey)) // 'objectValue'

// 键或值是对象或其他“集合”类型
const m6 = new Map()

const objKey = {},
  objValue = {},
  arrKey = [],
  arrValue = []

m6.set(objKey, objKey)
m6.set(arrKey, arrValue)
console.log(m6) // Map(2) { {} => {}, [] => [] }

objKey.foo = 'foo'
objValue.bar = 'bar'
arrKey.push('foo')
arrValue.push('bar')
console.log(m6) // Map(2) { { foo: 'foo' } => { foo: 'foo' }, [ 'foo' ] => [ 'bar' ] }
console.log(m6.get(objKey)) // { foo: 'foo' }
console.log(m6.get(arrKey)) // [ 'bar' ]

/* 顺序与迭代 */

// 迭代器
const m7 = new Map([
  ['key1', 'val1'],
  ['key2', 'val2'],
  ['key3', 'val3'],
])
console.log(m7.entries === m7[Symbol.iterator]) // true

for (let pair of m7.entries()) {
  console.log(pair)
  /* 
    [ 'key1', 'val1' ]
    [ 'key2', 'val2' ]
    [ 'key3', 'val3' ]
  */
}
for (let pair of m7[Symbol.iterator]()) {
  console.log(pair)
  /* 
    [ 'key1', 'val1' ]
    [ 'key2', 'val2' ]
    [ 'key3', 'val3' ]
  */
}

// 扩展操作
console.log([...m7]) // [ [ 'key1', 'val1' ], [ 'key2', 'val2' ], [ 'key3', 'val3' ] ]
console.log(...m7) // [ 'key1', 'val1' ] [ 'key2', 'val2' ] [ 'key3', 'val3' ]

// 回调方式
m7.forEach((val, key) => {
  console.log(`${key}->${val}`)
  /* 
    key1->val1
    key2->val2
    key3->val3
  */
})
for (let key of m7.keys()) {
  console.log(key)
  /* 
    key1
    key2
    key3
  */
}
for (let value of m7.values()) {
  console.log(value)
  /* 
    val1
    val2
    val3
  */
}
