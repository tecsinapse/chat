import {
  buildChatMessageObject,
  buildSendingMessage,
  calcRemainTime,
} from "../../utils/message";
import { defaultFetch, fetchMessages } from "../../utils/fetch";
import { DELIVERY_STATUS } from "@tecsinapse/chat";
import { ChatStatus } from "../../constants";

const emptyChat = {
  chatId: null,
  status: null,
  name: null,
  phone: null,
  lastMessage: null,
  unread: 0,
};

const uploadOptions = {
  maxFilesPerMessage: 10,
  maximumFileLimitMessage: (limit) =>
    `Apenas ${limit} arquivos podem ser carregados por mensagem.`,
  maximumFileNumberMessage: "Número máximo de arquivos",
  filenameFailedMessage: (name) => `${name} falhou. `,
  filetypeNotSupportedMessage: "Arquivo não suportado. ",
  sizeLimitErrorMessage: (size) =>
    `Arquivo deve ter tamanho menor que ${size / 1024} KB.`,
  undefinedErrorMessage: "Erro interno",
};

const getTitle = (currentChat, initialInfo) =>
  currentChat.name || initialInfo.name || "Cliente";

const getSubTitle = (currentChat) => {
  return (
    (currentChat.subName ? currentChat.subName + " - " : "") +
    (currentChat.phone ? currentChat.phone : "")
  );
};

const getTimeToExpire = (currentChat) => {
  return (
    (currentChat &&
      currentChat.minutesToBlock &&
      `O envio de mensagem irá expirar em ${calcRemainTime(
        currentChat.minutesToBlock
      )}.`) ||
    undefined
  );
};

// passar objeto como parametro com todos os paramentros
const runSendData = (
  localId,
  title,
  file,
  {
    chatApiUrl,
    initialInfo,
    setBlockedAndPropagateStatus,
    setStatusMessage,
    userkeycloakId,
    currentChat,
  }
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("localId", localId);
  if (title) {
    formData.append("title", title);
  }
  formData.append("userId", userkeycloakId);

  defaultFetch(
    `${chatApiUrl}/api/chats/${initialInfo.connectionKey}/${initialInfo.destination}/${currentChat.chatId}/upload`,
    "POST",
    {},
    formData
  )
    .then(() => {})
    .catch((err) => {
      if (err.status === 403) {
        setBlockedAndPropagateStatus(currentChat, true);
      }
      setStatusMessage(localId, DELIVERY_STATUS.ERROR.key);
    });
};

const auxSetMessage = (prevMessages, localId, blob) => {
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
};

const runBlockedAndPropagateStatus = (
  chat,
  isBlocked,
  setCurrentChat,
  onChatStatusChanged
) => {
  setCurrentChat((current) => ({
    ...current,
    status: isBlocked ? ChatStatus.BLOCKED : ChatStatus.OPEN,
  }));
  onChatStatusChanged(chat, isBlocked);
};

const runHandleNewExternalMessage = (
  newMessage,
  currentChat,
  messages,
  userNamesById,
  setMessages,
  setStatusMessage
) => {
  // Append received message when client message or
  // it comes from tec-chat (not create by the user)
  if (newMessage.type === "CHAT") {
    if (
      newMessage.from === currentChat.chatId ||
      newMessage.localId === undefined
    ) {
      let message = buildChatMessageObject(
        newMessage,
        currentChat.chatId,
        userNamesById
      );
      setMessages([...messages, message]);
    } else {
      setStatusMessage(
        newMessage.localId,
        newMessage.status,
        newMessage.statusDetails
      );
    }
  }
};

const runHandleNewUserFiles = (
  title,
  files,
  setMessages,
  onMessageSend,
  propsToSendData
) => {
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
    runSendData(uid, fileTitle, files[uid].file, propsToSendData);
  });

  // Sending title as a message, doesnt support title for this attachment
  if (titleAsMessage && title) {
    onMessageSend(title);
  }
};

const runLoadMore = async (
  chatApiUrl,
  initialInfo,
  currentChat,
  page,
  userNamesById
) => {
  const response = await fetchMessages({
    chatApiUrl,
    connectionKey: initialInfo.connectionKey,
    destination: initialInfo.destination,
    chatId: currentChat.chatId,
    page: page,
    updateUnreadWhenOpen: currentChat.updateUnreadWhenOpen,
  });

  const { content, last } = response;
  const loadedMessages = content
    .map((externalMessage) =>
      buildChatMessageObject(externalMessage, currentChat.chatId, userNamesById)
    )
    .reverse();
  return { last, loadedMessages };
};

export {
  emptyChat,
  uploadOptions,
  getTitle,
  getSubTitle,
  getTimeToExpire,
  auxSetMessage,
  runBlockedAndPropagateStatus,
  runSendData,
  runHandleNewExternalMessage,
  runHandleNewUserFiles,
  runLoadMore,
};
