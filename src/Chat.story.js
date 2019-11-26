import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';

import { DivFlex } from '@tecsinapse/ui-kit/build/withFlexCenter';
import { Chat } from './Chat';

const ChatWrapper = ({ isBlocked, blockedMessage, isMaximizedOnly }) => {
  const [messages, setMessages] = useState([]);

  const sendToBackend = text => {
    // Mocking send to a local echo backend (1s)
    setTimeout(() => echoBackend(text), 1000);
  };

  const echoBackend = newMessage => {
    setMessages(prevMessage => [
      ...prevMessage,
      {
        at: '02/03/2019 10:12',
        own: false,
        id: Date.now().toString(),
        text: newMessage,
      },
    ]);
  };

  const sendAudioToBackend = blob => {
    // Mocking send to a local echo backend (1s)
    setTimeout(() => echoAudioBackend(blob), 3000);
  };

  const echoAudioBackend = blob => {
    setMessages(prevMessage => [
      ...prevMessage,
      {
        at: '02/03/2019 10:12',
        own: false,
        id: Date.now().toString(),
        medias: [
          {
            mediaType: 'audio',
            url: blob.blobURL,
          },
        ],
      },
    ]);
  };

  const sendMediaToBackend = (file, title) => {
    // Mocking send to a local echo backend (1s)
    setTimeout(() => echoMediaBackend(file, title), 3000);
  };

  const echoMediaBackend = (file, title) => {
    setMessages(prevMessage => [
      ...prevMessage,
      {
        at: '02/03/2019 10:12',
        own: false,
        id: Date.now().toString(),
        medias: [
          {
            mediaType: file.mediaType,
            url: file.data,
            name: file.name,
            // size: file.size, emulate scenario without size from backend
          },
        ],
        title,
      },
    ]);
  };

  return (
    <Chat
      isMaximizedOnly={isMaximizedOnly}
      isBlocked={isBlocked}
      blockedMessage={blockedMessage}
      messages={messages}
      title="Felipe Rodrigues"
      subtitle="Última mensagem 10/10/2019 10:10"
      onMessageSend={text => {
        setMessages(prevMessage => [
          ...prevMessage,
          {
            at: '02/03/2019 10:12',
            own: true,
            id: Date.now().toString(),
            authorName: 'Você',
            text,
          },
        ]);

        sendToBackend(text);
      }}
      onAudio={blob => {
        if (blob !== null) {
          setMessages(prevMessage => [
            ...prevMessage,
            {
              at: '02/03/2019 10:12',
              own: true,
              id: Date.now().toString(),
              authorName: 'Você',
              medias: [
                {
                  mediaType: 'audio',
                  url: blob.blobURL,
                },
              ],
            },
          ]);

          sendAudioToBackend(blob);
        }
      }}
      // onCloseChat={(e) => console.log(e)}

      onMediaSend={(title, files) => {
        if (files !== null) {
          Object.keys(files).forEach((uid, i) => {
            setMessages(prevMessage => [
              ...prevMessage,
              {
                at: '02/03/2019 10:12',
                own: true,
                id: Date.now().toString(),
                authorName: 'Você',
                medias: [
                  {
                    mediaType: files[uid].mediaType,
                    url: files[uid].data,
                    name: files[uid].name,
                    size: files[uid].size,
                  },
                ],
                title,
              },
            ]);

            sendMediaToBackend(files[uid], title);
          });
        }
      }}
    />
  );
};

storiesOf(`Chat`, module)
  .addDecorator(story => <DivFlex>{story()}</DivFlex>)
  .add('Chat', () => (
    <div
      style={{
        width: '400px',
        height: '550px',
        position: 'fixed',
        right: '1em',
        bottom: '-50px',
      }}
    >
      {/* Only renders inside the given div */}
      <ChatWrapper />
    </div>
  ))
  .add('Chat Blocked', () => (
    <div
      style={{
        width: '400px',
        height: '550px',
        position: 'fixed',
        right: '1em',
        bottom: '-50px',
      }}
    >
      {/* Only renders inside the given div */}
      <ChatWrapper
        isMaximizedOnly
        isBlocked
        blockedMessage="Já se passaram 24h desde a última mensagem enviada pelo cliente, 
          por isso não é possível enviar nova mensagem por esse canal de comunicação, por favor, 
          entre em contato com o cliente por outro meio."
      />
    </div>
  ));
