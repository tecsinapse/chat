import React from 'react';
import ReactDOM from 'react-dom';
import ThemeProvider from '@tecsinapse/ui-kit/build/ThemeProvider';

import './index.css';
import {RenderChat} from './Chat/RenderChat';

import * as serviceWorker from './serviceWorker';

window.renderChatComponent = function renderChatComponent() {

  let chatId = window.CHAT_ID;
  if (!chatId) {
    // fixed for local tests
    // Mobile João Bassinello
    chatId = 'bb7f1fe6-6a8e-4975-9b5f-20635673e542@tunnel.msging.net';
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

  let clientName = '';
  if (window.CLIENT_NAME) {
    clientName = window.CLIENT_NAME;
  }

  ReactDOM.render(
    <ThemeProvider variant={'orange'}>
      <RenderChat
        chatId={chatId}
        chatApiUrl={chatApiUrl}
        clientName={clientName}
        disabled={disabled}
      />
    </ThemeProvider>,
    document.getElementById("chat-component-div")
  );
  serviceWorker.unregister();
};

// uncomment for local tests
window.renderChatComponent();
