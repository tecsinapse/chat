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
    userkeycloakId: "4a2979b6-e7db-4be1-bd73-e14aeab8006a",
    chatUrl: `${process.env.REACT_APP_SERVER_URL}`,
    chatApiUrl: `${process.env.REACT_APP_SERVER_URL}/api/chats`,
    productChatPath: "http://localhost:8080/rest/chat",
    componentInfoPath: "http://localhost:8080/rest/chat/componentInfo",
    deleteChatPath: "http://localhost:8080/rest/chat",
    createPath: "http://localhost:8080/rest/chat",
    openImmediately: false,
    clickOnUnreadOpenFirstAction: false,
    showMessagesLabel: "Visualizar Mensagens",
    navigateWhenCurrentChat: true,
    onChatTitle: "Mensagens do Chat",
    showDiscardOption: true,
    onlyMessageManagement: false,
    canSendNotification: true,
    standalone: false,
    userPhoneNumber: "",
    pageSize: 10,
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
