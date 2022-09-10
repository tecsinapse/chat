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
    userkeycloakId: "dd573238-8e0a-4de5-a73b-0dfee75fd905",
    chatApiUrl: `${process.env.REACT_APP_SERVER_URL}`,
    productChatPath: "http://localhost:8080/rest/chat",
    openImmediately: false,
    canSendNotification: true,
    pageSize: 10,
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
