/* https://zhuanlan.zhihu.com/p/94398691 */

// 例1

var salesOffices = {} // 定义售楼处
salesOffices.clientList = [] // 缓存列表，存放订阅者的回调函数,也就是花名册

// 增加订阅者
salesOffices.listen = function (fn) {
  this.clientList.push(fn) // 订阅的消息添加进缓存列表，也就是把一个买房的放进花名册里面
}

// 发布消息
salesOffices.trigger = function () {
  // 依次查看花名册里面的人，看他们需要什么样的房
  for (var i = 0; i < this.clientList.length; i++) {
    // 然后发短信告诉他们
    this.clientList[i].apply(this, arguments) // arguments 是发布消息时带上的参数（需指定方法中的this为salesOffices对象）
  }
}

// 小明订阅消息即小明有一个这样买房的需求，我就把它添加到花名册里面去（没有买房具体要求，任何消息都会告知小明）
salesOffices.listen(function (price, squareMeter) {
  console.log(`价格= ${price}`)
  console.log(`squareMeter= ${squareMeter}`)
})

// 售楼处发布了一个消息，有一个88平米，售价200万的房
// salesOffices.trigger(2000000, 88) // '价格 = 2000000 squareMeter = 88'

// 售楼处发布了一个消息，有一个110平米，售价300万的房
// salesOffices.trigger(3000000, 110) // '价格 = 3000000 squareMeter = 110'

// 例2

var salesOffices = {} // 定义售楼处
salesOffices.clientList = {} // 缓存列表，存放订阅者的回调函数

// 增加订阅者
salesOffices.listen = function (key, fn) {
  if (!this.clientList[key]) {
    this.clientList[key] = [] // 如果还没有订阅过此类消息，给该类消息创建一个缓存列表
  }
  this.clientList[key].push(fn) // 订阅的消息添加进消息缓存列表
}

// 发布消息
salesOffices.trigger = function () {
  var key = Array.prototype.shift.call(arguments) // 取出消息类型
  // console.log(key) // 'squareMeter88' 'squareMeter110'
  var fns = this.clientList[key] // 取出该消息对应的回调函数集合
  if (!fns || fns.length === 0) {
    return false // 如果没有订阅该消息，则返回
  }
  for (var i = 0, fn; (fn = fns[i++]); ) {
    fn.apply(this, arguments) // arguments是发布消息时附送的参数
  }
}
// 小明订阅88平方米房子的消息
salesOffices.listen('squareMeter88', function (price) {
  console.log(`价格= ${price}`) // '价格= 2000000'
})

// console.log(salesOffices.clientList) // { squareMeter88 : [f] }，仅订阅了88平方米的房子价格
// salesOffices.trigger('squareMeter88', 2000000) // '价格= 2000000'，发布88平方米房子的价格,小明能收到
// salesOffices.trigger('squareMeter110', 3000000) // 发布110平方米房子的价格，小明收不到

/* https://www.jianshu.com/p/dacdc40d984a */

class PubSub {
  constructor() {
    // 保存监听事件
    this.event = {}
  }

  // 订阅
  subscribe(eventName, fun) {
    try {
      if (!this.event.hasOwnProperty(eventName)) {
        this.event[eventName] = []
      }
      if (typeof fun === 'function') {
        this.event[eventName].push(fun)
      } else {
        throw new Error(`请给${eventName}事件添加回调方法`)
      }
    } catch (error) {
      console.warn(error)
    }
  }

  // 发布
  publish(eventName, arg) {
    try {
      if (this.event.hasOwnProperty(eventName)) {
        this.event[eventName].map((item) => {
          item.call(null, arg)
        })
      } else {
        throw new Error(`${eventName}事件未被注册`)
      }
    } catch (error) {
      console.warn(error)
    }
  }

  // 移除订阅
  unSubscribe(eventName, fun, arg) {
    try {
      if (this.event.hasOwnProperty(eventName)) {
        this.event[eventName].map((item, index) => {
          if (item == fun) {
            this.event[eventName].splice(index, 1)
            item.call(null, arg)
          }
        })
      }
    } catch (error) {
      console.warn(error)
    }
  }
}

// 实例化
const util = new PubSub()

function notice(params) {
  console.log(params)
}

// 订阅事件
util.subscribe('notice', notice) // 订阅主题为notice，并将notice回调方法进行注册

console.log(util.event) // { notice: [ƒ] }，已将notice回调方法注册到notice主题

// 发布事件
util.publish('notice', '订阅成功') // '订阅成功'
// util.publish('event', '订阅成功') // 'Error: event事件未被注册'，未注册event事件

// 移除订阅
setTimeout(() => {
  util.unSubscribe('notice', notice, '已取消订阅') // '已取消订阅'
  util.unSubscribe('event', notice, '已取消订阅') // 不打印，因为event事件未被注册
}, 3000)
