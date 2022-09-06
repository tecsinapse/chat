import MessageSource from "../../enums/MessageSource";
import { formatDateTime, momentNow } from "../utils";
import { DELIVERY_STATUS } from "@tecsinapse/chat";

export const getChatMessageObject = (message, chatId, userNamesByIds = {}) => {
  const {
    userId,
    name,
    messageId,
    title,
    text,
    medias,
    at,
    statusDetails,
    source,
    status,
    style,
  } = message;

  const isOwner = MessageSource.isProduct(source);
  const authorName = userNamesByIds && isOwner ? userNamesByIds[userId] : name;

  const chatMessage = {
    at: formatDateTime(at),
    own: isOwner,
    id: messageId,
    text: text,
    authorName: authorName,
    statusDetails: formatMessageStatus(statusDetails),
    status: status.toLowerCase(),
    style: style.toUpperCase(),
  };

  if (medias && medias.length > 0) {
    // when with media, show title instead of text
    delete chatMessage.text;
    chatMessage.title = title || text;

    chatMessage.medias = medias.map((media) => {
      if (media.mediaType.startsWith("application")) {
        delete chatMessage.title;
      }

      return {
        url: media.url,
        mediaType: media.mediaType,
        name: media.mediaType.startsWith("application") ? text : "",
      };
    });
  }

  return chatMessage;
};

export const getSendingMessage = (localId, authorName) => ({
  at: formatDateTime(momentNow()),
  authorName: authorName || "Você",
  id: localId,
  localId: localId,
  own: true,
  status: DELIVERY_STATUS.SENDING.key,
});

export const getSendingMedia = (file) => ({
  medias: [
    {
      mediaType: file.mediaType,
      url: file.data,
      name: file.name,
      size: file.size,
      data: file.file,
    },
  ],
});

export const getSendingNewMessage = (localId, text, authorName) => ({
  ...getSendingMessage(localId, authorName),
  text: text,
});

export const getSendingNewAudio = (localId, file, authorName) => ({
  ...getSendingMessage(localId, authorName),
  ...getSendingMedia(file),
});

export const getSendingNewFile = (localId, title, file, authorName) => ({
  ...getSendingMessage(localId, authorName),
  ...getSendingMedia(file),
  title: title,
});

export const formatMessageStatus = (status) => {
  if (!status) {
    return [];
  }

  return status.map((s) => ({
    status: s.status.toLowerCase(),
    statusMessage: s.statusMessage,
    at: s.at,
  }));
};

export const getChatTitle = (currentChat) => {
  return currentChat?.name || "CLIENTE NÃO CADASTRADO";
};

export const getChatSubTitle = (currentChat) => {
  return currentChat?.phone || "";
};

export const getTimeToExpireChat = (currentChat) => {
  return (
    (currentChat &&
      !currentChat.archived &&
      currentChat.minutesToBlock &&
      `O envio de mensagem irá expirar em ${getRemainTime(
        currentChat.minutesToBlock
      )}.`) ||
    undefined
  );
};

export const getRemainTime = (time) => {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;

  return (hours > 0 && `${hours} hora(s)`) || `${minutes} minuto(s)`;
};
