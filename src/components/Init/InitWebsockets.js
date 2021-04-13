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
  mainSocketRef,
}) => {
  const onConnectMainSocket = () => {
    connectionKeys.forEach((connectionKey) => {
      mainSocketRef.current.sendMessage(
        `/chat/addUser/main/${connectionKey}/${destination}/${userkeycloakId}`,
        JSON.stringify({ chatIds }) // informação dos chats que esse usuário está acompanhando
      );
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
