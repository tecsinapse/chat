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

  let userkeycloakId = window.USER_KEYCLOAK_ID;
  if (!userkeycloakId) {
    userkeycloakId = uuidv1();
  }

  let chatApiUrl = window.CHAT_API_URL;
  if (!chatApiUrl) {
    // fixed for local tests
    chatApiUrl = "http://localhost:8081";
    // chatApiUrl = 'https://chathomolog.tecsinapse.com.br';
  }

  let getInitialStatePath = window.GET_INITIAL_STATE_PATH;
  if (!getInitialStatePath) {
    getInitialStatePath = '/rest/chat/initialState';
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
