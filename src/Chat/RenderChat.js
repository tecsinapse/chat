import React, {useEffect, useRef, useState} from "react";
import {Chat} from "@tecsinapse/chat/build/Chat";
import SockJsClient from "react-stomp";

import {defaultFetch} from "../Util/fetch";
import {buildChatMessageObject, buildSendingMessage, setStatusMessageFunc} from "../Util/message";
import uuidv1 from "uuid/v1";
import moment from "moment";

const emptyChat = {
  chatId: null,
  status: null,
  name: null,
  phone: null,
  lastMessage: null,
  unread: 0,
};

const loadChatList = (initialInfo, chatApiUrl, setChats, setIsLoading) => {
  const chatIds = initialInfo.chats.map(chat => chat.chatId).join(',');
  defaultFetch(`${chatApiUrl}/api/chats/${chatIds}/infos`, "GET", {}).then(
    completeChatInfos => {
      const chats = [];
      completeChatInfos.forEach(completeInfo => {
        // considerando a possibilidade de que o objeto inicial tenha essas informações preenchidas
        // caso positivo, devem ser consideradas com maior procedência do que a informação retornada do chatApi
        const info = initialInfo.chats.filter(chat => chat.chatId === completeInfo.chatId)[0];
        completeInfo.name = info.name || completeInfo.name;
        completeInfo.phone = info.phone || completeInfo.phone;
        completeInfo.lastMessageAt = moment(completeInfo.lastMessageAt).format('DD/MM/YYYY HH:mm');

        chats.push(completeInfo);
      });
      setChats(chats);
      setIsLoading(false);
    }
  );
};

export const RenderChat = ({
                             chatApiUrl,
                             initialInfo,
                             disabled,
                           }) => {

  const [isLoading, setIsLoading] = useState(true);
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(emptyChat);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [messages, setMessages] = useState([]);
  const [blocked, setBlocked] = useState(false);

  const messagesEndRef = useRef(null);
  let clientRef = useRef();
  const setStatusMessage = setStatusMessageFunc(setMessages);

  useEffect(() => {

    loadChatList(initialInfo, chatApiUrl, setChats, setIsLoading);
  }, [
    initialInfo,
    chatApiUrl,
    setChats
  ]);

  const handleNewExternalMessage = newMessage => {
    // Append received message when client message or
    // it comes from tec-chat (not create by the user)
    if (newMessage.type === "CHAT") {
      if (newMessage.from === currentChat.chatId || newMessage.localId === undefined) {
        let message = buildChatMessageObject(newMessage, currentChat.chatId);
        setMessages([...messages, message])
      } else {
        setStatusMessage(newMessage.localId, "delivered");
      }
    }
  };

  const onConnect = () => {
    const chatMessage = {
      from: currentChat.chatId,
      type: "JOIN"
    };

    clientRef.sendMessage(
      "/chat/addUser/room/" + currentChat.chatId,
      JSON.stringify(chatMessage)
    );
  };

  const handleNewUserMessage = (newMessage, localId) => {
    const chatMessage = {
      from: currentChat.chatId,
      type: "CHAT",
      text: newMessage,
      localId: localId
    };

    try {
      clientRef.sendMessage(
        "/chat/sendMessage/room/" + currentChat.chatId,
        JSON.stringify(chatMessage)
      );
    } catch (e) {
      setStatusMessage(localId, 'error');
    }
  };

  const handleNewUserFiles = (title, files) => {
    Object.keys(files).forEach((uid, i) => {
      setMessages(prevMessages => {
        const copyPrevMessages = [...prevMessages];
        copyPrevMessages.push(
          buildSendingMessage(uid, undefined, title, files[uid])
        );
        return copyPrevMessages;
      });
      sendData(uid, title, files[uid].file);
    });
  };

  const sendData = (localId, title, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("localId", localId);
    if (title) {
      formData.append("title", title);
    }

    defaultFetch(
      `${chatApiUrl}/api/chats/${currentChat.chatId}/upload`,
      "POST",
      {},
      formData
    )
      .then(() => {
      })
      .catch(err => {
        if (err.status === 403) {
          setBlocked(true);
        }
        setStatusMessage(localId, "error");
      });
  };

  const loadMore = () => {
    if (isLoading || !hasMore) {
      return;
    }
    setIsLoading(true);
    defaultFetch(
      `${chatApiUrl}/api/chats/${currentChat.chatId}/messages?page=${page}&size=50`,
      "GET",
      {}
    ).then(pageResults => {
      const loadedMessages = pageResults.content
        .map(externalMessage => {
          return buildChatMessageObject(externalMessage, currentChat.chatId);
        })
        .reverse();
      setMessages(loadedMessages.concat(messages));
      setIsLoading(false);
      setHasMore(!pageResults.last);
      setPage(page + 1);
    });
  };

  const onSelectedChat = (chat) => {
    setIsLoading(true);

    defaultFetch(
      `${chatApiUrl}/api/chats/${chat.chatId}/messages?page=0&size=50`,
      "GET",
      {}
    ).then(pageResults => {
      const messages = pageResults.content
        .map(externalMessage => {
          return buildChatMessageObject(externalMessage, chat.chatId);
        })
        .reverse();
      setMessages(messages);
      setCurrentChat(chat);
      setBlocked(chat.status === 'BLOCKED');
      setIsLoading(false);

      setTimeout(function () {
        // workaround to wait for all elements to render
        messagesEndRef.current.scrollIntoView({
          block: "end",
          behavior: "smooth"
        });
      }, 700);
    });
  };

  const onBackToChatList = () => {
    loadChatList(initialInfo, chatApiUrl, setChats, setIsLoading);
    setMessages([]);
    setCurrentChat(emptyChat);
    setBlocked(false);
    setPage(1);
    setHasMore(true);
  };

  const title = currentChat.name || initialInfo.name || 'Cliente';
  let subTitle = currentChat.phone ? currentChat.phone : '';

  return (
    <div className="App">
      <Chat
        messages={messages}
        onMessageSend={text => {
          const localId = uuidv1();
          setMessages(prevMessages => {
            const copyPrevMessages = [...prevMessages];
            copyPrevMessages.push(buildSendingMessage(localId, text));
            return copyPrevMessages;
          });
          // send to user and waits for response
          handleNewUserMessage(text, localId);
        }}
        messagesEndRef={messagesEndRef}
        disabled={disabled}
        isMaximizedOnly
        onAudio={blob => {
          const localId = uuidv1();
          setMessages(prevMessages => {
            const copyPrevMessages = [...prevMessages];
            copyPrevMessages.push(
              buildSendingMessage(
                localId,
                undefined,
                undefined,
                {
                  mediaType: "audio",
                  data: blob.blobURL
                },
                blob.blob
              )
            );
            return copyPrevMessages;
          });

          // send to user and waits for response
          sendData(localId, undefined, blob.blob);
        }}
        title={title}
        subtitle={subTitle}
        onMediaSend={handleNewUserFiles}
        isLoading={isLoading}
        loadMore={loadMore}
        onMessageResend={localId => {
          // Change message status
          setStatusMessage(localId, "sending");

          // Resend to backend
          const message = messages.find(m => m.localId === localId);
          if (message && message.medias && message.medias.length > 0) {
            message.medias.forEach(media =>
              sendData(localId, message.title, media.data)
            );
          } else if (message && message.text) {
            handleNewUserMessage(message.text, localId);
          }
        }}
        isBlocked={blocked}
        blockedMessage={`Já se passaram 24h desde a última mensagem enviada pelo cliente, 
        por isso não é possível enviar nova mensagem por esse canal de comunicação. 
        Por favor, entre em contato com o cliente por outro meio`}
        chatList={chats}
        onBackToChatList={onBackToChatList}
        onSelectedChat={onSelectedChat}
      />

      {currentChat.chatId &&
      <SockJsClient
        url={`${chatApiUrl}/ws`}
        topics={["/topic/" + currentChat.chatId]}
        onMessage={handleNewExternalMessage}
        onConnect={onConnect}
        ref={client => (clientRef = client)}
      />
      }
    </div>
  );
};
