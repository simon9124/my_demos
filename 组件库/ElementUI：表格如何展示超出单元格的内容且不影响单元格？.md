- 这个问题之前在封装**表格行内编辑校验**时就一直困扰我，近期因为业务需求又不得不面对了

# 需求详述

- `ElementUi`表格列若干（肯定有横向滚动条），在若干行（不固定）的某一列上（不固定）展示指定文字，
- 要展示的文字长度大概率比该列宽度大
- 文字需要完整展示，可跨单元格

# 尝试过程

- 直接使用**自定义渲染单元格**，失败，超出单元格部分会被遮盖
- 自定义指令在`document`上渲染内容，失败，定位很困难（很难拿到该单元格相对整个`document`的位置），且内容也不随滚动条滚动
- 使用`el-tooltip`，让其一直保持展示，失败，`el-tooltip`初始化没有定位，只有在鼠标移入时才有

# 成功方案

- 使用`el-popover`弹出框的**手动激活**方式，其既保证`dom`结构在单元格里，又能打破**内容无法超出单元格**的壁垒

```vue
<template>
  <el-table-column
    v-for="(column, i) in columnList"
    :key="column.value"
    width="20"
    class-name="gantt-column"
  >
    <template slot-scope="scope">
      <div class="gantt-bar" :style="`background: green`">
        <el-popover
          v-if="scope.row.percent"
          v-model="visible"
          popper-class="gantt-percent-popover"
          trigger="manual"
          :content="`${scope.row.percent}%`"
        >
        </el-popover>
      </div>
    </template>
  </el-table-column>
</template>

<script>
export default {
  data() {
    return {
      columnList: [], // 动态表格列
      visible: true, // popover-始终展示
    };
  },
};
</script>

<style lang="scss">
.gantt-percent-popover {
  width: max-content;
  min-width: auto;
  border: none;
  box-shadow: none;
  background: none;
  padding: 0 !important;
  font-size: 14px;
  color: rgba(0, 0, 0, 1);
  font-weight: bold;
  // text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
  white-space: nowrap;
  height: 23px;
  line-height: 23px;
  transform: translate(-40%, 0);
  font-style: italic;
}
</style>
```
