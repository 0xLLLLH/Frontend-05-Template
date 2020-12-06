# 学习笔记

## HTML解析流程

### 1.词法分析——解析标签

合法的HTML标签：
1. 开始标签
2. 结束标签
3. 自封闭标签

标签的解析涉及到的状态：
1. `data`: 初始状态
   1. 遇到`<`时转换为`tagOpen`
   2. 遇到`EOF`时停止解析
   3. 遇到其他内容解析文本节点
2. `tagOpen`: 标签开启
   1. 遇到`/`转换为`endTagOpen`
   2. 如果是英文则进入`tagName`解析（需要re-consume）
   3. 否则维持当前状态
3. `tagName`: 解析标签名
   1. 遇到空白符（`/^[\t\n\f ]$/`）则进入`beforeAttributeName`
   2. 遇到`/`进入`selfClosingStartTag`
   3. 遇到`>`进入`data`状态，准备解析下一个标签
   4. 否则维持当前状态
4. `endTagOpen`: 结束标签开启
   1. 如果是英文则进入`tagName`解析（需要re-consume）
   2. 遇到`>`报错，不能马上闭合
   3. 遇到`EOF`报错
5. `beforeAttributeName`: 准备解析属性名
   1.
6. `selfClosingStartTag`: 标签自闭合
   1. 遇到`>`将当前token标记为自闭合标签，然后返回`data`
   2. 其他情况报错
