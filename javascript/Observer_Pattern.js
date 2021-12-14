/* 观察者模式 */

/* https://www.jianshu.com/p/ccd893c84424 */
// 主题，接收状态变化，触发每个观察者
class Subject {
  constructor() {
    this.state = 0 // 状态
    this.observers = [] // 观察者（依赖）
  }
  // 获取状态
  getState() {
    return this.state
  }
  // 设置状态
  setState(state) {
    this.state = state
    this.notifyAllObservers() // 通知观察者
  }
  // 收集观察者
  attach(observer) {
    this.observers.push(observer)
  }
  // 通知观察者
  notifyAllObservers() {
    this.observers.forEach((observer) => {
      observer.update() // 通知每个观察者，触发其更新方法
    })
  }
}

// 观察者，等待被触发
class Observer {
  constructor(name, subject) {
    this.name = name
    this.subject = subject
    this.subject.attach(this) // 收集该观察者
  }
  // 该观察者的更新方法，主题设置状态时被通知
  update() {
    console.log(`${this.name} update, state: ${this.subject.getState()}`)
  }
}

// 测试代码
let subject = new Subject()
let observer1 = new Observer('observer1', subject)
let observer2 = new Observer('observer2', subject)
let observer3 = new Observer('observer3', subject)

subject.setState(1)
// observer1 update, state: 1
// observer2 update, state: 1
// observer3 update, state: 1

/* https://www.cnblogs.com/LuckyWinty/p/5796190.html
[附加题] 请实现下面的自定义事件 Event 对象的接口，功能见注释(测试1)
该 Event 对象的接口需要能被其他对象拓展复用(测试2) */
var Event = {
  // 通过on接口监听事件eventName
  // 如果事件eventName被触发，则执行callback回调函数
  on: function (eventName, callback) {
    //你的代码
    if (!this.tests) {
      // this.tests = {}
      Object.defineProperty(this, 'tests', {
        value: {},
        enumerable: false,
        configurable: true,
        writable: true,
      })
    }
    !this.tests[eventName] && (this.tests[eventName] = [])
    this.tests[eventName].push(callback)
  },
  // 触发事件 eventName
  emit: function (eventName) {
    //你的代码
    if (this.tests[eventName]) {
      for (var i = 0; i < this.tests[arguments[0]].length; i++) {
        this.tests[arguments[0]][i](arguments[1])
      }
    }
  },
}

// 测试1
Event.on('test', function (result) {
  console.log(result)
})
Event.on('test', function () {
  console.log('test')
})
Event.emit('test', 'hello world') // 输出 'hello world' 和 'test'

// 测试2
var person1 = {}
var person2 = {}
Object.assign(person1, Event)
Object.assign(person2, Event)
// console.log(person1) // Object.assign是浅复制，将源对象所有可枚举属性都复制到目标对象上，因为需设置源对象的属性为不可枚举
// console.log(person2)
person1.on('call1', function () {
  console.log('person1')
})
person2.on('call2', function () {
  console.log('person2')
})
person1.emit('call1') // 输出 'person1'
person1.emit('call2') // 没有输出
person2.emit('call1') // 没有输出
person2.emit('call2') // 输出 'person2'

/* https://segmentfault.com/a/1190000018706349，观察者模式vs发布订阅模式 */

/* 观察者模式 */

// 猎人类
function Hunter(name, level) {
  this.name = name // 姓名
  this.level = level // 级别
  this.list = [] // 订阅列表，记录谁订阅了自己
}
// 发布任务
Hunter.prototype.publish = function (money) {
  console.log(this.level + '猎人' + this.name + '寻求帮助')
  this.list.forEach(function (item, index) {
    item(money) // 通知每个订阅者
  })
}
// 订阅任务
Hunter.prototype.subscribe = function (targrt, fn) {
  console.log(this.level + '猎人' + this.name + '订阅了' + targrt.name)
  targrt.list.push(fn) // 订阅者的fn回调方法，push到目标订阅者的list订阅列表中
}

// 猎人工会走来了几个猎人
let hunterMing = new Hunter('小明', '黄金')
let hunterJin = new Hunter('小金', '白银')
let hunterZhang = new Hunter('小张', '黄金')
let hunterPeter = new Hunter('Peter', '青铜')

hunterMing.subscribe(hunterPeter, function (money) {
  console.log('小明表示：' + (money > 200 ? '' : '暂时很忙，不能') + '给予帮助')
})
// 黄金猎人小明订阅了Peter

hunterJin.subscribe(hunterPeter, function () {
  console.log('小金表示：给予帮助')
})
// 白银猎人小金订阅了Peter

hunterZhang.subscribe(hunterPeter, function () {
  console.log('小张表示：给予帮助')
})
// 黄金猎人小张订阅了Peter

hunterPeter.publish(198) // 青铜猎人Peter寻求帮助

// 小明表示：暂时很忙，不能给予帮助
// 小金表示：给予帮助
// 小张表示：给予帮助

/* 发布订阅模式 */

// 定义一家猎人工会
let HunterUnion = {
  type: 'hunt',
  // 发布大厅
  topics: Object.create(null),
  // 订阅任务
  subscribe: function (topic, fn) {
    if (!this.topics[topic]) {
      // 若无该主题，则创建该主题
      this.topics[topic] = []
    }
    this.topics[topic].push(fn)
  },
  // 发布任务
  publish: function (topic, money) {
    if (!this.topics[topic]) return // 若无该主题，则返回undefined
    for (let fn of this.topics[topic]) {
      fn(money) // 若有该主题，则调用主题中的每个方法
    }
  },
}

// 定义一个猎人类
function Hunter2(name, level) {
  this.name = name // 姓名
  this.level = level // 级别
}
// 猎人在猎人工会订阅任务
Hunter2.prototype.subscribe = function (topic, fn) {
  console.log(this.level + '猎人' + this.name + '订阅了狩猎' + topic + '的任务')
  HunterUnion.subscribe(topic, fn) // 猎人工会订阅任务
}
// 猎人在猎人工会发布任务
Hunter2.prototype.publish = function (topic, money) {
  console.log(this.level + '猎人' + this.name + '发布了狩猎' + topic + '的任务')
  HunterUnion.publish(topic, money) // 猎人工会发布任务
}

// 猎人工会走来了几个猎人
let hunterMing2 = new Hunter2('小明', '黄金')
let hunterJin2 = new Hunter2('小金', '白银')
let hunterZhang2 = new Hunter2('小张', '黄金')
let hunterPeter2 = new Hunter2('Peter', '青铜')

hunterMing2.subscribe('tiger', function (money) {
  console.log('小明表示：' + (money > 200 ? '' : '不') + '接取任务')
})
// 黄金猎人小明订阅了狩猎tiger的任务

hunterJin2.subscribe('tiger', function (money) {
  console.log('小金表示：接取任务')
})
// 白银猎人小金订阅了狩猎tiger的任务

hunterZhang2.subscribe('tiger', function (money) {
  console.log('小张表示：接取任务')
})
// 黄金猎人小张订阅了狩猎tiger的任务

hunterPeter2.publish('tiger', 198) // 青铜猎人Peter发布了狩猎tiger的任务

// 小明表示：不接取任务
// 小金表示：接取任务
// 小张表示：接取任务
