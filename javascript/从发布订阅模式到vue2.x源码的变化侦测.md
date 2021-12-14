- 发布/订阅模式是前端设计模式的核心之一，在`vue2.x`的源码中举足轻重，本文就从该模式入手，层层递进，看看`vue2.x`的源码是怎样进行数据变化侦测的

## Object.defineProperty

- 通过`Object.defineProperty`为属性**设置访问器属性**，可以在对象**获取属性**或**属性变化**时做监测

```js
let person = { name: 'Nicholas' }
let name = person.name
Object.defineProperty(person, 'name', {
  enumerable: true,
  configurable: true,
  get() {
    console.log('name被读取了')
    return name
  },
  set(newVal) {
    if (name === newVal) {
      return
    }
    console.log('name被修改了')
    name = newVal
  },
})

person.name // 'name被读取了'
person.name = 'Greg' // 'name被修改了'
console.log(person) // { name: "Greg" }
```

## Observer 类（发布者：监测数据变化）

```js
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

  // 原型方法walk：循环该对象的key，针对每个key执行defineReactive()方法 → 让对象变得可观测（因此要求vue的data必须是一个对象）
  walk(obj) {
    const keys = Object.keys(obj)
    for (let i = 0; i < keys.length; i++) {
      defineReactive(obj, keys[i])
    }
  }
}

function defineReactive(obj, key, val) {
  if (arguments.length === 2) {
    // 如果只传了obj和key，那么val = obj[key]
    val = obj[key]
  }
  if (typeof val === 'object') {
    new Observer(val) // 若val仍是对象，则递归
  }

  /* 访问器属性 */
  Object.defineProperty(obj, key, {
    enumerable: true,
    configurable: true,
    /* get:读取属性时调用的函数 */
    get() {
      console.log(`${key}被读取了`)
      return val
    },
    /* set:写入属性时调用的函数 */
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
    },
  })
}

let car = new Observer({
  brand: 'BMW',
  price: 3000,
  child: {
    count: 100,
  },
}).value

car.price // 'price被读取了'
car.price = 5000 // 'price被修改了：3000=>5000'
car.child.count = 101
// 'child被读取了'
// 'count被修改了：100=>101'
```

- 给**被监测对象**的**全部属性**都设置访问器属性
- 属性（子属性）被访问或修改时，触发该属性的`getter`或`setter`方法

## Dep 类（调度中心：收集依赖）

- `Dep`类作为中转站

## Watcher 类（订阅者：订阅某属性）
