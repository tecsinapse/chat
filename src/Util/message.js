import moment from "moment";

export const buildChatMessageObject = (externalMessage, fromId) => {
  let message = {
    at: moment(externalMessage.at).format('DD/MM/YYYY HH:mm'),
    own: externalMessage.from !== fromId,
    id: externalMessage.messageId,
    text: externalMessage.text,
  };

  if (externalMessage.medias.length > 0) {
    // when with media, show title instead of text
    delete message.text;
    message.title = externalMessage.text;

    message.medias = externalMessage.medias.map((media) => {
      return {
        url: media.url,
        mediaType: media.mediaType,
      };
    });
  }

  return message;
};
