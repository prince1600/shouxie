const MyPromise = require("./promise.js"); 

const p = new MyPromise((resolve, reject) => {
    setTimeout(() => {
        resolve('ok')
    }, 1000);
})
const p2 = p.then(value => {
    console.log('value:', value)
    return new MyPromise((resolve, reject) => {
        // resolve('p2')
        reject('p2 error')
    })
}, reason => {
    console.log('reason:', reason)
})

p2.then().then().then(value => {
    console.log('v', value)
}).catch(e => {
    console.log('e:', e)
})