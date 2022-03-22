import "react-app-polyfill/ie9";
import "react-app-polyfill/stable";

import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "@tecsinapse/ui-kit";
import { createGenerateClassName, StylesProvider } from "@material-ui/styles";

import { Init } from "./components/Init/Init";
import "./index.css";

const standalone = process.env.REACT_APP_STANDALONE === "true";

window.renderChatComponent = function renderChatComponent() {
  const defaultChatInitConfig = {
    userkeycloakId: "f92c5d90-73b2-11ec-81db-abe03bce8cb8",
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
    userPhoneNumber: "",
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
        <Init chatInitConfig={chatInitConfig} />
      </ThemeProvider>
    </StylesProvider>,
    document.getElementById("chat-component-div")
  );
};

if (standalone) {
  window.renderChatComponent();
}
