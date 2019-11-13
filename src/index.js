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
    chatId = '88f8c44a-4cf4-4ae3-89bd-3d96be3c8161@tunnel.msging.net';
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
