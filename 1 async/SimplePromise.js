'use strict'

class SimplePromise {
    constructor(executor) {
        this.state = 'pending';
        this.valueForResolve = undefined; //param for resolve passed by user
        this.reasonForReject = undefined; //param for reject passed by user or exception
        this.onFulfilledCallbacks = [];
        this.onRejectedCallbacks = [];

        const resolve = (value) => {
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.valueForResolve = value;
                this.onFulfilledCallbacks.forEach(callback => callback(this.valueForResolve));
            }
        };

        const reject = (reason) => {
            if (this.state === 'pending') {
                this.state = 'rejected';
                this.reasonForReject = reason;
                this.onRejectedCallbacks.forEach(callback => callback(this.reasonForReject));
            }
        };

        try {
            executor(resolve, reject);
        } catch (error) {
            reject(error);
        }
    }

    static resolve(value) {
        return new SimplePromise((resolve) => resolve(value));
    }

    static reject(reason) {
        return new SimplePromise((_, reject) => reject(reason));
    }

    then(onFulfilled, onRejected) {
        return new SimplePromise((resolve, reject) => {
            const handleCallback = (callback, nextResolve, nextReject, param) => {
                try {
                    const result = callback(param);
                    if (result instanceof SimplePromise) {
                        result.then(nextResolve, nextReject);
                    } else {
                        nextResolve(result);
                    }
                } catch (error) {
                    nextReject(error);
                }
            };

            if (this.state === 'fulfilled') {
                setTimeout(()=>handleCallback(onFulfilled, resolve, reject, this.valueForResolve),0);
            } else if (this.state === 'rejected') {
                setTimeout(()=>handleCallback(onRejected, resolve, reject, this.reasonForReject),0);
            } else {
                this.onFulfilledCallbacks.push(value => setTimeout(()=>handleCallback(onFulfilled, resolve, reject, value),0));
                this.onRejectedCallbacks.push(reason => setTimeout(()=>handleCallback(onRejected, resolve, reject, reason),0))
            }
        });
    }

    catch(onRejected) {
        return this.then(null, onRejected);
    }
}

const myPromise = new SimplePromise((resolve, reject) => {
    resolve('Initial success');
});

myPromise
    .then((value) => {
        console.log('Step 1:', value);
        // return a rejected Promise
        return SimplePromise.reject(new Error("Error in first then onFulfilled"));
    },
    error => {
        console.log('Step 1 Rejected with:', error);
        // return a rejected Promise
        return SimplePromise.reject(new Error('Error in first then onRejected'));
    })
    .then(
        (value) => {
            console.log('Step 2:', value);
        },
        (error) => {
            console.log('Step 2 rejected with:', error.message);
            // let next then call onFulfilled by returning a normal value
            return 'Recovered from Step 1 error';
        }
    )
    .then((value) => {
        console.log('Step 3:', value);
    })
    .catch((error) => {
        console.error('Final catch:', error.message);
    });