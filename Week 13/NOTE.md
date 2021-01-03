# 学习笔记

## 浏览器API

浏览器API分类：
* BOM API
  * Storage相关：localStorage，sessionStorage，cookie
* DOM API
  * Node API
    * Element元素节点
      * HTMLElement
      * SVGElement
    * Document文档根节点
    * CharacterData字符数据
      * Text文本节点
      * Comment注释
      * ProcessingInstruction处理信息
    * DocumentFragment文档片段
    * DocumentType文档类型
  * Range API
  * traverse api
  * Event相关


## DOM 事件机制

视频中提到捕获和冒泡，但实际上[标准](https://www.w3.org/TR/DOM-Level-3-Events/#event-flow)定义的是三个阶段:
* 捕获 Capture：从DOM树根节点逐步向目标节点检查并执行对应事件的处理函数
* 目标 Target：按注册顺序执行处理函数，**不管注册时指定的capture**
* 冒泡 Bubbling：从目标节点向根节点检查并执行处理函数


