/* @flow */

import { def } from '../util/lang.js' // Define a property

const arrayProto = Array.prototype // Array原型
export const arrayMethods = Object.create(arrayProto) // 继承自Array原型的空对象（作为拦截器）
// console.log(arrayMethods) // Array {}

// 改变数组自身内容的7个方法
const methodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
]

/**
 * Intercept mutating methods and emit events
 */
methodsToPatch.forEach(function (method) {
  const original = arrayProto[method] // 缓存原生方法
  /* 将改变数组自身的7个方法进行封装 */
  def(arrayMethods, method, function mutator(...args) {
    console.log(method)
    const result = original.apply(this, args) // 执行同名的原生方法
    return result
  })
})

// console.log(arrayMethods) // Array {push: ƒ, pop: ƒ, shift: ƒ, unshift: ƒ, splice: ƒ, sort: f, reverse:f}，方法被封装在arrayMethods上

/* 测试：监听数组 */
// let arr = [1, 2, 3]
// arr.__proto__ = arrayMethods // 将实例的原型重写为arrayMethods，确保调用方法时调用的是arrayMethods上的同名方法
// arr.push(4) // 'push'
