/* @flow */

/**
 * Watcher类：变化侦测
 * 当数据发生变化时，通知Watcher实例，由Watcher实例去做真实的更新操作
 */
export default class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm
    this.cb = cb
    this.getter = parsePath(expOrFn)
    this.value = this.get() // 在构造函数中调用this.get()方法
  }
  get() {
    // window.target = this
    global.target = this // 将实例本身赋给全局的一个唯一对象（将Watch添加到依赖中）
    const vm = this.vm
    let value = this.getter.call(vm, vm) // 将this的getter方法利用call绑定到vm，参数为vm，并调用this.getter() -→ 获取被依赖的数据
    window.target = undefined // 释放
    return value
  }
  update() {
    const oldValue = this.value
    this.value = this.get()
    this.cb.call(this.vm, this.value, oldValue) // 更新视图/调用回调
  }
}

/**
 * Parse simple path.
 * 把一个形如'data.a.b.c'的字符串路径所表示的值，从真实的data对象中取出来
 * 例如：
 * data = {a:{b:{c:2}}}
 * parsePath('a.b.c')(data)  // 2
 */
const bailRE = /[^\w.$]/
export function parsePath(path) {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]]
    }
    return obj
  }
}
