import "react-app-polyfill/ie9";
import "react-app-polyfill/stable";

import React from "react";
import ReactDOM from "react-dom";
import ThemeProvider from "@tecsinapse/ui-kit/build/ThemeProvider";

import "./index.css";

import uuidv1 from "uuid/v1";

import * as serviceWorker from "./serviceWorker";
import {Init} from "./components/Init/Init";
import {createGenerateClassName, StylesProvider} from "@material-ui/styles";

window.renderChatComponent = function renderChatComponent() {

  const defaultChatInitConfig = {
    userkeycloakId: uuidv1(),
    chatApiUrl: "http://localhost:8081",
    // chatApiUrl: "https://chathomolog.tecsinapse.com.br",
    params: {},
    getInitialStatePath: "/rest/chat/componentInfo",
    deleteChatPath: "/rest/chat",
    openImmediately: false,
    clickOnUnreadOpenFirstAction: false,
    showMessagesLabel: 'Visualizar Mensagens',
    navigateWhenCurrentChat: true,
    onChatTitle: 'Mensagens do Chat',
    showDiscardOption: true,
    onlyMessageManagement: false,
    canSendNotification: true,
  };

  let chatInitConfig = {...defaultChatInitConfig};
  // merge da configuração default com o objeto passado para inicialização
  if (window.CHAT_INIT_CONFIG) {
    chatInitConfig = {...defaultChatInitConfig, ...window.CHAT_INIT_CONFIG};
  }
  console.log('Renderizando Componente de Chat com as Configurações: ', chatInitConfig);

  const generateClassName = createGenerateClassName({
    productionPrefix: "chat",
  });

  ReactDOM.render(
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider variant="orange">
        <Init
          chatInitConfig={chatInitConfig}
        />
      </ThemeProvider>
    </StylesProvider>,
    document.getElementById("chat-component-div")
  );
  serviceWorker.unregister();
};

// uncomment for local tests
// window.renderChatComponent();
