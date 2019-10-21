import React from 'react';
import ReactDOM from 'react-dom';
import ThemeProvider from '@tecsinapse/ui-kit/build/ThemeProvider';

import './index.css';
import RenderChatComponent from './RenderChatComponent';
import {RenderChat} from './Chat/RenderChat';

import * as serviceWorker from './serviceWorker';

window.renderChatComponent = function renderChatComponent() {

  let chatId = window.CHAT_ID;
  if (!chatId) {
    // fixed for local tests
    chatId = '94dd0178-db70-4959-ae35-1ac8a6825598@tunnel.msging.net';
  }
  let chatApiUrl = window.CHAT_API_URL;
  if (!chatApiUrl) {
    // fixed for local tests
    chatApiUrl = 'https://chathomolog.tecsinapse.com.br';
  }
  let disabled = false;
  if (window.CHAT_DISABLED) {
    disabled = true;
  }

  ReactDOM.render(
    <ThemeProvider variant={'orange'}>
      <RenderChat
        chatId={chatId}
        chatApiUrl={chatApiUrl}
        disabled={disabled}
      />
    </ThemeProvider>,
    document.getElementById("chat-component-div")
  );
  serviceWorker.unregister();
};

// uncomment for local tests
window.renderChatComponent();
