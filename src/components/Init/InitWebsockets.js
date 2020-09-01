import React, {createRef, useRef} from "react";
import SockJsClient from "react-stomp";

export const InitWebsockets = ({
                                 chatApiUrl,
                                 userkeycloakId,
                                 chatIds,
                                 connectionKeys,
                                 destination,
                                 onChatUpdated,
                                 reloadComponent,
                               }) => {
  let mainSocketClientRefs = {};
  connectionKeys.forEach(connectionKey => {
    mainSocketClientRefs[connectionKey] = createRef();
  })
  let productSocketClientRef = useRef();

  const onConnectMainSocket = (connectionKey) => {
    console.log(`connected to ${connectionKey} websocket`);
    mainSocketClientRefs[connectionKey].sendMessage(
      `/chat/addUser/main/${connectionKey}/${destination}/${userkeycloakId}`,
      JSON.stringify({chatIds: chatIds}) // informação dos chats que esse usuário está acompanhando
    );
  };

  const handleNewMainWebsocketMessage = updatedChatInfo => {
    onChatUpdated(updatedChatInfo);
  };

  const handleNewProductWebsocketMessage = () => {
    reloadComponent();
  };

  return (
    process.env.NODE_ENV === "development" ? <></>
      : <>
        {/* Conexões WebSocket com o tecsinapse-chat */}
        {connectionKeys.forEach(connectionKey => (
          <SockJsClient
            url={`${chatApiUrl}/ws`}
            topics={[`/topic/main.${userkeycloakId}`]}
            onMessage={handleNewMainWebsocketMessage}
            onConnect={() => onConnectMainSocket(connectionKey)}
            ref={client => (mainSocketClientRefs[connectionKey] = client)}
          />
        ))}

        {/* Conexão WebSocket com o produto (dynamo peças / dynamo contato ativo / etc.. */}
        <SockJsClient
          url={`${process.env.NODE_ENV === 'development' ? 'http://localhost:8282' : ''}/websocket/chat`}
          topics={[`/topic/chat.user.${userkeycloakId}`]}
          onMessage={handleNewProductWebsocketMessage}
          onConnect={() => {
            console.log('connected to productSocketClientRef')
          }}
          ref={client => (productSocketClientRef = client)}
        />
      </>
  );
};
