# 学习笔记

## HTML解析流程

合法的HTML标签：
1. 开始标签
2. 结束标签
3. 自封闭标签

具体的状态转换和emit时机参考[WHATWG 文档](https://whatwg-cn.github.io/html/multipage/parsing.html)，视频中代码展示不全导致难以进行问题的调试对比，我就遇到由于部分状态编写略有问题导致长时间debug还是没能搞定的情况，直到根据文档逐一校对后才运行正常。

比对着视频来实现更合理的一种实现流程：
1. 快速浏览视频确定ToyBrowser需要实现的状态
2. 参考WHATWG文档中相应的状态转移过程描述进行编码。参照文档实现时需要注意：1. 创建token的时机；2.是否需要re-consume;3.emit token的时机
