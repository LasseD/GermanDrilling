function getKeyToday() {
    const d = new Date();
    
    let D = d.getDate();
    let M = d.getMonth();
    let Y = d.getFullYear();

    return Y + '_' + M + '_' + D;
}

function updateIcon(info) {
    let txt = '' + info.correct;// + '/' + info.total;
    chrome.action.setBadgeText({text:txt});
}

function onAttempt(correct) {
    let key = getKeyToday();
    
    chrome.storage.sync.get([key], function(response) {
        let info = response[key];
        if(!info) {
            info = {correct:0, total:0}  
        }
        info.total++;
        if(correct) {
            info.correct++;
        }

        // Update storage:
        let toStore = {};
        toStore[key] = info;
        chrome.storage.sync.set(toStore, () => console.log('Set',key,':',info.correct,'/',info.total));

        // Update icon:
        updateIcon(info);
    });
}

// Setup:
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeBackgroundColor({color:[90, 90, 90, 55]});
    
    let key = getKeyToday();
    chrome.storage.sync.get([key], function(response) {
        let info = response[key];
        if(!info) {
            info = {correct:0, total:0}  
        }
        updateIcon(info);
    });
});

// Listen to events:
chrome.runtime.onConnect.addListener(function(port) {
    console.log('Listening to port', port.name);
    port.onMessage.addListener(function(msg) {
        onAttempt(msg.attempt);
    });
});
