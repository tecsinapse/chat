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
    message.title = externalMessage.title;

    message.medias = externalMessage.medias.map((media) => {
      return {
        url: media.url,
        mediaType: media.mediaType,
        name: externalMessage.text,
      };
    });
  }

  return message;
};

export const buildSendingMessage = (text, title, file, data) => ({
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
      data,
    }] : undefined,
});

export const setStatusMessageFunc = (setMessages) => (externalMessage, status) => {
  console.log(externalMessage);
  setMessages(prevMessages => {
    let id = externalMessage.localId;
    const copyMessages = [...prevMessages];
    copyMessages[id].status = status;

    if (externalMessage.medias && externalMessage.medias.length > 0) {
      // when with media, show title instead of text
      delete copyMessages[id].text;
      copyMessages[id].title = externalMessage.title;
  
      copyMessages[id].medias = externalMessage.medias.map((media) => {
        return {
          url: media.url,
          mediaType: media.mediaType,
          name: externalMessage.text,
        };
      });
    }
  
    
    return copyMessages;
  });
};
