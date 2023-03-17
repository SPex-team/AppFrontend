// .eslintrc.js
module.exports = {
  root: true,
  parserOptions: {
    // 检查 ES6 语法
    parser: 'babel-eslint'
  },
  env: {
    browser: true
  },
  extends: ['react-app', 'prettier'],

  // 选择 eslint 插件
  plugins: ['prettier', 'import', 'react'],

  // 自定义 eslint 检查规则
  rules: {
    // 自定义 prettier 规则 (实际上，可配置项非常有限)
    // 'prettier/prettier': [
    // 'error',
    // {
    //   singleQuote: true,
    //   trailingComma: 'all'
    // }
    // ],
    camelcase: 'off', // 强制驼峰法命名
    'no-new': 'off', // 禁止在使用new构造一个实例后不赋值
    'space-before-function-paren': 'off', // 函数定义时括号前面不要有空格
    'no-plusplus': 'off', // 禁止使用 ++， ——
    'max-len': 'off', // 字符串最大长度
    'func-names': 'off', // 函数表达式必须有名字
    'no-param-reassign': 'off' // 不准给函数入参赋值
  }
}
