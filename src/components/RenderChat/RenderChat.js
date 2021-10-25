import React, { useEffect, useRef, useState } from "react";
import { Chat, DELIVERY_STATUS } from "@tecsinapse/chat";

import uuidv1 from "uuid/v1";
import {
  buildChatMessageObject,
  buildSendingMessage,
  setStatusMessageFunc,
} from "../../utils/message";
import { ChatOptions } from "./ChatOptions/ChatOptions";
import { onSelectedChatMaker } from "../../utils/helpers";
import { COMPONENT_LOCATION } from "../../constants/COMPONENT_LOCATION";
import { ChatStatus } from "../../constants";
import {
  emptyChat,
  uploadOptions,
  getSubTitle,
  getTimeToExpire,
  getTitle,
  auxSetMessage,
  runBlockedAndPropagateStatus,
  runSendData,
  runHandleNewExternalMessage,
  runHandleNewUserFiles,
} from "./functions";

const RenderChatUnmemoized = ({
  chatApiUrl,
  initialInfo,
  userkeycloakId,
  onReadAllMessagesOfChat,
  navigateWhenCurrentChat,
  onChatStatusChanged,
  userNamesById,
  mobile,
  setView,
  customActions,
  setDrawerOpen,
  chatService,
  clientRef,
  receivedMessage,
  connectedAt, // notificação de reconexão
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState(initialInfo);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);

  const setStatusMessage = setStatusMessageFunc(setMessages);

  const isBlocked = ChatStatus.isBlocked(currentChat?.status);
  const enabled = currentChat.enabled || ChatStatus.isOK(currentChat?.status);

  const setBlockedAndPropagateStatus = (chat, blockedStatus) => {
    runBlockedAndPropagateStatus(
      chat,
      blockedStatus,
      setCurrentChat,
      onChatStatusChanged
    );
  };

  const propsToSendData = {
    chatApiUrl,
    initialInfo,
    setBlockedAndPropagateStatus,
    setStatusMessage,
    userkeycloakId,
    currentChat,
    chatService,
  };

  const propsOnSelectChatMake = {
    initialInfo,
    setIsLoading,
    setCurrentChat,
    setMessages,
    setBlocked: setBlockedAndPropagateStatus,
    chatService,
    messagesEndRef,
    onReadAllMessagesOfChat,
    userNamesById,
  };

  const onSelectedChat = onSelectedChatMaker(propsOnSelectChatMake);

  useEffect(() => {
    // TODO: O que fazer quando "length > 1"?
    if (initialInfo.chats.length === 1) {
      onSelectedChat(initialInfo.chats[0]);
    }
    // eslint-disable-next-line
  }, []);

  // handle new external message
  useEffect(() => {
    if (receivedMessage != null) {
      runHandleNewExternalMessage(
        receivedMessage,
        currentChat,
        messages,
        userNamesById,
        setMessages,
        setStatusMessage
      );
    }
    // eslint-disable-next-line
  }, [receivedMessage]);

  // inscreve a conversa nos tópicos no chat server
  useEffect(() => {
    if (!currentChat.chatId) {
      return () => {};
    }

    const clientSocket = clientRef.current;
    const topic = `/topic/${initialInfo.connectionKey}.${initialInfo.destination}.${currentChat.chatId}`;
    const addUser = `/chat/addUser/room/${initialInfo.connectionKey}/${initialInfo.destination}/${currentChat.chatId}`;

    const joinMessage = {
      from: currentChat.chatId,
      type: "JOIN",
    };

    try {
      clientSocket._subscribe(topic);
      clientSocket.sendMessage(addUser, JSON.stringify(joinMessage));
    } catch (e) {
      console.log(e);
    }

    return () => {
      const removeUser = `/chat/removeUser/room/${initialInfo.connectionKey}/${initialInfo.destination}/${currentChat.chatId}`;

      const leaveMessage = {
        from: currentChat.chatId,
        type: "LEAVE",
      };

      try {
        clientSocket.sendMessage(removeUser, JSON.stringify(leaveMessage));
        clientSocket._unsubscribe(topic);
      } catch (e) {
        console.log(e);
      }
    };
    // eslint-disable-next-line
  }, [currentChat, connectedAt]);

  const handleNewUserMessage = (newMessage, localId) => {
    const chatMessage = {
      from: currentChat.chatId,
      type: "CHAT",
      text: newMessage,
      localId,
      userId: userkeycloakId,
    };

    let attempt = 0;
    const maxAttemps = 6;
    const timeout = 1000 * 5; // 5 segundos

    const execute = () => {
      const clientSocket = clientRef.current;
      try {
        clientSocket.sendMessage(
          `/chat/sendMessage/room/${initialInfo.connectionKey}/${initialInfo.destination}/${currentChat.chatId}`,
          JSON.stringify(chatMessage)
        );
      } catch (e) {
        console.log(e);
        attempt += 1;

        if (attempt >= maxAttemps) {
          setStatusMessage(localId, DELIVERY_STATUS.ERROR.key);
          chatService.sendErrorReport(currentChat, userkeycloakId, chatMessage, e.message);
          return;
        }

        setTimeout(execute, timeout);
      }
    };

    execute();
  }

  const handleNewUserFiles = (title, files) =>
    runHandleNewUserFiles(
      title,
      files,
      setMessages,
      onMessageSend,
      propsToSendData
    );

  const sendData = (localId, title, file) => {
    runSendData(localId, title, file, propsToSendData);
  };

  const loadMore = async () => {
    if (isLoading || !hasMore) {
      return;
    }
    setIsLoading(true);
    const response = await chatService.loadMessages(
      initialInfo,
      currentChat,
      page
    );

    const { content, last } = response;
    const loadedMessages = content
      .map((externalMessage) =>
        buildChatMessageObject(
          externalMessage,
          currentChat.chatId,
          userNamesById
        )
      )
      .reverse();

    setMessages(loadedMessages.concat(messages));
    setIsLoading(false);
    setHasMore(!last);
    setPage(page + 1);
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

  const title = getTitle(currentChat, initialInfo);
  const subTitle = getSubTitle(currentChat);
  const timeToExpire = getTimeToExpire(currentChat);

  const actions = customActions || currentChat.actions;
  const hasActions =
    currentChat && actions && actions.length > 0 && navigateWhenCurrentChat;

  const onAudio = (blob) => {
    const localId = uuidv1();

    setMessages((prevMessages) => auxSetMessage(prevMessages, localId, blob));

    // send to user and waits for response
    sendData(localId, undefined, blob.blob);
  };

  const onMessageResend = (localId) => {
    // Change message status
    setStatusMessage(localId, DELIVERY_STATUS.SENDING.key);

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

  const handleView = (view) => setView(view);

  return (
    <div style={{ maxWidth: mobile ? "auto" : "40vW" }}>
      <Chat
        messages={messages}
        onMessageSend={onMessageSend}
        messagesEndRef={messagesEndRef}
        disabled={isLoading || !enabled}
        isMaximizedOnly
        onAudio={onAudio}
        title={title}
        subtitle={subTitle}
        onMediaSend={handleNewUserFiles}
        isLoading={isLoading}
        loadMore={loadMore}
        onMessageResend={onMessageResend}
        isBlocked={isBlocked}
        blockedMessage="Para conversar com esse cliente clique em Iniciar Conversa"
        onBackToChatList={onBackToChatList}
        onSelectedChat={onSelectedChat}
        disabledSend={isLoading}
        roundedCorners={false}
        containerHeight={`calc(100vh - ${isBlocked ? "224px" : "132px"})`}
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
        uploadOptions={uploadOptions}
        backAction={
          mobile
            ? () => handleView(COMPONENT_LOCATION.MESSAGE_MANAGEMENT)
            : undefined
        }
      />

      <ChatOptions
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        options={actions}
        data={currentChat}
        userkeycloakId={userkeycloakId}
        setDrawerOpen={setDrawerOpen}
      />
    </div>
  );
};

export const RenderChat = React.memo(RenderChatUnmemoized);
