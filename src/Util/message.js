import moment from "moment";

export const buildChatMessageObject = (externalMessage, fromId) => {
  let message = {
    at: moment(externalMessage.at).format('DD/MM/YYYY HH:mm'),
    own: externalMessage.from !== fromId,
    id: externalMessage.messageId,
    text: externalMessage.text,
  };

  if (externalMessage.medias && externalMessage.medias.length > 0) {
    // when with media, show title instead of text
    delete message.text;
    message.title = externalMessage.text;

    message.medias = externalMessage.medias.map((media) => {
      if (media.mediaType.startsWith('application')) {
        delete message.title;
      }
      return {
        url: media.url,
        mediaType: media.mediaType,
        name: media.mediaType.startsWith('application') ? externalMessage.text : '',
      };
    });
  }

  return message;
};

export const buildSendingMessage = (localId, text, title, file) => ({
  localId: localId,
  at: moment().format('DD/MM/YYYY HH:mm'),
  own: true,
  id: Date.now().toString(),
  authorName: 'Você',
  status: 'sending',
  text,
  title,
  medias: file ? [{
    mediaType: file.mediaType,
    url: file.data,
    name: file.name,
    size: file.size,
    data: file.file,
  }] : undefined,
});

export const setStatusMessageFunc = (setMessages) => (localId, status) => {
  setMessages(prevMessages => {
    const copyMessages = [...prevMessages];
    copyMessages.find(m => m.localId === localId).status = status;
    return copyMessages;
  });
};
