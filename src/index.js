import React from 'react';
import ReactDOM from 'react-dom';
import ThemeProvider from '@tecsinapse/ui-kit/build/ThemeProvider';

import './index.css';
import {RenderChat} from './Chat/RenderChat';

import * as serviceWorker from './serviceWorker';

window.renderChatComponent = function renderChatComponent() {

  let chatsInitialInfo = window.CHAT;
  if (!chatsInitialInfo) {
    // fixed for local tests
    chatsInitialInfo = {
      name: 'Título do Chat',
      chats: [
        {
          name: 'João Paulo Bassinello',
          phone: '(19) 99456-8196',
          // Mobile João Bassinello
          chatId: 'bb7f1fe6-6a8e-4975-9b5f-20635673e542@tunnel.msging.net'
        },
        {
          name: 'João Paulo Bassinello',
          phone: '(19) 99456-8196',
          // Mobile João Bassinello
          chatId: 'bb7f1fe6-6a8e-4975-9b5f-20635673e542@tunnel.msging.net'
        }
      ]
    };
  }

  let chatApiUrl = window.CHAT_API_URL;
  if (!chatApiUrl) {
    // fixed for local tests
    chatApiUrl = 'http://localhost:8081';
    // chatApiUrl = 'https://chathomolog.tecsinapse.com.br';
  }
  let disabled = false;
  if (window.CHAT_DISABLED) {
    disabled = true;
  }

  ReactDOM.render(
    <ThemeProvider variant={'orange'}>
      <RenderChat
        initialInfo={chatsInitialInfo}
        chatApiUrl={chatApiUrl}
        disabled={disabled}
      />
    </ThemeProvider>,
    document.getElementById("chat-component-div")
  );
  serviceWorker.unregister();
};

// uncomment for local tests
// window.renderChatComponent();
