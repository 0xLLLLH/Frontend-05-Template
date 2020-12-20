# 学习笔记

## CSS总体结构

@rule
* @charset
* @import
* @media
* @page
* @counter-style
* @keyframes
* @font-face
* @support
* @namespace

其中@media，@keyframes，@font-face对日常开发来讲重要。

而@support本身的兼容性比较差，暂时不推荐使用。
## CSS选择器

### 优先级

优先级可以参考[此处](https://www.w3.org/TR/selectors-3/#specificity)。

补充课上没有提到的：
* specificity计算忽略`*`
* :not()中的选择器需要计算，但:not()本身不算一个伪类
## 伪类

### 思考题
**为什么 first-letter 可以设置 float 之类的，而 first-line 不行呢？**
使用first-letter后，所占的空间是可以确定的，和正常的元素相似。
而first-line中的一行所包含的内容是会随父元素大小、first-line元素本身位置等的变化而变化的，如果让first-line的浮动和布局属性生效，会导致不断的reflow。因此不能设置浮动、布局相关属性。
