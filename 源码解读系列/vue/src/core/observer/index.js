/* @flow */

import Dep from './dep.js' // 依赖管理器
import { def } from '../util/lang.js' // Define a property
import { hasProto } from '../util/env.js' // 判断__proto__是否可用（有些浏览器不支持该属性）
import { arrayMethods } from './array.js' // 继承自Array原型的对象，包含改变数组的7个同名方法
import VNode from '../vdom/vnode.js'
import {
  isObject, // 判断是否为对象（且排除null）
  hasOwn, // 检查属性是否存在于对象本身
} from '../../shared/util.js'

const arrayKeys = Object.getOwnPropertyNames(arrayMethods) // Array要重写的属性组成的数组
// console.log(arrayKeys) // ['push','pop','shift','unshift','splice','sort','reverse',]

/**
 * Observer类：通过递归的方式把一个对象的所有属性都转化成可观测对象
 * 把Object数据中的所有属性（包括子属性）都转换成getter/seter的形式来侦测变化
 * @param { Object/Array } value 监测对象
 */
export class Observer {
  constructor(value) {
    this.value = value
    this.dep = new Dep() // 实例化一个依赖管理器，用来收集依赖（数组）
    // 给value新增一个__ob__属性，值为该value的Observer实例（相当于为value打上标记，表示它已经被转化成响应式了，避免重复操作）
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      // value为数组
      const augment = hasProto ? protoAugment : copyAugment
      augment(value, arrayMethods, arrayKeys)
    } else {
      // value不为数组
      this.walk(value)
    }
  }

  // 原型方法walk：循环该对象的key，针对每个key执行defineReactive()方法 → 让对象变得可观测
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
}

/**
 * 重写实例的原型（浏览器支持__proto__）
 * @param { Object } target 目标实例
 * @param { Object } src 要重写的原型
 */
function protoAugment(target, src) {
  /* eslint-disable no-proto */
  target.__proto__ = src
  /* eslint-enable no-proto */
}

/**
 * 重写实例的原型（浏览器不支持__proto__）
 * @param { Object } target 目标实例
 * @param { Object } src 要重写的原型
 * @param { Array } keys 要重写的属性组成的数组
 */
function copyAugment(target, src, keys) {
  for (let i = 0, l = keys.length; i < l; i++) {
    const key = keys[i]
    def(target, key, src[key]) // 分别重写目标实例的这些方法
  }
}

/**
 * 使一个对象转化成可观测对象
 * @param { Object } obj 对象
 * @param { String } key 对象的key
 * @param { Any } val 对象的某个key的值
 */
function defineReactive(obj, key, val) {
  // console.log(key)
  const dep = new Dep() // 实例化一个依赖管理器，用来收集对象的依赖

  if (arguments.length === 2) {
    // 如果只传了obj和key，那么val = obj[key]
    val = obj[key]
    // console.log(val)
  }
  // if (typeof val === 'object') {
  //   // 如果val的类型是对象，则对其再次执行new Observer，即实现递归
  //   new Observer(val)
  // }
  // console.log(val)

  let childOb = observe(val) // 源码在这里实现递归
  // console.log('defineReactive', key, val, childOb)

  /* 访问器属性 */
  Object.defineProperty(obj, key, {
    enumerable: true, // 能否通过for-in循环返回
    configurable: true, // 能否配置（delete 删除、修改特性、改为访问器属性）
    // get:读取属性时调用的函数
    get() {
      console.log(`${key}被读取了`)
      dep.depend() // 在getter中收集依赖（对象），调用dep实例的depend()方法
      if (childOb) {
        console.log('Observer实例的dep属性调用depend()', childOb)
        // 如果childOb非undefined（而是Observer实例），则对其dep属性也调用depend()方法（收集数组依赖）
        childOb.dep.depend()
      }
      return val
    },
    // set:写入属性时调用的函数
    set(newVal) {
      if (val === newVal) {
        return
      }
      console.log(`${key}被修改了：${val}=>${newVal}`)
      val = newVal
      dep.notify() // 在setter中通知依赖更新（对象），调用dep实例的notify()方法
    },
  })
}

/**
 * 尝试为value创建一个0bserver实例：
 *    如果创建成功，直接返回新创建的Observer实例
 *    如果value已经存在一个Observer实例，则直接返回它
 * @param { Object } value 当前传入数据
 */
export function observe(value, asRootData) {
  // console.log('observe', value) // 已被重写为obj[key]

  if (!isObject(value) || value instanceof VNode) {
    // 如果value不是对象 或者 value是VNode的实例，则返回undefined
    return
  }

  let ob
  if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
    // 如果value包含__ob__属性 且 value.__ob__是Observer的实例（value已经被转化成响应式，避免重复操作）
    ob = value.__ob__ // ob被重写为value.__ob__
  } else {
    // 如果value不包含__ob__属性（对象内层的对象）
    ob = new Observer(value) // 再次执行new Observer（在这里实现递归）
  }
  return ob
}

/* 测试：监听对象 */
// let car = new Observer({
//   brand: 'BMW',
//   price: 3000,
//   child: {
//     count: 100,
//   },
// }).value
// car.price
// car.price = 5000
// car.child.count = 101
// console.log(car)

/* 测试：监听数组 */
// let arr = new Observer([1, 2, 3]).value
// arr.push(4) // 'push'
// arr.reverse() // 'reverse'
// console.log(arr) // [ 4, 3, 2, 1 ]
