let oldList = [
  { key: "0", tagName: "li", props: {} },
  { key: "1", tagName: "li", props: {} },
  { key: "2", tagName: "li", props: {} },
  { key: "3", tagName: "li", props: {} },
  { key: "4", tagName: "li", props: {} },
  { tagName: "div", props: { id: "dom-id" } },
];
let newList = [
  { key: "2", tagName: "li", props: {} },
  { key: "0", tagName: "li", props: {} },
  { key: "1", tagName: "li", props: {} },
  { key: "4", tagName: "li", props: {} },
  { key: "5", tagName: "li", props: {} },
  { tagName: "div", props: { class: "dom-class" } },
];

/**
 * 将列表以 key-item （key-key在列表中的index）形式返回
 * @param {Array} list
 * @param {String|Function} key
 */
function makeKeyIndexAndFree(list, key) {
  let keyIndex = {}; // 要使用算法的obj
  let free = []; // 无法使用算法的列表
  for (let i = 0, len = list.length; i < len; i++) {
    let item = list[i];
    let itemKey = getItemKey(item, key);
    // console.log(itemKey);
    if (itemKey) {
      keyIndex[itemKey] = i;
    } else {
      free.push(item);
    }
  }
  return {
    keyIndex: keyIndex,
    free: free,
  };
}

// 获取该key在列表每项中的value
function getItemKey(item, key) {
  if (!item || !key) return void 666; // return undefined
  return typeof key === "string" ? item[key] : key(item); // 源码中也没有引入key()方法，保证传入的key始终是字符串即可
}

let key = "key";
let oldMap = makeKeyIndexAndFree(oldList, key);
let newMap = makeKeyIndexAndFree(newList, key);

console.log(oldMap, newMap);
/* 
{
  keyIndex: { '0': 0, '1': 1, '2': 2, '3': 3, '4': 4 },
  free: [ { tagName: 'div', props: ... } ]
} {
  keyIndex: { '0': 1, '1': 2, '2': 0, '4': 3, '5': 4 },
  free: [ { tagName: 'div', props: ... } ]
}
*/
