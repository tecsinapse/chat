import React, { useEffect, useRef, useState } from "react";
import { Chat } from "@tecsinapse/chat";
import SockJsClient from "react-stomp";

import { defaultFetch } from "../../utils/fetch";
import {
  buildChatMessageObject,
  buildSendingMessage,
  calcRemainTime,
  setStatusMessageFunc,
} from "../../utils/message";
import uuidv1 from "uuid/v1";
import { ChatOptions } from "./ChatOptions/ChatOptions";

const emptyChat = {
  chatId: null,
  status: null,
  name: null,
  phone: null,
  lastMessage: null,
  unread: 0,
};

const onSelectedChatMaker = (
  initialInfo,
  setIsLoading,
  setCurrentChat,
  setMessages,
  setBlocked,
  chatApiUrl,
  messagesEndRef,
  onReadAllMessagesOfChatId
) => (chat) => {
  setIsLoading(true);
  setCurrentChat(chat);

  defaultFetch(
    `${chatApiUrl}/api/chats/${initialInfo.connectionKey}/${chat.chatId}/messages?page=0&size=50&updateUnread=${chat.updateUnreadWhenOpen}`,
    "GET",
    {}
  ).then((pageResults) => {
    const messages = pageResults.content
      .map((externalMessage) => {
        return buildChatMessageObject(externalMessage, chat.chatId);
      })
      .reverse();
    setMessages(messages);
    const isBlocked = chat.status === "BLOCKED";
    setBlocked(chat.chatId, isBlocked);
    setIsLoading(false);
    if (chat.updateUnreadWhenOpen) {
      onReadAllMessagesOfChatId(chat.chatId);
    }

    setTimeout(function () {
      // workaround to wait for all elements to render
      messagesEndRef.current.scrollIntoView({
        block: "end",
        behavior: "smooth",
      });
    }, 700);
  });
};

export const RenderChat = ({
  chatApiUrl,
  initialInfo,
  userkeycloakId,
  onReadAllMessagesOfChatId,
  navigateWhenCurrentChat,
  onChatStatusChanged
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState(emptyChat);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [messages, setMessages] = useState([]);
  const [blocked, setBlocked] = useState(false);

  const messagesEndRef = useRef(null);
  let clientRef = useRef();
  const setStatusMessage = setStatusMessageFunc(setMessages);

  const setBlockedAndPropagateStatus = (chatId, isBlocked) => {
    setBlocked(isBlocked);
    onChatStatusChanged(chatId, isBlocked);
  }

  const onSelectedChat = onSelectedChatMaker(
    initialInfo,
    setIsLoading,
    setCurrentChat,
    setMessages,
    setBlockedAndPropagateStatus,
    chatApiUrl,
    messagesEndRef,
    onReadAllMessagesOfChatId
  );

  useEffect(() => {
    if (initialInfo.chats.length === 1) {
      onSelectedChatMaker(
        initialInfo,
        setIsLoading,
        setCurrentChat,
        setMessages,
        setBlockedAndPropagateStatus,
        chatApiUrl,
        messagesEndRef,
        onReadAllMessagesOfChatId
      )(initialInfo.chats[0]);
    }
    setIsLoading(false);
  }, [initialInfo, chatApiUrl, setIsLoading]);
  // ignore warning "React Hook useEffect has a missing dependency". It could cause infinity loop

  const handleNewExternalMessage = (newMessage) => {
    // Append received message when client message or
    // it comes from tec-chat (not create by the user)
    if (newMessage.type === "CHAT") {
      if (
        newMessage.from === currentChat.chatId ||
        newMessage.localId === undefined
      ) {
        let message = buildChatMessageObject(newMessage, currentChat.chatId);
        setMessages([...messages, message]);
      } else {
        setStatusMessage(newMessage.localId, "delivered");
      }
    }
  };

  const onConnect = () => {
    const chatMessage = {
      from: currentChat.chatId,
      type: "JOIN",
    };

    clientRef.sendMessage(
      `/chat/addUser/room/${initialInfo.connectionKey}/${currentChat.chatId}`,
      JSON.stringify(chatMessage)
    );
  };

  const handleNewUserMessage = (newMessage, localId) => {
    const chatMessage = {
      from: currentChat.chatId,
      type: "CHAT",
      text: newMessage,
      localId: localId,
    };

    try {
      clientRef.sendMessage(
        `/chat/sendMessage/room/${initialInfo.connectionKey}/${currentChat.chatId}`,
        JSON.stringify(chatMessage)
      );
    } catch (e) {
      setStatusMessage(localId, "error");
    }
  };

  const handleNewUserFiles = (title, files) => {
    // Doesnt support title for application and for more the one attached media
    const titleAsMessage =
      Object.keys(files).length > 1 ||
      (files[Object.keys(files)[0]] !== undefined &&
        files[Object.keys(files)[0]].mediaType.startsWith("application"));
    const fileTitle = titleAsMessage ? undefined : title;

    Object.keys(files).forEach((uid) => {
      setMessages((prevMessages) => {
        const copyPrevMessages = [...prevMessages];
        copyPrevMessages.push(
          buildSendingMessage(uid, undefined, fileTitle, files[uid])
        );
        return copyPrevMessages;
      });
      sendData(uid, fileTitle, files[uid].file);
    });

    // Sending title as a message, doesnt support title for this attachment
    if (titleAsMessage && title) {
      onMessageSend(title);
    }
  };

  const sendData = (localId, title, file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("localId", localId);
    if (title) {
      formData.append("title", title);
    }

    defaultFetch(
      `${chatApiUrl}/api/chats/${initialInfo.connectionKey}/${currentChat.chatId}/upload`,
      "POST",
      {},
      formData
    )
      .then(() => {})
      .catch((err) => {
        if (err.status === 403) {
          setBlockedAndPropagateStatus(currentChat.chatId, true);
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
      `${chatApiUrl}/api/chats/${initialInfo.connectionKey}/${currentChat.chatId}/messages?page=${page}&size=50&updateUnread=${currentChat.updateUnreadWhenOpen}`,
      "GET",
      {}
    ).then((pageResults) => {
      const loadedMessages = pageResults.content
        .map((externalMessage) => {
          return buildChatMessageObject(externalMessage, currentChat.chatId);
        })
        .reverse();
      setMessages(loadedMessages.concat(messages));
      setIsLoading(false);
      setHasMore(!pageResults.last);
      setPage(page + 1);
    });
  };

  const onBackToChatList = () => {
    setMessages([]);
    setCurrentChat(emptyChat);
    setBlockedAndPropagateStatus(null, false);
    setPage(1);
    setHasMore(true);
  };

  const onMessageSend = (text) => {
    const localId = uuidv1();
    setMessages((prevMessages) => {
      const copyPrevMessages = [...prevMessages];
      copyPrevMessages.push(buildSendingMessage(localId, text));
      return copyPrevMessages;
    });
    // send to user and waits for response
    handleNewUserMessage(text, localId);
  };

  const title = currentChat.name || initialInfo.name || "Cliente";
  let subTitle = (currentChat.subName ? (currentChat.subName + " - ") : "")
    + (currentChat.phone ? currentChat.phone : "");
  const timeToExpire =
    (currentChat &&
      currentChat.minutesToBlock &&
      `O envio de mensagem irá expirar em ${calcRemainTime(
        currentChat.minutesToBlock
      )}.`) ||
    undefined;
  const { actions } = currentChat;
  const hasActions = currentChat && actions && actions.length > 0 && navigateWhenCurrentChat;

  const onAudio = (blob) => {
    const localId = uuidv1();
    setMessages((prevMessages) => {
      const copyPrevMessages = [...prevMessages];
      copyPrevMessages.push(
        buildSendingMessage(
          localId,
          undefined,
          undefined,
          {
            mediaType: "audio",
            data: blob.blobURL,
          },
          blob.blob
        )
      );
      return copyPrevMessages;
    });

    // send to user and waits for response
    sendData(localId, undefined, blob.blob);
  };

  const onMessageResend = (localId) => {
    // Change message status
    setStatusMessage(localId, "sending");

    // Resend to backend
    const message = messages.find((m) => m.localId === localId);
    if (message && message.medias && message.medias.length > 0) {
      message.medias.forEach((media) =>
        sendData(localId, message.title, media.data)
      );
    } else if (message && message.text) {
      handleNewUserMessage(message.text, localId);
    }
  };

  const handleOpenActions = (event) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Chat
        messages={messages}
        onMessageSend={onMessageSend}
        messagesEndRef={messagesEndRef}
        disabled={isLoading || (initialInfo.chats.length > 1 ? false : !initialInfo.chats[0].enabled)}
        isMaximizedOnly
        onAudio={onAudio}
        title={title}
        subtitle={subTitle}
        onMediaSend={handleNewUserFiles}
        isLoading={isLoading}
        loadMore={loadMore}
        onMessageResend={onMessageResend}
        isBlocked={blocked}
        blockedMessage=""
        chatList={initialInfo.chats.length > 1 ? initialInfo.chats : undefined}
        onBackToChatList={onBackToChatList}
        onSelectedChat={onSelectedChat}
        disabledSend={isLoading && messages.length === 0}
        roundedCorners={false}
        containerHeight={`calc(100vh - ${blocked ? '264px' : '132px'})`}
        customHeader={{
          headerLabel: "Cliente:",
          headerBackground: "#f7f7f7",
          headerText: "#000",
        }}
        chatOptions={{
          show: hasActions,
          handleFunc: handleOpenActions,
          color: "#000",
        }}
        warningMessage={timeToExpire}
      />

      <ChatOptions
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        options={actions}
        data={currentChat}
        userkeycloakId={userkeycloakId}
      />

      {currentChat.chatId && (
        <SockJsClient
          url={`${chatApiUrl}/ws`}
          topics={[`/topic/${initialInfo.connectionKey}.${currentChat.chatId}`]}
          onMessage={handleNewExternalMessage}
          onConnect={onConnect}
          ref={(client) => (clientRef = client)}
        />
      )}
    </>
  );
};
