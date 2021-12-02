/* @flow */

// import { _Set as Set, isObject } from '../util/index'
// import type { SimpleSet } from '../util/index'
// import VNode from '../vdom/vnode'

const seenObjects = new Set()

/**
 * Recursively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 * 深度监听，递归对象或数组，触发其所有嵌套的属性的getter
 */
export function traverse(val) {
  _traverse(val, seenObjects)
  seenObjects.clear()
}

function _traverse(val, seen) {
  // console.log(val)
  let i, keys
  const isA = Array.isArray(val)
  // if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
  //   return
  // }
  // if (val.__ob__) {
  //   const depId = val.__ob__.dep.id
  //   if (seen.has(depId)) {
  //     return
  //   }
  //   seen.add(depId)
  // }
  if (isA) {
    // val是数组
    i = val.length
    while (i--) _traverse(val[i], seen)
  } else {
    // val不是数组
    keys = Object.keys(val)
    // console.log(keys)
    i = keys.length
    while (i--) _traverse(val[keys[i]], seen) // 在这里触发数据的getter
  }
}
