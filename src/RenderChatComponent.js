import React, {useEffect, useRef, useState} from 'react';
import {FixedWrapper, ThemeProvider} from '@livechat/ui-kit'
import Maximized from "./Maximized";

import SockJsClient from 'react-stomp';

import moment from "moment";
import defaultFetch from "./util";

const themes = {
  defaultTheme: {
    FixedWrapperRoot: {
      css: {
        position: 'inherit',
        right: 0,
        left: 0,
        top: 0,
        bottom: 0,
        fontFamily: "'Roboto',sans-serif",
        fontSize: '10pt',
        color: '#262626',
        padding: 0,
        margin: 0,
      },
    },
    FixedWrapperMaximized: {
      css: {
        position: 'inherit',
        right: 0,
        left: 0,
        width: '100%',
        padding: 0,
        margin: 0,
      },
    },
    MessageList: {
      css: {
        backgroundColor: '#eceff1',
        height: '100%',
        padding: 0,
        margin: 0,
      }
    },
    TextComposer: {
      css: {
        borderTop: '1px solic #ccc',
      }
    },
    TitleBar: {
      css: {
        backgroundColor: '#404040',
        color: '#fff',
        height: '100%',
        padding: 0,
      }
    },
    Bubble: {
      css: {
        padding: '0.6em',
      }
    },
    MessageText: {
      css: {
        padding: '0.3em',
        color: '#262626',
      }
    }
  },
};

let clientRef;

const buildChatMessageObject = (externalMessage, fromId) => {
  let message = {
    at: moment(externalMessage.at).format('DD/MM/YYYY HH:mm'),
    own: externalMessage.from !== fromId,
    id: externalMessage.messageId,
    text: externalMessage.text,
  };

  if (externalMessage.medias.length > 0) {
    // when with media, show title instead of text
    delete message.text;
    message.title = externalMessage.text;

    message.medias = externalMessage.medias.map((media) => {
      return {
        url: media.url,
        mediaType: media.mediaType,
      };
    });
  }
  return message;
};

function RenderChatComponent(props) {
  const {chatApiUrl, chatId, disabled} = props;
  const fromId = chatId;

  const [messages, setMessages] = useState([]);
  const [lastMessageAt, setLastMessageAt] = useState(null);

  const [webSocketError, setWebSocketError] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    defaultFetch(`${chatApiUrl}/api/messages/${chatId}?page=0&size=100`, 'GET', {}).then(pageResults => {
      const messages = pageResults.content.map((externalMessage) => {
        return buildChatMessageObject(externalMessage, fromId);
      });
      setMessages(messages);
      setLastMessageAt(messages.length > 0 ? messages[messages.length - 1].at : null);
      setTimeout(function () {
        // workaround to wait for all elements to render
        messagesEndRef.current.scrollIntoView({block: 'end', behavior: "smooth"})
      }, 700);
    });
  }, [setMessages, messagesEndRef, fromId, chatApiUrl, chatId, lastMessageAt]);

  const handleNewExternalMessage = (newMessage) => {
    if (newMessage.type === 'CHAT') {
      let message = buildChatMessageObject(newMessage, fromId);
      let newMessages = [...messages, message];
      setMessages(newMessages);
    }
  };

  const onConnect = () => {
    const chatMessage = {
      from: fromId,
      type: 'JOIN',
    };

    clientRef.sendMessage(
      '/chat/addUser/room/' + chatId,
      JSON.stringify(chatMessage)
    );

  };

  const handleNewUserMessage = (newMessage) => {
    const chatMessage = {
      from: fromId,
      type: 'CHAT',
      text: newMessage,
    };

    try {
      clientRef.sendMessage(
        '/chat/sendMessage/room/' + chatId,
        JSON.stringify(chatMessage)
      );
      if (webSocketError) {
        setWebSocketError(false);
      }
    } catch (e) {
      console.log('Error with Websocket connection', e);
      setWebSocketError(true);
    }
  };

  return (
    <div className="App">
      <ThemeProvider theme={themes.defaultTheme}>
        <FixedWrapper.Root maximizedOnInit>
          <FixedWrapper.Maximized>
            <Maximized messages={messages}
                       onMessageSend={text => {
                         handleNewUserMessage(text);
                       }}
                       messagesEndRef={messagesEndRef}
                       disabled={disabled}
                       webSocketError={webSocketError}
                       lastMessageAt={lastMessageAt}/>
          </FixedWrapper.Maximized>
        </FixedWrapper.Root>
      </ThemeProvider>

      <SockJsClient
        url={`${chatApiUrl}/ws`}
        topics={['/topic/' + chatId]}
        onMessage={handleNewExternalMessage}
        onConnect={onConnect}
        ref={client => {
          clientRef = client;
        }}
      />
    </div>
  );
}

export default RenderChatComponent;
