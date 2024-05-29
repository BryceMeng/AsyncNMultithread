const fs = require('fs');
const async_hooks = require('async_hooks');

const logFile = fs.openSync('EventLoop.js.log', 'w');

// using console.log will lead many other async operations, using fs.writeSync can ensure the correct order of the log
function logWithTimestamp(message) {
    const now = new Date();
    const timestampedMessage = `${now.toISOString()} - ${message}\n`;
    fs.writeSync(logFile, timestampedMessage);
}

const hook = async_hooks.createHook({
    init(asyncId, type, triggerAsyncId, resource) {
        logWithTimestamp(`Init ${type}(${asyncId}) triggered by ${triggerAsyncId}`);
    },
    before(asyncId) {
        logWithTimestamp(`Before ${asyncId}`);
    },
    after(asyncId) {
        logWithTimestamp(`After ${asyncId}`);
    },
    destroy(asyncId) {
        logWithTimestamp(`Destroy ${asyncId}`);
    },
});

// enabling it will output more details
// hook.enable();

logWithTimestamp('Start of the script');

// file operation
fs.open(__filename, 'r', (err, fd) => {
    if (err) throw err;
    logWithTimestamp('File opened');
});

// setImmediate
setImmediate(() => {
    logWithTimestamp('setImmediate callback');
});


// setTimeout
setTimeout(() => {
    logWithTimestamp('setTimeout callback');
}, 0);


// micro task：process.nextTick
process.nextTick(() => {
    logWithTimestamp('process.nextTick callback');
});

// micro task：Promise
Promise.resolve().then(() => {
    logWithTimestamp('Promise resolved');
});

logWithTimestamp('End of the script');
