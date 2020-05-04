import "react-app-polyfill/ie9";
import "react-app-polyfill/stable";

import React from "react";
import ReactDOM from "react-dom";
import ThemeProvider from "@tecsinapse/ui-kit/build/ThemeProvider";

import "./index.css";

import uuidv1 from "uuid/v1";

import * as serviceWorker from "./serviceWorker";
import {Init} from "./Chat/Init";

window.renderChatComponent = function renderChatComponent() {

  /**
   * ID do usuário logado no produto que está abrindo o chat
   */
  let userkeycloakId = window.USER_KEYCLOAK_ID;
  if (!userkeycloakId) {
    userkeycloakId = uuidv1();
  }

  /**
   * URL do tecsinapse-chat
   */
  let chatApiUrl = window.CHAT_API_URL;
  if (!chatApiUrl) {
    // fixed for local tests
    chatApiUrl = "http://localhost:8081";
    // chatApiUrl = 'https://chathomolog.tecsinapse.com.br';
  }

  /**
   * Parâmetro de inicialização do componente que será enviado
   * na requisição REST ao produto
   */
  let initParam = window.INIT_PARAM;
  if (!initParam) {
    initParam = '';
  } else {
    if (typeof initParam !== 'string') {
      initParam = JSON.stringify(initParam);
    }
  }

  /**
   * Caminho do endpoint REST que carregará as informações iniciais do componente
   */
  let getInitialStatePath = window.GET_INITIAL_STATE_PATH;
  if (!getInitialStatePath) {
    getInitialStatePath = '/rest/chat/componentInfo?param=' + initParam;
  }

  ReactDOM.render(
    <ThemeProvider variant={"orange"}>
      <Init
        userkeycloakId={userkeycloakId}
        chatApiUrl={chatApiUrl}
        getInitialStatePath={getInitialStatePath}
      />
    </ThemeProvider>,
    document.getElementById("chat-component-div")
  );
  serviceWorker.unregister();
};

// uncomment for local tests
window.renderChatComponent();
