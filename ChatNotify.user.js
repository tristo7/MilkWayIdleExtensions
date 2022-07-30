// ==UserScript==
// @name         Chat Notify
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Notify chat messages
// @icon         https://www.google.com/s2/favicons?sz=64&domain=milkywayidle.com
// @author       tristo7
// @updateURL    https://github.com/tristo7/MilkyWayIdleExtensions/raw/main/ChatNotify.user.js
// @downloadURL  https://github.com/tristo7/MilkyWayIdleExtensions/raw/main/ChatNotify.user.js
// @match        *://*.milkywayidle.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

const nativeWebSocket = window.WebSocket;
window.WebSocket = function(...args){
  const socket = new nativeWebSocket(...args);
  window.cowsocket = socket;
  window.cowsocket.addEventListener('message', function handler(e){
    let msg = JSON.parse(e.data);
    if( msg.type == 'init_character_info' ){
      window.init_character_info = msg;
    }
    if(typeof window.init_character_info !== 'undefined'){
        window.cowsocketready = true;
        console.log(`Attached to WebSocket.`);
        this.removeEventListener('message', handler);
    }
  });
  return socket;
};

const interceptChat = (msg) => {
    const data = JSON.parse(msg.data);

    const { type, message } = data;
    if (type !== 'chat_message_received') {
        return;
    }

    const { senderName, receiverName, channelTypeHrid } = message;

    if (channelTypeHrid === '/chat_channel_types/whisper' && receiverName === window.init_character_info.user.username){
        displayMessage(`New whisper from ${senderName}`)
    }
};

const displayMessage = (message) => {
    let note = new Notification( message );
    note.onclick = function(){window.focus(); this.close()};
    setTimeout(()=>{note.close()}, 3*1000);
  }

(async function() {
    'use strict';
    
    while (!window.cowsocketready) {
        await new Promise(r => setTimeout(r, 250));
    }

    Notification.requestPermission();

    window.cowsocket.addEventListener('message', interceptChat);
})();