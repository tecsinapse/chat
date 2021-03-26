import React from "react";
import SockJsClient from "react-stomp";
import { NotificationType } from "../../constants";

const InitWebsockets = ({
  chatApiUrl,
  userkeycloakId,
  chatIds,
  connectionKeys,
  destination,
  reloadComponent,
  onChatUpdated,
  mainSocketClientRefs,
}) => {
  const onConnectMainSocket = (connectionKey) => {
    mainSocketClientRefs[connectionKey].sendMessage(
      `/chat/addUser/main/${connectionKey}/${destination}/${userkeycloakId}`,
      JSON.stringify({ chatIds: chatIds }) // informação dos chats que esse usuário está acompanhando
    );
  };

  const handleNewMainWebsocketMessage = (message) => {
    if (message) {
      if (NotificationType.isRefreshUI(message)) {
        reloadComponent();
      } else {
        onChatUpdated(message);
      }
    }
  };

  return (
    <>
      {/* Conexões WebSocket com o tecsinapse-chat */}
      {connectionKeys.map((connectionKey) => {
        return (
          <SockJsClient
            key={connectionKey}
            url={`${chatApiUrl}/ws`}
            topics={[`/topic/main.${userkeycloakId}`]}
            onMessage={handleNewMainWebsocketMessage}
            onConnect={() => onConnectMainSocket(connectionKey)}
            onDisconnect={() => console.log("Disconnected")}
            ref={(client) => (mainSocketClientRefs[connectionKey] = client)}
            options={{ sessionId: () => userkeycloakId }}
          />
        );
      })}
    </>
  );
};

export default React.memo(InitWebsockets, (oldProps, newProps) => {
  const { connectionKeys: old } = oldProps;
  const { connectionKeys: news } = newProps;

  return JSON.stringify(old) === JSON.stringify(news);
});
