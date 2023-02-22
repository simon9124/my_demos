
/**
 * 
 * @param {Array} oldList   原始列表
 * @param {Array} newList   新列表 
 * @param {String} key 键名称
 * @return {Object} {children: [], moves: [] }
 * children 是源列表 根据 新列表返回 移动的新数据，比如 oldList = [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}];
 newList = [{id: 2}, {id: 3}, {id: 1}]; 最后返回的children = [
  {id: 1},
  {id: 2},
  {id: 3},
  null,
  null,
  null
 ]
 moves 是源列表oldList 根据新列表newList 返回的操作，children为null的话，依次删除掉掉，因此返回的是
 moves = [
  {type: 0, index:3},
  {type: 0, index: 3},
  {type: 0, index: 3},
  {type: 0, index: 0},
  {type: 1, index: 2, item: {id: 1}}
 ]
 注意：type = 0 是删除操作， type = 1 是新增操作
*/
function diff(oldList, newList, key) {
  var oldMap = makeKeyIndexAndFree(oldList, key);
  var newMap = makeKeyIndexAndFree(newList, key);
  var newFree = newMap.free;

  var oldKeyIndex = oldMap.keyIndex;
  var newKeyIndex = newMap.keyIndex;

  var moves = [];
  var children = [];
  var i = 0;
  var freeIndex = 0;
  var item;
  var itemKey;

  while(i < oldList.length) {
    item = oldList[i];
    itemKey = getItemKey(item, key);
    if(itemKey) {
      if(!newKeyIndex.hasOwnProperty(itemKey)) {
        children.push(null);
      } else {
        var newItemIndex = newKeyIndex[itemKey];
        children.push(newList[newItemIndex]);
      }
    } else {
      var freeItem = newFree[freeIndex++];
      children.push(freeItem || null);
    }
    i++;
  }
  // 删除不存在的项
  var simulateList = children.slice(0);
  i = 0;
  while (i < simulateList.length) {
    if (simulateList[i] === null) {
      remove(i);
      // 调用该方法执行删除
      removeSimulate(i);
    } else {
      i++;
    }
  }

  // 
  var j = i = 0;
  while (i < newList.length) {
    item = newList[i];
    itemKey = getItemKey(item, key);

    var simulateItem = simulateList[j];
    var simulateItemKey = getItemKey(simulateItem, key);
    if (simulateItem) {
      if (itemKey === simulateItemKey) {
        j++;
      } else {
        // 新的一项，插入
        if (!oldKeyIndex.hasOwnProperty(itemKey)) {
          insert(i, item);
        } else {
          var nextItemKey = getItemKey(simulateList[j + 1], key);
          if (nextItemKey === itemKey) {
            remove(i);
            removeSimulate(j);
            j++;
          } else {
            insert(i, item);
          }
        }
      }
    } else {
      insert(i, item);
    }
    i++;
  }

  function remove(index) {
    var move = {index: index, type: 0};
    moves.push(move);
  }

  function insert(index, item) {
    var move = {index: index, item: item, type: 1};
    moves.push(move);
  }

  function removeSimulate(index) {
    simulateList.splice(index, 1);
  }
  return {
    moves: moves,
    children: children
  }
}
/*
 * 列表转化为 keyIndex 对象
 * 比如如下代码：
 var list = [{key: 'id1'}, {key: 'id2'}, {key: 'id3'}, {key: 'id4'}]
 var map = diff.makeKeyIndexAndFree(list, 'key');
 console.log(map); 
// {
  keyIndex: {id1: 0, id2: 1, id3: 2, id4: 3},
  free: []
}
 * @param {Array} list
 * @param {String|Function} key
*/
function makeKeyIndexAndFree(list, key) {
  var keyIndex = {};
  var free = [];
  for (var i = 0, len = list.length; i < len; i++) {
    var item = list[i];
    var itemKey = getItemKey(item, key);
    if (itemKey) {
      keyIndex[itemKey] = i;
    } else {
      free.push(item);
    }
  }
  return {
    keyIndex: keyIndex,
    free: free
  }
}

function getItemKey(item, key) {
  if (!item || !key) {
    return;
  }
  return typeof key === 'string' ? item[key] : key[item]
}
exports.makeKeyIndexAndFree = makeKeyIndexAndFree;
exports.diff = diff;