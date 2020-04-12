import React, { useEffect, useRef, useState } from 'react';
import uuidv1 from 'uuid/v1';
import { Chat } from '../Chat';
import { dummyChatList, dummyMessagesText } from './dummyMessages';
import { sleep } from './chatStoryFunctions';

export const ChatStory = ({
  initialMessages = [],
  isMaximizedOnly = false,
  error,
  isBlocked = false,
  blockedMessage = undefined,
  initialChatList = [],
  loadingEnabled = false,
}) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [chatList, setChatList] = useState(initialChatList);
  const [blocked, setBlocked] = useState(isBlocked);
  const chatClient = useRef(null);
  const totalUnread = useRef(
    initialChatList.reduce((total, c) => total + c.unread, 0)
  );
  const isMultipleChat = chatList.length > 0;

  useEffect(() => {
    async function setTimeToWait() {
      setBlocked(false);
      setMessages([]);
      setIsLoading(true);
      await sleep(10000);
      setBlocked(isBlocked);
      setMessages(initialMessages);
      setIsLoading(false);
    }

    if (loadingEnabled) {
      setTimeToWait().then(() => {});
    }
  }, [loadingEnabled, isBlocked, initialMessages]);

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

  const sendMediaToBackend = (file, title, id, noTitle) => {
    // Mocking change state to delivered
    setTimeout(() => mockStatusMessage(id, 'delivered'), 2000);

    // Mocking send to a local echo backend
    setTimeout(() => echoMediaBackend(file, title, noTitle), 5000);
  };

  const echoMediaBackend = (file, title, noTitle) => {
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
        title: noTitle ? undefined : title,
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
      const titleAsMessage =
        Object.keys(files).length > 1 ||
        (files[Object.keys(files)[0]] !== undefined &&
          files[Object.keys(files)[0]].mediaType.startsWith('application'));

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
            title: titleAsMessage ? undefined : title,
          });
          return copyPrevMessages;
        });

        if (!error) {
          sendMediaToBackend(files[uid], title, localId, titleAsMessage);
        }
      });
      if (titleAsMessage) {
        onMessageSend(title);
      }
    }
  };

  const onMessageResend = id => {
    // mock sending to backend
    mockStatusMessage(id, 'sending');

    // mock error again sending the message
    setTimeout(() => mockStatusMessage(id, 'error'), 1000);
  };

  const onBackToChatList = () => {
    // States to unset client
    chatClient.current = null;
    setMessages([]);

    // Dummy fetch chat list
    setIsLoading(true);
    setTimeout(() => {
      // Count total unread
      totalUnread.current = dummyChatList.reduce(
        (total, c) => total + c.unread,
        0
      );

      // Set the array
      setChatList([...dummyChatList]);
      setIsLoading(false);
    }, 2000);
  };

  const onSelectedChat = chatClintClicked => {
    chatClient.current = chatClintClicked;

    // Dummy fetch chat messages of chatClintClicked.chatId
    setIsLoading(true);
    setTimeout(() => {
      setMessages([...dummyMessagesText]);
      setIsLoading(false);
    }, 3000);
  };

  const getSubtitle = defaultSub => {
    if (chatClient.current !== null) {
      return `${chatClient.current.name} - ${chatClient.current.phone}`;
    }
    return defaultSub;
  };

  // Defined according how is using the chat: with contact list or simple
  const defaultSub =
    isMultipleChat > 0
      ? `${totalUnread.current} mensagens não lidas`
      : 'Última mensagem 10/10/2019 10:10';

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
        isBlocked={blocked}
        disabledSend={isLoading && messages.length === 0}
        blockedMessage={blockedMessage}
        messages={messages}
        title={isMultipleChat ? 'Transportadora Gomes' : 'Felipe Rodrigues'}
        subtitle={getSubtitle(defaultSub)}
        onMessageSend={onMessageSend}
        onAudio={onAudioSend}
        onMediaSend={onMediaSend}
        onMessageResend={onMessageResend}
        isLoading={isLoading}
        chatList={isMultipleChat > 0 ? chatList : undefined}
        notificationNumber={totalUnread.current}
        onBackToChatList={onBackToChatList}
        onSelectedChat={onSelectedChat}
      />
    </div>
  );
};
