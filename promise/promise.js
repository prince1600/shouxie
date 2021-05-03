const PENDING = Symbol('pending'),
FULFILLED = Symbol('fulfilled'),
REJECTED = Symbol('rejected')

class MyPromise {
    constructor(executor) {
        this.status = PENDING
        this.value = undefined
        this.reason = undefined
        this.onFulfilledCallbacks = []
        this.onRejectedCallbacks = []

        const resolve = value => {
            if (this.status === PENDING) {
                this.status = FULFILLED
                this.value = value
                this.onFulfilledCallbacks.forEach(fn => fn())
            }
        }

        const reject = reason => {
            if (this.status === PENDING) {
                this.status = REJECTED
                this.reason = reason
                this.onRejectedCallbacks.forEach(fn => fn())
            }
        }

        try {
            executor(resolve, reject)
        } catch(e) {
            reject(e)
        }
    }

    then(onFulfilled, onRejected) {
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value
        onRejected = typeof onRejected === 'function' ? onRejected: reason => {throw reason}
        const promise2 = new MyPromise((resolve, reject) => {
            if (this.status === FULFILLED) {
                setTimeout(() => {
                    try {
                        const x = onFulfilled(this.value)
                        procedure(promise2, x, resolve, reject)
                    } catch(e) {
                        reject(e)
                    }
                    
                }, 0);
            }
    
            if (this.status === REJECTED) {
                setTimeout(() => {
                    try {
                        const x = onRejected(this.reason)
                        procedure(promise2, x, resolve, reject)
                    } catch(e) {
                        reject(e)
                    }
                }, 0);
            }
    
            if (this.status === PENDING) {
                this.onFulfilledCallbacks.push(() => {
                    try {
                        const x = onFulfilled(this.value)
                        procedure(promise2, x, resolve, reject)
                    } catch(e) {
                        reject(e)
                    }
                })
                this.onRejectedCallbacks.push(() => {
                    try {
                        const x = onRejected(this.reason)
                        procedure(promise2, x, resolve, reject)
                    } catch(e) {
                        reject(e)
                    }
                })
            }
        })

        return promise2
    }

    catch(errorHandler) {
        return this.then(null, errorHandler)
    }
}

function procedure(promise2, x, resolve, reject){
    if (promise2 === x) {
        return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
    }
    
    let called = false
    if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
        try {
            const then = x.then
            if (typeof then === 'function') {
                then.call(x, y => {
                    if (called) return
                    called = true
                    procedure(promise2, y, resolve, reject)
                }, r => {
                    if (called) return
                    called = true
                    reject(r)
                })
            } else {
                resolve(x)
            }
        } catch(e) {
            if (called) return
            called = true
            reject(e)
        }
    } else {
        resolve(x)
    }
}

module.exports = MyPromise