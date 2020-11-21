# 学习笔记

## 优先级

构建语法树时需要考虑运算符的优先级，不过由于优先级可能受上下文影响，更准确的表述方式为生成式。

> 对于不确定优先级的表达式，必须使用括号以避免歧义和错误！！！

### new A和new A()优先级不同

`new A()`的优先级要高于`new A`
主要考虑两个例子：

```Typescript
new A()()   // 等价于(new A())()

new new A()  // 等价于new (new A())
```

### 特殊的Exponential运算符

JavaScript中的运算符几乎都是左结合的，只有乘方`**`运算是右结合的

```Typescript
2 ** 3 ** 4 === 2 ** ( 3 ** 4)
```


## 类型转换

> 类型转换规则复杂难记且不同的运算符有所不同，实际应用需要查阅规范并进行充分的测试！！！

## 宏任务和微任务

当初是根据这篇blog了解到MacroTask和MicroTask:
https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
