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
  { tagName: "p", props: { class: "dom-class" } },
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

/**
 * 核心方法：新旧列表数据处理后做比对+进行操作，并记录需要的完整操作
 * @param {Array} oldList
 * @param {Array} newList
 * @return {Object} - {moves: <Array>}
 *                  - 从oldList变化到newList，需要的完整操作
 */
function listDiff(oldList, newList, key) {
  let oldMap = makeKeyIndexAndFree(oldList, key);
  /* 
  {
    keyIndex: { '0': 0, '1': 1, '2': 2, '3': 3, '4': 4 },
    free: [ { tagName: 'div', props: ... } ]
  }
  */
  let newMap = makeKeyIndexAndFree(newList, key);
  /* 
  {
    keyIndex: { '0': 1, '1': 2, '2': 0, '4': 3, '5': 4 },
    free: [ { tagName: 'p', props: ... } ]
  }
  */

  let newFree = newMap.free;
  let oldKeyIndex = oldMap.keyIndex;
  let newKeyIndex = newMap.keyIndex;
  let moves = []; // 需要操作的步骤

  /* 1.获取simulateList：要操作的列表 */
  let children = [];
  let i = 0;
  let item;
  let itemKey;
  let freeIndex = 0;

  while (i < oldList.length) {
    item = oldList[i];
    itemKey = getItemKey(item, key);
    // console.log(itemKey); // 0 1 2 3 4 undefined
    if (itemKey) {
      // oldList中包含传入key的项
      if (!newKeyIndex.hasOwnProperty(itemKey)) {
        // 新对象里没有旧对象的key：push null
        children.push(null);
      } else {
        // 新对象里有旧对象的key
        let newItemIndex = newKeyIndex[itemKey]; // 获取该key在新对象中的value（即在新列表的index）
        // console.log(itemKey, newItemIndex);
        children.push(newList[newItemIndex]);
      }
    } else {
      // oldList中不包含传入key的项：直接追加newList中不包含传入key的项
      let freeItem = newFree[freeIndex++]; // { tagName: 'p', props: { class: 'dom-class' } }
      children.push(freeItem || null);
    }
    i++;
  }
  // console.log(children);
  /* 
  [
    { key: '0', tagName: 'li', props: {} },
    { key: '1', tagName: 'li', props: {} },
    { key: '2', tagName: 'li', props: {} },
    null,
    { key: '4', tagName: 'li', props: {} },
    { tagName: 'p', props: { class: 'dom-class' } }
  ]
  */

  let simulateList = children.slice(0); // 同children

  i = 0;
  while (i < simulateList.length) {
    if (simulateList[i] === null) {
      remove(i); // 加入操作数组（要删除）
      removeSimulate(i); // 从 simulateList 中移除
    } else {
      i++;
    }
  }

  // console.log(simulateList);
  /* 
  [
    { key: '0', tagName: 'li', props: {} },
    { key: '1', tagName: 'li', props: {} },
    { key: '2', tagName: 'li', props: {} },
    { key: '4', tagName: 'li', props: {} },
    { tagName: 'p', props: { class: 'dom-class' } }
  ]，已将null删除
  */

  /* 2.比对newList和simulateList，进行相关操作 */
  let j = (i = 0);
  while (i < newList.length) {
    item = newList[i];
    itemKey = getItemKey(item, key);
    // console.log(itemKey); // 2 0 1 4 5 undefined

    let simulateItem = simulateList[j];
    let simulateItemKey = getItemKey(simulateItem, key);
    // console.log(simulateItemKey);

    if (simulateItem) {
      if (itemKey === simulateItemKey && itemKey) {
        // 新旧集合中 key-value 相等，而且位置相同：不做任何操作
        // 或者是(undefined === undefined)新旧集合中都没有设置 key
        // 此处源码没有&&itemKey，会自动忽略二者都是undefined的情况，导致没有将newList的该项追加到moves中
        // 此处与vue源码加以区分：单独使用时需追加&&itemKey，而在vue源码中已经在前一步进行过属性比较了，无需考虑二者均为undefined的情况
        j++; // 跳过此项，newList的下一项与simulateList的下一项继续做比对
      } else {
        if (!oldKeyIndex.hasOwnProperty(itemKey)) {
          // 旧集合中没有该key
          insert(i, item); // 加入操作数组（要新增）
        } else {
          // 旧集合中有该key：newList当前项与simulateList下一项做比对
          let nextItemKey = getItemKey(simulateList[j + 1], key);
          if (nextItemKey === itemKey) {
            // 与simulateList下一项的key-value相等
            remove(i); // 把当前项加入操作数组（要删除）
            removeSimulate(j); // 把当前项从simulateList中移除
            // console.log(simulateList);
            j++; // newList下一项与simulateList下一项继续做比对
          } else {
            // 与simulateList下一项的key-value不等
            insert(i, item); // 加入操作数组（要新增）
          }
        }
      }
    } else {
      // simulateList被删除后，长度已不足newList（或原本的oldList为空，而newList不为空）
      insert(i, item); // 将剩余item（依次）加入操作数组（要新增）
    }
    i++;
  }

  // console.log(simulateList, i, j); // 6 4

  /* 3.移除simulateList中多余的元素 */
  let k = simulateList.length - j; // simulateList未循环元素的个数
  while (j++ < simulateList.length) {
    /* 循环未在simulateList中循环的元素，核心是计算要删除元素的下标：
      1.未循环的元素一定在simulateList的最后几位
      2.删除的是经过增/减项后的新数组的元素，而不是在simulateList里直接删除，因此需要结合newList的长度一并计算
    */
    k--;
    remove(k + i); // 加入操作数组（要删除）
  }

  function remove(index) {
    let move = { index: index, type: 0 }; // type为0是删除
    moves.push(move);
  }

  function insert(index, item) {
    let move = { index: index, item: item, type: 1 }; // type为1是新增
    moves.push(move);
  }

  function removeSimulate(index) {
    simulateList.splice(index, 1);
  }

  console.log(children, moves);
  /* 
  [
    { key: '0', tagName: 'li', props: {} },
    { key: '1', tagName: 'li', props: {} },
    { key: '2', tagName: 'li', props: {} },
    null,
    { key: '4', tagName: 'li', props: {} },
    { tagName: 'p', props: { class: 'dom-class' } }
  ] // children
  [
    { index: 3, type: 0 },
    { index: 0, item: { key: '2', tagName: 'li', props: {} }, type: 1 },
    { index: 3, type: 0 },
    { index: 4, item: { key: '5', tagName: 'li', props: {} }, type: 1 },
    { index: 5, item: { tagName: 'p', props: [Object] }, type: 1 },
    { index: 6, type: 0 }
  ] // moves
  */

  return {
    moves: moves,
    children: children,
  };
}

let key = "key";
listDiff(oldList, newList, key);
