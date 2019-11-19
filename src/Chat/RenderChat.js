import React, { useEffect, useRef, useState } from "react";
import { Chat } from "@tecsinapse/ui-kit/build/Chat/Chat";
import SockJsClient from "react-stomp";

import { defaultFetch } from "../Util/fetch";
import {
  buildChatMessageObject,
  buildSendingMessage,
  setStatusMessageFunc
} from "../Util/message";
import { UploaderDialog } from "./UploaderDialog";

export const RenderChat = ({ chatApiUrl, chatId, clientName, disabled }) => {
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [messages, setMessages] = useState([]);
  const [lastMessageAt, setLastMessageAt] = useState(null);
  const [name, setName] = useState("Cliente");
  const [open, setOpen] = useState(false);
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
      setLastMessageAt(
        messages.length > 0 ? messages[messages.length - 1].at : null
      );

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
    if ((newMessage.type === "CHAT" && newMessage.from === fromId) || newMessage.localId === undefined) {
      let message = buildChatMessageObject(newMessage, fromId);
      let newMessages = [...messages, message];
      setMessages(newMessages);
    } else if (newMessage.type === "CHAT") {
      // own message only gets its id and changes its status
      setStatusMessage(newMessage, "delivered");
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
      localId,
    };

    try {
      clientRef.sendMessage(
        "/chat/sendMessage/room/" + chatId,
        JSON.stringify(chatMessage)
      );
    } catch (e) {
      setStatusMessage({ localId }, "error");
    }
  };

  const handleNewUserAudio = (recordedBlob, localId) => {
    sendData(undefined, recordedBlob.blob, localId);
  };

  const handleNewUserFiles = (title, files) => {
    Object.keys(files).forEach((uid, i) => {
      let localId;
      setMessages(prevMessages => {
        const copyPrevMessages = [...prevMessages];
        localId =
          copyPrevMessages.push(buildSendingMessage(undefined, title, files[uid], files[uid])) - 1;
        return copyPrevMessages;
      });
      sendData(title, files[uid], localId);
    });
  };

  const sendData = (title, file, localId) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("localId", localId);
    if(title) {
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
        setStatusMessage({ localId }, "error");
      });
  }

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
          let id;
          setMessages(prevMessages => {
            const copyPrevMessages = [...prevMessages];
            id = copyPrevMessages.push(buildSendingMessage(text)) - 1;
            return copyPrevMessages;
          });

          // send to user and waits for response
          handleNewUserMessage(text, id);
        }}
        onAudio={blob => {
          let id;
          setMessages(prevMessages => {
            const copyPrevMessages = [...prevMessages];
            id =
              copyPrevMessages.push(
                buildSendingMessage(undefined, undefined, {
                  mediaType: "audio",
                  data: blob.blobURL,
                }, blob.blob)
              ) - 1;
            return copyPrevMessages;
          });

          // send to user and waits for response
          handleNewUserAudio(blob, id);
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
        onMessageResend={id => {
          // Change message status
          setStatusMessage({localId: id}, "sending");

          // Resend to backend
          if(messages[id].medias && messages[id].medias.length > 0) {
            messages[id].medias.forEach((media) => sendData(messages[id].title, media.data, id));
          } else if(messages[id].text) {
            handleNewUserMessage(messages[id].text, id);
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

      {/* TODO: improve the ux/ui for showing progress uploading files  */}
      <UploaderDialog open={open} setOpen={setOpen} />
    </div>
  );
};
