var account = '';
var playername = '';

var socket = io("http://localhost:3000");

console.log("background page ready");  

chrome.browserAction.onClicked.addListener(function(tab) {  
    // console.log(tab);  
    alert("使用者在"+tab.title+ "中點擊了瀏覽器按鈕");  

});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {  

    console.log(message);  
    console.log(sender);
    if(message.donelogin==true || message.donesignin==true){
        account = message.account;
        playername = message.playername;
        sendResponse({islogin: true});
    }
    if(message.checklogin==true){
        console.log({account:account,playername:playername});
        if(account==''){
            sendResponse({islogin: false});
        }else{
            sendResponse({islogin: true,account: account, playername:playername});  
        }
    }

    sendResponse({content: "來自事件腳本的回覆"});  
});

var tabToUrl = {};
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    // Note: this event is fired twice:
    // Once with `changeInfo.status` = "loading" and another time with "complete"
    tabToUrl[tabId] = tab.url;
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    socket.emit('removetab', { url: tabToUrl[tabId], account:account });

    // Remove information for non-existent tab
    delete tabToUrl[tabId];
});

var socket = io("http://localhost:3000");

