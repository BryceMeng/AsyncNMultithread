'use strict'

const MailWorker = require('./MailWorker');
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

function ProcessReplyMail(){
    logger.info("Now I'm going to save the cheque from the mail to my account :)")
}

function callBackFromPostOffice(){
    logger.info("Post office got the mail and nofity me to process it")
    ProcessReplyMail()
}

function postTheMailSync(){
    logger.info("Sync Process Demonstration")
    gotoPostOfficeAndSentTheMail()
    MailWorker.deliveryProcessSync()
    ProcessReplyMail()
    goHomeForDinner()
}

function postTheMailAsync(){
    if(isMainThread){
        // my main thread
        logger.info("Async Process Demonstration")

        const worker = new Worker('./MailDemo.js', {workerData: { p1: 2 }});

        worker.on('message', (message) => {
            switch (message) {
                case "Completed":
                    callBackFromPostOffice()
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
        // Post Office's thread
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

const args = process.argv.slice(2);

if (args.length == 0 || args[0].toUpperCase()=="ASYNC") {
    postTheMailAsync()
} else if (args[0].toUpperCase()=="SYNC") {
    postTheMailSync()
} else {
    console.log("unknown parameter\nPlease use 'node MailDemo.js sync/async'")
}






