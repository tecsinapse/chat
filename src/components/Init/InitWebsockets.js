import React from "react";
import SockJsClient from "react-stomp";

export const InitWebsockets = ({
  chatApiUrl,
  userkeycloakId,
  chatIds,
  connectionKeys,
  destination,
  onChatUpdated,
  mainSocketClientRefs,
}) => {
  const onConnectMainSocket = (connectionKey) => {
    mainSocketClientRefs[connectionKey].sendMessage(
      `/chat/addUser/main/${connectionKey}/${destination}/${userkeycloakId}`,
      JSON.stringify({ chatIds: chatIds }) // informação dos chats que esse usuário está acompanhando
    );
  };

  const handleNewMainWebsocketMessage = (updatedChatInfo) => {
    if (updatedChatInfo) {
      onChatUpdated(updatedChatInfo);
    }
  };

  return (
    <>
      {/* Conexões WebSocket com o tecsinapse-chat */}
      {connectionKeys.map((connectionKey) => (
        <SockJsClient
          key={connectionKey}
          url={`${chatApiUrl}/ws`}
          topics={[`/topic/main.${userkeycloakId}`]}
          onMessage={handleNewMainWebsocketMessage}
          onConnect={() => onConnectMainSocket(connectionKey)}
          ref={(client) => (mainSocketClientRefs[connectionKey] = client)}
        />
      ))}
    </>
  );
};
