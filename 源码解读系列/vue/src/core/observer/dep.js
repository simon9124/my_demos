/* @flow */

let uid = 0

/**
 * Dep类：依赖管理器
 * 用于存储收集到的依赖
 */
export default class Dep {
  constructor() {
    this.id = uid++
    this.subs = [] // 依赖数组
  }

  addSub(sub) {
    this.subs.push(sub)
    console.log('向依赖中添加Watcher实例：subs', this.subs)
  }
  // 删除一个依赖
  removeSub(sub) {
    remove(this.subs, sub)
  }
  // 添加一个依赖
  depend() {
    if (Dep.target) {
      Dep.target.addDep(this) // Dep.target即Watcher实例 -> 调用Watcher实例的addDep方法，参数为Dep实例
    }
  }
  // 通知所有依赖更新
  notify() {
    console.log('依赖更新：subs', this.subs)
    const subs = this.subs.slice()
    // 遍历所有依赖（即Watcher实例）
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update() // 执行依赖的update()方法（Watcher类中的update()方法）
    }
  }
}

/**
 * Remove an item from an array
 */
export function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

// The current target watcher being evaluated.
// This is globally unique because only one watcher
// can be evaluated at a time.
Dep.target = null // 在Dep类上定义target属性

/**
 * 添加依赖
 * @param { Watcher } _target Watcher实例
 */
export function pushTarget(_target) {
  Dep.target = _target // 将Watcher实例赋给全局的唯一对象Dep的target属性（将Watcher添加到依赖中）
}

/**
 * 释放依赖
 */
export function popTarget() {
  Dep.target = undefined // 释放
}
