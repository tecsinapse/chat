import React from "react";
import SockJsClient from "react-stomp";
import ReactGA from "react-ga4";
import { NotificationType } from "../../constants";
import { momentNow } from "../../utils/dates";

const debug = new URLSearchParams(window.location.search).has(
  "__chat_debug_mode__"
);

if (debug) {
  console.log("Debug Mode");
}

const InitWebsockets = ({
  chatApiUrl,
  userkeycloakId,
  destination,
  reloadComponent,
  onChatUpdated,
  setReceivedMessage,
  setConnectedAt,
  mainSocketRef,
  onConnectMainSocket,
  componentInfo,
}) => {
  const handleNewMainWebsocketMessage = (message) => {
    if (message) {
      if (NotificationType.isRefreshUI(message)) {
        reloadComponent();
      } else if (message.type === "CHAT") {
        setReceivedMessage(message);
      } else {
        ReactGA.event({
          category: message.connectionKey,
          action: "Unread Message",
          nonInteraction: true,
        });
        onChatUpdated(componentInfo, message);
      }
    }
  };

  const onConnect = () => {
    console.log("WebSocket Connected");
    // notifica a conexão do socket
    setConnectedAt(momentNow());
    onConnectMainSocket();
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
      topics={[`/topic/main.${destination}.${userkeycloakId}`]}
      onMessage={handleNewMainWebsocketMessage}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      ref={mainSocketRef}
      options={options}
      debug={debug}
    />
  );
};

export default React.memo(InitWebsockets, (oldProps, newProps) => {
  const {
    connectionKeys: oldConnectionKeys,
    componentInfo: oldComponentInfo,
  } = oldProps;
  const {
    connectionKeys: newConnectionKeys,
    componentInfo: newComponentInfo,
  } = newProps;

  return (
    JSON.stringify(oldConnectionKeys) === JSON.stringify(newConnectionKeys) &&
    JSON.stringify(oldComponentInfo) === JSON.stringify(newComponentInfo)
  );
});
