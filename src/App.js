import React, {useEffect, useState, useRef} from 'react';
import {FixedWrapper, ThemeProvider} from '@livechat/ui-kit'
import Maximized from "./Maximized";

import SockJsClient from 'react-stomp';

import moment from "moment";
import defaultFetch from "./util";

const themes = {
  defaultTheme: {
    FixedWrapperMaximized: {
      css: {
        height: '600px',
        width: '500px',
        boxShadow: '0 0 1em rgba(0, 0, 0, 0.1)',
      },
    },
    Bubble: {
      css: {
        backgroundColor: '#ccc',
      }
    },
    TextComposer: {
      css: {
        borderTop: '1px solic #ccc',
      }
    }
  },
};

const chatId = 'bb7f1fe6-6a8e-4975-9b5f-20635673e542@tunnel.msging.net';
const fromId = chatId;
let clientRef;

const buildChatMessageObject = (externalMessage) => {
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

function App() {

  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    defaultFetch(`/api/messages/${chatId}?page=0&size=100`, 'GET', {}).then(pageResults => {
      const messages = pageResults.content.map((externalMessage) => {
        return buildChatMessageObject(externalMessage);
      });
      setMessages(messages);
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    });
  }, [setMessages, messagesEndRef]);

  const handleNewExternalMessage = (newMessage) => {
    if (newMessage.type === 'CHAT' && newMessage.from !== fromId) {
      let message = buildChatMessageObject(newMessage);
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

    clientRef.sendMessage(
      '/chat/sendMessage/room/' + chatId,
      JSON.stringify(chatMessage)
    );
  };

  return (
    <div className="App">
      <ThemeProvider theme={themes.defaultTheme}>
        <div>
          <FixedWrapper.Root maximizedOnInit>
            <FixedWrapper.Maximized>
              <Maximized messages={messages}
                         onMessageSend={text => {
                           handleNewUserMessage(text);

                           let message = {
                             at: moment(Date.now()).format('DD/MM/YYYY HH:mm'),
                             own: true,
                             id: '' + Date.now(),
                             text: text,
                           };

                           let newMessages = [...messages, message];
                           setMessages(newMessages);
                         }}
                         messagesEndRef={messagesEndRef}/>
            </FixedWrapper.Maximized>
          </FixedWrapper.Root>
        </div>
      </ThemeProvider>

      <SockJsClient
        url={`http://localhost:8080/ws`}
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

export default App;
