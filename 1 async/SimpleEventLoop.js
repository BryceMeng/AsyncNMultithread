'use strict'

const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] EventLoop: ${message}`;
        })
    ),
    transports: [
        new transports.Console()
    ]
});

const synlogger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        format.printf(({ timestamp, level, message }) => {
            return `[${timestamp}] SynCode: ${message}`;
        })
    ),
    transports: [
        new transports.Console()
    ]
});

class EventLoop {
    constructor() {
        this.taskQueue = [];
        this.running = false;
    }

    addTask(callback) {
        this.taskQueue.push(callback);
    }

    run() {
        if (this.running) return;
        this.running = true;

        while (this.taskQueue.length > 0 ) {

            if (this.taskQueue.length > 0) {
                const task = this.taskQueue.shift();
                task(true);
            }
        }

        this.running = false;
    }
}

if (require.main === module) {
    const eventLoop = new EventLoop();

    synlogger.info('Script start');


    eventLoop.addTask((reserved1) => {
        logger.info('Task 1');
    });

    eventLoop.addTask((reserved1) => {
        logger.info('Task 2');
    });

    eventLoop.addTask((reserved1) => {
        logger.info('Task 3');
    });

    eventLoop.addTask((reserved1) => {
        logger.info('Task 4');
    });

    synlogger.info('Script end');

    eventLoop.run();
} else {
    // console.log('This file is being required as a module.');
}



module.exports = EventLoop