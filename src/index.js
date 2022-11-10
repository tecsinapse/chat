import React from "react";
import ReactDOM from "react-dom";
import { createGenerateClassName, StylesProvider } from "@material-ui/styles";
import { ThemeProvider } from "@tecsinapse/ui-kit";
import { Init } from "./components/Init/Init";
import "react-app-polyfill/ie9";
import "react-app-polyfill/stable";
import "./index.css";

window.renderChatComponent = function renderChatComponent() {
  const defaultChatInitConfig = {
    userkeycloakId: "06a2bd10-599d-4012-a8fa-3de2d6edb83d",
    chatApiUrl: `${process.env.REACT_APP_SERVER_URL}`,
    productChatPath: "http://localhost:9080/rest/chat",
    openImmediately: false,
    canSendNotification: true,
    executeFirstAction: false,
    showBackButton: true,
    showMessageManagementBanner: false,
    params: {},
    // params: { clienteId: 59996 },
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
    document.getElementById("wingo-chat-component")
  );
};

if (process.env.REACT_APP_HOST === "development") {
  window.renderChatComponent();
}
