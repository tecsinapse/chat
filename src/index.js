import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import RenderChatComponent from './RenderChatComponent';
import * as serviceWorker from './serviceWorker';

window.renderChatComponent = function renderChatComponent() {

  let chatId = window.CHAT_ID;
  if (!chatId) {
    // fixed for local tests
    // chatId = 'bb7f1fe6-6a8e-4975-9b5f-20635673e542@tunnel.msging.net';
    chatId = '9b995670-4f04-41df-90ea-bf7cdc335357@tunnel.msging.net';
  }
  let chatApiUrl = window.CHAT_API_URL;
  if (!chatApiUrl) {
    // fixed for local tests
    // chatApiUrl = 'http://localhost:8081';
    chatApiUrl = 'https://chathomolog.tecsinapse.com.br';
  }
  let disabled = false;
  if (window.CHAT_DISABLED) {
    disabled = true;
  }

  ReactDOM.render(
    <RenderChatComponent
      chatId={chatId}
      chatApiUrl={chatApiUrl}
      disabled={disabled}/>,
    document.getElementById("chat-component-div")
  );
  serviceWorker.unregister();
};

// uncomment for local tests
// window.renderChatComponent();
