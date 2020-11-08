# 学习笔记

## 关于Proxy
Proxy强大而危险，提供了一系列的钩子来拦截对对象的操作，需要理解但日常开发过程中尽量少用。

## Proxy和双向绑定

由于effect回调中使用的变量无法直接确定，需要进行一次调用，然后在reactive对象的get中进行注册，记录effect和reactive对象的联系。

## drag-drop

小技巧：事件绑定在document上，这样即使鼠标移出浏览器也能响应。
