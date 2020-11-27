# 学习笔记

## 状态机

在看这周前几个视频的时候，一直在思考，怎样才能将状态机的构建进行抽象，从而能够对未知的pattern进行处理，而不是像视频中一样每个字符写一个函数。后来想到KMP算法，KMP算法通过转移表来进行匹配和回退，而实际上状态机形式也可以用类似的思想实现，于是设计了一个State类，专门进行回退状态、匹配状态以及状态转移的操作。

## HTTP请求的处理

nodejs中网络相关的两个包：
* net：TCP相关
* http: HTTP相关

在响应内容中多出的十六进制值实际上是Transfer-Encoding编码的格式，详见
[HTTP 协议中的 Transfer-Encoding](https://imququ.com/post/transfer-encoding-header-in-http.html)

分块编码有两个基本的规则：
* 用十六进制值代表当前分块的长度（不包含CRLF）
* 最后一个分块长度必须为0，且对应分块无数据（但是有CRLF）

一个合法的响应:
```
HTTP/1.1 200 OK\r\n
Transfer-Encoding: chunked\r\n
\r\n
5\r\n
12345\r\n
0\r\n
\r\n
```

明确规则后就可以写出对应的状态机来解析分块数据
