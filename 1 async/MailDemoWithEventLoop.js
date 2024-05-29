'use strict'

const MailWorker = require('./MailWorker');
const EventLoop = require('./SimpleEventLoop');
const { Worker, workerData, parentPort, isMainThread } = require('worker_threads');
const { createLogger, format, transports } = require('winston');
const clc = require('cli-color');

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        format.printf(({ timestamp, level, message }) => {
            return clc.greenBright(`[${timestamp}] Me: ${message}`);
        })
    ),
    transports: [
        new transports.Console()
    ]
});

const elogger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        format.printf(({ timestamp, level, message }) => {
            return clc.yellowBright(`[${timestamp}] Me.EventLoop: ${message}`);
        })
    ),
    transports: [
        new transports.Console()
    ]
});

const wlogger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        format.printf(({ timestamp, level, message }) => {
            return clc.cyanBright(`[${timestamp}] PostOffice: ${message}`);
        })
    ),
    transports: [
        new transports.Console()
    ]
});

function gotoPostOfficeAndSentTheMail(){
    logger.info("Now I'm in office and passing the mail to the PostOffice")
}

function goHomeForDinner(){
    logger.info("Now I'v returned home and ready for my dinner :)")
}

function callBackFromPostOffice(isFromEventLoop=false){
    var tLogger = logger
    if (isFromEventLoop) {
        tLogger = elogger
    }
    tLogger.info("Now I'm going to save the cheque from the mail to my account :)")
}

var eventLoop = new EventLoop()

function postTheMailAsync(){
    if(isMainThread){
        const intervalId = setInterval(() => {eventLoop.run();}, 1000);

        const worker = new Worker('./MailDemoWithEventLoop.js', {workerData: { p1: 2 }});

        worker.on('message', (message) => {
            // console.log(`Received message from worker: ${message}`);
            switch (message) {
                case "Completed":
                    logger.info("Post office got the mail and nofity me. I'll add the task into my schedule and to it later.")
                    eventLoop.addTask(callBackFromPostOffice)
                    break;
                default:
                    wlogger.info(message)
                    break;
            }
        });
        
        worker.on('error', (error) => {
            console.error('Worker error:', error);
        });

        worker.on('online', () => {
            // console.log('online');
            gotoPostOfficeAndSentTheMail();
            worker.postMessage('start');
            goHomeForDinner();
        });
        
        worker.on('exit', (code) => {
            if (code !== 0) {
              console.error(`Worker stopped with exit code ${code}`);
            } else {
            //   console.log('Exit normal')
            }
        });
    } else {
        // code for the new worker thread
        parentPort.on('message', (message) => {
            if (message === 'start') {
            //   console.log("paremeter:" + workerData.p1)
              MailWorker.deliveryProcessAsync(parentPort)
              parentPort.postMessage('Completed');
              process.exit(0)
            }
        });
    }


}

postTheMailAsync()


