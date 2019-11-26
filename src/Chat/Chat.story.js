import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import uuidv1 from 'uuid/v1';

import { Chat } from './Chat';
import { DivFlex } from '../withFlexCenter';
import { dummyMessagesText, dummyMessagesMedia } from './dummyMessages';

const ChatWrapper = ({
  initialMessages = [],
  isMaximizedOnly = false,
  error,
  isBlocked = false,
  blockedMessage = undefined,
}) => {
  const [messages, setMessages] = useState(initialMessages);

  const mockStatusMessage = (id, status) => {
    setMessages(prevMessages => {
      const copyMessages = [...prevMessages];
      const message = copyMessages.find(m => m.localId === id);
      message.status = status;
      return copyMessages;
    });
  };

  const sendToBackend = (text, id) => {
    // Mocking change state to delivered
    setTimeout(() => mockStatusMessage(id, 'delivered'), 1000);

    // Mocking send to a local echo backend
    setTimeout(() => echoBackend(text), 3000);
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

  const sendAudioToBackend = (blob, id) => {
    // Mocking change state to delivered
    setTimeout(() => mockStatusMessage(id, 'delivered'), 2000);

    // Mocking send to a local echo backend
    setTimeout(() => echoAudioBackend(blob), 4000);
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

  const sendMediaToBackend = (file, title, id) => {
    // Mocking change state to delivered
    setTimeout(() => mockStatusMessage(id, 'delivered'), 2000);

    // Mocking send to a local echo backend
    setTimeout(() => echoMediaBackend(file, title), 5000);
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

  const onMessageSend = text => {
    const localId = uuidv1();
    setMessages(prevMessages => {
      const copyPrevMessages = [...prevMessages];
      copyPrevMessages.push({
        at: '02/03/2019 10:12',
        own: true,
        id: Date.now().toString(),
        authorName: 'Você',
        status: 'sending',
        text,
        localId,
      });
      return copyPrevMessages;
    });
    if (!error) {
      sendToBackend(text, localId);
    }
  };

  const onAudioSend = blob => {
    if (blob !== null) {
      const localId = uuidv1();
      setMessages(prevMessages => {
        const copyPrevMessages = [...prevMessages];
        copyPrevMessages.push({
          at: '02/03/2019 10:12',
          own: true,
          id: Date.now().toString(),
          authorName: 'Você',
          status: 'sending',
          localId,
          medias: [
            {
              mediaType: 'audio',
              url: blob.blobURL,
            },
          ],
        });
        return copyPrevMessages;
      });

      if (!error) {
        sendAudioToBackend(blob, localId);
      }
    }
  };

  const onMediaSend = (title, files) => {
    if (files !== null) {
      Object.keys(files).forEach((uid, i) => {
        const localId = uuidv1();
        setMessages(prevMessages => {
          const copyPrevMessages = [...prevMessages];
          copyPrevMessages.push({
            at: '02/03/2019 10:12',
            own: true,
            id: Date.now().toString(),
            authorName: 'Você',
            status: 'sending',
            localId,
            medias: [
              {
                mediaType: files[uid].mediaType,
                url: files[uid].data,
                name: files[uid].name,
                size: files[uid].size,
              },
            ],
            title,
          });
          return copyPrevMessages;
        });

        if (!error) {
          sendMediaToBackend(files[uid], title, localId);
        }
      });
    }
  };

  const onMessageResend = id => {
    // mock sending to backend
    mockStatusMessage(id, 'sending');

    // mock error again sending the message
    setTimeout(() => mockStatusMessage(id, 'error'), 1000);
  };

  return (
    <div
      style={{
        width: '400px',
        height: '550px',
        position: 'fixed',
        right: '1em',
        bottom: '-50px',
      }}
    >
      <Chat
        error={error}
        isMaximizedOnly={isMaximizedOnly}
        isBlocked={isBlocked}
        blockedMessage={blockedMessage}
        messages={messages}
        title="Felipe Rodrigues"
        subtitle="Última mensagem 10/10/2019 10:10"
        onMessageSend={onMessageSend}
        onAudio={onAudioSend}
        onMediaSend={onMediaSend}
        onMessageResend={onMessageResend}
      />
    </div>
  );
};

storiesOf(`Chat`, module)
  .addDecorator(story => <DivFlex>{story()}</DivFlex>)
  .add('Chat Echo', () => <ChatWrapper isMaximizedOnly />)
  .add('Status Text', () => (
    <ChatWrapper isMaximizedOnly initialMessages={dummyMessagesText} />
  ))
  .add('Status Image', () => (
    <ChatWrapper initialMessages={dummyMessagesMedia} isMaximizedOnly />
  ))
  .add('Error Connection', () => (
    <ChatWrapper isMaximizedOnly error="Erro de conexão. Tente mais tarde!" />
  ))
  .add('Chat Blocked', () => (
    <ChatWrapper
      isMaximizedOnly
      isBlocked
      blockedMessage="Já se passaram 24h desde a última mensagem enviada pelo cliente, 
          por isso não é possível enviar nova mensagem por esse canal de comunicação, por favor, 
          entre em contato com o cliente por outro meio."
    />
  ));
