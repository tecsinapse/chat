import React, { useEffect, useRef, useState } from "react";
import ReactGA from "react-ga4";
import uuidv1 from "uuid/v1";
import { Chat, DELIVERY_STATUS } from "@tecsinapse/chat";
import {
  formatMessageStatus,
  getChatMessageObject,
  getChatSubTitle,
  getChatTitle,
  getSendingNewAudio,
  getSendingNewFile,
  getSendingNewMessage,
  getTimeToExpireChat,
} from "./utils";
import { List, ListItem, ListItemText, Popover } from "@material-ui/core";
import { encodeChatData } from "../MessageManagement/utils";

export const RenderChat = ({
  chatService,
  userkeycloakId,
  currentChat,
  setCurrentChat,
  setDrawerOpen,
  handleAfterLoadMessage,
  receivedMessage,
  userNamesById,
  webSocketRef,
}) => {
  const { connectionKey, destination, chatId, archived, actions } = currentChat;

  const [loading, setLoading] = useState(true);
  const [readyToSubscribe, setReadyToSubscribe] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [page, setPage] = useState(0);
  const [blocked, setBlocked] = useState(true);
  const [hasMoreMessage, setHasMoreMessages] = useState(false);
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    setLoading(true);

    chatService.loadMessages(currentChat, page).then((response) => {
      const {
        messages: { content, totalPages },
        archived,
        blocked,
        minutesToBlock,
      } = response;

      setMessages((oldMessages) => {
        return content
          .map((it) => getChatMessageObject(it, chatId, userNamesById))
          .reverse()
          .concat(oldMessages);
      });

      setHasMoreMessages(totalPages > page + 1);
      setLoading(false);
      handleAfterLoadMessage(archived, blocked, minutesToBlock, setBlocked);
      setReadyToSubscribe(true);

      if (page === 0) {
        setTimeout(() => {
          if (messagesEndRef?.current) {
            messagesEndRef.current.scrollIntoView({
              block: "end",
              behavior: "smooth",
            });
          }
        }, 700);
      }
    });
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBlockCurrentChat = () => {
    setBlocked(true);
    setCurrentChat((oldCurrentChat) => ({
      ...oldCurrentChat,
      minutesToBlock: 0,
      blocked: true,
    }));
  };

  const handleChangeMessageStatus = (localId, status, details) => {
    setMessages((oldMessages) => {
      const newMessages = [...oldMessages];

      const messageIndex = newMessages.findIndex(
        (m) => m.localId === localId || m.id === localId
      );

      if (messageIndex > -1) {
        newMessages[messageIndex].status = status.toLowerCase();
        newMessages[messageIndex].statusDetails = formatMessageStatus(details);
      }

      return newMessages;
    });
  };

  useEffect(() => {
    if (!readyToSubscribe) {
      return () => {};
    }

    const clientSocket = webSocketRef.current;
    const topic = `/topic/${connectionKey}.${destination}.${chatId}`;
    const addUser = `/chat/addUser/room/${connectionKey}/${destination}/${chatId}`;

    try {
      clientSocket._subscribe(topic);
      clientSocket.sendMessage(addUser);
    } catch (e) {
      console.error(e);
    }

    return () => {
      const removeUser = `/chat/removeUser/room/${connectionKey}/${destination}/${chatId}`;

      try {
        clientSocket.sendMessage(removeUser);
        clientSocket._unsubscribe(topic);
      } catch (e) {
        console.error(e);
      }
    };
  }, [readyToSubscribe]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!receivedMessage || loading) {
      return;
    }

    const { message, minutesToBlock, blocked } = receivedMessage;
    const newChatMessage = getChatMessageObject(message, chatId, userNamesById);
    handleAfterLoadMessage(archived, blocked, minutesToBlock, setBlocked);

    ReactGA.event({
      category: connectionKey,
      action: "Received Message",
    });

    setMessages((oldMessages) => {
      const messageIndex = oldMessages.findIndex(
        (it) => it.id === newChatMessage.id
      );

      if (messageIndex === -1) {
        const newMessages = [...oldMessages];
        newMessages.push(newChatMessage);
        return newMessages;
      }

      const newMessages = [...oldMessages];
      newMessages[messageIndex] = newChatMessage;
      return newMessages;
    });
  }, [receivedMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = () => {
    if (!loading && hasMoreMessage) {
      setPage(page + 1);
    }
  };

  const handleSendMessage = (text, localId) => {
    const chatMessage = {
      localId: localId,
      userId: userkeycloakId,
      from: chatId,
      text: text,
    };

    chatService.sendMessage(
      userkeycloakId,
      chatMessage,
      currentChat,
      setCurrentChat,
      setBlocked,
      handleChangeMessageStatus,
      handleBlockCurrentChat
    );
  };

  const handleSendData = (localId, title, file) => {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("localId", localId);

    if (title) {
      formData.append("title", title);
    }
    formData.append("userId", userkeycloakId);

    chatService
      .sendDataApi(currentChat, formData)
      .then(() => {})
      .catch((err) => {
        if (err.status === 403) {
          handleBlockCurrentChat();
        }
        handleChangeMessageStatus(localId, DELIVERY_STATUS.ERROR.key);
      });
  };

  const handleSendNewMessage = (text) => {
    const localId = uuidv1();

    setMessages((oldMessages) => {
      const newMessages = [...oldMessages];
      const authorName = userNamesById[userkeycloakId];
      const newMessage = getSendingNewMessage(localId, text, authorName);
      newMessages.push(newMessage);
      return newMessages;
    });

    handleSendMessage(text, localId);
  };

  const handleResendNewMessage = (localId) => {
    handleChangeMessageStatus(localId, DELIVERY_STATUS.SENDING.key);

    const message = messages.find((m) => m.localId === localId);

    if (message && message.medias && message.medias.length > 0) {
      message.medias.forEach((media) => {
        handleSendData(localId, message.title, media.data);
      });
    } else if (message && message.text) {
      handleSendMessage(message.text, localId);
    }
  };

  const handleSendNewAudio = (blob) => {
    const localId = uuidv1();

    setMessages((oldMessages) => {
      const newMessages = [...oldMessages];
      const authorName = userNamesById[userkeycloakId];
      const newMessage = getSendingNewAudio(
        localId,
        {
          mediaType: "audio",
          data: blob.blobURL,
        },
        authorName
      );
      newMessages.push(newMessage);
      return newMessages;
    });

    handleSendData(localId, undefined, blob.blob);
  };

  const handleSendNewFile = (title, files) => {
    // não suporta título para type application ou mais de uma mídia
    const titleAsMessage =
      Object.keys(files).length > 1 ||
      (files[Object.keys(files)[0]] !== undefined &&
        files[Object.keys(files)[0]].mediaType.startsWith("application"));

    const fileTitle = titleAsMessage ? undefined : title;

    Object.keys(files).forEach((uid) => {
      const localId = uuidv1();

      setMessages((oldMessages) => {
        const newMessages = [...oldMessages];
        const authorName = userNamesById[userkeycloakId];
        const newMessage = getSendingNewFile(
          localId,
          fileTitle,
          files[uid],
          authorName
        );
        newMessages.push(newMessage);
        return newMessages;
      });

      handleSendData(localId, title, files[uid].file);
    });

    // envia o título como uma mensagem única quando necessário
    if (titleAsMessage && title) {
      handleSendNewMessage(title);
    }
  };

  const handleOpenActions = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseActions = () => {
    setAnchorEl(null);
  };

  const handleBackToChatList = () => {
    // não faz nada
  };

  const encodedData = encodeChatData(currentChat, userkeycloakId);

  return (
    <div style={{ maxWidth: "40vW" }}>
      <Chat
        messages={messages}
        onMessageSend={handleSendNewMessage}
        messagesEndRef={messagesEndRef}
        disabled={loading}
        isMaximizedOnly
        onAudio={handleSendNewAudio}
        title={getChatTitle(currentChat)}
        subtitle={getChatSubTitle(currentChat)}
        onMediaSend={handleSendNewFile}
        isLoading={loading}
        loadMore={loadMore}
        onMessageResend={handleResendNewMessage}
        isBlocked={blocked}
        blockedMessage="Para conversar com esse cliente clique em Iniciar Conversa"
        onBackToChatList={handleBackToChatList}
        disabledSend={loading}
        roundedCorners={false}
        containerHeight={`calc(100vh - ${blocked ? "164px" : "82px"})`}
        customHeader={{
          headerLabel: "Cliente:",
          headerBackground: "#f7f7f7",
          headerText: "#000",
        }}
        chatOptions={{
          show: currentChat && actions && actions.length > 0,
          handleFunc: handleOpenActions,
          color: "#000",
        }}
        warningMessage={getTimeToExpireChat(currentChat)}
        uploadOptions={{
          maxFilesPerMessage: 10,
          maximumFileLimitMessage: (limit) =>
            `Apenas ${limit} arquivos podem ser carregados por mensagem.`,
          maximumFileNumberMessage:
            "Excedeu o número máximo de arquivos permitidos.",
          filenameFailedMessage: (name) =>
            `Não foi possível carregar o arquivo ${name}. `,
          filetypeNotSupportedMessage: "O arquivo selecionado não é suportado.",
          sizeLimitErrorMessage: (size) =>
            `Arquivo deve ter tamanho menor que ${size / 1024} KB.`,
          undefinedErrorMessage: "Erro interno, contate o administrador.",
        }}
      />

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleCloseActions}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <List>
          {actions &&
            actions.map((item) => {
              const handleClick = () => {
                if (item.action) {
                  setDrawerOpen(false);
                  item.action(currentChat, encodedData);
                } else {
                  window.open(`${item.path}?data=${encodedData}`, "_self");
                }
              };

              return (
                <ListItem
                  key={item.label}
                  component="a"
                  onClick={handleClick}
                  button
                >
                  <ListItemText
                    primary={item.action ? item.label(currentChat) : item.label}
                  />
                </ListItem>
              );
            })}
        </List>
      </Popover>
    </div>
  );
};
