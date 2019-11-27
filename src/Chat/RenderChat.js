import React, { useEffect, useRef, useState } from "react";
import { Chat } from "@tecsinapse/chat/build/Chat";
import SockJsClient from "react-stomp";

import { defaultFetch } from "../Util/fetch";
import {
  buildChatMessageObject,
  buildSendingMessage,
  setStatusMessageFunc
} from "../Util/message";
import uuidv1 from "uuid/v1";

export const RenderChat = ({ chatApiUrl, chatId, clientName, disabled }) => {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [messages, setMessages] = useState([]);
  const [lastMessageAt, setLastMessageAt] = useState(null);
  const [name, setName] = useState("Cliente");
  const [blocked, setBlocked] = useState(false);

  const messagesEndRef = useRef(null);
  let clientRef = useRef();
  const fromId = chatId;
  const setStatusMessage = setStatusMessageFunc(setMessages);

  useEffect(() => {
    defaultFetch(`${chatApiUrl}/api/chats/${chatId}/status`, "GET", {}).then(
      status => {
        if (status === "BLOCKED") {
          setBlocked(true);
        }
      }
    );

    defaultFetch(
      `${chatApiUrl}/api/chats/${chatId}/messages?page=0&size=50`,
      "GET",
      {}
    ).then(pageResults => {
      const messages = pageResults.content
        .map(externalMessage => {
          return buildChatMessageObject(externalMessage, fromId);
        })
        .reverse();
      setMessages(messages);
      if (messages.length > 0) {
        setLastMessageAt(messages[messages.length - 1].at);
        const clientNamesFromMessages = pageResults.content.filter(
          externalMessage => {
            return externalMessage.name && externalMessage.name !== "";
          }
        );
        if (clientNamesFromMessages.length > 0) {
          setName(clientNamesFromMessages[0].name);
        }
      }

      setTimeout(function() {
        // workaround to wait for all elements to render
        messagesEndRef.current.scrollIntoView({
          block: "end",
          behavior: "smooth"
        });
      }, 700);
    });
  }, [
    messagesEndRef,
    lastMessageAt,
    setName,
    fromId,
    chatApiUrl,
    chatId,
    setBlocked
  ]);

  const handleNewExternalMessage = newMessage => {
    // Append received message when client message or
    // it comes from tec-chat (not create by the user)
    if (newMessage.type === "CHAT") {
      if (newMessage.from === fromId || newMessage.localId === undefined) {
        let message = buildChatMessageObject(newMessage, fromId);
        let newMessages = [...messages, message];
        setMessages(newMessages);
      } else {
        setStatusMessage(newMessage.localId, "delivered");
      }
    }
  };

  const onConnect = () => {
    const chatMessage = {
      from: fromId,
      type: "JOIN"
    };

    clientRef.sendMessage(
      "/chat/addUser/room/" + chatId,
      JSON.stringify(chatMessage)
    );
  };

  const handleNewUserMessage = (newMessage, localId) => {
    const chatMessage = {
      from: fromId,
      type: "CHAT",
      text: newMessage,
      localId: localId
    };

    try {
      clientRef.sendMessage(
        "/chat/sendMessage/room/" + chatId,
        JSON.stringify(chatMessage)
      );
    } catch (e) {
      setStatusMessage(localId, "error");
    }
    //setTimeout(() => setStatusMessage(localId, "error"), 60000)
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
      `${chatApiUrl}/api/chats/${chatId}/upload`,
      "POST",
      {},
      formData
    )
      .then(() => {})
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
      `${chatApiUrl}/api/chats/${chatId}/messages?page=${page}&size=50`,
      "GET",
      {}
    ).then(pageResults => {
      const loadedMessages = pageResults.content
        .map(externalMessage => {
          return buildChatMessageObject(externalMessage, chatId);
        })
        .reverse();
      setMessages(loadedMessages.concat(messages));
      setIsLoading(false);
      setHasMore(!pageResults.last);
      setPage(page + 1);
    });
  };

  const title = clientName !== "" ? clientName : name;

  return (
    <div className="App">
      <Chat
        isLoading={isLoading}
        loadMore={loadMore}
        disabled={disabled}
        isMaximizedOnly
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
        subtitle={`Última mensagem: ${
          lastMessageAt == null ? "nenhuma mensagem" : lastMessageAt
        }`}
        messagesEndRef={messagesEndRef}
        onMediaSend={handleNewUserFiles}
        isBlocked={blocked}
        blockedMessage={`Já se passaram 24h desde a última mensagem enviada pelo cliente, 
        por isso não é possível enviar nova mensagem por esse canal de comunicação. 
        Por favor, entre em contato com o cliente por outro meio`}
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
      />

      <SockJsClient
        url={`${chatApiUrl}/ws`}
        topics={["/topic/" + chatId]}
        onMessage={handleNewExternalMessage}
        onConnect={onConnect}
        ref={client => (clientRef = client)}
      />
    </div>
  );
};
