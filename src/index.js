import React from "react";
import ReactDOM from "react-dom";
import { ThemeProvider } from "@tecsinapse/ui-kit";
import { Init } from "./components/Init/Init";
import "react-app-polyfill/ie9";
import "react-app-polyfill/stable";
import "./index.css";
import { createGenerateClassName, StylesProvider } from "@material-ui/styles";

window.renderChatComponent = function renderChatComponent() {
  const defaultChatInitConfig = {
    userkeycloakId: "4a2979b6-e7db-4be1-bd73-e14aeab8006a",
    chatApiUrl: `${process.env.REACT_APP_SERVER_URL}`,
    productChatPath: "http://localhost:8080/rest/chat",
    openImmediately: false,
    canSendNotification: true,
    pageSize: 10,
  };

  let chatInitConfig = { ...defaultChatInitConfig };

  // merge da configuração default com o objeto passado para inicialização
  if (window.CHAT_INIT_CONFIG) {
    chatInitConfig = { ...defaultChatInitConfig, ...window.CHAT_INIT_CONFIG };
  }

  console.log("CHAT_INIT_CONFIG", window.CHAT_INIT_CONFIG);
  console.log("chatInitConfig", chatInitConfig);

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
