import React, { useRef } from "react";
import SockJsClient from "react-stomp";

const debug = new URLSearchParams(window.location.search).has(
  "__chat_debug_mode__"
);

if (debug) {
  console.log("Debug Mode");
}

export const InitWebSockets = ({
  chatApiUrl,
  userkeycloakId,
  destination,
  handleConnect,
  handleDisconnect,
  handleMessage,
}) => {
  const webSocketRef = useRef();

  const onMessage = (message) => {
    handleMessage(message);
  };

  const onConnect = () => {
    console.log("WebSocket Connected");
    handleConnect(webSocketRef);
  };

  const onDisconnect = () => {
    console.log("WebSocket Disconnected");
    handleDisconnect(webSocketRef);
  };

  const options = {
    transports: [
      "websocket",
      "xhr-polling",
      "iframe-xhr-polling",
      "xhr-streaming",
      "iframe-htmlfile",
      "iframe-eventsource",
    ],
  };

  return (
    <SockJsClient
      url={`${chatApiUrl}/ws`}
      topics={[`/topic/main.${destination}.${userkeycloakId}`]}
      onMessage={onMessage}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      ref={webSocketRef}
      options={options}
      debug={debug}
    />
  );
};
