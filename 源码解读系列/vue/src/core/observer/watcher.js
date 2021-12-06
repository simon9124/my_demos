/* @flow */

import { parsePath } from '../util/lang.js' // 把一个形如'data.a.b.c'的字符串路径所表示的值，从真实的data对象中取出来
import { traverse } from './traverse.js' // 深度监听
import { pushTarget, popTarget } from './dep.js' // 添加依赖 & 释放依赖

let uid = 0

/**
 * Watcher类：变化侦测
 * 当数据发生变化时，通知Watcher实例，由Watcher实例去做真实的更新操作
 * @param { Component } vm 要监测的对象
 * @param { String } expOrFn 字符串路径，形如'data.a.b.c'
 * @param { Function } cb 回调函数
 * @param { Object } options 配置项
 */
export default class Watcher {
  constructor(vm, expOrFn, cb, options) {
    // console.log(vm) // 要监测的对象
    this.vm = vm
    if (options) {
      this.deep = !!options.deep // 是否深度监听
      this.user = !!options.user
      this.lazy = !!options.lazy // 是否懒执行
      this.sync = !!options.sync // 是否同步更新数据
      this.before = options.before
    } else {
      this.deep = this.user = this.lazy = this.sync = false
    }
    console.log('深度监听：', this.deep)
    this.cb = cb // 回调方法
    this.getter = parsePath(expOrFn) // 在parsePath方法中触发数据的getter，详见parsePath方法源码
    // this.expOrFn = expOrFn
    this.value = this.get() // 实例化Watcher类时，在构造函数中调用this.get()方法
    this.id = ++uid // 唯一id，确保相同的Watcher实例只被添加1次
  }
  get() {
    pushTarget(this) // 将Watcher实例赋给全局的唯一对象Dep的target属性（将Watcher添加到依赖中）
    const vm = this.vm
    // 将this.getter利用call绑定到vm，并调用this.getter()即parsePath(expOrFn)，参数为vm → 相当于parsePath(this.expOrFn)(vm)
    // let value = parsePath(this.expOrFn)(vm)
    // let value = this.getter(vm)
    let value = this.getter.call(vm, vm) // 获取被依赖的数据 → 触发该数据的getter → 触发dep.depend()，将Dep.target（Watcher）添加到依赖数组中
    // console.log(value)
    if (this.deep) traverse(value) // 深度监听
    popTarget() // 释放（Dep.target置为null）
    return value
  }
  // 更新依赖：从Dep类中调用notify()来通知
  update() {
    const oldValue = this.value
    this.value = this.get() // 获取监听到的变化后的值
    // 将this.cb利用call绑定到this.vm，并调用this.cb()即回调函数
    this.cb.call(this.vm, this.value, oldValue) // 调用数据变化的回调函数，从而更新视图
  }
}
