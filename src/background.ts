interface Message {
    message: string;
}

chrome.action.onClicked.addListener(buttonClicked);

function buttonClicked(tab: chrome.tabs.Tab) {
    const myMessage: Message = {
        message: "Hello from the background"
    }
    const tabId = tab.id === undefined ? 0 : tab.id;
    console.debug(`tabId: ${tabId}`)
    chrome.tabs.sendMessage(tabId, myMessage);
}