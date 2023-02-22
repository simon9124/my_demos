
var diff = require('./diff');
/*
var list = [{key: 'id1'}, {key: 'id2'}, {key: 'id3'}, {key: 'id4'}]
var map = diff.makeKeyIndexAndFree(list, 'key');

console.log(map);
// moves 是 删除和插入操作，等于0的话 是删除操作，等于1的话 是插入操作
移动可以看成是删除和插入操作的结合。
*/

var before = [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}, {id: 6}];
var after = [{id: 4}, {id: 3}, {id: 2},{id: 1}];
// var before = [{id: "a"}, {id: "b"}, {id: "c"}, {id: "d"}, {id: "e"}]
// var after = [{id: "c"}, {id: "a"}, {id: "b"}, {id: "e"}, {id: "f"}]
//var before = [{id: 'a'}, {id: 'b'}, {id: 'c'}, {id: 'd'}, {id: 'e'}];
//var after = [{id: 'c'}, {id: 'd'}, {id: 'f'}];

var diffs = diff.diff(before, after, 'id');
console.log(diffs)
/*
moves = [
  {
    index: 3, type: 0
  },
  {
    index: 3, type: 0
  },
  {
    index: 3, type: 0
  },
  {
    index: 0, type: 0
  },
  {
    index: 2, type: 1, item: {id: 1}
  }
]
*/
