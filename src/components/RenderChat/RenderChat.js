import React, { useEffect, useRef, useState } from "react";
import ReactGA from "react-ga4";
import uuidv1 from "uuid/v1";
import { Chat, DELIVERY_STATUS } from "@tecsinapse/chat";
import { mdiInformation } from "@mdi/js";
import {
  List,
  ListItem,
  ListItemText,
  Popover,
  Tooltip,
} from "@material-ui/core";
import Icon from "@mdi/react";
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
import { encodeChatData } from "../utils";
import { useStyle } from "./styles";
import { DeleteChat } from "../DeleteChat/DeleteChat";
import { ANALYTICS_EVENTS } from "../../constants/ANALYTICS_EVENTS";
import { LoadMetric } from "../LoadMetric/LoadMetric";

export const RenderChat = ({
  chatService,
  userkeycloakId,
  currentChat,
  setCurrentChat,
  setCurrentChatSend,
  setDrawerOpen,
  handleAfterLoadMessage,
  receivedMessage,
  userNamesById,
  canSendNotification,
  productService,
  view,
  setView,
}) => {
  const classes = useStyle();

  const {
    connectionKey,
    chatId,
    archived,
    actions,
    minutesToBlock,
    blocked,
  } = currentChat;

  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const [page, setPage] = useState(0);
  const [hasMoreMessage, setHasMoreMessages] = useState(false);
  const [messages, setMessages] = useState([]);
  const [deleting, setDeleting] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    setLoading(true);

    chatService.loadMessages(currentChat, page).then((response) => {
      const {
        messages: { content, totalPages },
        archived: newArchived,
        blocked: newBlocked,
        minutesToBlock: newMinutesToBlock,
      } = response;

      setMessages((oldMessages) =>
        content
          .map((it) => getChatMessageObject(it, chatId, userNamesById))
          .reverse()
          .concat(oldMessages)
      );

      setHasMoreMessages(totalPages > page + 1);
      setLoading(false);

      handleAfterLoadMessage(newArchived, newBlocked, newMinutesToBlock);

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
    setCurrentChat((oldCurrentChat) => ({
      ...oldCurrentChat,
      minutesToBlock: 0,
      blocked: true,
    }));

    setCurrentChatSend(currentChat);
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
    if (minutesToBlock === 0 && !blocked) {
      setCurrentChat((oldCurrentChat) => ({
        ...oldCurrentChat,
        blocked: true,
      }));

      setCurrentChatSend(currentChat);

      return () => {};
    }

    if (!blocked) {
      const timer = setTimeout(() => {
        setCurrentChat((oldCurrentChat) => ({
          ...oldCurrentChat,
          minutesToBlock: minutesToBlock - 1,
        }));
      }, 60000);

      return () => clearTimeout(timer);
    }

    return () => {};
  }, [currentChat]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!receivedMessage || loading) {
      return;
    }

    chatService
      .updateMessageStatusToRead(receivedMessage.message?.messageId)
      .catch((error) => {
        console.error(error);
      });

    const {
      message: newMessage,
      minutesToBlock: newMinutesToBlock,
      blocked: newBlocked,
    } = receivedMessage;

    const newChatMessage = getChatMessageObject(
      newMessage,
      chatId,
      userNamesById
    );

    handleAfterLoadMessage(archived, newBlocked, newMinutesToBlock);

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

      // atualiza apenas o status da mensagem existente
      newMessages[messageIndex].status = newChatMessage.status;
      newMessages[messageIndex].statusDetails = newChatMessage.statusDetails;

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
      localId,
      userId: userkeycloakId,
      from: chatId,
      text,
    };

    chatService.sendMessage(
      userkeycloakId,
      chatMessage,
      currentChat,
      setCurrentChat,
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
      .sendUpload(currentChat, formData)
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

  const deleteChat = () => {
    setDeleting(true);
  };

  const encodedData = encodeChatData(currentChat, userkeycloakId);
  const style1 = { display: "flex", alignItems: "center" };

  return (
    <div className={classes.container}>
      {loading && (
        <LoadMetric
          metricId={view}
          userkeyloakId={userkeycloakId}
          chatService={chatService}
        />
      )}

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
        isBlocked={blocked || !canSendNotification}
        blockedMessage="Para conversar com esse cliente clique em Iniciar Conversa"
        disabledSend={loading}
        roundedCorners={false}
        containerHeight={`calc(100vh - ${
          blocked || !canSendNotification ? "164px" : "82px"
        })`}
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
          {!currentChat.archived && (
            <ListItem button onClick={deleteChat}>
              <ListItemText>
                <div style={style1}>
                  <span>Arquivar Conversa</span>
                  <Tooltip title="O recurso arquivar conversa possibilita ocultar uma conversa para organizar melhor sua lista de conversas. As mensagens não são excluídas, sendo possível retomar o diálogo iniciando uma nova conversa de forma ativa ou aguardando um novo contato do cliente.">
                    <Icon path={mdiInformation} size={0.8} />
                  </Tooltip>
                </div>
              </ListItemText>
            </ListItem>
          )}
          {deleting && (
            <DeleteChat
              chatToDelete={currentChat}
              productService={productService}
              chatService={chatService}
              setView={setView}
              setDeleting={setDeleting}
              userkeycloakId={userkeycloakId}
              analyticsEventName={ANALYTICS_EVENTS.DISCART_CHAT_RENDER_CHAT}
            />
          )}
        </List>
      </Popover>
    </div>
  );
};
