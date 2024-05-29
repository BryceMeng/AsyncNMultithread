const { execSync } = require('child_process');
const { createLogger, format, transports} = require('winston');
const clc = require('cli-color');

parentPort = null
logFunc = null

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



const funcResource = {
    "packTheMail": ["I'm about to use {secs} seconds to pack the mail.", 2, "Finish packing."],
    "onTheWayThere": ["I need {secs} seconds on the way there.", 8, "I've got there."],
    "replyTheMail": ["I need {secs} seconds to reply this mail.", 3, "I'm done."],
    "onTheWayBack": ["I need {secs} seconds on the way back.", 8, "I've got the reply mail."],
    "processReplyMail": ["I need {secs} to get the cheque from the reply mail.", 1, "I'm done"]
}

function costTime(seconds) {
    execSync(`powershell -command "Start-Sleep -Seconds ${seconds}"`);
}



function process(funcName){
    var paras = funcResource[funcName]
    logFunc(paras[0].replace('{secs}',paras[1]))
    costTime(paras[1])
    logFunc(paras[2])
}

function packTheMail(){
    process(packTheMail.name)
}

function onTheWayThere(){
    process(onTheWayThere.name)
}

function replyTheMail(){
    process(replyTheMail.name)
}

function onTheWayBack(){
    process(onTheWayBack.name)
}

function processReplyMail(){
    process(processReplyMail.name)
}

// parentPort.on('message', (message) => {
//     if (message === 'start') {
//       console.log("abcdefg")
//       parentPort.postMessage('costTime completed');
//     }
// });
  
function deliveryProcessSync(){
    logFunc = wlogger.info
    packTheMail()
    onTheWayThere()
    // replyTheMail()
    // onTheWayBack()
    // processReplyMail()
}

function deliveryProcessAsync(pParentPort){
    parentPort = pParentPort
    logFunc = (msg) => parentPort.postMessage(msg)
    packTheMail()
    onTheWayThere()
    // replyTheMail()
    // onTheWayBack()
    // processReplyMail()
}

module.exports = {
    deliveryProcessSync:deliveryProcessSync,
    deliveryProcessAsync:deliveryProcessAsync
}