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

export const buildSendingMessage = (text, file) => ({
    at: moment().format('DD/MM/YYYY HH:mm'),
    own: true,
    id: Date.now().toString(),
    authorName: 'Você',
    status: 'sending',
    text,
    medias: file ? [{
      mediaType: file.mediaType,
      url: file.data,
      name: file.name,
      size: file.size,
    }] : undefined,
});

export const setStatusMessageFunc = (setMessages) => (externalMessage, status) => {
  setMessages(prevMessages => {
    let id = externalMessage.localID;
    const copyMessages = [...prevMessages];
    copyMessages[id].status = status;

    if (externalMessage.medias.length > 0) {
      // when with media, show title instead of text
      delete copyMessages[id].text;
      copyMessages[id].title = externalMessage.text;
  
      copyMessages[id].medias = copyMessages[id].medias.map((media) => {
        return {
          url: media.url,
          mediaType: media.mediaType,
        };
      });
    }
  
    
    return copyMessages;
  });
};
