/* @flow */

/**
 * Dep类：依赖管理器
 * 用于存储收集到的依赖
 */
export default class Dep {
  constructor() {
    this.subs = [] // 依赖数组
  }

  addSub(sub) {
    this.subs.push(sub)
  }
  // 删除一个依赖
  removeSub(sub) {
    remove(this.subs, sub)
  }
  // 添加一个依赖
  depend() {
    // window.target是一个依赖对象（vscode是node运行环境，无法识别全局对象window，这里将window改为global）
    // if (window.target) {
    //   this.addSub(window.target)
    // }
    if (global.target) {
      this.addSub(global.target)
    }
  }
  // 通知所有依赖更新
  notify() {
    const subs = this.subs.slice()
    // 遍历所有依赖（即watcher实例）
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update() // 执行依赖的update()方法（Watch类中的update()方法）
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
