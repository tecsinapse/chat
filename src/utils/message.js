import moment from "moment";
import { DELIVERY_STATUS } from "@tecsinapse/chat";
import { MessageSource } from "../constants";

const formatMessageStatus = (status) =>
  status.map((s) => ({
    status: s.status.toLowerCase(),
    at: s.at,
  }));

export const buildChatMessageObject = (
  externalMessage,
  fromId,
  userNamesByIds = {}
) => {
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
  } = externalMessage;

  const isOwner = MessageSource.isProduct(source);
  const authorName = userNamesByIds && isOwner ? userNamesByIds[userId] : name;

  const message = {
    at: moment(at).format("DD/MM/YYYY HH:mm"),
    own: isOwner,
    id: messageId,
    text,
    authorName,
    statusDetails: formatMessageStatus(statusDetails),
    status: status.toLowerCase(),
  };

  if (medias && medias.length > 0) {
    // when with media, show title instead of text
    delete message.text;
    message.title = title || text;

    message.medias = medias.map((media) => {
      if (media.mediaType.startsWith("application")) {
        delete message.title;
      }

      return {
        url: media.url,
        mediaType: media.mediaType,
        name: media.mediaType.startsWith("application") ? text : "",
      };
    });
  }

  return message;
};

export const buildSendingMessage = (localId, text, title, file) => ({
  localId,
  at: moment().format("DD/MM/YYYY HH:mm"),
  own: true,
  id: Date.now().toString(), // Dummy only, it is set by backend
  authorName: "Você",
  status: DELIVERY_STATUS.SENDING.key,
  text,
  title,
  medias: file
    ? [
        {
          mediaType: file.mediaType,
          url: file.data,
          name: file.name,
          size: file.size,
          data: file.file,
        },
      ]
    : undefined,
});

export const setStatusMessageFunc = (setMessages) => (
  localId,
  status,
  details
) => {
  setMessages((prevMessages) => {
    const copyMessages = [...prevMessages];
    const message = copyMessages.find((m) => m.localId === localId);

    if (message) {
      message.status = status.toLowerCase();

      if (status) {
        message.statusDetails = formatMessageStatus(details);
      }
    }

    return copyMessages;
  });
};

export const calcRemainTime = (time) => {
  const hours = Math.floor(time / 60);
  const minutes = time % 60;

  return (hours > 0 && `${hours} hora(s)`) || `${minutes} minuto(s)`;
};
