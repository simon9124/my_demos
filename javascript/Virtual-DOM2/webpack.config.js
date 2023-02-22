// 引入一个包
const path = require("path");
module.exports = {
  // 指定入口文件
  entry: "./src/index.js",
  // 指定打包文件所在目录
  output: {
    // 指定打包文件的目录
    path: path.resolve(__dirname, "dist"),
    // 打包后文件的文件
    filename: "index.js",
  },
  mode: "development", // 设置mode
  // 指定webpack打包时要使用的模块
  module: {},
  // 配置webpack插件
  plugins: [],
};
