# 原文  https://promisesaplus.com/

1. 术语
    1.1 “promise”是一个object或function，带有then方法，并且它的行为遵循本规范。
    1.2 “thenable”是一个object或function，它定义了一个then方法
    1.3 “value”是一个任意的合法JavaScript值（包括undefined、一个thenable或一个promise）
    1.4 “exception”是通过throw语法抛出的一个值
    1.5 “reason”是一个值，表示promise被拒绝的原因。

2. 要求
    2.1 Promise 状态
    一个promise必须处于以下3种状态之一：pending、fulfilled、rejected

    2.1.1 当promise处于pending状态：
        2.1.1.1 可以转化为fulfilled或rejected
    2.1.2 当promise处于fulfilled状态：
        2.1.2.1 不能转化为其他状态
        2.1.2.2 必须有1个value，且不能改变
    2.1.3 当promise处于rejected状态：
        2.1.3.1 不能转化为其他状态
        2.1.3.2 必须有1个reason，且不能改变
    “不能改变”是指内存地址不可变


    2.2 then方法
    一个promise必须提供一个then()方法来访问它的当前或者最终的value/reason
    then()接受2个参数：
        promise.then(onFulfilled, onRejecteed)
    
    2.2.1 onFulfilled和onRejecteed都是可选参数
        2.2.1.1 如果onFulfilled不是function，那么它会被忽略
        2.2.1.2 如果onRejecteed不是function，那么它会被忽略
    
    2.2.2 如果onFulfilled是一个function：
        2.2.2.1 它必须在promise状态变为fulfilled之后调用，第一个参数是value
        2.2.2.2 在promise状态变为fulfilled之前，不可调用
        2.2.2.3 最多只能调用1次
    
    2.2.3 如果onRejected是一个function：
        2.2.3.1 它必须要promise状态变为rejected之后调用，第一个参数是reason
        2.2.3.2 在promise状态变为rejected之前，不可调用
        2.2.3.3 最多只能调用1次
    
    2.2.4 在执行上下文堆栈只包含平台代码之前，不能调用onFulfilled或onRejected。

    2.2.5 onFulfilled或onRejected只能作为函数调用(不能包含this)

    2.2.6 then方法可在一个promise上多次调用
        2.2.6.1 如果/当promise处于fulfilled，所有相应的onFulfilled回调必须按照它们最初调用到then的顺序执行。
        2.2.6.2 如果/当promise处于rejected，所有相应的onRejected回调必须按照它们最初调用到then的顺序执行。

    2.2.7 then()必须返回一个promise
        promise2 = promise1.then(onFulfilled, onRejected)
        2.2.7.1 如果onFulfilled或onRejected返回值x，则运行Promise Resolution Procedure [[Resolve]](promise2, x)
        2.2.7.2 如果onFulfilled或onRejected抛出异常e，则必须以e为原因拒绝promise2。
        2.2.7.3 如果onFulfilled不是一个函数并且promise1处于fulfilled态，promise2必须用与promise1相同的value被fulfilled。
        2.2.7.4 如果onRejected不是一个函数并且promise1处于rejected态，promise2必须用与promise1相同的reason被rejected。
    

    2.3 Promise 解决过程
    Promise 解决过程是一个抽象的操作，其需输入一个 promise 和一个值，我们表示为 [[Resolve]](promise, x)，如果 x 有 then 方法且看上去像一个 Promise ，解决程序即尝试使 promise 接受 x 的状态；否则其用 x 的值来执行 promise 。

    这种 thenable 的特性使得 Promise 的实现更具有通用性：只要其暴露出一个遵循 Promise/A+ 协议的 then 方法即可；这同时也使遵循 Promise/A+ 规范的实现可以与那些不太规范但可用的实现能良好共存。

    运行 [[Resolve]](promise, x) 需遵循以下步骤：

    2.3.1 If promise and x refer to the same object, reject promise with a TypeError as the reason.

    2.3.2 If x is a promise, adopt its state [3.4]:
        2.3.2.1 If x is pending, promise must remain pending until x is fulfilled or rejected.
        2.3.2.2 If/when x is fulfilled, fulfill promise with the same value.
        2.3.2.3 If/when x is rejected, reject promise with the same reason.

    2.3.3 Otherwise, if x is an object or function,
        2.3.3.1 Let then be x.then. [3.5]
        2.3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
        2.3.3.3 If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise, where:
            2.3.3.3.1 If/when resolvePromise is called with a value y, run [[Resolve]](promise, y).
            2.3.3.3.2 If/when rejectPromise is called with a reason r, reject promise with r.
            2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
            2.3.3.3.4 If calling then throws an exception e,
                2.3.3.3.4.1 If resolvePromise or rejectPromise have been called, ignore it.
                2.3.3.3.4.2 Otherwise, reject promise with e as the reason.
        2.3.3.4 If then is not a function, fulfill promise with x.
    
    2.3.4 If x is not an object or function, fulfill promise with x.

    If a promise is resolved with a thenable that participates in a circular thenable chain, such that the recursive nature of [[Resolve]](promise, thenable) eventually causes [[Resolve]](promise, thenable) to be called again, following the above algorithm will lead to infinite recursion. Implementations are encouraged, but not required, to detect such recursion and reject promise with an informative TypeError as the reason. [3.6]

