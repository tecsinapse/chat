import React, { useRef } from "react";
import SockJsClient from "react-stomp";

const debug = new URLSearchParams(window.location.search).has(
  "__chat_debug_mode__"
);

if (debug) {
  // eslint-disable-next-line
  console.log("Debug Mode");
}

export const InitWebSockets = ({
  chatApiUrl,
  userkeycloakId,
  destination,
  currentChat,
  handleConnect,
  handleDisconnect,
  handleMessage,
}) => {
  const webSocketRef = useRef();

  const onMessage = (message) => {
    handleMessage(message);
  };

  const onConnect = () => {
    // eslint-disable-next-line
    console.log("WebSocket Connected");
    handleConnect(webSocketRef);
  };

  const onDisconnect = () => {
    // eslint-disable-next-line
    console.log("WebSocket Disconnected");
    handleDisconnect(webSocketRef);
  };

  const topics = [`/topic/main.${destination}.${userkeycloakId}`];

  if (currentChat) {
    const { connectionKey, chatId } = currentChat;

    topics.push(`/topic/${connectionKey}.${destination}.${chatId}`);
  }

  return (
    <SockJsClient
      url={`${chatApiUrl}/ws`}
      topics={topics}
      onMessage={onMessage}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      ref={webSocketRef}
      options={{
        transports: [
          "websocket",
          "xhr-polling",
          "iframe-xhr-polling",
          "xhr-streaming",
          "iframe-htmlfile",
          "iframe-eventsource",
        ],
      }}
      debug={debug}
    />
  );
};
