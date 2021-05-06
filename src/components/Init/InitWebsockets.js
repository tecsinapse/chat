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
  setReceivedMessage,
  setConnectedAt,
  mainSocketRef,
}) => {
  const onConnectMainSocket = () => {
    // notifica a conexão do socket
    setConnectedAt(Date.now());

    connectionKeys.forEach((connectionKey) => {
      const addUser = `/chat/addUser/main/${connectionKey}/${destination}/${userkeycloakId}`;
      try {
        // informação dos chats que esse usuário está acompanhando
        const payload = JSON.stringify({ chatIds });
        mainSocketRef.current.sendMessage(addUser, payload);
      } catch (e) {
        console.log(e);
      }
    });
  };

  const handleNewMainWebsocketMessage = (message) => {
    if (message) {
      if (NotificationType.isRefreshUI(message)) {
        reloadComponent();
      } else if (message.type === "CHAT") {
        setReceivedMessage(message);
      } else {
        onChatUpdated(message);
      }
    }
  };

  const onDisconnect = () => console.log("Disconnected"); // eslint-disable-line no-console

  return (
    <SockJsClient
      url={`${chatApiUrl}/ws`}
      topics={[`/topic/main.${userkeycloakId}`]}
      onMessage={handleNewMainWebsocketMessage}
      onConnect={onConnectMainSocket}
      onDisconnect={onDisconnect}
      ref={mainSocketRef}
    />
  );
};

export default React.memo(InitWebsockets, (oldProps, newProps) => {
  const { connectionKeys: old } = oldProps;
  const { connectionKeys: news } = newProps;

  return JSON.stringify(old) === JSON.stringify(news);
});
