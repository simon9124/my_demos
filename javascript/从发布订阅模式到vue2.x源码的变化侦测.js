// Observer类：把Object数据中的所有属性（包括子属性）都转换成getter/seter的形式来侦测变化
class Observer {
  constructor(value) {
    this.value = value
    if (Array.isArray(value)) {
      // value为数组
    } else {
      // value不为数组
      this.walk(value)
    }
  }

  // 原型方法walk：循环该对象的key，针对每个key执行defineReactive()方法 → 让对象变得可观测（因此要求vue的data必须返回一个对象）
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
}

// 使一个对象转化成可观测对象
function defineReactive(obj, key, val) {
  const dep = new Dep() // 实例化一个依赖管理器，用来收集对象的依赖（让data的每个属性都注册一个dep对象）
  if (arguments.length === 2) {
    val = obj[key]
  }
  if (typeof val === 'object') {
    new Observer(val)
  }
  /* 访问器属性 */
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    get() {
      console.log(`${key}被读取了`)
      dep.depend() // 调用Dep实例的depend()方法（收集对象依赖）
      return val
    },
    set(newVal) {
      if (val === newVal) {
        return
      }
      console.log(
        `${key}被修改了：${
          typeof val === 'string' ? val : JSON.stringify(val)
        }=>${typeof newVal === 'string' ? newVal : JSON.stringify(newVal)}`
      )
      val = newVal
      dep.notify() // 调用dep实例的notify()方法（通知对象依赖更新）
    },
  })
}

let uid = 0

// Dep类：依赖管理器，用于存储收集到的依赖
class Dep {
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

// 删除一个依赖
function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

// Watcher类：当数据发生变化时，通知Watcher实例，由Watcher实例去做真实的更新操作
class Watcher {
  constructor(vm, expOrFn, cb) {
    this.vm = vm // 要监测的对象
    this.cb = cb // 回调方法
    this.depIds = new Set() // 依赖id集合 - 缓存
    this.getter = parsePath(expOrFn) // 在parsePath方法中触发数据的getter，详见parsePath方法源码
    this.value = this.get() // 实例化Watcher类时，在构造函数中调用this.get()方法
  }
  get() {
    Dep.target = this // 将Watcher实例赋给全局的唯一对象Dep的target属性（将Watcher注册到依赖中）
    const vm = this.vm
    let value = this.getter.call(vm, vm) // 获取被依赖的数据 → 触发该数据的getter → 触发dep.depend()，将Dep.target（Watcher）添加到依赖数组中
    // console.log(value)
    Dep.target = undefined // 将Watcher从依赖中释放
    return value
  }

  /* 添加依赖 */
  addDep(dep) {
    const id = dep.id
    // 避免重复添加
    if (!this.depIds.has(id)) {
      dep.addSub(this)
      this.depIds.add(id)
    }
  }

  // 更新依赖：从Dep类中调用notify()来通知
  update() {
    const oldValue = this.value
    this.value = this.get() // 获取监听到的变化后的值
    // 将this.cb利用call绑定到this.vm，并调用this.cb()即回调函数
    this.cb.call(this.vm, this.value, oldValue) // 调用数据变化的回调函数，从而更新视图
  }
}

const unicodeRegExp =
  /a-zA-Z\u00B7\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u037D\u037F-\u1FFF\u200C-\u200D\u203F-\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD/
const bailRE = new RegExp(`[^${unicodeRegExp.source}.$_\\d]`)

// 把一个形如'data.a.b.c'的字符串路径所表示的值，从真实的data对象中取出来
// data = {a:{b:{c:2}}}  parsePath('a.b.c')(data)===2
function parsePath(path) {
  if (bailRE.test(path)) {
    return
  }
  const segments = path.split('.')
  return function (obj) {
    for (let i = 0; i < segments.length; i++) {
      if (!obj) return
      obj = obj[segments[i]] // 在这里触发数据的getter
    }
    return obj
  }
}

let data = {
  brand: 'BMW',
  price: 3000,
  child: {
    count: 100,
  },
}
let observer = new Observer(data)

new Watcher(data, 'price', function (newVal, oldVal) {
  console.log(`price被修改了：${oldVal}=>${newVal}`)
})
// price被读取了（Observer中触发）
// 向依赖中添加Watcher实例：subs [Watcher]（Dep中触发）

data.price++
// price被读取了（Observer中触发）
// price被修改了：3000=>3001（Observer中触发）
// 依赖更新：subs [Watcher]（Dep中触发）
// price被读取了（Observer中触发）
// price被修改了：3000=>3001（Watcher中触发）
