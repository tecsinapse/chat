import React, {useRef} from "react";
import SockJsClient from "react-stomp";

export const InitWebsockets = ({
                                 chatApiUrl,
                                 userkeycloakId,
                                 chatIds,
                                 connectionKey,
                                 onChatUpdated,
                                 reloadComponent,
                               }) => {

  let mainSocketClientRef = useRef();
  let productSocketClientRef = useRef();

  const onConnectMainSocket = () => {
    mainSocketClientRef.sendMessage(
      `/chat/addUser/main/${connectionKey}/${userkeycloakId}`,
      JSON.stringify({chatIds: chatIds}) // informação dos chats que esse usuário está acompanhando
    );
  };

  const handleNewMainWebsocketMessage = updatedChatInfo => {
    console.log(updatedChatInfo);
    onChatUpdated(updatedChatInfo);
  };

  const handleNewProductWebsocketMessage = () => {
    console.log('handleNewProductWebsocketMessage');
    reloadComponent();
    // TODO reload chat component
  };

  return (
    <>
      {/* Conexão WebSocket com o tecsinapse-chat */}
      <SockJsClient
        url={`${chatApiUrl}/ws`}
        topics={[`/topic/main.${userkeycloakId}`]}
        onMessage={handleNewMainWebsocketMessage}
        onConnect={onConnectMainSocket}
        ref={client => (mainSocketClientRef = client)}
      />
      {/* Conexão WebSocket com o produto (dynamo peças / dynamo contato ativo / etc.. */}
      <SockJsClient
        url={`${process.env.NODE_ENV === 'development' ? 'http://localhost:8282' : ''}/ws/chat`}
        topics={[`/topic/chat.user.${userkeycloakId}`]}
        onMessage={handleNewProductWebsocketMessage}
        onConnect={(a) => {
          console.log(a);
        }}
        ref={client => (productSocketClientRef = client)}
      />
    </>
  );
};
