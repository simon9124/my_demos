/* @flow */

import Dep from './dep.js' // 依赖管理器
import { def } from '../util/lang.js' // Define a property

/**
 * Observer类：通过递归的方式把一个对象的所有属性都转化成可观测对象
 * 把Object数据中的所有属性（包括子属性）都转换成getter/seter的形式来侦测变化
 * @param { Object/Array } value 监测对象
 */
export class Observer {
  constructor(value) {
    this.value = value
    // 给value新增一个__ob__属性，值为该value的Observer实例（相当于为value打上标记，表示它已经被转化成响应式了，避免重复操作）
    def(value, '__ob__', this)
    if (Array.isArray(value)) {
      // value为数组
      // ...
    } else {
      // value不为数组
      this.walk(value)
    }
  }

  // 原型方法walk：循环该对象的key，针对每个key执行defineReactive()方法
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
}

/**
 * 使一个对象转化成可观测对象
 * @param { Object } obj 对象
 * @param { String } key 对象的key
 * @param { Any } val 对象的某个key的值
 */
function defineReactive(obj, key, val) {
  if (arguments.length === 2) {
    // 如果只传了obj和key，那么val = obj[key]
    val = obj[key]
  }
  if (typeof val === 'object') {
    // 如果val的类型是对象，则对其再次执行new Observer，即实现递归
    new Observer(val)
  }
  const dep = new Dep() // 实例化一个依赖管理器，生成一个依赖管理数组dep

  /* 访问器属性 */
  Object.defineProperty(obj, key, {
    enumerable: true, // 能否通过for-in循环返回
    configurable: true, // 能否配置（delete 删除、修改特性、改为访问器属性）
    // get:读取属性时调用的函数
    get() {
      // console.log(`${key}被读取了`)
      dep.depend() // 在getter中收集依赖，调用dep实例的depend()方法
      return val
    },
    // set:写入属性时调用的函数
    set(newVal) {
      if (val === newVal) {
        return
      }
      // console.log(`${key}被修改了：${val}=>${newVal}`)
      val = newVal
      dep.notify() // 在setter中通知依赖更新，调用dep实例的notify()方法
    },
  })
}

let car = new Observer({
  brand: 'BMW',
  price: 3000,
  child: {
    user: 'Tom',
  },
}).value
car.price
car.price = 5000
// car.child.user = 'Mark'
// console.log(car)
