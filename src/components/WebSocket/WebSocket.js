import React from "react";
import SockJsClient from "react-stomp";

export const WebSocket = ({
  chatApiUrl,
  userkeycloakId,
  destination,
  currentChat,
  handleConnect,
  handleDisconnect,
  handleMessage,
}) => {
  const topics = [`/topic/main.${destination}.${userkeycloakId}`];

  if (currentChat) {
    const { connectionKey, chatId } = currentChat;

    topics.push(`/topic/${connectionKey}.${destination}.${chatId}`);
  }

  return (
    <SockJsClient
      url={`${chatApiUrl}/ws`}
      topics={topics}
      onMessage={handleMessage}
      onConnect={handleConnect}
      onDisconnect={handleDisconnect}
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
      debug={true}
    />
  );
};
