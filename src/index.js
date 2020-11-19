import "react-app-polyfill/ie9";
import "react-app-polyfill/stable";

import React from "react";
import ReactDOM from "react-dom";
import ThemeProvider from "@tecsinapse/ui-kit/build/ThemeProvider";

import "./index.css";

import uuidv1 from "uuid/v1";

import { Init } from "./components/Init/Init";
import { createGenerateClassName, StylesProvider } from "@material-ui/styles";

const standalone = process.env.REACT_APP_STANDALONE === "true";

window.renderChatComponent = function renderChatComponent() {
  const defaultChatInitConfig = {
    userkeycloakId: uuidv1(),
    chatApiUrl: `${process.env.REACT_APP_SERVER_URL}`,
    params: {},
    getInitialStatePath: "/rest/chat/componentInfo",
    deleteChatPath: "/rest/chat",
    createPath: "/rest/chat",
    openImmediately: false,
    clickOnUnreadOpenFirstAction: false,
    showMessagesLabel: "Visualizar Mensagens",
    navigateWhenCurrentChat: true,
    onChatTitle: "Mensagens do Chat",
    showDiscardOption: true,
    onlyMessageManagement: false,
    canSendNotification: true,
    standalone,
  };

  let chatInitConfig = { ...defaultChatInitConfig };
  // merge da configuração default com o objeto passado para inicialização
  if (window.CHAT_INIT_CONFIG) {
    chatInitConfig = { ...defaultChatInitConfig, ...window.CHAT_INIT_CONFIG };
  }

  const generateClassName = createGenerateClassName({
    productionPrefix: "chat",
  });

  ReactDOM.render(
    <StylesProvider generateClassName={generateClassName}>
      <ThemeProvider variant="orange">
        <Init chatInitConfig={chatInitConfig} mobile={true} />
      </ThemeProvider>
    </StylesProvider>,
    document.getElementById("chat-component-div")
  );
};

if (standalone) {
  window.renderChatComponent();
}
