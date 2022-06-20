import { Message, a } from "./message";
import React from 'react';
import ReactDOM from 'react-dom';

chrome.runtime.onMessage.addListener(receiver);

function receiver(request: Message, sender: chrome.runtime.MessageSender, sendResponse: any) {
    console.log("Message received:", request, sender, sendResponse);
}

console.log(a);

const App: React.FC = () => {
    return <div>
        <h1>Simple Notes</h1>
        <p>I am a react component</p>
        <input id="main-text-entry"></input>
    </div>;
}

ReactDOM.render(
    <React.StrictMode><App/></React.StrictMode>, document.getElementById("root")
);