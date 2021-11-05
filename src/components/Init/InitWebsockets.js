import React from "react";
import SockJsClient from "react-stomp";
import { NotificationType } from "../../constants";
import { momentNow } from "../../utils/dates";
import ReactGA from "react-ga4";

const debug = new URLSearchParams(window.location.search).has(
  "__chat_debug_mode__"
);

if (debug) {
  console.log("Debug Mode");
}

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
    console.log("WebSocket Connected");
    // notifica a conexão do socket
    setConnectedAt(momentNow());

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
      ReactGA.event({
        category: message.connectionKey,
        action: "Received Message",
        nonInteraction: true,
      });
    }
  };

  const onDisconnect = () => console.log("WebSocket Disconnected"); // eslint-disable-line no-console

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
      topics={[`/topic/main.${userkeycloakId}`]}
      onMessage={handleNewMainWebsocketMessage}
      onConnect={onConnectMainSocket}
      onDisconnect={onDisconnect}
      ref={mainSocketRef}
      options={options}
      debug={debug}
    />
  );
};

export default React.memo(InitWebsockets, (oldProps, newProps) => {
  const { connectionKeys: old } = oldProps;
  const { connectionKeys: news } = newProps;

  return JSON.stringify(old) === JSON.stringify(news);
});
