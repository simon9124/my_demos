const promiseStatusSymbol = Symbol('PromiseStatus')
const promiseValueSymbol = Symbol('PromiseValue')
const STATUS = {
  PENDING: 'PENDING',
  FULFILLED: 'FULFILLED',
  REJECTED: 'REJECTED',
}

const transition = function (status) {
  return (value) => {
    this[promiseValueSymbol] = value
    setStatus.call(this, status)
  }
}
/**
 * 对于状态的改变进行控制，类似于存取器的效果。
 * 如果状态从 PENDING --> FULFILLED，则调用链式的下一个onFulfilled函数
 * 如果状态从 PENDING --> REJECTED， 则调用链式的下一个onRejected函数
 *
 * @returns void
 */
const setStatus = function (status) {
  this[promiseStatusSymbol] = status
  if (status === STATUS.FULFILLED) {
    this.deps.resolver && this.deps.resolver()
  } else if (status === STATUS.REJECTED) {
    this.deps.rejecter && this.deps.rejecter()
  }
}

/* Promise构造函数 */
const FPromise = function (resolver) {
  if (typeof resolver !== 'function') {
    throw new TypeError('parameter 1 must be a function')
  }
  this[promiseStatusSymbol] = STATUS.PENDING
  this[promiseValueSymbol] = []
  this.deps = {}
  resolver(
    // 这里返回两个函数，这两个函数也就是resolver和reject。
    // 这两个函数会分别对于当前Promise的状态和值进行修改
    transition.call(this, STATUS.FULFILLED),
    transition.call(this, STATUS.REJECTED)
  )
}

const callback = function () {
  const resolveValue = onFulfilled(self[promiseValueSymbol])
  // 这里是对于当返回值是一个thenable对象的时候，
  // 需要对其进行特殊处理，直接调用它的then方法来
  // 获取一个返回值
  if (resolveValue && typeof resolveValue.then === 'function') {
    // 这里调用了resolve之后，也就是将这个内嵌的Promise
    // 得到的值绑定到当前Promise的依赖中，其实和下面的
    // unthenable的情况是一致的
    resolveValue.then(
      function (data) {
        resolve(data)
      },
      function (err) {
        reject(err)
      }
    )
  } else {
    // 注意，这里是then方法进行链式调用的连接点
    // 当初始化状态或者上一次Promise的状态发生改变的时候
    // 这里会通过调用当前Promise成功的方法，来进行当前Promise的状态改变
    // 以及调用链式的下个Promise的回调
    resolve(resolveValue)
  }
}
